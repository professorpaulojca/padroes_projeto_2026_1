package br.edu.padroes.estruturais.adapter;

/**
 * Exemplo de uso do padrão Adapter
 */
public class ExemploAdapter {
    
    public static void main(String[] args) {
        System.out.println("=== Exemplo do Padrão Adapter ===\n");
        
        PlayerUniversal player = new PlayerUniversal();
        
        System.out.println("Reproduzindo diferentes formatos:\n");
        
        player.tocarMusica("mp3", "musica.mp3");
        player.tocarMusica("vlc", "video.mp4");
        player.tocarMusica("mp3", "podcast.mp3");
        player.tocarMusica("avi", "filme.avi");
        
        System.out.println("\n✓ O padrão Adapter permitiu que o PlayerUniversal use");
        System.out.println("  reprodutores com interfaces diferentes através de uma");
        System.out.println("  interface comum (ReprodutorAudio).");
    }
}
