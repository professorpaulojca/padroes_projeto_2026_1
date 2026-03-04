package br.umc.services;

import br.umc.dto.ViaCepResponseDTO;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Component
public class ViaCepClient {

    private static final String VIACEP_URL = "https://viacep.com.br/ws/{cep}/json/";

    private final RestTemplate restTemplate;

    public ViaCepClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ViaCepResponseDTO buscarPorCep(String cep) {
        String cepNormalizado = cep.replaceAll("[^0-9]", "");
        try {
            ViaCepResponseDTO response = restTemplate.getForObject(
                    VIACEP_URL, ViaCepResponseDTO.class, cepNormalizado);

            if (response == null || response.isCepInvalido()) {
                throw new IllegalArgumentException("CEP não encontrado: " + cep);
            }

            return response;
        } catch (HttpClientErrorException e) {
            throw new IllegalArgumentException("CEP inválido ou não encontrado: " + cep);
        }
    }
}
