package br.edu.padroes.criacionais.singleton;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes para o padrão Singleton
 */
class ConfiguracaoSistemaTest {
    
    @Test
    void testInstanciaUnica() {
        ConfiguracaoSistema config1 = ConfiguracaoSistema.getInstancia();
        ConfiguracaoSistema config2 = ConfiguracaoSistema.getInstancia();
        
        assertSame(config1, config2, "Ambas as referências devem apontar para a mesma instância");
    }
    
    @Test
    void testModificacaoPersiste() {
        ConfiguracaoSistema config1 = ConfiguracaoSistema.getInstancia();
        config1.setAmbiente("teste");
        
        ConfiguracaoSistema config2 = ConfiguracaoSistema.getInstancia();
        
        assertEquals("teste", config2.getAmbiente(), 
                    "Modificação deve persistir pois é a mesma instância");
    }
    
    @Test
    void testValoresPadrao() {
        ConfiguracaoSistema config = ConfiguracaoSistema.getInstancia();
        
        assertNotNull(config.getNomeAplicacao());
        assertNotNull(config.getVersao());
        assertNotNull(config.getAmbiente());
    }
}
