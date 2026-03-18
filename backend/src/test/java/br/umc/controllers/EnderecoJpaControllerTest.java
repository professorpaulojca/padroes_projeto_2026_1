package br.umc.controllers;

import br.umc.dto.auth.CadastroRequestDTO;
import br.umc.models.EnderecoEntity;
import br.umc.models.enums.EnderecoPrincipal;
import br.umc.models.enums.TipoEndereco;
import br.umc.repositories.EnderecoRepository;
import br.umc.repositories.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
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
class EnderecoJpaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EnderecoRepository enderecoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private String tokenJwt;

    @BeforeEach
    void setup() throws Exception {
        enderecoRepository.deleteAll();
        usuarioRepository.deleteAll();

        CadastroRequestDTO cadastro = new CadastroRequestDTO(
                "end-user@email.com", "Senha@123", "End User");
        MvcResult result = mockMvc.perform(
                        org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                                .post("/auth/cadastro")
                                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(cadastro)))
                .andReturn();

        tokenJwt = objectMapper.readTree(result.getResponse().getContentAsString())
                .get("token").asText();
    }

    private String bearer() {
        return "Bearer " + tokenJwt;
    }

    private EnderecoEntity salvarEndereco(String cep, String logradouro, String numero) {
        EnderecoEntity e = new EnderecoEntity();
        e.setCep(cep);
        e.setLogradouro(logradouro);
        e.setNumero(numero);
        e.setBairro("Centro");
        e.setCidade("São Paulo");
        e.setEstado("SP");
        e.setPais("Brasil");
        e.setTipoEndereco(TipoEndereco.RESIDENCIAL);
        e.setEnderecoPrincipal(EnderecoPrincipal.SIM);
        return enderecoRepository.save(e);
    }

    @Test
    @DisplayName("GET /api/enderecos - deve retornar lista de endereços")
    void deveListarEnderecos() throws Exception {
        salvarEndereco("01310-100", "Av. Paulista", "1000");
        salvarEndereco("04038-001", "Rua Domingos de Morais", "500");

        mockMvc.perform(get("/api/enderecos")
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/enderecos - deve retornar lista vazia")
    void deveRetornarListaVaziaEnderecos() throws Exception {
        mockMvc.perform(get("/api/enderecos")
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("GET /api/enderecos/{id} - deve retornar endereço por ID")
    void deveBuscarEnderecoPorId() throws Exception {
        EnderecoEntity e = salvarEndereco("01310-100", "Av. Paulista", "1500");

        mockMvc.perform(get("/api/enderecos/" + e.getId())
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(e.getId().intValue())))
                .andExpect(jsonPath("$.cep", is("01310-100")))
                .andExpect(jsonPath("$.logradouro", is("Av. Paulista")));
    }

    @Test
    @DisplayName("GET /api/enderecos/{id} - deve retornar 404 para ID inexistente")
    void deveRetornar404EnderecoIdInexistente() throws Exception {
        mockMvc.perform(get("/api/enderecos/999999")
                        .header("Authorization", bearer()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.erro", containsString("não encontrado")));
    }

    @Test
    @DisplayName("GET /api/enderecos/buscar - deve buscar por CEP")
    void deveBuscarEnderecoPorCep() throws Exception {
        salvarEndereco("01310-100", "Av. Paulista", "1000");
        salvarEndereco("01310-100", "Av. Paulista", "2000");
        salvarEndereco("04038-001", "Rua Domingos de Morais", "500");

        mockMvc.perform(get("/api/enderecos/buscar")
                        .header("Authorization", bearer())
                        .param("cep", "01310-100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    @DisplayName("GET /api/enderecos/buscar - deve retornar lista vazia para CEP não cadastrado")
    void deveRetornarVazioParaCepNaoCadastrado() throws Exception {
        mockMvc.perform(get("/api/enderecos/buscar")
                        .header("Authorization", bearer())
                        .param("cep", "99999-999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("DELETE /api/enderecos/{id} - deve excluir endereço por ID")
    void deveExcluirEndereco() throws Exception {
        EnderecoEntity e = salvarEndereco("01310-100", "Av. Paulista", "1500");

        mockMvc.perform(delete("/api/enderecos/" + e.getId())
                        .header("Authorization", bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.mensagem", containsString("sucesso")));

        mockMvc.perform(get("/api/enderecos/" + e.getId())
                        .header("Authorization", bearer()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/enderecos/{id} - deve retornar 404 para ID inexistente")
    void deveFalharExcluirEnderecoIdInexistente() throws Exception {
        mockMvc.perform(delete("/api/enderecos/999999")
                        .header("Authorization", bearer()))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/enderecos - deve retornar 403 sem token")
    void deveRetornar403SemToken() throws Exception {
        mockMvc.perform(get("/api/enderecos"))
                .andExpect(status().isForbidden());
    }
}
