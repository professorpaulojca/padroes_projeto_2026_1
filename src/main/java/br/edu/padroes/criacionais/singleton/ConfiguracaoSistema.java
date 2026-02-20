package br.edu.padroes.criacionais.singleton;

/**
 * Padrão Singleton - Garante que uma classe tenha apenas uma instância
 * e fornece um ponto global de acesso a ela.
 * 
 * Implementação Thread-Safe usando inicialização antecipada (Eager Initialization)
 */
public class ConfiguracaoSistema {
    
    // Instância única criada no momento do carregamento da classe
    private static final ConfiguracaoSistema instancia = new ConfiguracaoSistema();
    
    private String nomeAplicacao;
    private String versao;
    private String ambiente;
    
    /**
     * Construtor privado para prevenir instanciação externa
     */
    private ConfiguracaoSistema() {
        this.nomeAplicacao = "Sistema de Padrões de Projeto";
        this.versao = "1.0.0";
        this.ambiente = "desenvolvimento";
    }
    
    /**
     * Método público estático para obter a instância única
     */
    public static ConfiguracaoSistema getInstancia() {
        return instancia;
    }
    
    public String getNomeAplicacao() {
        return nomeAplicacao;
    }
    
    public void setNomeAplicacao(String nomeAplicacao) {
        this.nomeAplicacao = nomeAplicacao;
    }
    
    public String getVersao() {
        return versao;
    }
    
    public void setVersao(String versao) {
        this.versao = versao;
    }
    
    public String getAmbiente() {
        return ambiente;
    }
    
    public void setAmbiente(String ambiente) {
        this.ambiente = ambiente;
    }
    
    @Override
    public String toString() {
        return String.format("ConfiguracaoSistema{nome='%s', versao='%s', ambiente='%s'}", 
                           nomeAplicacao, versao, ambiente);
    }
}
