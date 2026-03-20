import { test, expect, type Page } from '@playwright/test';

// ─── Helpers de métricas ────────────────────────────────────────────────────────
interface Metrica {
  nome: string;
  valor: number;
  unidade: string;
}

const metricas: Metrica[] = [];

function registrarMetrica(nome: string, valor: number, unidade = 'ms') {
  metricas.push({ nome, valor, unidade });
  console.log(`  📊 ${nome}: ${valor.toFixed(2)} ${unidade}`);
}

async function medirTempoNavegacao(page: Page) {
  const timing = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
      loadCompleto: nav.loadEventEnd - nav.startTime,
      ttfb: nav.responseStart - nav.requestStart,
      tempoConexao: nav.connectEnd - nav.connectStart,
      tempoDNS: nav.domainLookupEnd - nav.domainLookupStart,
      tempoResposta: nav.responseEnd - nav.responseStart,
    };
  });

  registrarMetrica('DOM Content Loaded', timing.domContentLoaded);
  registrarMetrica('Page Load Completo', timing.loadCompleto);
  registrarMetrica('TTFB (Time to First Byte)', timing.ttfb);
  registrarMetrica('Tempo de Conexão', timing.tempoConexao);
  registrarMetrica('Tempo de DNS', timing.tempoDNS);
  registrarMetrica('Tempo de Resposta', timing.tempoResposta);

  return timing;
}

// ─── Setup / Teardown ───────────────────────────────────────────────────────────

test.beforeEach(async () => {
  metricas.length = 0;
});

test.afterEach(async ({}, testInfo) => {
  // Anexar métricas ao relatório
  if (metricas.length > 0) {
    const resumo = metricas.map(m => `${m.nome}: ${m.valor.toFixed(2)} ${m.unidade}`).join('\n');
    await testInfo.attach('metricas-performance', {
      body: Buffer.from(resumo),
      contentType: 'text/plain',
    });
  }
});

