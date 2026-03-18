package br.umc.services;

import br.umc.dto.ViaCepResponseDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

@Component
public class ViaCepClient {

    private static final Logger log = LoggerFactory.getLogger(ViaCepClient.class);

    private static final String VIACEP_URL = "https://viacep.com.br/ws/{cep}/json/";

    private final RestTemplate restTemplate;

    public ViaCepClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ViaCepResponseDTO buscarPorCep(String cep) {
        String cepNormalizado = cep.replaceAll("[^0-9]", "");
        log.debug("[VIACEP] Consultando CEP: {}", cepNormalizado);
        try {
            ViaCepResponseDTO response = restTemplate.getForObject(
                    VIACEP_URL, ViaCepResponseDTO.class, cepNormalizado);

            if (response == null || response.isCepInvalido()) {
                log.warn("[VIACEP] CEP não encontrado: {}", cep);
                throw new IllegalArgumentException("CEP não encontrado: " + cep);
            }

            log.debug("[VIACEP] CEP encontrado: {} | cidade={} | estado={}",
                    cepNormalizado, response.getLocalidade(), response.getUf());
            return response;
        } catch (HttpClientErrorException e) {
            log.error("[VIACEP] Erro ao consultar CEP: {} | status={} | erro={}",
                    cep, e.getStatusCode(), e.getMessage());
            throw new IllegalArgumentException("CEP inválido ou não encontrado: " + cep);
        }
    }
}
