package br.umc.controllers;

import br.umc.dto.auth.CadastroRequestDTO;
import br.umc.dto.auth.LoginRequestDTO;
import br.umc.dto.usuario.AlterarSenhaRequestDTO;
import br.umc.dto.usuario.AtualizarPerfilRequestDTO;
import br.umc.models.PerfilUsuario;
import br.umc.models.UsuarioEntity;
import br.umc.repositories.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String EMAIL = "usuario@email.com";
    private static final String SENHA = "Senha@123";
    private String tokenJwt;
    private Long usuarioId;

    @BeforeEach
    void setup() throws Exception {
        usuarioRepository.deleteAll();

        CadastroRequestDTO cadastro = new CadastroRequestDTO(EMAIL, SENHA, "Usuário Teste");
        MvcResult result = mockMvc.perform(post("/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cadastro)))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        tokenJwt = objectMapper.readTree(body).get("token").asText();
        usuarioId = usuarioRepository.findByEmail(EMAIL).orElseThrow().getId();
    }

    private String bearer() {
        return "Bearer " + tokenJwt;
    }

    @Test
    @DisplayName("GET /api/usuarios/me - deve retornar dados do usuário autenticado")
    void deveRetornarDadosDoUsuarioAutenticado() throws Exception {
        mockMvc.perform(get("/api/usuarios/me")
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is(EMAIL)))
                .andExpect(jsonPath("$.nomeExibicao", is("Usuário Teste")));
    }

    @Test
    @DisplayName("GET /api/usuarios/me - deve retornar 403 sem token")
    void deveRetornar403SemToken() throws Exception {
        mockMvc.perform(get("/api/usuarios/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/usuarios/{id} - deve retornar usuário por ID")
    void deveRetornarUsuarioPorId() throws Exception {
        mockMvc.perform(get("/api/usuarios/" + usuarioId)
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(usuarioId.intValue())))
                .andExpect(jsonPath("$.email", is(EMAIL)));
    }

    @Test
    @DisplayName("GET /api/usuarios/{id} - deve retornar 404 para ID inexistente")
    void deveRetornar404ParaIdInexistente() throws Exception {
        mockMvc.perform(get("/api/usuarios/9999999")
                        .header("Authorization", bearer()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/usuarios - deve retornar 403 para usuário sem perfil ADMIN")
    void deveRetornar403ParaListarSemAdmin() throws Exception {
        mockMvc.perform(get("/api/usuarios")
                        .header("Authorization", bearer()))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/usuarios - deve retornar lista para usuário ADMIN")
    void deveListarParaAdmin() throws Exception {
        UsuarioEntity admin = new UsuarioEntity();
        admin.setEmail("admin@email.com");
        admin.setSenha(passwordEncoder.encode("Admin@456"));
        admin.setNomeExibicao("Admin");
        admin.setPerfil(PerfilUsuario.ADMIN);
        usuarioRepository.save(admin);

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequestDTO("admin@email.com", "Admin@456"))))
                .andReturn();

        String adminToken = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("token").asText();

        mockMvc.perform(get("/api/usuarios")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("PUT /api/usuarios/{id}/perfil - deve atualizar nome de exibição")
    void deveAtualizarNomeDeExibicao() throws Exception {
        AtualizarPerfilRequestDTO dto = new AtualizarPerfilRequestDTO("Novo Nome", null);

        mockMvc.perform(put("/api/usuarios/" + usuarioId + "/perfil")
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomeExibicao", is("Novo Nome")));
    }

    @Test
    @DisplayName("PUT /api/usuarios/{id}/perfil - deve retornar 403 ao editar outro usuário")
    void deveRetornar403AoEditarOutroUsuario() throws Exception {
        UsuarioEntity outro = new UsuarioEntity();
        outro.setEmail("outro@email.com");
        outro.setSenha(passwordEncoder.encode("Outro@123"));
        outro.setNomeExibicao("Outro");
        outro.setPerfil(PerfilUsuario.USUARIO);
        UsuarioEntity outroSalvo = usuarioRepository.save(outro);

        AtualizarPerfilRequestDTO dto = new AtualizarPerfilRequestDTO("Hacker Name", null);

        mockMvc.perform(put("/api/usuarios/" + outroSalvo.getId() + "/perfil")
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PUT /api/usuarios/{id}/senha - deve alterar senha com senha atual correta")
    void deveAlterarSenhaCorretamente() throws Exception {
        AlterarSenhaRequestDTO dto = new AlterarSenhaRequestDTO(SENHA, "NovaSenha@456");

        mockMvc.perform(put("/api/usuarios/" + usuarioId + "/senha")
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem", containsString("sucesso")));
    }

    @Test
    @DisplayName("PUT /api/usuarios/{id}/senha - deve retornar 400 com senha atual errada")
    void deveFalharAlterarSenhaAtualErrada() throws Exception {
        AlterarSenhaRequestDTO dto = new AlterarSenhaRequestDTO("SenhaErrada@999", "NovaSenha@456");

        mockMvc.perform(put("/api/usuarios/" + usuarioId + "/senha")
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro", containsString("Senha atual incorreta")));
    }

    @Test
    @DisplayName("DELETE /api/usuarios/{id} - deve desativar o próprio usuário")
    void deveDesativarProprioUsuario() throws Exception {
        mockMvc.perform(delete("/api/usuarios/" + usuarioId)
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem", containsString("sucesso")));
    }
}
