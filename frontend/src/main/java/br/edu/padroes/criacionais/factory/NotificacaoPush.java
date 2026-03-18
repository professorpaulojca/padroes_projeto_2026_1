package br.edu.padroes.criacionais.factory;

/**
 * Implementação concreta: Notificação Push
 */
public class NotificacaoPush implements Notificacao {
    
    @Override
    public void enviar(String destinatario, String mensagem) {
        System.out.println("🔔 Enviando PUSH para: " + destinatario);
        System.out.println("   Mensagem: " + mensagem);
    }
    
    @Override
    public String getTipo() {
        return "PUSH";
    }
}
