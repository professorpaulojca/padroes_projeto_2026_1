package br.edu.padroes.comportamentais.strategy;

/**
 * Estratégia concreta: Pagamento com PIX
 */
public class PagamentoPix implements EstrategiaPagamento {
    
    private String chavePix;
    
    public PagamentoPix(String chavePix) {
        this.chavePix = chavePix;
    }
    
    @Override
    public void pagar(double valor) {
        System.out.println("📱 Pagamento com PIX");
        System.out.println("   Chave: " + chavePix);
        System.out.println("   Valor: R$ " + String.format("%.2f", valor));
        System.out.println("   Status: Processado instantaneamente ✓");
    }
    
    @Override
    public String getNome() {
        return "PIX";
    }
}
