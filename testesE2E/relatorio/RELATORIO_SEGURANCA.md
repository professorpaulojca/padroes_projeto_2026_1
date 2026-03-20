# Relatório de Auditoria de Segurança — Pentest Automatizado E2E

**Projeto:** Padrões de Projeto 2026/1  
**Data:** 19/03/2026  
**Ferramenta:** Playwright Test + Chromium (com gravação de vídeo e trace)  
**Executor:** Testes automatizados E2E  
**Escopo:** Brute Force, SQL Injection, XSS, Auth Bypass, IDOR, Informações Expostas

---

## 1. Resumo Executivo

Foram executados **13 casos de teste** de segurança cobrindo as principais categorias do OWASP Top 10, gerando **14 achados** (findings). A aplicação apresenta proteção sólida contra injeção e manipulação de autenticação, porém possui **5 vulnerabilidades** que exigem correção antes de ir a produção.

| Indicador         | Valor |
|--------------------|-------|
| Total de findings  | 14    |
| Vulneráveis        | 5     |
| Seguros            | 9     |
| Severidade CRÍTICA | 1     |
| Severidade ALTA    | 4     |
| Severidade MÉDIA   | 0     |

---

## 2. Vulnerabilidades Encontradas

### 2.1 [CRÍTICA] Ausência de Rate Limiting no Login

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-01 |
| **Endpoint** | `POST /api/auth/login` |
| **Evidência** | 20 tentativas de login com senhas erradas foram aceitas em sequência rápida (~295ms cada) sem qualquer bloqueio ou throttling. Todas retornaram HTTP 401. |
| **Impacto** | Um atacante pode executar ataques de força bruta sem limitação, testando milhares de combinações de senhas por minuto. |
| **OWASP** | A07:2021 — Identification and Authentication Failures |

**Recomendação:**
- Implementar rate limiting com Bucket4j ou Resilience4j
- Limitar a **5 tentativas por minuto por IP**
- Retornar HTTP **429 Too Many Requests** após exceder o limite
- Adicionar header `Retry-After` na resposta 429

**Exemplo de implementação (Spring Boot + Bucket4j):**
```java
@Bean
public FilterRegistrationBean<RateLimitFilter> rateLimitFilter() {
    Bandwidth limit = Bandwidth.classic(5, Refill.intervally(5, Duration.ofMinutes(1)));
    Bucket bucket = Bucket.builder().addLimit(limit).build();
    // aplicar no endpoint /api/auth/login
}
```

---

### 2.2 [ALTA] Sem Account Lockout após Tentativas Falhas

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-01 |
| **Endpoint** | `POST /api/auth/login` |
| **Evidência** | Após 20 tentativas consecutivas com senha errada, o login com a senha correta (`admin@email.com / 123456`) funcionou normalmente (HTTP 200). A conta não foi bloqueada. |
| **Impacto** | Atacantes podem tentar infinitas combinações de senha sem que a conta seja temporariamente bloqueada. |
| **OWASP** | A07:2021 — Identification and Authentication Failures |

**Recomendação:**
- Registrar contador de tentativas falhas por usuário no banco de dados
- Bloquear temporariamente a conta (15 minutos) após **5 tentativas falhas**
- Notificar o usuário por email sobre tentativas suspeitas
- Registrar o IP de origem no log de auditoria

---

### 2.3 [ALTA] Sem Proteção contra Brute Force na Interface

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-02 |
| **Endpoint** | Formulário de login (UI) |
| **Evidência** | 10 senhas comuns foram testadas via interface gráfica sem qualquer restrição: `password`, `123456789`, `admin123`, `qwerty`, `letmein`, `welcome`, `monkey`, `dragon`, `master`, `abc123`. Todas aceitas sem CAPTCHA ou delay. |
| **Impacto** | Ferramentas automatizadas podem executar brute force via interface sem obstáculos. |
| **OWASP** | A07:2021 — Identification and Authentication Failures |

**Recomendação:**
- Adicionar **CAPTCHA (reCAPTCHA v3)** após 3 tentativas falhas
- Implementar delay progressivo: 1s, 2s, 4s, 8s entre tentativas
- Desabilitar o botão "Entrar" temporariamente após falhas

---

### 2.4 [ALTA] Token de Reset de Senha Exposto na Resposta HTTP

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-12 |
| **Endpoint** | `POST /api/auth/esqueci-senha` |
| **Evidência** | O endpoint retornou HTTP 200 com o token de recuperação diretamente no corpo da resposta (124 bytes). Um atacante pode solicitar reset para qualquer email e obter o token sem acesso à caixa de email. |
| **Impacto** | Permite account takeover — um atacante pode redefinir a senha de qualquer usuário. |
| **OWASP** | A04:2021 — Insecure Design |

