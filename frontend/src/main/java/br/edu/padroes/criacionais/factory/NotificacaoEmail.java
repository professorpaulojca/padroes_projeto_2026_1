package br.edu.padroes.criacionais.factory;

/**
 * Implementação concreta: Notificação por Email
 */
public class NotificacaoEmail implements Notificacao {
    
    @Override
    public void enviar(String destinatario, String mensagem) {
        System.out.println("📧 Enviando EMAIL para: " + destinatario);
        System.out.println("   Mensagem: " + mensagem);
    }
    
    @Override
    public String getTipo() {
        return "EMAIL";
    }
}
