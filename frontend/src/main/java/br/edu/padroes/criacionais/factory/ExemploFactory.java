package br.edu.padroes.criacionais.factory;

/**
 * Exemplo de uso do padrão Factory Method
 */
public class ExemploFactory {
    
    public static void main(String[] args) {
        System.out.println("=== Exemplo do Padrão Factory Method ===\n");
        
        // Criando diferentes tipos de notificações usando a factory
        Notificacao emailNotificacao = NotificacaoFactory.criarNotificacao("EMAIL");
        Notificacao smsNotificacao = NotificacaoFactory.criarNotificacao("SMS");
        Notificacao pushNotificacao = NotificacaoFactory.criarNotificacao("PUSH");
        
        // Enviando notificações
        emailNotificacao.enviar("usuario@email.com", "Bem-vindo ao sistema!");
        System.out.println();
        
        smsNotificacao.enviar("+55 11 98765-4321", "Seu código de verificação: 123456");
        System.out.println();
        
        pushNotificacao.enviar("user_device_token", "Você tem uma nova mensagem!");
        System.out.println();
        
        System.out.println("✓ A Factory criou diferentes objetos sem que o cliente");
        System.out.println("  precise conhecer os detalhes de implementação de cada tipo.");
    }
}
