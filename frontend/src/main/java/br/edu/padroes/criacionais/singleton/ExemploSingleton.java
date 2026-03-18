package br.edu.padroes.criacionais.singleton;

/**
 * Exemplo de uso do padrão Singleton
 */
public class ExemploSingleton {
    
    public static void main(String[] args) {
        // Obtendo a primeira referência da instância
        ConfiguracaoSistema config1 = ConfiguracaoSistema.getInstancia();
        System.out.println("Primeira instância: " + config1);
        
        // Modificando a configuração
        config1.setAmbiente("produção");
        config1.setVersao("1.0.1");
        
        // Obtendo uma segunda referência
        ConfiguracaoSistema config2 = ConfiguracaoSistema.getInstancia();
        System.out.println("Segunda instância: " + config2);
        
        // Verificando se são a mesma instância
        if (config1 == config2) {
            System.out.println("\n✓ Ambas as referências apontam para a MESMA instância!");
            System.out.println("  Isso comprova o padrão Singleton.");
        } else {
            System.out.println("\n✗ As referências são diferentes (não deveria acontecer)");
        }
    }
}
