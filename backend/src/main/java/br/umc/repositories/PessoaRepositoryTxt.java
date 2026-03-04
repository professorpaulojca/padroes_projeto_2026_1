package br.umc.repositories;

import br.umc.models.Endereco;
import br.umc.models.Pessoa;
import br.umc.models.valueObjects.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

            PessoaJson pessoaJson = PessoaJson.fromPessoa(pessoa);

            boolean atualizado = false;
            for (int i = 0; i < pessoas.size(); i++) {
                if (pessoas.get(i).getNome().equalsIgnoreCase(pessoa.getNome().getValor())) {
                    pessoas.set(i, pessoaJson);
                    atualizado = true;
                    break;
                }
            }

            if (!atualizado) {
                pessoas.add(pessoaJson);
            }

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
                    .map(PessoaJson::toPessoa)
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
                    .map(PessoaJson::toPessoa);
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

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class PessoaJson {
        private String nome;
        private LocalDate dataNascimento;
        private List<EnderecoJson> enderecos = new ArrayList<>();

        public PessoaJson() {
        }

        public static PessoaJson fromPessoa(Pessoa pessoa) {
            PessoaJson pj = new PessoaJson();
            pj.nome = pessoa.getNome().getValor();
            pj.dataNascimento = pessoa.getDataNascimento().getValor();
            pj.enderecos = pessoa.getEnderecos().stream()
                    .map(EnderecoJson::fromEndereco)
                    .collect(Collectors.toList());
            return pj;
        }

        public Pessoa toPessoa() {
            Pessoa pessoa = new Pessoa(nome, dataNascimento);
            if (enderecos != null) {
                enderecos.stream()
                        .map(EnderecoJson::toEndereco)
                        .forEach(pessoa::adicionarEndereco);
            }
            return pessoa;
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

        public List<EnderecoJson> getEnderecos() {
            return enderecos;
        }

        public void setEnderecos(List<EnderecoJson> enderecos) {
            this.enderecos = enderecos;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private static class EnderecoJson {
        private String cep;
        private String logradouro;
        private String numero;
        private String complemento;
        private String bairro;
        private String cidade;
        private String estado;
        private String pais;
        private String tipoEndereco;
        private String enderecoPrincipal;
        private Double latitude;
        private Double longitude;

        public EnderecoJson() {
        }

        public static EnderecoJson fromEndereco(Endereco e) {
            EnderecoJson ej = new EnderecoJson();
            ej.cep = e.getCep().getValor();
            ej.logradouro = e.getLogradouro().getValor();
            ej.numero = e.getNumero().getValor();
            ej.complemento = e.getComplemento() != null ? e.getComplemento().getValor() : null;
            ej.bairro = e.getBairro().getValor();
            ej.cidade = e.getCidade().getValor();
            ej.estado = e.getEstado().getValor();
            ej.pais = e.getPais().getValor();
            ej.tipoEndereco = e.getTipoEndereco().getValor().name();
            ej.enderecoPrincipal = e.getEnderecoPrincipal().getValor().name();
            if (e.getGeolocalizacao().isPresente()) {
                ej.latitude = e.getGeolocalizacao().getLatitude();
                ej.longitude = e.getGeolocalizacao().getLongitude();
            }
            return ej;
        }

        public Endereco toEndereco() {
            return new Endereco(
                    new Cep(cep),
                    new Numero(numero),
                    new Complemento(complemento),
                    new Logradouro(logradouro),
                    new TipoEnderecoVO(tipoEndereco),
                    new EnderecoPrincipalVO(enderecoPrincipal),
                    new Bairro(bairro),
                    new Cidade(cidade),
                    new Estado(estado),
                    new Pais(pais),
                    new Geolocalizacao(latitude, longitude)
            );
        }

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
}
