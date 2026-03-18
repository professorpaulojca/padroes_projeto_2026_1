package br.edu.padroes.estruturais.adapter;

/**
 * Adapter que adapta ReprodutorVLC para a interface ReprodutorAudio
 */
public class AdaptadorVLC implements ReprodutorAudio {
    
    private ReprodutorVLC reprodutorVLC;
    
    public AdaptadorVLC() {
        this.reprodutorVLC = new ReprodutorVLC();
    }
    
    @Override
    public void reproduzir(String arquivo) {
        // Adapta a chamada para o método do VLC
        reprodutorVLC.executarVLC(arquivo);
    }
}
