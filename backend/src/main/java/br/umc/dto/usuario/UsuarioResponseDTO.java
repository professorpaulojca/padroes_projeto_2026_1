package br.umc.dto.usuario;

import br.umc.models.UsuarioEntity;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Schema(description = "Dados de um usuário")
public class UsuarioResponseDTO {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    @Schema(description = "ID do usuário", example = "1")
    private Long id;

    @Schema(description = "E-mail do usuário", example = "joao@email.com")
    private String email;

    @Schema(description = "Nome de exibição", example = "João da Silva")
    private String nomeExibicao;

    @Schema(description = "Perfil do usuário", example = "USUARIO")
    private String perfil;

    @Schema(description = "Indica se o usuário está ativo", example = "true")
    private boolean ativo;

    @Schema(description = "ID da pessoa vinculada ao usuário")
    private Long pessoaId;

    @Schema(description = "Nome da pessoa vinculada ao usuário")
    private String pessoaNome;

    @Schema(description = "Data de criação", example = "01/01/2024 10:00:00")
    private String criadoEm;

    @Schema(description = "Data de atualização", example = "01/01/2024 10:00:00")
    private String atualizadoEm;

    public UsuarioResponseDTO() {
    }

    public static UsuarioResponseDTO fromEntity(UsuarioEntity entity) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.id = entity.getId();
        dto.email = entity.getEmail();
        dto.nomeExibicao = entity.getNomeExibicao();
        dto.perfil = entity.getPerfil() != null ? entity.getPerfil().name() : null;
        dto.ativo = entity.isAtivo();
        if (entity.getPessoa() != null) {
            dto.pessoaId = entity.getPessoa().getId();
            dto.pessoaNome = entity.getPessoa().getNome();
        }
        dto.criadoEm = entity.getCriadoEm() != null ? entity.getCriadoEm().format(FORMATTER) : null;
        dto.atualizadoEm = entity.getAtualizadoEm() != null ? entity.getAtualizadoEm().format(FORMATTER) : null;
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getNomeExibicao() { return nomeExibicao; }
    public void setNomeExibicao(String nomeExibicao) { this.nomeExibicao = nomeExibicao; }

    public String getPerfil() { return perfil; }
    public void setPerfil(String perfil) { this.perfil = perfil; }

    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    public Long getPessoaId() { return pessoaId; }
    public void setPessoaId(Long pessoaId) { this.pessoaId = pessoaId; }

    public String getPessoaNome() { return pessoaNome; }
    public void setPessoaNome(String pessoaNome) { this.pessoaNome = pessoaNome; }

    public String getCriadoEm() { return criadoEm; }
    public void setCriadoEm(String criadoEm) { this.criadoEm = criadoEm; }

    public String getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(String atualizadoEm) { this.atualizadoEm = atualizadoEm; }
}