// ═════════════════════════════════════════════════════════════════════════════════
// TESTE 1 — Carregamento da página de login
// ═════════════════════════════════════════════════════════════════════════════════
test.describe('Página de Login — Carregamento', () => {
  test('CT-01: Deve carregar a página de login com todos os elementos visíveis', async ({ page }) => {
    console.log('\n🔄 Iniciando teste de carregamento da página de login...');
    const inicio = Date.now();

    await page.goto('/login', { waitUntil: 'networkidle' });

    const tempoCarregamento = Date.now() - inicio;
    registrarMetrica('Tempo total de navegação até /login', tempoCarregamento);

    // Métricas do navegador
    await medirTempoNavegacao(page);

    // Verificar elementos principais
    await expect(page.getByRole('heading', { name: 'Bem-vindo' })).toBeVisible();
    console.log('  ✅ Título "Bem-vindo" visível');

    await expect(page.getByText('Faça login para acessar o sistema')).toBeVisible();
    console.log('  ✅ Subtítulo visível');

    await expect(page.getByLabel('Email')).toBeVisible();
    console.log('  ✅ Campo Email visível');

    await expect(page.getByRole('textbox', { name: 'Senha' })).toBeVisible();
    console.log('  ✅ Campo Senha visível');

    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    console.log('  ✅ Botão "Entrar" visível');

    await expect(page.getByText('Lembrar-me')).toBeVisible();
    console.log('  ✅ Checkbox "Lembrar-me" visível');

    await expect(page.getByRole('link', { name: 'Esqueceu a senha?' })).toBeVisible();
    console.log('  ✅ Link "Esqueceu a senha?" visível');

    await expect(page.getByRole('link', { name: 'Criar conta' })).toBeVisible();
    console.log('  ✅ Link "Criar conta" visível');

    // Critério de performance: página deve carregar em < 5 segundos
    expect(tempoCarregamento).toBeLessThan(5000);
    console.log(`  🏁 Carregamento total: ${tempoCarregamento}ms (limite: 5000ms)`);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════
// TESTE 2 — Validação de campos obrigatórios (formulário vazio)
// ═════════════════════════════════════════════════════════════════════════════════
test.describe('Página de Login — Validações', () => {
  test('CT-02: Deve exibir erros de validação ao submeter formulário vazio', async ({ page }) => {
    console.log('\n🔄 Testando validação de campos obrigatórios...');
    const inicio = Date.now();

    await page.goto('/login', { waitUntil: 'networkidle' });

    // Clicar no botão sem preencher nada
    await page.getByRole('button', { name: 'Entrar' }).click();
    const tempoValidacao = Date.now() - inicio;

    // Deve exibir mensagens de erro
    await expect(page.getByText('O email é obrigatório')).toBeVisible({ timeout: 5000 });
    console.log('  ✅ Mensagem "O email é obrigatório" exibida');

    await expect(page.getByText('A senha é obrigatória')).toBeVisible({ timeout: 5000 });
    console.log('  ✅ Mensagem "A senha é obrigatória" exibida');

    registrarMetrica('Tempo até exibir validação', tempoValidacao);
    console.log(`  🏁 Validação exibida em: ${tempoValidacao}ms`);
  });

  test('CT-03: Deve exibir erro para email em formato inválido', async ({ page }) => {
    console.log('\n🔄 Testando validação de formato de email...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.getByLabel('Email').fill('emailinvalido');
    await page.getByRole('textbox', { name: 'Senha' }).fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('Informe um email válido')).toBeVisible({ timeout: 5000 });
    console.log('  ✅ Mensagem "Informe um email válido" exibida');
  });

  test('CT-04: Deve exibir erro para senha com menos de 6 caracteres', async ({ page }) => {
    console.log('\n🔄 Testando validação de tamanho de senha...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.getByLabel('Email').fill('teste@email.com');
    await page.getByRole('textbox', { name: 'Senha' }).fill('123');
    await page.getByRole('button', { name: 'Entrar' }).click();

    await expect(page.getByText('A senha deve ter no mínimo 6 caracteres')).toBeVisible({ timeout: 5000 });
    console.log('  ✅ Mensagem de senha curta exibida');
  });
});

// ═════════════════════════════════════════════════════════════════════════════════
// TESTE 3 — Toggle de visibilidade da senha
// ═════════════════════════════════════════════════════════════════════════════════
test.describe('Página de Login — Interações UI', () => {
  test('CT-05: Deve alternar visibilidade da senha ao clicar no ícone', async ({ page }) => {
    console.log('\n🔄 Testando toggle de visibilidade da senha...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    const campoSenha = page.getByRole('textbox', { name: 'Senha' });
    await campoSenha.fill('minhaSenha123');

    // Inicialmente deve ser type=password
    await expect(campoSenha).toHaveAttribute('type', 'password');
    console.log('  ✅ Campo inicialmente oculto (type=password)');

    // Clicar no botão de toggle
    await page.getByLabel('alternar visibilidade da senha').click();

    // Agora deve ser type=text
    await expect(campoSenha).toHaveAttribute('type', 'text');
    console.log('  ✅ Campo visível após toggle (type=text)');

    // Clicar novamente
    await page.getByLabel('alternar visibilidade da senha').click();

    // Deve voltar a password
    await expect(campoSenha).toHaveAttribute('type', 'password');
    console.log('  ✅ Campo oculto novamente (type=password)');
  });
});

// ═════════════════════════════════════════════════════════════════════════════════
// TESTE 4 — Login com credenciais inválidas (mock da API)
// ═════════════════════════════════════════════════════════════════════════════════
test.describe('Página de Login — Autenticação', () => {
  test('CT-06: Deve exibir mensagem de erro para credenciais inválidas', async ({ page }) => {
    console.log('\n🔄 Testando login com credenciais inválidas...');
    const inicio = Date.now();

    // Mock da API: retorna 400 com mensagem de erro
    // (o backend real retorna 401, que aciona o interceptor global do axios
    //  fazendo window.location.href='/login' antes do alert renderizar)
    await page.route('**/auth/login', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ erro: 'E-mail ou senha inválidos' }),
      });
    });

    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.getByLabel('Email').fill('usuario@invalido.com');
    await page.getByRole('textbox', { name: 'Senha' }).fill('senhaerrada');

    const inicioSubmit = Date.now();
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Deve exibir alerta de erro
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 15000 });
    const tempoRespostaErro = Date.now() - inicioSubmit;
    registrarMetrica('Tempo até exibir erro de autenticação', tempoRespostaErro);

    await expect(page.getByRole('alert')).toContainText('E-mail ou senha inválidos');
    console.log('  ✅ Alerta de erro exibido com mensagem correta');

    // Deve permanecer na página de login
    expect(page.url()).toContain('/login');
    console.log('  ✅ Permaneceu na página de login');

    console.log(`  🏁 Tempo de resposta ao erro: ${tempoRespostaErro}ms`);
  });

  test('CT-07: Deve realizar login com sucesso e redirecionar ao dashboard', async ({ page }) => {
    console.log('\n🔄 Testando login com sucesso (backend real — admin@email.com)...');
    const inicio = Date.now();

    await page.goto('/login', { waitUntil: 'networkidle' });
    const tempoCarregamento = Date.now() - inicio;
    registrarMetrica('Tempo de carregamento /login', tempoCarregamento);

    // Preencher formulário com credenciais reais
    const inicioPreenchimento = Date.now();
    await page.getByLabel('Email').fill('admin@email.com');
    await page.getByRole('textbox', { name: 'Senha' }).fill('123456');
    const tempoPreenchimento = Date.now() - inicioPreenchimento;
    registrarMetrica('Tempo de preenchimento do formulário', tempoPreenchimento);

    // Submeter
    const inicioSubmit = Date.now();
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Deve redirecionar para /dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    const tempoRedirecionamento = Date.now() - inicioSubmit;
    registrarMetrica('Tempo de submit até redirecionamento', tempoRedirecionamento);

    expect(page.url()).toContain('/dashboard');
    console.log('  ✅ Redirecionado para /dashboard com sucesso');

    // Verificar que o token foi salvo
    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeTruthy();
    console.log('  ✅ Token armazenado no localStorage');

    const tempoTotal = Date.now() - inicio;
    registrarMetrica('Tempo total do fluxo de login', tempoTotal);
    console.log(`  🏁 Fluxo completo: ${tempoTotal}ms`);
  });
});

