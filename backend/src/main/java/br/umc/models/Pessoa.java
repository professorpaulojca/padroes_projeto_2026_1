package br.umc.models;

import br.umc.models.valueObjects.DataNascimento;
import br.umc.models.valueObjects.Nome;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class Pessoa {

    private final Nome nome;
    private final DataNascimento dataNascimento;
    private final List<Endereco> enderecos;

    public Pessoa(Nome nome, DataNascimento dataNascimento) {
        if (nome == null) {
            throw new IllegalArgumentException("Nome não pode ser nulo");
        }
        if (dataNascimento == null) {
            throw new IllegalArgumentException("Data de nascimento não pode ser nula");
        }
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.enderecos = new ArrayList<>();
    }

    public Pessoa(String nomeString, String dataNascimentoString) {
        this(new Nome(nomeString), new DataNascimento(dataNascimentoString));
    }

    public Pessoa(String nomeString, LocalDate dataNascimentoLocalDate) {
        this(new Nome(nomeString), new DataNascimento(dataNascimentoLocalDate));
    }

    public Nome getNome() {
        return nome;
    }

    public DataNascimento getDataNascimento() {
        return dataNascimento;
    }

    public int getIdade() {
        return dataNascimento.getIdade();
    }

    public List<Endereco> getEnderecos() {
        return Collections.unmodifiableList(enderecos);
    }

    public void adicionarEndereco(Endereco endereco) {
        if (endereco == null) {
            throw new IllegalArgumentException("Endereço não pode ser nulo");
        }
        enderecos.add(endereco);
    }

    public void removerEndereco(Endereco endereco) {
        enderecos.remove(endereco);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Pessoa pessoa = (Pessoa) o;
        return Objects.equals(nome, pessoa.nome) &&
               Objects.equals(dataNascimento, pessoa.dataNascimento);
    }

    @Override
    public int hashCode() {
        return Objects.hash(nome, dataNascimento);
    }

    @Override
    public String toString() {
        return "Pessoa{" +
                "nome=" + nome +
                ", dataNascimento=" + dataNascimento +
                ", idade=" + getIdade() +
                ", enderecos=" + enderecos +
                '}';
    }
}
