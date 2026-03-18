package br.edu.padroes.comportamentais.observer;

/**
 * Exemplo de uso do padrão Observer
 */
public class ExemploObserver {
    
    public static void main(String[] args) {
        System.out.println("=== Exemplo do Padrão Observer ===\n");
        
        // Criando o subject (canal de notícias)
        CanalNoticias canal = new CanalNoticias();
        
        // Criando observers (assinantes)
        Observer assinante1 = new AssinanteNoticia("João");
        Observer assinante2 = new AssinanteNoticia("Maria");
        Observer assinante3 = new AssinanteNoticia("Pedro");
        
        // Adicionando observadores
        canal.adicionarObservador(assinante1);
        canal.adicionarObservador(assinante2);
        canal.adicionarObservador(assinante3);
        
        // Publicando primeira notícia
        canal.publicarNoticia("Lançamento do Java 21 LTS!");
        
        // Removendo um observador
        System.out.println();
        canal.removerObservador(assinante2);
        
        // Publicando segunda notícia
        canal.publicarNoticia("Novas features do Spring Boot 3.2");
        
        System.out.println("\n✓ O padrão Observer permite que múltiplos objetos sejam");
        System.out.println("  notificados automaticamente quando o estado do subject muda.");
    }
}
