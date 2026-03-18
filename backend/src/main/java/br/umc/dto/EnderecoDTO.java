package br.umc.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Dados para cadastro de um endereço. O logradouro, bairro, cidade, estado e país são preenchidos automaticamente via ViaCEP.")
public class EnderecoDTO {

    @Schema(description = "CEP do endereço (com ou sem máscara)", example = "01310-100")
    @NotBlank(message = "CEP é obrigatório")
    @Pattern(regexp = "\\d{5}-?\\d{3}", message = "CEP deve estar no formato 99999-999 ou 99999999")
    private String cep;

    @Schema(description = "Número do endereço", example = "1500")
    @NotBlank(message = "Número é obrigatório")
    private String numero;

    @Schema(description = "Complemento do endereço (opcional)", example = "Apto 42")
    private String complemento;

    @Schema(description = "Tipo do endereço: RESIDENCIAL, COMERCIAL, COBRANCA, ENTREGA, OUTRO", example = "RESIDENCIAL")
    @NotBlank(message = "Tipo de endereço é obrigatório")
    private String tipoEndereco;

    @Schema(description = "Indica se é o endereço principal: SIM ou NAO", example = "SIM")
    @NotBlank(message = "Indicação de endereço principal é obrigatória")
    private String enderecoPrincipal;

    public EnderecoDTO() {
    }

    public EnderecoDTO(String cep, String numero, String complemento, String tipoEndereco, String enderecoPrincipal) {
        this.cep = cep;
        this.numero = numero;
        this.complemento = complemento;
        this.tipoEndereco = tipoEndereco;
        this.enderecoPrincipal = enderecoPrincipal;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getTipoEndereco() {
        return tipoEndereco;
    }

    public void setTipoEndereco(String tipoEndereco) {
        this.tipoEndereco = tipoEndereco;
    }

    public String getEnderecoPrincipal() {
        return enderecoPrincipal;
    }

    public void setEnderecoPrincipal(String enderecoPrincipal) {
        this.enderecoPrincipal = enderecoPrincipal;
    }
}
