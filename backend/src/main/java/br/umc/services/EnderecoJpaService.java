package br.umc.services;

import br.umc.dto.ViaCepResponseDTO;
import br.umc.dto.endereco.EnderecoJpaRequestDTO;
import br.umc.dto.endereco.EnderecoJpaResponseDTO;
import br.umc.models.EnderecoEntity;
import br.umc.models.enums.EnderecoPrincipal;
import br.umc.models.enums.TipoEndereco;
import br.umc.models.valueObjects.Geolocalizacao;
import br.umc.repositories.EnderecoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EnderecoJpaService {

    private static final String PAIS_PADRAO = "Brasil";

    private final EnderecoRepository enderecoRepository;
    private final ViaCepClient viaCepClient;
    private final GeocodingClient geocodingClient;

    public EnderecoJpaService(EnderecoRepository enderecoRepository,
                               ViaCepClient viaCepClient,
                               GeocodingClient geocodingClient) {
        this.enderecoRepository = enderecoRepository;
        this.viaCepClient = viaCepClient;
        this.geocodingClient = geocodingClient;
    }

    @Transactional
    public EnderecoEntity construirEPersistirEndereco(EnderecoJpaRequestDTO dto) {
        ViaCepResponseDTO viaCep = viaCepClient.buscarPorCep(dto.getCep());

        String logradouro = resolverLogradouro(viaCep);
        String bairro = resolverBairro(viaCep);
        String cidade = viaCep.getLocalidade();
        String estado = viaCep.getUf();
        String cepNormalizado = dto.getCep().replaceAll("[^0-9]", "");
        String cepFormatado = cepNormalizado.substring(0, 5) + "-" + cepNormalizado.substring(5);

        Optional<EnderecoEntity> existente = dto.getComplemento() != null && !dto.getComplemento().isBlank()
                ? enderecoRepository.findByCepAndNumeroAndComplemento(cepFormatado, dto.getNumero(), dto.getComplemento())
                : enderecoRepository.findByCepAndNumeroSemComplemento(cepFormatado, dto.getNumero());

        if (existente.isPresent()) {
            return existente.get();
        }

        Geolocalizacao geo = geocodingClient.buscarCoordenadas(
                logradouro, dto.getNumero(), cidade, estado, PAIS_PADRAO);

        EnderecoEntity endereco = new EnderecoEntity();
        endereco.setCep(cepFormatado);
        endereco.setLogradouro(logradouro);
        endereco.setNumero(dto.getNumero());
        endereco.setComplemento(dto.getComplemento());
        endereco.setBairro(bairro);
        endereco.setCidade(cidade);
        endereco.setEstado(estado);
        endereco.setPais(PAIS_PADRAO);
        endereco.setTipoEndereco(parsarTipoEndereco(dto.getTipoEndereco()));
        endereco.setEnderecoPrincipal(parsarEnderecoPrincipal(dto.getEnderecoPrincipal()));

        if (geo.isPresente()) {
            endereco.setLatitude(geo.getLatitude());
            endereco.setLongitude(geo.getLongitude());
        }

        return enderecoRepository.save(endereco);
    }

    @Transactional(readOnly = true)
    public List<EnderecoJpaResponseDTO> listarTodos() {
        return enderecoRepository.findAllOrderByLogradouro()
                .stream()
                .map(EnderecoJpaResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EnderecoJpaResponseDTO buscarPorId(Long id) {
        EnderecoEntity endereco = enderecoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Endereço não encontrado com ID: " + id));
        return EnderecoJpaResponseDTO.fromEntity(endereco);
    }

    @Transactional(readOnly = true)
    public List<EnderecoJpaResponseDTO> buscarPorCep(String cep) {
        String cepNormalizado = cep.replaceAll("[^0-9]", "");
        String cepFormatado = cepNormalizado.length() == 8
                ? cepNormalizado.substring(0, 5) + "-" + cepNormalizado.substring(5)
                : cep;
        return enderecoRepository.findByCep(cepFormatado)
                .stream()
                .map(EnderecoJpaResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public EnderecoJpaResponseDTO atualizar(Long id, EnderecoJpaRequestDTO dto) {
        EnderecoEntity existente = enderecoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Endereço não encontrado com ID: " + id));

        ViaCepResponseDTO viaCep = viaCepClient.buscarPorCep(dto.getCep());
        String logradouro = resolverLogradouro(viaCep);
        String bairro = resolverBairro(viaCep);
        String cidade = viaCep.getLocalidade();
        String estado = viaCep.getUf();
        String cepNorm = dto.getCep().replaceAll("[^0-9]", "");
        String cepFormatado = cepNorm.substring(0, 5) + "-" + cepNorm.substring(5);

        Geolocalizacao geo = geocodingClient.buscarCoordenadas(
                logradouro, dto.getNumero(), cidade, estado, PAIS_PADRAO);

        enderecoRepository.updateEndereco(
                id,
                cepFormatado,
                logradouro,
                dto.getNumero(),
                dto.getComplemento(),
                bairro,
                cidade,
                estado,
                PAIS_PADRAO,
                parsarTipoEndereco(dto.getTipoEndereco()).name(),
                parsarEnderecoPrincipal(dto.getEnderecoPrincipal()).name(),
                geo.isPresente() ? geo.getLatitude() : existente.getLatitude(),
                geo.isPresente() ? geo.getLongitude() : existente.getLongitude()
        );

        return EnderecoJpaResponseDTO.fromEntity(enderecoRepository.findById(id).orElseThrow());
    }

    @Transactional
    public void excluir(Long id) {
        if (!enderecoRepository.existsById(id)) {
            throw new IllegalArgumentException("Endereço não encontrado com ID: " + id);
        }
        enderecoRepository.deleteById(id);
    }

    private String resolverLogradouro(ViaCepResponseDTO viaCep) {
        if (viaCep.getLogradouro() == null || viaCep.getLogradouro().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "O CEP informado não possui logradouro específico. Informe o logradouro manualmente.");
        }
        return viaCep.getLogradouro().trim();
    }

    private String resolverBairro(ViaCepResponseDTO viaCep) {
        if (viaCep.getBairro() == null || viaCep.getBairro().trim().isEmpty()) {
            return "Centro";
        }
        return viaCep.getBairro().trim();
    }

    private TipoEndereco parsarTipoEndereco(String valor) {
        try {
            return TipoEndereco.valueOf(valor.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Tipo de endereço inválido: " + valor
                    + ". Valores aceitos: RESIDENCIAL, COMERCIAL, COBRANCA, ENTREGA, OUTRO");
        }
    }

    private EnderecoPrincipal parsarEnderecoPrincipal(String valor) {
        try {
            return EnderecoPrincipal.valueOf(valor.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Indicação de endereço principal inválida: " + valor
                    + ". Valores aceitos: SIM, NAO");
        }
    }
}
