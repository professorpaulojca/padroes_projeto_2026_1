package br.edu.padroes.comportamentais.observer;

/**
 * Implementação concreta de Observer - Assinante do canal de notícias
 */
public class AssinanteNoticia implements Observer {
    
    private String nome;
    
    public AssinanteNoticia(String nome) {
        this.nome = nome;
    }
    
    @Override
    public void atualizar(String mensagem) {
        System.out.println("   👤 " + nome + " recebeu: \"" + mensagem + "\"");
    }
    
    @Override
    public String getNome() {
        return nome;
    }
}
