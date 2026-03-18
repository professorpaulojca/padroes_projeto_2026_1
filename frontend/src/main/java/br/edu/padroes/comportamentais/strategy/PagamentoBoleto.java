package br.edu.padroes.comportamentais.strategy;

/**
 * Estratégia concreta: Pagamento com Boleto Bancário
 */
public class PagamentoBoleto implements EstrategiaPagamento {
    
    private String cpf;
    
    public PagamentoBoleto(String cpf) {
        this.cpf = cpf;
    }
    
    @Override
    public void pagar(double valor) {
        System.out.println("🧾 Pagamento com Boleto Bancário");
        System.out.println("   CPF: " + cpf);
        System.out.println("   Valor: R$ " + String.format("%.2f", valor));
        System.out.println("   Vencimento: 3 dias úteis");
        System.out.println("   Status: Boleto gerado ✓");
    }
    
    @Override
    public String getNome() {
        return "Boleto Bancário";
    }
}
