package br.edu.padroes.comportamentais.observer;

/**
 * Interface Observer - Define o método de atualização
 */
public interface Observer {
    void atualizar(String mensagem);
    String getNome();
}
