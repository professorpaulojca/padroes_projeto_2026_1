package br.edu.padroes.comportamentais.strategy;

/**
 * Interface Strategy - Define a família de algoritmos
 */
public interface EstrategiaPagamento {
    void pagar(double valor);
    String getNome();
}
