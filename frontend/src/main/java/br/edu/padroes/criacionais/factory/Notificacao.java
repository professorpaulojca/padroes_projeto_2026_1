package br.edu.padroes.criacionais.factory;

/**
 * Interface comum para todos os tipos de notificação
 */
public interface Notificacao {
    void enviar(String destinatario, String mensagem);
    String getTipo();
}
