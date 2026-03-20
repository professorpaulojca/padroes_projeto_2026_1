package br.umc.services;

import br.umc.dto.ViaCepResponseDTO;
import br.umc.dto.endereco.EnderecoJpaRequestDTO;
import br.umc.dto.endereco.EnderecoJpaResponseDTO;
import br.umc.models.EnderecoEntity;
import br.umc.models.enums.EnderecoPrincipal;
import br.umc.models.enums.TipoEndereco;
import br.umc.models.valueObjects.Geolocalizacao;
import br.umc.repositories.EnderecoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EnderecoJpaService {

    private static final Logger log = LoggerFactory.getLogger(EnderecoJpaService.class);
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
        log.info("[ENDERECO] Construindo endereço: cep={} | numero={}", dto.getCep(), dto.getNumero());
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
            log.info("[ENDERECO] Endereço já existente reutilizado: id={} | cep={}", existente.get().getId(), cepFormatado);
            return existente.get();
        }

        Geolocalizacao geo = geocodingClient.buscarCoordenadas(
                logradouro, dto.getNumero(), cidade, estado, PAIS_PADRAO);
        log.debug("[ENDERECO] Geolocalização obtida: lat={} | lon={}", geo.getLatitude(), geo.getLongitude());

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
        log.debug("[ENDERECO] Listando todos os endereços");
        List<EnderecoJpaResponseDTO> resultado = enderecoRepository.findAllOrderByLogradouro()
                .stream()
                .map(EnderecoJpaResponseDTO::fromEntity)
                .collect(Collectors.toList());
        log.debug("[ENDERECO] Total de endereços encontrados: {}", resultado.size());
        return resultado;
    }

    @Transactional(readOnly = true)
    public EnderecoJpaResponseDTO buscarPorId(Long id) {
        log.debug("[ENDERECO] Buscando endereço por ID: {}", id);
        EnderecoEntity endereco = enderecoRepository.findByIdAtivo(id)
                .orElseThrow(() -> {
                    log.warn("[ENDERECO] Endereço não encontrado: id={}", id);
                    return new IllegalArgumentException("Endereço não encontrado com ID: " + id);
                });
        return EnderecoJpaResponseDTO.fromEntity(endereco);
    }

    @Transactional(readOnly = true)
    public List<EnderecoJpaResponseDTO> buscarPorCep(String cep) {
        log.debug("[ENDERECO] Buscando endereços por CEP: {}", cep);
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
        log.info("[ENDERECO] Atualizando endereço: id={} | cep={}", id, dto.getCep());
        EnderecoEntity existente = enderecoRepository.findByIdAtivo(id)
                .orElseThrow(() -> {
                    log.warn("[ENDERECO] Endereço não encontrado para atualização: id={}", id);
                    return new IllegalArgumentException("Endereço não encontrado com ID: " + id);
                });

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

        log.info("[ENDERECO] Endereço atualizado com sucesso: id={}", id);
        return EnderecoJpaResponseDTO.fromEntity(enderecoRepository.findByIdAtivo(id).orElseThrow());
    }

    @Transactional
    public void excluir(Long id) {
        log.info("[ENDERECO] Excluindo endereço: id={}", id);
        enderecoRepository.findByIdAtivo(id)
                .orElseThrow(() -> {
                    log.warn("[ENDERECO] Endereço não encontrado para exclusão: id={}", id);
                    return new IllegalArgumentException("Endereço não encontrado com ID: " + id);
                });
        enderecoRepository.softDelete(id);
        log.info("[ENDERECO] Endereço excluído (soft delete) com sucesso: id={}", id);
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
