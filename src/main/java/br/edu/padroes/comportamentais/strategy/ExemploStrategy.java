package br.edu.padroes.comportamentais.strategy;

/**
 * Exemplo de uso do padrão Strategy
 */
public class ExemploStrategy {
    
    public static void main(String[] args) {
        System.out.println("=== Exemplo do Padrão Strategy ===\n");
        
        // Cenário 1: Compra com Cartão de Crédito
        System.out.println("--- COMPRA 1 ---");
        CarrinhoCompras carrinho1 = new CarrinhoCompras();
        carrinho1.adicionarItem("Notebook", 3500.00);
        carrinho1.adicionarItem("Mouse", 80.00);
        carrinho1.setEstrategiaPagamento(
            new PagamentoCartaoCredito("1234567890123456", "João Silva")
        );
        carrinho1.finalizarCompra();
        
        System.out.println("\n" + "=".repeat(50) + "\n");
        
        // Cenário 2: Compra com PIX
        System.out.println("--- COMPRA 2 ---");
        CarrinhoCompras carrinho2 = new CarrinhoCompras();
        carrinho2.adicionarItem("Teclado", 250.00);
        carrinho2.adicionarItem("Headset", 180.00);
        carrinho2.setEstrategiaPagamento(
            new PagamentoPix("joao.silva@email.com")
        );
        carrinho2.finalizarCompra();
        
        System.out.println("\n" + "=".repeat(50) + "\n");
        
        // Cenário 3: Compra com Boleto
        System.out.println("--- COMPRA 3 ---");
        CarrinhoCompras carrinho3 = new CarrinhoCompras();
        carrinho3.adicionarItem("Monitor", 800.00);
        carrinho3.setEstrategiaPagamento(
            new PagamentoBoleto("123.456.789-00")
        );
        carrinho3.finalizarCompra();
        
        System.out.println("\n✓ O padrão Strategy permite trocar o algoritmo de pagamento");
        System.out.println("  em tempo de execução, sem modificar a classe CarrinhoCompras.");
    }
}