// ═════════════════════════════════════════════════════════════════════════════════
// TESTE 5 — Navegação pelos links
// ═════════════════════════════════════════════════════════════════════════════════
test.describe('Página de Login — Navegação', () => {
  test('CT-08: Link "Esqueceu a senha?" deve navegar para /esqueci-senha', async ({ page }) => {
    console.log('\n🔄 Testando navegação para "Esqueceu a senha?"...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.getByRole('link', { name: 'Esqueceu a senha?' }).click();

    await page.waitForURL('**/esqueci-senha', { timeout: 5000 });
    expect(page.url()).toContain('/esqueci-senha');
    console.log('  ✅ Navegou para /esqueci-senha');
  });

  test('CT-09: Link "Criar conta" deve navegar para /cadastro', async ({ page }) => {
    console.log('\n🔄 Testando navegação para "Criar conta"...');

    await page.goto('/login', { waitUntil: 'networkidle' });

    await page.getByRole('link', { name: 'Criar conta' }).click();

    await page.waitForURL('**/cadastro', { timeout: 5000 });
    expect(page.url()).toContain('/cadastro');
    console.log('  ✅ Navegou para /cadastro');
  });

  test('CT-10: Rota raiz "/" deve redirecionar para /login', async ({ page }) => {
    console.log('\n🔄 Testando redirecionamento de "/" para "/login"...');

    await page.goto('/', { waitUntil: 'networkidle' });

    await page.waitForURL('**/login', { timeout: 5000 });
    expect(page.url()).toContain('/login');
    console.log('  ✅ Rota raiz redirecionou para /login');
  });
});
