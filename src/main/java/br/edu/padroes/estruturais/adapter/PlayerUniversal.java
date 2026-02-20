package br.edu.padroes.estruturais.adapter;

/**
 * Cliente que usa a interface ReprodutorAudio
 */
public class PlayerUniversal {
    
    public void tocarMusica(String tipoArquivo, String nomeArquivo) {
        ReprodutorAudio reprodutor = null;
        
        if (tipoArquivo.equalsIgnoreCase("mp3")) {
            reprodutor = new AdaptadorMP3();
        } else if (tipoArquivo.equalsIgnoreCase("vlc") || 
                   tipoArquivo.equalsIgnoreCase("mp4")) {
            reprodutor = new AdaptadorVLC();
        } else {
            System.out.println("❌ Formato não suportado: " + tipoArquivo);
            return;
        }
        
        reprodutor.reproduzir(nomeArquivo);
    }
}
