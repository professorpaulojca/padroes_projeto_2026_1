package br.umc.repositories;

import br.umc.models.Pessoa;

import java.util.List;
import java.util.Optional;

public interface PessoaRepository {

    void salvar(Pessoa pessoa);

    List<Pessoa> buscarTodas();

    Optional<Pessoa> buscarPorNome(String nome);
}