**Recomendação:**
- **NUNCA** retornar o token na resposta HTTP
- Enviar o token exclusivamente por email
- Retornar mensagem genérica: *"Se o email estiver cadastrado, enviaremos instruções de recuperação."*
- Implementar expiração curta para o token (15 minutos)
- Invalidar tokens anteriores ao gerar um novo

---

### 2.5 [ALTA] Credenciais Padrão Hardcoded Ativas

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-13 |
| **Endpoint** | `POST /api/auth/login` |
| **Evidência** | Login com credenciais padrão `admin@email.com` / `123456` retornou HTTP 200 com sucesso. Essas credenciais são inseridas pelo `DataInitializer` na inicialização da aplicação. |
| **Impacto** | Qualquer pessoa com conhecimento do código-fonte pode acessar o sistema como administrador. |
| **OWASP** | A07:2021 — Identification and Authentication Failures |

**Recomendação:**
- Remover ou desabilitar o `DataInitializer` em ambiente de produção (usar `@Profile("dev")`)
- Exigir troca de senha obrigatória no primeiro login
- Usar senhas fortes geradas automaticamente (mín. 12 caracteres com símbolos)
- Nunca versionar credenciais no código-fonte

---

## 3. Pontos Seguros Comprovados

### 3.1 [SEGURO] SQL Injection — Endpoint de Autenticação

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-03 |
| **Resultado** | 10 payloads de SQL Injection testados via API — todos rejeitados |

**Payloads testados:**

| # | Payload | Resultado |
|---|---------|-----------|
| 1 | `' OR '1'='1' --` | HTTP 400 (46ms) |
| 2 | `admin@email.com' OR 1=1 --` | HTTP 400 (7ms) |
| 3 | `' UNION SELECT null,null,null,null,null --` | HTTP 400 (7ms) |
| 4 | `admin'@email.com` / `' OR '1'='1` | HTTP 401 (292ms) |
| 5 | `admin@email.com'; DROP TABLE usuarios; --` | HTTP 400 (6ms) |
| 6 | `admin@email.com'/*` / `*/OR'1'='1` | HTTP 401 (282ms) |
| 7 | `admin@email.com' AND SLEEP(5) --` | HTTP 400 (4ms) |
| 8 | `admin@email.com' OR 0x31=0x31 --` | HTTP 400 (9ms) |
| 9 | `admin%27%20OR%201%3D1%20--` | HTTP 400 (6ms) |
| 10 | `` admin@email.com` OR `1`=`1 `` | HTTP 400 (10ms) |

**Conclusão:** Spring Data JPA utiliza consultas parametrizadas (prepared statements) corretamente. Nenhum payload resultou em bypass ou vazamento de informação SQL.

---

### 3.2 [SEGURO] SQL Injection — Interface de Login (UI)

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-04 |
| **Resultado** | 3 payloads testados via formulário visual — nenhum redirecionou para /dashboard |

---

### 3.3 [SEGURO] SQL Injection — Busca de Pessoas

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-05 |
| **Resultado** | 5 payloads testados no endpoint `/api/pessoas/buscar` — todos retornaram HTTP 500 sem expor informações de SQL |

**Payloads testados:** `' OR '1'='1`, `'; DROP TABLE pessoa; --`, `' UNION SELECT ...`, `1' AND (SELECT COUNT(*) ...) > 0 --`, `' OR 1=1; --`

**Observação:** Os retornos HTTP 500 indicam tratamento de erro, mas o ideal seria retornar HTTP 400 (Bad Request) com mensagem genérica em vez de 500.

---

### 3.4 [SEGURO] XSS Armazenado — Nome de Pessoa

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-06 |
| **Resultado** | 5 payloads XSS rejeitados pelo servidor (HTTP 500) |

**Payloads testados:** `<script>alert("XSS")</script>`, `<img src=x onerror=alert("XSS")>`, `<svg onload=alert("XSS")>`, `javascript:alert("XSS")`, `<a href="data:text/html,...">click</a>`

---

### 3.5 [SEGURO] XSS Armazenado — Nome de Exibição do Usuário

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-07 |
| **Resultado** | Payload `<img src=x onerror=alert("XSS")>` rejeitado (HTTP 400) |

---

### 3.6 [SEGURO] Endpoints Protegidos sem Token

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-08 |
| **Resultado** | Todos os 7 endpoints retornaram HTTP 403 sem token JWT |

| Método | Endpoint | Status |
|--------|----------|--------|
| GET | `/api/pessoas` | 403 |
| GET | `/api/enderecos` | 403 |
| GET | `/api/usuarios/me` | 403 |
| GET | `/api/usuarios` | 403 |
| GET | `/api/auditoria` | 403 |
| POST | `/api/pessoas` | 403 |
| DELETE | `/api/pessoas/1` | 403 |

