package br.umc.dto.endereco;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Dados para cadastro ou atualização de endereço")
public class EnderecoJpaRequestDTO {

    @Schema(description = "CEP (somente números ou com hífen)", example = "01310-100")
    @NotBlank(message = "CEP é obrigatório")
    @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP inválido")
    private String cep;

    @Schema(description = "Número do imóvel", example = "1500")
    @NotBlank(message = "Número é obrigatório")
    private String numero;

    @Schema(description = "Complemento (opcional)", example = "Apto 42")
    private String complemento;

    @Schema(description = "Tipo do endereço", example = "RESIDENCIAL",
            allowableValues = {"RESIDENCIAL", "COMERCIAL", "COBRANCA", "ENTREGA", "OUTRO"})
    @NotBlank(message = "Tipo de endereço é obrigatório")
    private String tipoEndereco;

    @Schema(description = "Indica se é o endereço principal", example = "SIM",
            allowableValues = {"SIM", "NAO"})
    @NotBlank(message = "Indicação de endereço principal é obrigatória")
    private String enderecoPrincipal;

    public EnderecoJpaRequestDTO() {
    }

    public EnderecoJpaRequestDTO(String cep, String numero, String complemento,
                                  String tipoEndereco, String enderecoPrincipal) {
        this.cep = cep;
        this.numero = numero;
        this.complemento = complemento;
        this.tipoEndereco = tipoEndereco;
        this.enderecoPrincipal = enderecoPrincipal;
    }

    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }

    public String getNumero() { return numero; }
    public void setNumero(String numero) { this.numero = numero; }

    public String getComplemento() { return complemento; }
    public void setComplemento(String complemento) { this.complemento = complemento; }

    public String getTipoEndereco() { return tipoEndereco; }
    public void setTipoEndereco(String tipoEndereco) { this.tipoEndereco = tipoEndereco; }

    public String getEnderecoPrincipal() { return enderecoPrincipal; }
    public void setEnderecoPrincipal(String enderecoPrincipal) { this.enderecoPrincipal = enderecoPrincipal; }
}
