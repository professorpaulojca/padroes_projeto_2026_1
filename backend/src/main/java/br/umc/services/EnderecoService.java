package br.umc.services;

import br.umc.dto.EnderecoDTO;
import br.umc.dto.ViaCepResponseDTO;
import br.umc.models.Endereco;
import br.umc.models.valueObjects.Bairro;
import br.umc.models.valueObjects.Cep;
import br.umc.models.valueObjects.Cidade;
import br.umc.models.valueObjects.Complemento;
import br.umc.models.valueObjects.EnderecoPrincipalVO;
import br.umc.models.valueObjects.Estado;
import br.umc.models.valueObjects.Geolocalizacao;
import br.umc.models.valueObjects.Logradouro;
import br.umc.models.valueObjects.Numero;
import br.umc.models.valueObjects.Pais;
import br.umc.models.valueObjects.TipoEnderecoVO;
import org.springframework.stereotype.Service;

@Service
public class EnderecoService {

    private static final String PAIS_PADRAO = "Brasil";

    private final ViaCepClient viaCepClient;
    private final GeocodingClient geocodingClient;

    public EnderecoService(ViaCepClient viaCepClient, GeocodingClient geocodingClient) {
        this.viaCepClient = viaCepClient;
        this.geocodingClient = geocodingClient;
    }

    public Endereco construirEndereco(EnderecoDTO dto) {
        ViaCepResponseDTO viaCep = viaCepClient.buscarPorCep(dto.getCep());

        String logradouroValor = resolverLogradouro(viaCep);
        String bairroValor = resolverBairro(viaCep);
        String cidadeValor = viaCep.getLocalidade();
        String estadoValor = viaCep.getUf();

        Geolocalizacao geolocalizacao = geocodingClient.buscarCoordenadas(
                logradouroValor, dto.getNumero(), cidadeValor, estadoValor, PAIS_PADRAO);

        return new Endereco(
                new Cep(dto.getCep()),
                new Numero(dto.getNumero()),
                new Complemento(dto.getComplemento()),
                new Logradouro(logradouroValor),
                new TipoEnderecoVO(dto.getTipoEndereco()),
                new EnderecoPrincipalVO(dto.getEnderecoPrincipal()),
                new Bairro(bairroValor),
                new Cidade(cidadeValor),
                new Estado(estadoValor),
                new Pais(PAIS_PADRAO),
                geolocalizacao
        );
    }

    private String resolverLogradouro(ViaCepResponseDTO viaCep) {
        if (viaCep.getLogradouro() == null || viaCep.getLogradouro().trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "O CEP informado corresponde a uma faixa de CEP sem logradouro específico. " +
                    "Por favor, informe o logradouro manualmente.");
        }
        return viaCep.getLogradouro().trim();
    }

    private String resolverBairro(ViaCepResponseDTO viaCep) {
        if (viaCep.getBairro() == null || viaCep.getBairro().trim().isEmpty()) {
            return "Centro";
        }
        return viaCep.getBairro().trim();
    }
}
