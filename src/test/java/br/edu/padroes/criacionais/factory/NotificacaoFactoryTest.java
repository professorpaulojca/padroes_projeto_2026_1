package br.edu.padroes.criacionais.factory;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes para o padrão Factory
 */
class NotificacaoFactoryTest {
    
    @Test
    void testCriarNotificacaoEmail() {
        Notificacao notificacao = NotificacaoFactory.criarNotificacao("EMAIL");
        
        assertNotNull(notificacao);
        assertInstanceOf(NotificacaoEmail.class, notificacao);
        assertEquals("EMAIL", notificacao.getTipo());
    }
    
    @Test
    void testCriarNotificacaoSMS() {
        Notificacao notificacao = NotificacaoFactory.criarNotificacao("SMS");
        
        assertNotNull(notificacao);
        assertInstanceOf(NotificacaoSMS.class, notificacao);
        assertEquals("SMS", notificacao.getTipo());
    }
    
    @Test
    void testCriarNotificacaoPush() {
        Notificacao notificacao = NotificacaoFactory.criarNotificacao("PUSH");
        
        assertNotNull(notificacao);
        assertInstanceOf(NotificacaoPush.class, notificacao);
        assertEquals("PUSH", notificacao.getTipo());
    }
    
    @Test
    void testCriarNotificacaoCaseInsensitive() {
        Notificacao notificacao = NotificacaoFactory.criarNotificacao("email");
        
        assertNotNull(notificacao);
        assertInstanceOf(NotificacaoEmail.class, notificacao);
    }
    
    @Test
    void testTipoInvalido() {
        assertThrows(IllegalArgumentException.class, () -> {
            NotificacaoFactory.criarNotificacao("INVALIDO");
        });
    }
    
    @Test
    void testTipoNulo() {
        assertThrows(IllegalArgumentException.class, () -> {
            NotificacaoFactory.criarNotificacao(null);
        });
    }
    
    @Test
    void testTipoVazio() {
        assertThrows(IllegalArgumentException.class, () -> {
            NotificacaoFactory.criarNotificacao("");
        });
    }
}
