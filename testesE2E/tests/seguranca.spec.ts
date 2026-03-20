import { test, expect, type Page, type APIRequestContext } from '@playwright/test';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  TESTES DE SEGURANÇA E2E — PENTEST AUTOMATIZADO                           ║
 * ║  Foco: Brute Force, SQL Injection, XSS, IDOR, Auth Bypass                 ║
 * ║  Ferramenta: Playwright Test (com vídeo e trace)                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─── Constantes ─────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8080';
const FRONTEND_BASE = 'http://localhost:3001';
const VALID_EMAIL = 'admin@email.com';
const VALID_PASSWORD = '123456';

// ─── Métricas de segurança ──────────────────────────────────────────────────────
interface SecurityFinding {
  teste: string;
  severidade: 'CRÍTICA' | 'ALTA' | 'MÉDIA' | 'BAIXA' | 'INFO';
  vulneravel: boolean;
  descricao: string;
  detalhes: string;
  recomendacao: string;
}

const findings: SecurityFinding[] = [];

function registrarFinding(f: SecurityFinding) {
  findings.push(f);
  const icon = f.vulneravel ? '🔴' : '🟢';
  const status = f.vulneravel ? 'VULNERÁVEL' : 'SEGURO';
  console.log(`  ${icon} [${f.severidade}] ${status}: ${f.descricao}`);
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
async function obterTokenValido(request: APIRequestContext): Promise<string> {
  const resp = await request.post(`${API_BASE}/api/auth/login`, {
    data: { email: VALID_EMAIL, senha: VALID_PASSWORD },
  });
  const body = await resp.json();
  return body.token;
}

// ─── Attach findings ao relatório ───────────────────────────────────────────────
test.afterEach(async ({}, testInfo) => {
  const findingsDoTeste = findings.filter(f => f.teste === testInfo.title);
  if (findingsDoTeste.length > 0) {
    const resumo = findingsDoTeste.map(f =>
      `[${f.severidade}] ${f.vulneravel ? 'VULNERÁVEL' : 'SEGURO'}: ${f.descricao}\n  → ${f.detalhes}\n  → Recomendação: ${f.recomendacao}`
    ).join('\n\n');
    await testInfo.attach('security-findings', {
      body: Buffer.from(resumo),
      contentType: 'text/plain',
    });
  }
});

// ═════════════════════════════════════════════════════════════════════════════════
// 1. BRUTE FORCE — Tentativas massivas de login
// ═════════════════════════════════════════════════════════════════════════════════
test.describe('1. BRUTE FORCE — Ataque de Força Bruta', () => {

  test('SEC-01: Enviar 20 tentativas de login com senhas erradas em sequência rápida', async ({ page, request }) => {
    const testName = 'SEC-01: Enviar 20 tentativas de login com senhas erradas em sequência rápida';
    console.log('\n🔴 SEC-01: Teste de força bruta — 20 tentativas rápidas...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    const resultados: { tentativa: number; status: number; tempo: number }[] = [];
    let bloqueado = false;

    for (let i = 1; i <= 20; i++) {
      const inicio = Date.now();
      const resp = await request.post(`${API_BASE}/api/auth/login`, {
        data: { email: VALID_EMAIL, senha: `senhaErrada${i}` },
      });
      const tempo = Date.now() - inicio;
      resultados.push({ tentativa: i, status: resp.status(), tempo });

      if (resp.status() === 429 || resp.status() === 423) {
        bloqueado = true;
        console.log(`  🛡️ Bloqueado na tentativa ${i} (HTTP ${resp.status()}) — ${tempo}ms`);
        break;
      }

      if (i % 5 === 0) {
        console.log(`  📊 Tentativa ${i}: HTTP ${resp.status()} — ${tempo}ms`);
      }
    }

    // Verificar se APÓS as tentativas erradas, login válido ainda funciona
    const respValido = await request.post(`${API_BASE}/api/auth/login`, {
      data: { email: VALID_EMAIL, senha: VALID_PASSWORD },
    });

    registrarFinding({
      teste: testName,
      severidade: 'CRÍTICA',
      vulneravel: !bloqueado,
      descricao: 'Rate Limiting no endpoint de login',
      detalhes: bloqueado
        ? `Servidor bloqueou após tentativas rápidas`
        : `20 tentativas aceitas sem throttling. Todas retornaram HTTP 401. Login válido após ataque: HTTP ${respValido.status()}`,
      recomendacao: 'Implementar rate limiting (ex: Bucket4j, Resilience4j) limitando a 5 tentativas/minuto por IP. Retornar HTTP 429 Too Many Requests.',
    });

    registrarFinding({
      teste: testName,
      severidade: 'ALTA',
      vulneravel: respValido.status() === 200,
      descricao: 'Account Lockout após tentativas falhas',
      detalhes: respValido.status() === 200
        ? 'Conta NÃO foi bloqueada após 20 tentativas falhas. Login válido funcionou normalmente.'
        : 'Conta foi bloqueada após tentativas falhas.',
      recomendacao: 'Implementar lockout temporário (15min) após 5 tentativas falhas. Registrar contador de falhas no banco de dados.',
    });

    // Mostrar no navegador para vídeo
    await page.getByLabel('Email').fill(VALID_EMAIL);
    await page.getByRole('textbox', { name: 'Senha' }).fill('senhaErrada1');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForTimeout(2000);

    const stats = resultados.reduce((acc, r) => acc + r.tempo, 0) / resultados.length;
    console.log(`  📊 Tempo médio de resposta: ${stats.toFixed(0)}ms`);
    console.log(`  📊 Bloqueado: ${bloqueado ? 'SIM' : 'NÃO'}`);
  });

  test('SEC-02: Brute force via interface gráfica — 10 tentativas visuais', async ({ page }) => {
    const testName = 'SEC-02: Brute force via interface gráfica — 10 tentativas visuais';
    console.log('\n🔴 SEC-02: Brute force pela UI — 10 tentativas...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    const senhasTentadas = [
      'password', '123456789', 'admin123', 'qwerty', 'letmein',
      'welcome', 'monkey', 'dragon', 'master', 'abc123'
    ];

    let algumBloqueio = false;

    for (let i = 0; i < senhasTentadas.length; i++) {
      await page.getByLabel('Email').fill(VALID_EMAIL);
      await page.getByRole('textbox', { name: 'Senha' }).fill(senhasTentadas[i]);
      await page.getByRole('button', { name: 'Entrar' }).click();

      // Esperar resposta
      await page.waitForTimeout(1000);

      // Verificar se apareceu mensagem de bloqueio
      const bloqueio = await page.getByText(/bloqueado|muitas tentativas|too many|aguarde/i).isVisible().catch(() => false);
      if (bloqueio) {
        algumBloqueio = true;
        console.log(`  🛡️ Bloqueio detectado na tentativa ${i + 1} com senha "${senhasTentadas[i]}"`);
        break;
      }

      console.log(`  ❌ Tentativa ${i + 1}: "${senhasTentadas[i]}" — sem bloqueio`);
    }

    registrarFinding({
      teste: testName,
      severidade: 'ALTA',
      vulneravel: !algumBloqueio,
      descricao: 'Proteção contra brute force na interface',
      detalhes: algumBloqueio
        ? 'Interface exibiu mensagem de bloqueio após tentativas repetidas.'
        : `10 senhas comuns testadas sem qualquer restrição. Senhas testadas: ${senhasTentadas.join(', ')}`,
      recomendacao: 'Adicionar CAPTCHA após 3 tentativas falhas. Exibir mensagem de espera progressiva (1s, 2s, 4s, 8s...).',
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════════
// 2. SQL INJECTION — Injeção SQL nos campos de login e busca
// ═════════════════════════════════════════════════════════════════════════════════
test.describe('2. SQL INJECTION — Tentativas de Injeção SQL', () => {

  const SQL_PAYLOADS = [
    // Payloads clássicos de autenticação bypass
    { nome: 'OR 1=1 básico', email: "' OR '1'='1' --", senha: 'qualquer' },
    { nome: 'OR 1=1 com comentário', email: "admin@email.com' OR 1=1 --", senha: 'qualquer' },
    { nome: 'UNION SELECT', email: "' UNION SELECT null,null,null,null,null --", senha: 'qualquer' },
    { nome: 'Aspas simples', email: "admin'@email.com", senha: "' OR '1'='1" },
    { nome: 'Ponto-e-vírgula DROP', email: "admin@email.com'; DROP TABLE usuarios; --", senha: '123456' },
    { nome: 'Comentário MySQL', email: "admin@email.com'/*", senha: "*/OR'1'='1" },
    { nome: 'SLEEP injection', email: "admin@email.com' AND SLEEP(5) --", senha: '123456' },
    { nome: 'Hex encoding', email: "admin@email.com' OR 0x31=0x31 --", senha: '123456' },
    { nome: 'Double encoding', email: "admin%27%20OR%201%3D1%20--", senha: '123456' },
    { nome: 'Backtick injection', email: "admin@email.com` OR `1`=`1", senha: '123456' },
  ];

  test('SEC-03: SQL Injection no endpoint de login via API', async ({ page, request }) => {
    const testName = 'SEC-03: SQL Injection no endpoint de login via API';
    console.log('\n🔴 SEC-03: SQL Injection no login — 10 payloads...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    let algumSucesso = false;
    const resultados: string[] = [];

    for (const payload of SQL_PAYLOADS) {
      const inicio = Date.now();
      const resp = await request.post(`${API_BASE}/api/auth/login`, {
        data: { email: payload.email, senha: payload.senha },
      });
      const tempo = Date.now() - inicio;
      const status = resp.status();
      const body = await resp.text();

      // Verificar se houve bypass (login com sucesso usando SQL injection)
      if (status === 200) {
        algumSucesso = true;
        console.log(`  🔴 BYPASS! Payload "${payload.nome}" retornou HTTP 200!`);
      } else {
        console.log(`  🟢 Payload "${payload.nome}": HTTP ${status} — ${tempo}ms`);
      }

      // Verificar se o servidor expôs stack traces ou erros de SQL
      const expoeSql = /sql|query|jdbc|hibernate|exception|stack.?trace|org\.postgresql/i.test(body);
      if (expoeSql) {
        console.log(`  ⚠️ Payload "${payload.nome}" expôs informação de SQL no response!`);
      }

      resultados.push(`${payload.nome}: HTTP ${status} (${tempo}ms)${expoeSql ? ' [EXPÕE SQL]' : ''}`);

      // Verificar time-based injection (SLEEP)
      if (payload.nome.includes('SLEEP') && tempo > 4000) {
        console.log(`  🔴 SLEEP injection funcionou! Tempo: ${tempo}ms`);
        algumSucesso = true;
      }
    }

    registrarFinding({
      teste: testName,
      severidade: 'CRÍTICA',
      vulneravel: algumSucesso,
      descricao: 'SQL Injection no endpoint de autenticação',
      detalhes: algumSucesso
        ? 'PERIGO: Pelo menos um payload de SQL injection foi aceito pelo servidor!'
        : `10 payloads testados, todos rejeitados.\n  ${resultados.join('\n  ')}`,
      recomendacao: algumSucesso
        ? 'URGENTE: Use consultas parametrizadas (prepared statements). Nunca concatene strings SQL.'
        : 'Manter uso de consultas parametrizadas via Spring Data JPA. Adicionar WAF como camada adicional de proteção.',
    });
  });

  test('SEC-04: SQL Injection na interface de login via UI', async ({ page }) => {
    const testName = 'SEC-04: SQL Injection na interface de login via UI';
    console.log('\n🔴 SEC-04: SQL Injection via formulário visual...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    const payloadsUI = [
      { email: "' OR '1'='1' --", senha: 'qualquer' },
      { email: "admin@email.com' OR 1=1 --", senha: "' OR '1'='1" },
      { email: "'; DROP TABLE usuarios;--", senha: '123456' },
    ];

    for (const p of payloadsUI) {
      await page.getByLabel('Email').fill(p.email);
      await page.getByRole('textbox', { name: 'Senha' }).fill(p.senha);
      await page.getByRole('button', { name: 'Entrar' }).click();
      await page.waitForTimeout(2000);

      // Se navegou para dashboard = BYPASS
      const url = page.url();
      if (url.includes('/dashboard')) {
        console.log(`  🔴 BYPASS via UI! Payload: ${p.email}`);
        registrarFinding({
          teste: testName,
          severidade: 'CRÍTICA',
          vulneravel: true,
          descricao: 'SQL Injection bypass via interface',
          detalhes: `Payload "${p.email}" permitiu login sem credenciais válidas`,
          recomendacao: 'Sanitizar inputs, usar prepared statements.',
        });
        return;
      }
      console.log(`  🟢 Payload "${p.email}" — permaneceu em /login`);
    }

    registrarFinding({
      teste: testName,
      severidade: 'CRÍTICA',
      vulneravel: false,
      descricao: 'SQL Injection bypass via interface de login',
      detalhes: '3 payloads testados via formulário visual. Nenhum permitiu bypass.',
      recomendacao: 'Manter validação server-side. Adicionar validação de formato de email no backend (regex).',
    });
  });

  test('SEC-05: SQL Injection na busca de pessoas', async ({ page, request }) => {
    const testName = 'SEC-05: SQL Injection na busca de pessoas';
    console.log('\n🔴 SEC-05: SQL Injection na busca de pessoas...');

    const token = await obterTokenValido(request);

    const payloadsBusca = [
      "' OR '1'='1",
      "'; DROP TABLE pessoa; --",
      "' UNION SELECT id,nome,null,null FROM usuario --",
      "1' AND (SELECT COUNT(*) FROM usuario) > 0 --",
      "' OR 1=1; --",
    ];

    let algumSucessoAnomalo = false;

    for (const payload of payloadsBusca) {
      const resp = await request.get(`${API_BASE}/api/pessoas/buscar`, {
        params: { nome: payload },
        headers: { Authorization: `Bearer ${token}` },
      });
      const status = resp.status();
      const body = await resp.text();

      const expoeSql = /sql|query|jdbc|hibernate|exception|stack.?trace|syntax/i.test(body);

      if (status === 200) {
        // Verificar se retornou dados que não deveria
        try {
          const dados = JSON.parse(body);
          if (Array.isArray(dados) && dados.length > 10) {
            algumSucessoAnomalo = true;
            console.log(`  ⚠️ Payload "${payload}" retornou ${dados.length} registros — possível dump`);
          } else {
            console.log(`  🟢 Payload "${payload}": HTTP 200, ${Array.isArray(dados) ? dados.length : 0} registros`);
          }
        } catch {
          console.log(`  🟢 Payload "${payload}": HTTP 200 (resposta não-JSON)`);
        }
      } else {
        console.log(`  🟢 Payload "${payload}": HTTP ${status}${expoeSql ? ' [EXPÕE SQL]' : ''}`);
      }

      if (expoeSql) algumSucessoAnomalo = true;
    }

    registrarFinding({
      teste: testName,
      severidade: 'ALTA',
      vulneravel: algumSucessoAnomalo,
      descricao: 'SQL Injection na busca de pessoas',
      detalhes: algumSucessoAnomalo
        ? 'Pelo menos um payload retornou dados anômalos ou expôs informação SQL.'
        : '5 payloads testados no endpoint de busca. Consultas parametrizadas funcionando corretamente.',
      recomendacao: 'Manter queries parametrizadas. Implementar sanitização de input no servidor. Limitar tamanho do resultado com paginação.',
    });

    // Mostrar busca no navegador para o vídeo
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.getByLabel('Email').fill(VALID_EMAIL);
    await page.getByRole('textbox', { name: 'Senha' }).fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.getByRole('link', { name: 'Pessoas' }).click();
    await page.waitForURL('**/pessoas', { timeout: 10000 });

    const campoBusca = page.getByPlaceholder('Buscar por nome...');
    await campoBusca.fill("' OR '1'='1' --");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/sqli-busca-pessoas.png' });
  });
});

// ═════════════════════════════════════════════════════════════════════════════════
// 3. XSS — Cross-Site Scripting Armazenado
// ═════════════════════════════════════════════════════════════════════════════════
test.describe('3. XSS — Cross-Site Scripting', () => {

  test('SEC-06: XSS armazenado no cadastro de pessoa', async ({ page, request }) => {
    const testName = 'SEC-06: XSS armazenado no cadastro de pessoa';
    console.log('\n🔴 SEC-06: Teste de XSS armazenado no nome de pessoa...');

    const token = await obterTokenValido(request);

    const xssPayloads = [
      { nome: 'Script tag', valor: '<script>alert("XSS")</script>' },
      { nome: 'Event handler', valor: '<img src=x onerror=alert("XSS")>' },
      { nome: 'SVG onload', valor: '<svg onload=alert("XSS")>' },
      { nome: 'JavaScript URI', valor: 'javascript:alert("XSS")' },
      { nome: 'Data URI', valor: '<a href="data:text/html,<script>alert(1)</script>">click</a>' },
    ];

    let algumAceito = false;
    const pessoasCriadas: number[] = [];

    for (const payload of xssPayloads) {
      const resp = await request.post(`${API_BASE}/api/pessoas`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { nome: payload.valor, dataNascimento: '01/01/2000' },
      });

      if (resp.status() === 200 || resp.status() === 201) {
        algumAceito = true;
        const body = await resp.json();
        pessoasCriadas.push(body.id);
        console.log(`  🔴 Payload "${payload.nome}" ACEITO! ID: ${body.id} — Nome armazenado: ${body.nome}`);
      } else {
        console.log(`  🟢 Payload "${payload.nome}": HTTP ${resp.status()} — rejeitado`);
      }
    }

    registrarFinding({
      teste: testName,
      severidade: 'MÉDIA',
      vulneravel: algumAceito,
      descricao: 'XSS armazenado (Stored XSS) no campo nome de pessoa',
      detalhes: algumAceito
        ? `${pessoasCriadas.length} payloads XSS foram aceitos e armazenados no banco. O frontend React escapa por padrão, mas APIs consumidoras podem ser vulneráveis.`
        : 'Todos os payloads XSS foram rejeitados pelo servidor.',
      recomendacao: 'Implementar sanitização de HTML no backend (OWASP Java HTML Sanitizer). Rejeitar inputs contendo tags HTML (<, >, script).',
    });

    // Limpar pessoas criadas
    for (const id of pessoasCriadas) {
      await request.delete(`${API_BASE}/api/pessoas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // Demonstrar no navegador
    if (algumAceito) {
      await page.goto('/login', { waitUntil: 'networkidle' });
      await page.getByLabel('Email').fill(VALID_EMAIL);
      await page.getByRole('textbox', { name: 'Senha' }).fill(VALID_PASSWORD);
      await page.getByRole('button', { name: 'Entrar' }).click();
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      await page.getByRole('link', { name: 'Pessoas' }).click();
      await page.waitForURL('**/pessoas', { timeout: 10000 });
      await page.waitForTimeout(2000);
    }
  });

  test('SEC-07: XSS no cadastro de usuário (nomeExibicao)', async ({ request, page }) => {
    const testName = 'SEC-07: XSS no cadastro de usuário (nomeExibicao)';
    console.log('\n🔴 SEC-07: Teste de XSS no registro de usuário...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    const xssNome = '<img src=x onerror=alert("XSS")>';
    const emailUnico = `xsstest${Date.now()}@teste.com`;

    const resp = await request.post(`${API_BASE}/api/auth/cadastro`, {
      data: {
        nomeExibicao: xssNome,
        email: emailUnico,
        senha: '123456',
        confirmarSenha: '123456',
      },
    });

    const aceito = resp.status() === 200 || resp.status() === 201;

    registrarFinding({
      teste: testName,
      severidade: 'MÉDIA',
      vulneravel: aceito,
      descricao: 'XSS armazenado no nome de exibição do usuário',
      detalhes: aceito
        ? `Payload XSS "${xssNome}" aceito no cadastro com email ${emailUnico}`
        : `Payload XSS rejeitado: HTTP ${resp.status()}`,
      recomendacao: 'Sanitizar campo nomeExibicao. Rejeitar caracteres HTML especiais (<, >, &).',
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════════
// 4. AUTH BYPASS — Acesso sem autenticação
// ═════════════════════════════════════════════════════════════════════════════════
test.describe('4. AUTH BYPASS — Acesso sem Autenticação', () => {

  test('SEC-08: Acessar endpoints protegidos sem token', async ({ page, request }) => {
    const testName = 'SEC-08: Acessar endpoints protegidos sem token';
    console.log('\n🔴 SEC-08: Testando acesso sem autenticação...');

    const endpointsProtegidos = [
      { metodo: 'GET', path: '/api/pessoas', nome: 'Listar pessoas' },
      { metodo: 'GET', path: '/api/enderecos', nome: 'Listar endereços' },
      { metodo: 'GET', path: '/api/usuarios/me', nome: 'Dados do usuário logado' },
      { metodo: 'GET', path: '/api/usuarios', nome: 'Listar todos usuários' },
      { metodo: 'GET', path: '/api/auditoria', nome: 'Logs de auditoria' },
      { metodo: 'POST', path: '/api/pessoas', nome: 'Criar pessoa' },
      { metodo: 'DELETE', path: '/api/pessoas/1', nome: 'Excluir pessoa' },
    ];

    let algumAcessivel = false;

    for (const ep of endpointsProtegidos) {
      let resp;
      if (ep.metodo === 'GET') {
        resp = await request.get(`${API_BASE}${ep.path}`);
      } else if (ep.metodo === 'POST') {
        resp = await request.post(`${API_BASE}${ep.path}`, {
          data: { nome: 'Teste', dataNascimento: '01/01/2000' },
        });
      } else {
        resp = await request.delete(`${API_BASE}${ep.path}`);
      }

      const status = resp.status();
      const acessivel = status !== 401 && status !== 403;

      if (acessivel) {
        algumAcessivel = true;
        console.log(`  🔴 ${ep.metodo} ${ep.path} — HTTP ${status} — ACESSÍVEL SEM TOKEN!`);
      } else {
        console.log(`  🟢 ${ep.metodo} ${ep.path} — HTTP ${status} — bloqueado`);
      }
    }

    registrarFinding({
      teste: testName,
      severidade: 'CRÍTICA',
      vulneravel: algumAcessivel,
      descricao: 'Endpoints protegidos acessíveis sem autenticação',
      detalhes: algumAcessivel
        ? 'Pelo menos um endpoint protegido é acessível sem token JWT!'
        : 'Todos os 7 endpoints protegidos retornaram 401/403 sem token.',
      recomendacao: 'Verificar configuração do Spring Security. Garantir que apenas /auth/**, /swagger-ui/**, /actuator/health são públicos.',
    });

    // Demonstrar no browser — tentar acessar /pessoas diretamente
    await page.goto('/pessoas');
    await page.waitForTimeout(2000);
    const redirecionou = page.url().includes('/login');
    console.log(`  ${redirecionou ? '🟢' : '🔴'} Acesso direto a /pessoas ${redirecionou ? 'redirecionou para /login' : 'NÃO redirecionou!'}`);
  });

  test('SEC-09: Acessar endpoints com token JWT inválido/expirado', async ({ request, page }) => {
    const testName = 'SEC-09: Acessar endpoints com token JWT inválido/expirado';
    console.log('\n🔴 SEC-09: Testando token JWT manipulado...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    const tokensInvalidos = [
      { nome: 'Token vazio', valor: '' },
      { nome: 'Token lixo', valor: 'abc123.xyz456.invalid' },
      { nome: 'Token com payload modificado', valor: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoYWNrZXJAZXZpbC5jb20iLCJyb2xlcyI6IkFETUlOIiwiZXhwIjo5OTk5OTk5OTk5fQ.invalidsignature' },
      { nome: 'Token None algorithm', valor: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbkBlbWFpbC5jb20iLCJyb2xlcyI6IkFETUlOIn0.' },
    ];

    let algumAceito = false;

    for (const t of tokensInvalidos) {
      const resp = await request.get(`${API_BASE}/api/pessoas`, {
        headers: { Authorization: `Bearer ${t.valor}` },
      });

      const aceito = resp.status() !== 401 && resp.status() !== 403;
      if (aceito) {
        algumAceito = true;
        console.log(`  🔴 "${t.nome}" — HTTP ${resp.status()} — ACEITO!`);
      } else {
        console.log(`  🟢 "${t.nome}" — HTTP ${resp.status()} — rejeitado`);
      }
    }

    registrarFinding({
      teste: testName,
      severidade: 'CRÍTICA',
      vulneravel: algumAceito,
      descricao: 'Validação de tokens JWT inválidos/manipulados',
      detalhes: algumAceito
        ? 'Servidor aceitou token JWT inválido ou manipulado!'
        : '4 tokens manipulados testados (vazio, lixo, payload modificado, None algorithm). Todos rejeitados corretamente.',
      recomendacao: 'Manter validação HMAC-SHA256. Rejeitar algoritmo "none". Validar expiração.',
    });
  });
});

// ═════════════════════════════════════════════════════════════════════════════════
// 5. IDOR + INFORMAÇÃO EXPOSTA
// ═════════════════════════════════════════════════════════════════════════════════
test.describe('5. IDOR e Informações Expostas', () => {

  test('SEC-10: Acessar dados de outros usuários (IDOR)', async ({ request, page }) => {
    const testName = 'SEC-10: Acessar dados de outros usuários (IDOR)';
    console.log('\n🔴 SEC-10: Teste de IDOR — acesso a dados de outros usuários...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    const token = await obterTokenValido(request);

    // Tentar acessar usuários com IDs sequenciais
    let dadosExpostos = false;
    const idsTestados: number[] = [];

    for (let id = 1; id <= 5; id++) {
      const resp = await request.get(`${API_BASE}/api/usuarios/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (resp.status() === 200) {
        const body = await resp.json();
        idsTestados.push(id);
        const isOwnData = body.email === VALID_EMAIL;
        if (!isOwnData) {
          dadosExpostos = true;
          console.log(`  🔴 ID ${id}: Acesso a dados de outro usuário! Email: ${body.email}`);
        } else {
          console.log(`  🟡 ID ${id}: Próprio usuário (${body.email})`);
        }
      } else {
        console.log(`  🟢 ID ${id}: HTTP ${resp.status()} — bloqueado/não existe`);
      }
    }

    registrarFinding({
      teste: testName,
      severidade: 'ALTA',
      vulneravel: dadosExpostos,
      descricao: 'IDOR — Acesso a dados de outros usuários via enumeração de ID',
      detalhes: dadosExpostos
        ? `Usuário admin conseguiu acessar dados de outros usuários. IDs acessíveis: ${idsTestados.join(', ')}`
        : 'Acesso a dados de outros usuários foi bloqueado corretamente.',
      recomendacao: 'Implementar verificação de ownership: o usuário só pode acessar seus próprios dados (exceto ADMIN). Usar UUIDs em vez de IDs sequenciais.',
    });
  });

  test('SEC-11: Endpoints de monitoramento expostos publicamente', async ({ request, page }) => {
    const testName = 'SEC-11: Endpoints de monitoramento expostos publicamente';
    console.log('\n🔴 SEC-11: Verificando endpoints de monitoramento...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    const actuatorEndpoints = [
      '/actuator/health',
      '/actuator/info',
      '/actuator/prometheus',
      '/actuator/metrics',
      '/actuator/env',
      '/actuator/beans',
      '/actuator/loggers',
    ];

    const expostos: string[] = [];

    for (const ep of actuatorEndpoints) {
      const resp = await request.get(`${API_BASE}${ep}`);
      if (resp.status() === 200) {
        expostos.push(ep);
        const body = await resp.text();
        const tamanho = body.length;
        console.log(`  🔴 ${ep} — PÚBLICO (${tamanho} bytes)`);
      } else {
        console.log(`  🟢 ${ep} — HTTP ${resp.status()} — protegido`);
      }
    }

    registrarFinding({
      teste: testName,
      severidade: 'MÉDIA',
      vulneravel: expostos.length > 1,
      descricao: 'Endpoints Actuator/monitoramento expostos sem autenticação',
      detalhes: expostos.length > 0
        ? `${expostos.length} endpoints públicos: ${expostos.join(', ')}. Expõem métricas internas, info do sistema e detalhes de saúde.`
        : 'Todos os endpoints de monitoramento estão protegidos.',
      recomendacao: 'Restringir Actuator a apenas /health (sem details). Mover /prometheus para rede interna. Proteger /metrics, /env, /loggers com autenticação.',
    });
  });

  test('SEC-12: Token de reset de senha exposto na resposta', async ({ request, page }) => {
    const testName = 'SEC-12: Token de reset de senha exposto na resposta';
    console.log('\n🔴 SEC-12: Verificando exposição de token de reset...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    const resp = await request.post(`${API_BASE}/api/auth/esqueci-senha`, {
      data: { email: VALID_EMAIL },
    });

    const body = await resp.text();
    const status = resp.status();
    const contemToken = /token|código|code|reset/i.test(body) && body.length > 20;

    console.log(`  HTTP ${status} — Tamanho resposta: ${body.length} bytes`);

    registrarFinding({
      teste: testName,
      severidade: 'ALTA',
      vulneravel: contemToken && status === 200,
      descricao: 'Token de recuperação de senha retornado na resposta HTTP',
      detalhes: contemToken
        ? `O endpoint /auth/esqueci-senha retorna o token de reset diretamente no corpo da resposta. Um atacante pode solicitar reset para qualquer email e obter o token.`
        : 'Token de reset não é exposto na resposta.',
      recomendacao: 'NUNCA retornar o token na resposta. Enviar apenas por email. Responder com mensagem genérica: "Se o email existir, enviaremos instruções."',
    });
  });

  test('SEC-13: Credenciais padrão hardcoded', async ({ request, page }) => {
    const testName = 'SEC-13: Credenciais padrão hardcoded';
    console.log('\n🔴 SEC-13: Verificando credenciais padrão...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    const credenciais = [
      { email: 'admin@email.com', senha: '123456', desc: 'Admin padrão' },
      { email: 'admin@admin.com', senha: 'admin', desc: 'Admin genérico' },
      { email: 'admin@email.com', senha: 'admin', desc: 'Admin + admin' },
      { email: 'root@email.com', senha: 'root', desc: 'Root' },
      { email: 'test@test.com', senha: 'test', desc: 'Test' },
    ];

    const acessiveis: string[] = [];

    for (const c of credenciais) {
      const resp = await request.post(`${API_BASE}/api/auth/login`, {
        data: { email: c.email, senha: c.senha },
      });
      if (resp.status() === 200) {
        acessiveis.push(`${c.desc} (${c.email}:${c.senha})`);
        console.log(`  🔴 ${c.desc}: ${c.email}/${c.senha} — LOGIN OK!`);
      } else {
        console.log(`  🟢 ${c.desc}: ${c.email}/${c.senha} — rejeitado`);
      }
    }

    registrarFinding({
      teste: testName,
      severidade: 'ALTA',
      vulneravel: acessiveis.length > 0,
      descricao: 'Credenciais padrão/hardcoded ativas no sistema',
      detalhes: acessiveis.length > 0
        ? `Credenciais encontradas: ${acessiveis.join('; ')}`
        : 'Nenhuma credencial padrão encontrada.',
      recomendacao: 'Remover DataInitializer em produção. Exigir troca de senha no primeiro login. Usar senhas fortes geradas automaticamente.',
    });

    // Demonstrar login com credencial padrão
    if (acessiveis.length > 0) {
      await page.getByLabel('Email').fill('admin@email.com');
      await page.getByRole('textbox', { name: 'Senha' }).fill('123456');
      await page.getByRole('button', { name: 'Entrar' }).click();
      await page.waitForTimeout(3000);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════════
// GERADOR DE FINDINGS (para o relatório final)
// ═════════════════════════════════════════════════════════════════════════════════
test.afterAll(async () => {
  // Salvar findings em JSON para o relatório
  const fs = await import('fs');
  const path = await import('path');
  const dir = path.join(process.cwd(), 'relatorio');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'security-findings.json'),
    JSON.stringify(findings, null, 2),
    'utf-8'
  );
  console.log(`\n📁 ${findings.length} findings salvos em relatorio/security-findings.json`);
});
