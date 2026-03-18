package br.umc.services;

import br.umc.models.valueObjects.Geolocalizacao;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class GeocodingClient {

    private static final Logger log = LoggerFactory.getLogger(GeocodingClient.class);

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

    private final RestTemplate restTemplate;

    public GeocodingClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Geolocalizacao buscarCoordenadas(String logradouro, String numero, String cidade, String estado, String pais) {
        log.debug("[GEO] Buscando coordenadas: {} {}, {}, {}", logradouro, numero, cidade, estado);
        try {
            String query = String.join(", ", logradouro + " " + numero, cidade, estado, pais);

            String url = UriComponentsBuilder.fromHttpUrl(NOMINATIM_URL)
                    .queryParam("q", query)
                    .queryParam("format", "json")
                    .queryParam("limit", 1)
                    .queryParam("countrycodes", "br")
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "PadroesProjeto/1.0 (academic)");

            ResponseEntity<NominatimResultDTO[]> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), NominatimResultDTO[].class);

            if (response.getBody() != null && response.getBody().length > 0) {
                NominatimResultDTO resultado = response.getBody()[0];
                log.debug("[GEO] Coordenadas encontradas: lat={} | lon={}", resultado.getLat(), resultado.getLon());
                return new Geolocalizacao(
                        Double.parseDouble(resultado.getLat()),
                        Double.parseDouble(resultado.getLon())
                );
            }
            log.debug("[GEO] Nenhuma coordenada encontrada para o endereço");
        } catch (Exception e) {
            log.warn("[GEO] Falha ao buscar coordenadas (não bloqueante): {}", e.getMessage());
        }
        return new Geolocalizacao(null, null);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class NominatimResultDTO {

        @JsonProperty("lat")
        private String lat;

        @JsonProperty("lon")
        private String lon;

        public String getLat() {
            return lat;
        }

        public void setLat(String lat) {
            this.lat = lat;
        }

        public String getLon() {
            return lon;
        }

        public void setLon(String lon) {
            this.lon = lon;
        }
    }
}
