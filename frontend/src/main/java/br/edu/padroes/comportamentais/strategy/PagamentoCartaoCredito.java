package br.edu.padroes.comportamentais.strategy;

/**
 * Estratégia concreta: Pagamento com Cartão de Crédito
 */
public class PagamentoCartaoCredito implements EstrategiaPagamento {
    
    private String numeroCartao;
    private String nomeTitular;
    
    public PagamentoCartaoCredito(String numeroCartao, String nomeTitular) {
        this.numeroCartao = numeroCartao;
        this.nomeTitular = nomeTitular;
    }
    
    @Override
    public void pagar(double valor) {
        System.out.println("💳 Pagamento com Cartão de Crédito");
        System.out.println("   Titular: " + nomeTitular);
        System.out.println("   Cartão: **** **** **** " + numeroCartao.substring(numeroCartao.length() - 4));
        System.out.println("   Valor: R$ " + String.format("%.2f", valor));
        System.out.println("   Status: Aprovado ✓");
    }
    
    @Override
    public String getNome() {
        return "Cartão de Crédito";
    }
}
