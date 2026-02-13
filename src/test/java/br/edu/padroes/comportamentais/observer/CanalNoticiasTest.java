package br.edu.padroes.comportamentais.observer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes para o padrão Observer
 */
class CanalNoticiasTest {
    
    private CanalNoticias canal;
    private AssinanteNoticia assinante1;
    private AssinanteNoticia assinante2;
    
    @BeforeEach
    void setUp() {
        canal = new CanalNoticias();
        assinante1 = new AssinanteNoticia("João");
        assinante2 = new AssinanteNoticia("Maria");
    }
    
    @Test
    void testAdicionarObservador() {
        canal.adicionarObservador(assinante1);
        
        // Não há como verificar diretamente o número de observadores,
        // mas podemos publicar e verificar que funciona sem erros
        assertDoesNotThrow(() -> canal.publicarNoticia("Teste"));
    }
    
    @Test
    void testRemoverObservador() {
        canal.adicionarObservador(assinante1);
        canal.removerObservador(assinante1);
        
        assertDoesNotThrow(() -> canal.publicarNoticia("Teste"));
    }
    
    @Test
    void testPublicarNoticia() {
        canal.publicarNoticia("Nova notícia importante");
        
        assertEquals("Nova notícia importante", canal.getUltimaNoticia());
    }
    
    @Test
    void testMultiplosObservadores() {
        canal.adicionarObservador(assinante1);
        canal.adicionarObservador(assinante2);
        
        assertDoesNotThrow(() -> canal.publicarNoticia("Notícia para todos"));
    }
    
    @Test
    void testObservadorNome() {
        assertEquals("João", assinante1.getNome());
        assertEquals("Maria", assinante2.getNome());
    }
}
