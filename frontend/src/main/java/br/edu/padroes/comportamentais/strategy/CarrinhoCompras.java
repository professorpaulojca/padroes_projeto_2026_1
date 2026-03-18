package br.edu.padroes.comportamentais.strategy;

/**
 * Padrão Strategy - Define uma família de algoritmos, encapsula cada um deles
 * e os torna intercambiáveis. Strategy permite que o algoritmo varie
 * independentemente dos clientes que o utilizam.
 * 
 * Context - Classe que utiliza a estratégia
 */
public class CarrinhoCompras {
    
    private double valorTotal;
    private EstrategiaPagamento estrategiaPagamento;
    
    public CarrinhoCompras() {
        this.valorTotal = 0.0;
    }
    
    public void adicionarItem(String item, double preco) {
        valorTotal += preco;
        System.out.println("+ Item adicionado: " + item + " - R$ " + String.format("%.2f", preco));
    }
    
    public void setEstrategiaPagamento(EstrategiaPagamento estrategia) {
        this.estrategiaPagamento = estrategia;
        System.out.println("\n💰 Forma de pagamento selecionada: " + estrategia.getNome());
    }
    
    public void finalizarCompra() {
        if (estrategiaPagamento == null) {
            System.out.println("⚠️  Selecione uma forma de pagamento!");
            return;
        }
        
        System.out.println("\n--- FINALIZANDO COMPRA ---");
        System.out.println("Total: R$ " + String.format("%.2f", valorTotal));
        System.out.println();
        estrategiaPagamento.pagar(valorTotal);
    }
    
    public double getValorTotal() {
        return valorTotal;
    }
}