**Acesso direto via navegador** a `/pessoas` redirecionou corretamente para `/login`.

---

### 3.7 [SEGURO] Validação de Token JWT Manipulado

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-09 |
| **Resultado** | 4 tokens inválidos testados — todos rejeitados (HTTP 403) |

| Token | Resultado |
|-------|-----------|
| Vazio (`""`) | 403 — Rejeitado |
| Lixo (`abc123.xyz456.invalid`) | 403 — Rejeitado |
| Payload modificado (sub: hacker@evil.com, roles: ADMIN) | 403 — Rejeitado |
| Algoritmo "none" (sem assinatura) | 403 — Rejeitado |

---

### 3.8 [SEGURO] IDOR — Enumeração de Usuários

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-10 |
| **Resultado** | IDs 1 a 5 testados — nenhum retornou dados de outro usuário |

---

### 3.9 [SEGURO] Endpoints Actuator/Monitoramento

| Campo | Detalhe |
|-------|---------|
| **Teste** | SEC-11 |
| **Resultado** | 7 endpoints Actuator testados — todos retornaram HTTP 404 |

Endpoints verificados: `/actuator/health`, `/actuator/info`, `/actuator/prometheus`, `/actuator/metrics`, `/actuator/env`, `/actuator/beans`, `/actuator/loggers`

---

## 4. Mapeamento OWASP Top 10 (2021)

| Código | Categoria | Testado | Resultado |
|--------|-----------|---------|-----------|
| A01 | Broken Access Control | SEC-08, SEC-09, SEC-10 | **SEGURO** — Endpoints protegidos, JWT validado, IDOR bloqueado |
| A02 | Cryptographic Failures | SEC-09 | **SEGURO** — JWT HMAC-SHA256 com rejeição de alg "none" |
| A03 | Injection | SEC-03, SEC-04, SEC-05, SEC-06, SEC-07 | **SEGURO** — Prepared statements, XSS rejeitado |
| A04 | Insecure Design | SEC-12 | **VULNERÁVEL** — Token de reset na resposta |
| A05 | Security Misconfiguration | SEC-11 | **SEGURO** — Actuator não exposto |
| A07 | Identification & Auth Failures | SEC-01, SEC-02, SEC-13 | **VULNERÁVEL** — Sem rate limit, sem lockout, credenciais padrão |

---

## 5. Plano de Correção Priorizado

| # | Severidade | Vulnerabilidade | Esforço | Ação |
|---|------------|-----------------|---------|------|
| 1 | **CRÍTICA** | Sem Rate Limiting | Médio | Implementar Bucket4j ou Resilience4j no endpoint de login |
| 2 | **ALTA** | Sem Account Lockout | Médio | Contador de falhas no BD + bloqueio de 15min após 5 erros |
| 3 | **ALTA** | Token de reset exposto | Baixo | Remover token do response body, enviar só por email |
| 4 | **ALTA** | Credenciais padrão | Baixo | Adicionar `@Profile("dev")` no DataInitializer |
| 5 | **ALTA** | Sem proteção brute force UI | Médio | Adicionar reCAPTCHA v3 após 3 falhas |

---

## 6. Evidências e Artefatos

| Artefato | Localização |
|----------|-------------|
| Código dos testes | `testesE2E/tests/seguranca.spec.ts` |
| Findings em JSON | `testesE2E/relatorio/security-findings.json` |
| Relatório HTML interativo | `testesE2E/relatorio/relatorio-seguranca.html` |
| Vídeos dos testes | `testesE2E/test-results/` (`.webm`) |
| Traces do Playwright | `testesE2E/test-results/` (`.zip`) |
| Report visual Playwright | `testesE2E/relatorio-html/` (abrir com `npm run report`) |

---

## 7. Conclusão

A aplicação apresenta **boa proteção contra ataques de injeção** (SQL Injection e XSS) graças ao uso de consultas parametrizadas pelo Spring Data JPA e validação de inputs. A **autenticação JWT** está corretamente configurada, rejeitando tokens manipulados e exigindo autenticação em todos os endpoints protegidos.

Porém, a **camada de proteção contra força bruta é inexistente** — não há rate limiting, account lockout ou CAPTCHA. Combinado com **credenciais padrão ativas** e o **token de reset exposto na resposta**, um atacante poderia comprometer contas de usuário com relativa facilidade.

**Classificação geral de risco: ALTO** — As vulnerabilidades encontradas são exploráveis com ferramentas simples e devem ser corrigidas antes do deploy em produção.

---

*Relatório gerado automaticamente a partir dos testes E2E de segurança executados com Playwright Test.*  
*Este documento é para fins educacionais e defensivos. Testes realizados apenas em ambiente local autorizado.*
