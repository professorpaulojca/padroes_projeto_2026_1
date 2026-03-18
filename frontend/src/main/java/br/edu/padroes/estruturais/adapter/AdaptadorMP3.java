package br.edu.padroes.estruturais.adapter;

/**
 * Padrão Adapter - Converte a interface de uma classe em outra interface
 * esperada pelos clientes. Permite que classes com interfaces incompatíveis
 * trabalhem juntas.
 * 
 * Adapter que adapta ReprodutorMP3 para a interface ReprodutorAudio
 */
public class AdaptadorMP3 implements ReprodutorAudio {
    
    private ReprodutorMP3 reprodutorMP3;
    
    public AdaptadorMP3() {
        this.reprodutorMP3 = new ReprodutorMP3();
    }
    
    @Override
    public void reproduzir(String arquivo) {
        // Adapta a chamada para o método do MP3
        reprodutorMP3.tocarMP3(arquivo);
    }
}
