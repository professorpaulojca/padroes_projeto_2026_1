package br.edu.padroes.criacionais.factory;

/**
 * Padrão Factory Method - Define uma interface para criar objetos,
 * mas permite que as subclasses decidam qual classe instanciar.
 * 
 * Factory para criar diferentes tipos de notificações
 */
public class NotificacaoFactory {
    
    /**
     * Método factory que cria instâncias de Notificacao baseado no tipo
     */
    public static Notificacao criarNotificacao(String tipo) {
        if (tipo == null || tipo.isEmpty()) {
            throw new IllegalArgumentException("Tipo de notificação não pode ser nulo ou vazio");
        }
        
        switch (tipo.toUpperCase()) {
            case "EMAIL":
                return new NotificacaoEmail();
            case "SMS":
                return new NotificacaoSMS();
            case "PUSH":
                return new NotificacaoPush();
            default:
                throw new IllegalArgumentException("Tipo de notificação desconhecido: " + tipo);
        }
    }
}
