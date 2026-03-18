package br.edu.padroes.criacionais.factory;

/**
 * Implementação concreta: Notificação por SMS
 */
public class NotificacaoSMS implements Notificacao {
    
    @Override
    public void enviar(String destinatario, String mensagem) {
        System.out.println("📱 Enviando SMS para: " + destinatario);
        System.out.println("   Mensagem: " + mensagem);
    }
    
    @Override
    public String getTipo() {
        return "SMS";
    }
}
