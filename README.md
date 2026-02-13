# Padrões de Projeto - 2026.1

Repositório de exemplos práticos de Padrões de Projeto em Java para o 1º semestre de 2026.

## 📚 Sobre o Projeto

Este repositório contém implementações didáticas dos principais padrões de projeto (Design Patterns) utilizados no desenvolvimento de software orientado a objetos. Cada padrão inclui:
- Código fonte comentado em português
- Exemplos práticos de uso
- Demonstrações executáveis

## 🏗️ Estrutura do Projeto

```
src/main/java/br/edu/padroes/
├── criacionais/          # Padrões Criacionais
│   ├── singleton/        # Singleton Pattern
│   └── factory/          # Factory Method Pattern
├── estruturais/          # Padrões Estruturais
│   └── adapter/          # Adapter Pattern
└── comportamentais/      # Padrões Comportamentais
    ├── observer/         # Observer Pattern
    └── strategy/         # Strategy Pattern
```

## 🎯 Padrões Implementados

### Padrões Criacionais
Padrões que lidam com mecanismos de criação de objetos.

#### 1. **Singleton**
- **Propósito**: Garante que uma classe tenha apenas uma instância
- **Exemplo**: `ConfiguracaoSistema` - configurações globais do sistema
- **Como executar**: 
  ```bash
  mvn compile exec:java -Dexec.mainClass="br.edu.padroes.criacionais.singleton.ExemploSingleton"
  ```

#### 2. **Factory Method**
- **Propósito**: Define uma interface para criar objetos, permitindo que subclasses decidam qual classe instanciar
- **Exemplo**: `NotificacaoFactory` - criação de diferentes tipos de notificações
- **Como executar**:
  ```bash
  mvn compile exec:java -Dexec.mainClass="br.edu.padroes.criacionais.factory.ExemploFactory"
  ```

### Padrões Estruturais
Padrões que lidam com a composição de classes e objetos.

#### 3. **Adapter**
- **Propósito**: Converte a interface de uma classe em outra esperada pelos clientes
- **Exemplo**: `PlayerUniversal` - adaptação de diferentes reprodutores de mídia
- **Como executar**:
  ```bash
  mvn compile exec:java -Dexec.mainClass="br.edu.padroes.estruturais.adapter.ExemploAdapter"
  ```

### Padrões Comportamentais
Padrões que lidam com algoritmos e atribuição de responsabilidades entre objetos.

#### 4. **Observer**
- **Propósito**: Define dependência um-para-muitos para notificação automática de mudanças
- **Exemplo**: `CanalNoticias` - sistema de notícias com assinantes
- **Como executar**:
  ```bash
  mvn compile exec:java -Dexec.mainClass="br.edu.padroes.comportamentais.observer.ExemploObserver"
  ```

#### 5. **Strategy**
- **Propósito**: Define família de algoritmos intercambiáveis
- **Exemplo**: `CarrinhoCompras` - diferentes estratégias de pagamento
- **Como executar**:
  ```bash
  mvn compile exec:java -Dexec.mainClass="br.edu.padroes.comportamentais.strategy.ExemploStrategy"
  ```

## 🚀 Como Usar

### Pré-requisitos
- Java 11 ou superior
- Maven 3.6 ou superior

### Compilar o Projeto
```bash
mvn clean compile
```

### Executar Todos os Exemplos
```bash
# Singleton
mvn compile exec:java -Dexec.mainClass="br.edu.padroes.criacionais.singleton.ExemploSingleton"

# Factory
mvn compile exec:java -Dexec.mainClass="br.edu.padroes.criacionais.factory.ExemploFactory"

# Adapter
mvn compile exec:java -Dexec.mainClass="br.edu.padroes.estruturais.adapter.ExemploAdapter"

# Observer
mvn compile exec:java -Dexec.mainClass="br.edu.padroes.comportamentais.observer.ExemploObserver"

# Strategy
mvn compile exec:java -Dexec.mainClass="br.edu.padroes.comportamentais.strategy.ExemploStrategy"
```

### Executar Testes
```bash
mvn test
```

## 📖 Referências

- **Livro**: "Padrões de Projetos: Soluções Reutilizáveis de Software Orientado a Objetos" - Gang of Four (GoF)
- **Site**: [Refactoring.Guru - Design Patterns](https://refactoring.guru/design-patterns)
- **Site**: [SourceMaking - Design Patterns](https://sourcemaking.com/design_patterns)

## 👨‍💻 Autor

Professor Paulo José - 2026.1

## 📄 Licença

Este projeto é de uso educacional.
