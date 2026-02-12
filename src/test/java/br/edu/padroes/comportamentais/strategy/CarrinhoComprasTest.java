package br.edu.padroes.comportamentais.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Testes para o padrão Strategy
 */
class CarrinhoComprasTest {
    
    private CarrinhoCompras carrinho;
    
    @BeforeEach
    void setUp() {
        carrinho = new CarrinhoCompras();
    }
    
    @Test
    void testAdicionarItem() {
        carrinho.adicionarItem("Produto", 100.0);
        
        assertEquals(100.0, carrinho.getValorTotal(), 0.01);
    }
    
    @Test
    void testAdicionarMultiplosItens() {
        carrinho.adicionarItem("Produto 1", 50.0);
        carrinho.adicionarItem("Produto 2", 75.0);
        
        assertEquals(125.0, carrinho.getValorTotal(), 0.01);
    }
    
    @Test
    void testSetEstrategiaPagamento() {
        EstrategiaPagamento estrategia = new PagamentoPix("chave@email.com");
        
        assertDoesNotThrow(() -> carrinho.setEstrategiaPagamento(estrategia));
    }
    
    @Test
    void testFinalizarCompraSemEstrategia() {
        carrinho.adicionarItem("Produto", 100.0);
        
        // Deve executar sem erro, mas não processar o pagamento
        assertDoesNotThrow(() -> carrinho.finalizarCompra());
    }
    
    @Test
    void testFinalizarCompraComEstrategia() {
        carrinho.adicionarItem("Produto", 100.0);
        carrinho.setEstrategiaPagamento(new PagamentoCartaoCredito("1234567890123456", "João"));
        
        assertDoesNotThrow(() -> carrinho.finalizarCompra());
    }
    
    @Test
    void testDiferentesEstrategias() {
        EstrategiaPagamento pix = new PagamentoPix("chave@email.com");
        EstrategiaPagamento cartao = new PagamentoCartaoCredito("1234567890123456", "João");
        EstrategiaPagamento boleto = new PagamentoBoleto("123.456.789-00");
        
        assertEquals("PIX", pix.getNome());
        assertEquals("Cartão de Crédito", cartao.getNome());
        assertEquals("Boleto Bancário", boleto.getNome());
    }
}
