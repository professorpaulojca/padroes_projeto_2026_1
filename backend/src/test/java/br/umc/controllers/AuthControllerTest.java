package br.umc.controllers;

import br.umc.dto.auth.CadastroRequestDTO;
import br.umc.dto.auth.EsqueciSenhaRequestDTO;
import br.umc.dto.auth.LoginRequestDTO;
import br.umc.dto.auth.RedefinirSenhaRequestDTO;
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

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static final String EMAIL = "teste@email.com";
    private static final String SENHA = "Senha@123";

    @BeforeEach
    void setup() {
        usuarioRepository.deleteAll();
    }

    private UsuarioEntity criarUsuario(String email, String senha) {
        UsuarioEntity u = new UsuarioEntity();
        u.setEmail(email);
        u.setSenha(passwordEncoder.encode(senha));
        u.setNomeExibicao("Usuário Teste");
        u.setPerfil(PerfilUsuario.USUARIO);
        return usuarioRepository.save(u);
    }

    @Test
    @DisplayName("POST /auth/cadastro - deve criar usuário e retornar token JWT")
    void deveCadastrarUsuarioERetornarToken() throws Exception {
        CadastroRequestDTO dto = new CadastroRequestDTO(EMAIL, SENHA, "Teste Silva");

        mockMvc.perform(post("/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andExpect(jsonPath("$.email", is(EMAIL)))
                .andExpect(jsonPath("$.tipo", is("Bearer")));
    }

    @Test
    @DisplayName("POST /auth/cadastro - deve retornar 400 quando e-mail já cadastrado")
    void deveFalharCadastroEmailDuplicado() throws Exception {
        criarUsuario(EMAIL, SENHA);

        CadastroRequestDTO dto = new CadastroRequestDTO(EMAIL, SENHA, "Outro Nome");

        mockMvc.perform(post("/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro", containsString("já cadastrado")));
    }

    @Test
    @DisplayName("POST /auth/cadastro - deve retornar 400 para dados inválidos")
    void deveFalharCadastroEmailInvalido() throws Exception {
        CadastroRequestDTO dto = new CadastroRequestDTO("email-invalido", "123", "");

        mockMvc.perform(post("/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /auth/login - deve autenticar e retornar token JWT")
    void deveLoginERetornarToken() throws Exception {
        criarUsuario(EMAIL, SENHA);

        LoginRequestDTO dto = new LoginRequestDTO(EMAIL, SENHA);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andExpect(jsonPath("$.email", is(EMAIL)))
                .andExpect(jsonPath("$.tipo", is("Bearer")));
    }

    @Test
    @DisplayName("POST /auth/login - deve retornar 401 com senha errada")
    void deveFalharLoginSenhaErrada() throws Exception {
        criarUsuario(EMAIL, SENHA);

        LoginRequestDTO dto = new LoginRequestDTO(EMAIL, "SenhaErrada@999");

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /auth/login - deve retornar 401 com e-mail inexistente")
    void deveFalharLoginEmailInexistente() throws Exception {
        LoginRequestDTO dto = new LoginRequestDTO("naoexiste@email.com", SENHA);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /auth/esqueci-senha - deve gerar token de reset")
    void deveGerarTokenDeResetDeSenha() throws Exception {
        criarUsuario(EMAIL, SENHA);

        EsqueciSenhaRequestDTO dto = new EsqueciSenhaRequestDTO(EMAIL);

        MvcResult result = mockMvc.perform(post("/auth/esqueci-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", not(emptyString())))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        assertNotNull(responseBody);
    }

    @Test
    @DisplayName("POST /auth/esqueci-senha - deve retornar 400 para e-mail não cadastrado")
    void deveFalharEsqueciSenhaEmailInexistente() throws Exception {
        EsqueciSenhaRequestDTO dto = new EsqueciSenhaRequestDTO("naoexiste@email.com");

        mockMvc.perform(post("/auth/esqueci-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /auth/redefinir-senha - deve redefinir senha com token válido")
    void deveRedefinirSenhaComTokenValido() throws Exception {
        UsuarioEntity usuario = criarUsuario(EMAIL, SENHA);
        String token = "tokenvalido123abc";
        usuarioRepository.updateTokenReset(usuario.getId(), token, LocalDateTime.now().plusHours(1));

        RedefinirSenhaRequestDTO dto = new RedefinirSenhaRequestDTO(token, "NovaSenha@456");

        mockMvc.perform(post("/auth/redefinir-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem", containsString("sucesso")));
    }

    @Test
    @DisplayName("POST /auth/redefinir-senha - deve retornar 400 para token inválido")
    void deveFalharRedefinirSenhaTokenInvalido() throws Exception {
        RedefinirSenhaRequestDTO dto = new RedefinirSenhaRequestDTO("tokeninvalido", "NovaSenha@456");

        mockMvc.perform(post("/auth/redefinir-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro", containsString("Token inválido")));
    }

    @Test
    @DisplayName("POST /auth/redefinir-senha - deve retornar 400 para token expirado")
    void deveFalharRedefinirSenhaTokenExpirado() throws Exception {
        UsuarioEntity usuario = criarUsuario(EMAIL, SENHA);
        String token = "tokenexpirado123";
        usuarioRepository.updateTokenReset(usuario.getId(), token, LocalDateTime.now().minusHours(2));

        RedefinirSenhaRequestDTO dto = new RedefinirSenhaRequestDTO(token, "NovaSenha@456");

        mockMvc.perform(post("/auth/redefinir-senha")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erro", containsString("Token inválido")));
    }
}
