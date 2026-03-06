package br.umc.dto.endereco;

import br.umc.models.EnderecoEntity;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de um endereço cadastrado")
public class EnderecoJpaResponseDTO {

    @Schema(description = "ID do endereço", example = "1")
    private Long id;

    @Schema(description = "CEP formatado", example = "01310-100")
    private String cep;

    @Schema(description = "Logradouro", example = "Avenida Paulista")
    private String logradouro;

    @Schema(description = "Número", example = "1500")
    private String numero;

    @Schema(description = "Complemento", example = "Apto 42")
    private String complemento;

    @Schema(description = "Bairro", example = "Bela Vista")
    private String bairro;

    @Schema(description = "Cidade", example = "São Paulo")
    private String cidade;

    @Schema(description = "Estado (sigla)", example = "SP")
    private String estado;

    @Schema(description = "País", example = "Brasil")
    private String pais;

    @Schema(description = "Tipo do endereço", example = "RESIDENCIAL")
    private String tipoEndereco;

    @Schema(description = "Indica se é o endereço principal", example = "SIM")
    private String enderecoPrincipal;

    @Schema(description = "Latitude para georreferenciamento", example = "-23.5632")
    private Double latitude;

    @Schema(description = "Longitude para georreferenciamento", example = "-46.6543")
    private Double longitude;

    public EnderecoJpaResponseDTO() {
    }

    public static EnderecoJpaResponseDTO fromEntity(EnderecoEntity entity) {
        EnderecoJpaResponseDTO dto = new EnderecoJpaResponseDTO();
        dto.id = entity.getId();
        dto.cep = entity.getCep();
        dto.logradouro = entity.getLogradouro();
        dto.numero = entity.getNumero();
        dto.complemento = entity.getComplemento();
        dto.bairro = entity.getBairro();
        dto.cidade = entity.getCidade();
        dto.estado = entity.getEstado();
        dto.pais = entity.getPais();
        dto.tipoEndereco = entity.getTipoEndereco() != null ? entity.getTipoEndereco().name() : null;
        dto.enderecoPrincipal = entity.getEnderecoPrincipal() != null ? entity.getEnderecoPrincipal().name() : null;
        dto.latitude = entity.getLatitude();
        dto.longitude = entity.getLongitude();
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }

    public String getLogradouro() { return logradouro; }
    public void setLogradouro(String logradouro) { this.logradouro = logradouro; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getComplemento() { return complemento; }
    public void setComplemento(String complemento) { this.complemento = complemento; }

    public String getBairro() { return bairro; }
    public void setBairro(String bairro) { this.bairro = bairro; }

    public String getCidade() { return cidade; }
    public void setCidade(String cidade) { this.cidade = cidade; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }

    public String getTipoEndereco() { return tipoEndereco; }
    public void setTipoEndereco(String tipoEndereco) { this.tipoEndereco = tipoEndereco; }

    public String getEnderecoPrincipal() { return enderecoPrincipal; }
    public void setEnderecoPrincipal(String enderecoPrincipal) { this.enderecoPrincipal = enderecoPrincipal; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
