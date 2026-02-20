package br.edu.padroes.comportamentais.observer;

import java.util.ArrayList;
import java.util.List;

/**
 * Padrão Observer - Define uma dependência um-para-muitos entre objetos,
 * de modo que quando um objeto muda de estado, todos os seus dependentes
 * são notificados e atualizados automaticamente.
 * 
 * Subject (Observable) - mantém lista de observers e notifica mudanças
 */
public class CanalNoticias {
    
    private List<Observer> observadores = new ArrayList<>();
    private String ultimaNoticia;
    
    /**
     * Adiciona um observador à lista
     */
    public void adicionarObservador(Observer observador) {
        observadores.add(observador);
        System.out.println("✓ " + observador.getNome() + " se inscreveu no canal");
    }
    
    /**
     * Remove um observador da lista
     */
    public void removerObservador(Observer observador) {
        observadores.remove(observador);
        System.out.println("✗ " + observador.getNome() + " se desinscreveu do canal");
    }
    
    /**
     * Notifica todos os observadores sobre uma mudança
     */
    public void notificarObservadores(String mensagem) {
        System.out.println("\n📢 Notificando " + observadores.size() + " inscritos...");
        for (Observer observador : observadores) {
            observador.atualizar(mensagem);
        }
    }
    
    /**
     * Publica uma nova notícia e notifica os observadores
     */
    public void publicarNoticia(String noticia) {
        this.ultimaNoticia = noticia;
        System.out.println("\n🗞️  NOVA NOTÍCIA PUBLICADA:");
        System.out.println("   \"" + noticia + "\"");
        notificarObservadores(noticia);
    }
    
    public String getUltimaNoticia() {
        return ultimaNoticia;
    }
}
