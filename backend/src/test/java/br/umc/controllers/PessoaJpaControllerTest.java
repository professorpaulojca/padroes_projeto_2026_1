package br.umc.controllers;

import br.umc.dto.auth.CadastroRequestDTO;
import br.umc.dto.pessoa.PessoaRequestDTO;
import br.umc.models.PerfilUsuario;
import br.umc.models.PessoaEntity;
import br.umc.repositories.PessoaJpaRepository;
import br.umc.repositories.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PessoaJpaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PessoaJpaRepository pessoaJpaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private String tokenJwt;

    @BeforeEach
    void setup() throws Exception {
        pessoaJpaRepository.deleteAll();
        usuarioRepository.deleteAll();

        CadastroRequestDTO cadastro = new CadastroRequestDTO(
                "user@email.com", "Senha@123", "Usuário");
        MvcResult result = mockMvc.perform(post("/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(cadastro)))
                .andReturn();

        tokenJwt = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();
    }

    private String bearer() {
        return "Bearer " + tokenJwt;
    }

    private PessoaEntity salvarPessoa(String nome, String dataNasc) {
        PessoaEntity p = new PessoaEntity();
        p.setNome(nome);
        p.setDataNascimento(LocalDate.parse(dataNasc));
        return pessoaJpaRepository.save(p);
    }

    @Test
    @DisplayName("POST /api/pessoas - deve cadastrar pessoa com sucesso")
    void deveCadastrarPessoa() throws Exception {
        PessoaRequestDTO dto = new PessoaRequestDTO("João da Silva", "15/03/1990");

        mockMvc.perform(post("/api/pessoas")
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.nome", is("João da Silva")))
                .andExpect(jsonPath("$.dataNascimento", is("15/03/1990")))
                .andExpect(jsonPath("$.idade", greaterThan(0)));
    }

    @Test
    @DisplayName("POST /api/pessoas - deve retornar 400 com nome em branco")
    void deveFalharCadastroPessoaNomeVazio() throws Exception {
        PessoaRequestDTO dto = new PessoaRequestDTO("", "15/03/1990");

        mockMvc.perform(post("/api/pessoas")
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/pessoas - deve retornar 400 com data inválida")
    void deveFalharCadastroPessoaDataInvalida() throws Exception {
        PessoaRequestDTO dto = new PessoaRequestDTO("Maria", "1990-03-15");

        mockMvc.perform(post("/api/pessoas")
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /api/pessoas - deve retornar 403 sem token")
    void deveFalharSemAutenticacao() throws Exception {
        PessoaRequestDTO dto = new PessoaRequestDTO("Teste", "01/01/2000");

        mockMvc.perform(post("/api/pessoas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/pessoas - deve listar todas as pessoas")
    void deveListarTodasPessoas() throws Exception {
        salvarPessoa("Ana Lima", "1985-05-20");
        salvarPessoa("Carlos Souza", "1992-11-10");

        mockMvc.perform(get("/api/pessoas")
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].nome", is("Ana Lima")));
    }

    @Test
    @DisplayName("GET /api/pessoas - deve retornar lista vazia quando não há pessoas")
    void deveRetornarListaVazia() throws Exception {
        mockMvc.perform(get("/api/pessoas")
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/pessoas/{id} - deve buscar pessoa por ID")
    void deveBuscarPessoaPorId() throws Exception {
        PessoaEntity p = salvarPessoa("Fernanda Costa", "2000-07-04");

        mockMvc.perform(get("/api/pessoas/" + p.getId())
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(p.getId().intValue())))
                .andExpect(jsonPath("$.nome", is("Fernanda Costa")));
    }

    @Test
    @DisplayName("GET /api/pessoas/{id} - deve retornar 404 para ID inexistente")
    void deveRetornar404PessoaIdInexistente() throws Exception {
        mockMvc.perform(get("/api/pessoas/999999")
                        .header("Authorization", bearer()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro", containsString("não encontrada")));
    }

    @Test
    @DisplayName("GET /api/pessoas/buscar - deve buscar por nome parcial")
    void deveBuscarPorNomeParcial() throws Exception {
        salvarPessoa("João Pedro", "1990-01-01");
        salvarPessoa("Pedro Alves", "1988-06-15");
        salvarPessoa("Maria Silva", "1995-03-20");

        mockMvc.perform(get("/api/pessoas/buscar")
                        .header("Authorization", bearer())
                        .param("nome", "Pedro"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("PUT /api/pessoas/{id} - deve atualizar dados de uma pessoa")
    void deveAtualizarPessoa() throws Exception {
        PessoaEntity p = salvarPessoa("Nome Antigo", "1990-01-01");

        PessoaRequestDTO dto = new PessoaRequestDTO("Nome Atualizado", "20/06/1991");

        mockMvc.perform(put("/api/pessoas/" + p.getId())
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome", is("Nome Atualizado")))
                .andExpect(jsonPath("$.dataNascimento", is("20/06/1991")));
    }

    @Test
    @DisplayName("PUT /api/pessoas/{id} - deve retornar 404 para ID inexistente")
    void deveFalharAtualizarPessoaIdInexistente() throws Exception {
        PessoaRequestDTO dto = new PessoaRequestDTO("Qualquer", "01/01/2000");

        mockMvc.perform(put("/api/pessoas/999999")
                        .header("Authorization", bearer())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/pessoas/{id} - deve excluir pessoa por ID")
    void deveExcluirPessoa() throws Exception {
        PessoaEntity p = salvarPessoa("Excluir Teste", "1980-12-31");

        mockMvc.perform(delete("/api/pessoas/" + p.getId())
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem", containsString("sucesso")));

        mockMvc.perform(get("/api/pessoas/" + p.getId())
                        .header("Authorization", bearer()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/pessoas/{id} - deve retornar 404 para ID inexistente")
    void deveFalharExcluirPessoaIdInexistente() throws Exception {
        mockMvc.perform(delete("/api/pessoas/999999")
                        .header("Authorization", bearer()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/pessoas/{id}/enderecos - deve retornar lista vazia para pessoa sem endereços")
    void deveRetornarEnderecoVazioParaPessoa() throws Exception {
        PessoaEntity p = salvarPessoa("Sem Endereço", "1990-01-01");

        mockMvc.perform(get("/api/pessoas/" + p.getId() + "/enderecos")
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/pessoas/{id}/enderecos - deve retornar 404 para pessoa inexistente")
    void deveRetornar404EnderecosPessoaInexistente() throws Exception {
        mockMvc.perform(get("/api/pessoas/999999/enderecos")
                        .header("Authorization", bearer()))
                .andExpect(status().isNotFound());
    }
}
