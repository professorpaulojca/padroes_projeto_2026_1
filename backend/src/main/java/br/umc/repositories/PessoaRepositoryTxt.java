package br.umc.repositories;

import br.umc.models.Pessoa;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.stereotype.Repository;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Repository
public class PessoaRepositoryTxt implements PessoaRepository {

    private static final String ARQUIVO = "pessoas.txt";
    private final ObjectMapper objectMapper;

    public PessoaRepositoryTxt() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    @Override
    public void salvar(Pessoa pessoa) {
        try {
            List<PessoaJson> pessoas = lerArquivo();
            
            PessoaJson pessoaJson = new PessoaJson(
                    pessoa.getNome().getValor(),
                    pessoa.getDataNascimento().getValor()
            );
            
            pessoas.add(pessoaJson);
            
            gravarArquivo(pessoas);
            
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar pessoa no arquivo: " + e.getMessage(), e);
        }
    }

    @Override
    public List<Pessoa> buscarTodas() {
        try {
            List<PessoaJson> pessoasJson = lerArquivo();
            return pessoasJson.stream()
                    .map(pj -> new Pessoa(pj.getNome(), pj.getDataNascimento()))
                    .collect(Collectors.toList());
        } catch (IOException e) {
            throw new RuntimeException("Erro ao buscar pessoas do arquivo: " + e.getMessage(), e);
        }
    }

    @Override
    public Optional<Pessoa> buscarPorNome(String nome) {
        try {
            List<PessoaJson> pessoasJson = lerArquivo();
            return pessoasJson.stream()
                    .filter(pj -> pj.getNome().equalsIgnoreCase(nome))
                    .findFirst()
                    .map(pj -> new Pessoa(pj.getNome(), pj.getDataNascimento()));
        } catch (IOException e) {
            throw new RuntimeException("Erro ao buscar pessoa por nome: " + e.getMessage(), e);
        }
    }

    private List<PessoaJson> lerArquivo() throws IOException {
        File file = new File(ARQUIVO);
        
        if (!file.exists()) {
            return new ArrayList<>();
        }
        
        String conteudo = new String(Files.readAllBytes(Paths.get(ARQUIVO)));
        
        if (conteudo.trim().isEmpty()) {
            return new ArrayList<>();
        }
        
        PessoaJson[] array = objectMapper.readValue(conteudo, PessoaJson[].class);
        return new ArrayList<>(Arrays.asList(array));
    }

    private void gravarArquivo(List<PessoaJson> pessoas) throws IOException {
        String json = objectMapper.writeValueAsString(pessoas);
        Files.write(Paths.get(ARQUIVO), json.getBytes());
    }

    private static class PessoaJson {
        private String nome;
        private LocalDate dataNascimento;

        public PessoaJson() {
        }

        public PessoaJson(String nome, LocalDate dataNascimento) {
            this.nome = nome;
            this.dataNascimento = dataNascimento;
        }

        public String getNome() {
            return nome;
        }

        public void setNome(String nome) {
            this.nome = nome;
        }

        public LocalDate getDataNascimento() {
            return dataNascimento;
        }

        public void setDataNascimento(LocalDate dataNascimento) {
            this.dataNascimento = dataNascimento;
        }
    }
}
