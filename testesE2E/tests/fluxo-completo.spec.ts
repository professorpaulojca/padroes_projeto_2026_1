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
    };
  });

  registrarMetrica('DOM Content Loaded', timing.domContentLoaded);
  registrarMetrica('Page Load Completo', timing.loadCompleto);
  registrarMetrica('TTFB (Time to First Byte)', timing.ttfb);

  return timing;
}

// ─── Setup / Teardown ───────────────────────────────────────────────────────────

test.beforeEach(async () => {
  metricas.length = 0;
});

test.afterEach(async ({}, testInfo) => {
  if (metricas.length > 0) {
    const resumo = metricas.map(m => `${m.nome}: ${m.valor.toFixed(2)} ${m.unidade}`).join('\n');
    await testInfo.attach('metricas-performance', {
      body: Buffer.from(resumo),
      contentType: 'text/plain',
    });
  }
});

// ─── Helper: faz login e vai ao dashboard ───────────────────────────────────────
async function fazerLogin(page: Page) {
  await page.goto('/login', { waitUntil: 'networkidle' });
  await page.getByLabel('Email').fill('admin@email.com');
  await page.getByRole('textbox', { name: 'Senha' }).fill('123456');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
}

// Nome único para evitar colisão entre execuções
function gerarNomePessoa() {
  const ts = Date.now().toString().slice(-6);
  return `Teste E2E ${ts}`;
}

// ═════════════════════════════════════════════════════════════════════════════════
// FLUXO COMPLETO: Login → Dashboard → Pessoas → Cadastrar Pessoa
// ═════════════════════════════════════════════════════════════════════════════════
test.describe('Fluxo Completo — Login e Cadastro de Pessoa', () => {

  test('CT-01: Login com sucesso e redirecionamento ao dashboard', async ({ page }) => {
    console.log('\n🔄 CT-01: Realizando login com admin@email.com...');
    const inicio = Date.now();

    await page.goto('/login', { waitUntil: 'networkidle' });
    await medirTempoNavegacao(page);

    await page.getByLabel('Email').fill('admin@email.com');
    await page.getByRole('textbox', { name: 'Senha' }).fill('123456');

    const inicioSubmit = Date.now();
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    const tempoLogin = Date.now() - inicioSubmit;
    registrarMetrica('Tempo de login (submit → dashboard)', tempoLogin);

    expect(page.url()).toContain('/dashboard');
    console.log('  ✅ Login realizado com sucesso');

    const token = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(token).toBeTruthy();
    console.log('  ✅ Token JWT armazenado');

    const tempoTotal = Date.now() - inicio;
    registrarMetrica('Tempo total CT-01', tempoTotal);
  });

  test('CT-02: Navegar do dashboard para a página de Pessoas via sidebar', async ({ page }) => {
    console.log('\n🔄 CT-02: Navegando Dashboard → Pessoas...');
    await fazerLogin(page);

    const inicio = Date.now();

    // Clicar no link "Pessoas" no sidebar
    await page.getByRole('link', { name: 'Pessoas' }).click();
    await page.waitForURL('**/pessoas', { timeout: 10000 });
    const tempoNavegacao = Date.now() - inicio;
    registrarMetrica('Tempo de navegação Dashboard → Pessoas', tempoNavegacao);

    expect(page.url()).toContain('/pessoas');
    console.log('  ✅ Navegou para /pessoas');

    // Verificar elementos da página
    await expect(page.getByText('Gerencie o cadastro de pessoas')).toBeVisible();
    console.log('  ✅ Subtítulo da página visível');

    await expect(page.getByRole('button', { name: 'Nova Pessoa' })).toBeVisible();
    console.log('  ✅ Botão "Nova Pessoa" visível');

    registrarMetrica('Tempo total CT-02', Date.now() - inicio);
  });

  test('CT-03: Abrir drawer de cadastro e validar campos obrigatórios', async ({ page }) => {
    console.log('\n🔄 CT-03: Testando validações do formulário de pessoa...');
    await fazerLogin(page);
    await page.getByRole('link', { name: 'Pessoas' }).click();
    await page.waitForURL('**/pessoas', { timeout: 10000 });

    const inicio = Date.now();

    // Abrir drawer
    await page.getByRole('button', { name: 'Nova Pessoa' }).click();
    await expect(page.getByText('Nova Pessoa').first()).toBeVisible();
    console.log('  ✅ Drawer "Nova Pessoa" aberto');

    // Tentar submeter vazio
    await page.getByRole('button', { name: 'Criar' }).click();

    // Verificar mensagens de validação
    await expect(page.getByText('O nome é obrigatório')).toBeVisible({ timeout: 5000 });
    console.log('  ✅ Validação: "O nome é obrigatório"');

    await expect(page.getByText('A data de nascimento é obrigatória')).toBeVisible({ timeout: 5000 });
    console.log('  ✅ Validação: "A data de nascimento é obrigatória"');

    const tempoValidacao = Date.now() - inicio;
    registrarMetrica('Tempo até exibir validações', tempoValidacao);
  });

  test('CT-04: Validar formato de data de nascimento inválido', async ({ page }) => {
    console.log('\n🔄 CT-04: Testando validação de formato de data...');
    await fazerLogin(page);
    await page.getByRole('link', { name: 'Pessoas' }).click();
    await page.waitForURL('**/pessoas', { timeout: 10000 });

    await page.getByRole('button', { name: 'Nova Pessoa' }).click();
    await expect(page.getByText('Nova Pessoa').first()).toBeVisible();

    await page.getByLabel('Nome completo').fill('Pessoa Teste');
    await page.getByLabel('Data de nascimento').fill('invalido');
    await page.getByRole('button', { name: 'Criar' }).click();

    await expect(page.getByText('Formato inválido (dd/MM/yyyy)')).toBeVisible({ timeout: 5000 });
    console.log('  ✅ Validação: "Formato inválido (dd/MM/yyyy)"');
  });

  test('CT-05: Validar nome com menos de 3 caracteres', async ({ page }) => {
    console.log('\n🔄 CT-05: Testando validação de nome curto...');
    await fazerLogin(page);
    await page.getByRole('link', { name: 'Pessoas' }).click();
    await page.waitForURL('**/pessoas', { timeout: 10000 });

    await page.getByRole('button', { name: 'Nova Pessoa' }).click();
    await expect(page.getByText('Nova Pessoa').first()).toBeVisible();

    await page.getByLabel('Nome completo').fill('AB');
    await page.getByLabel('Data de nascimento').fill('01/01/2000');
    await page.getByRole('button', { name: 'Criar' }).click();

    await expect(page.getByText('O nome deve ter no mínimo 3 caracteres')).toBeVisible({ timeout: 5000 });
    console.log('  ✅ Validação: "O nome deve ter no mínimo 3 caracteres"');
  });

  test('CT-06: Cadastrar uma nova pessoa com sucesso', async ({ page }) => {
    const nomePessoa = gerarNomePessoa();
    console.log(`\n🔄 CT-06: Cadastrando pessoa "${nomePessoa}"...`);
    const inicio = Date.now();

    await fazerLogin(page);
    const tempoLogin = Date.now() - inicio;
    registrarMetrica('Tempo de login', tempoLogin);

    // Navegar para Pessoas
    const inicioNav = Date.now();
    await page.getByRole('link', { name: 'Pessoas' }).click();
    await page.waitForURL('**/pessoas', { timeout: 10000 });
    registrarMetrica('Tempo de navegação para /pessoas', Date.now() - inicioNav);

    // Abrir drawer
    const inicioDrawer = Date.now();
    await page.getByRole('button', { name: 'Nova Pessoa' }).click();
    await expect(page.getByText('Nova Pessoa').first()).toBeVisible();
    registrarMetrica('Tempo para abrir drawer', Date.now() - inicioDrawer);
    console.log('  ✅ Drawer "Nova Pessoa" aberto');

    // Preencher formulário
    const inicioPreenchimento = Date.now();
    await page.getByLabel('Nome completo').fill(nomePessoa);
    await page.getByLabel('Data de nascimento').fill('15/06/1995');
    registrarMetrica('Tempo de preenchimento do formulário', Date.now() - inicioPreenchimento);
    console.log(`  ✅ Formulário preenchido: nome="${nomePessoa}", data="15/06/1995"`);

    // Submeter
    const inicioSubmit = Date.now();
    await page.getByRole('button', { name: 'Criar' }).click();

    // Aguardar drawer fechar (indica sucesso)
    await expect(page.getByLabel('Nome completo')).not.toBeVisible({ timeout: 15000 });
    const tempoCadastro = Date.now() - inicioSubmit;
    registrarMetrica('Tempo de cadastro (submit → drawer fechar)', tempoCadastro);
    console.log('  ✅ Drawer fechou — cadastro realizado');

    // Verificar que a pessoa aparece na tabela
    await expect(page.getByText(nomePessoa)).toBeVisible({ timeout: 10000 });
    console.log(`  ✅ Pessoa "${nomePessoa}" aparece na tabela`);

    // Verificar dados na linha da tabela
    await expect(page.getByText('15/06/1995')).toBeVisible();
    console.log('  ✅ Data de nascimento exibida corretamente');

    const tempoTotal = Date.now() - inicio;
    registrarMetrica('Tempo total do fluxo (login + nav + cadastro)', tempoTotal);
    console.log(`  🏁 Fluxo completo: ${tempoTotal}ms`);
  });

  test('CT-07: Verificar pessoa cadastrada na listagem com busca', async ({ page }) => {
    console.log('\n🔄 CT-07: Testando busca na listagem de pessoas...');
    await fazerLogin(page);
    await page.getByRole('link', { name: 'Pessoas' }).click();
    await page.waitForURL('**/pessoas', { timeout: 10000 });

    const inicio = Date.now();

    // Buscar por "Teste E2E" (nome padrão dos testes)
    const campoBusca = page.getByPlaceholder('Buscar por nome...');
    await campoBusca.fill('Teste E2E');
    registrarMetrica('Tempo de preenchimento da busca', Date.now() - inicio);

    // Deve aparecer pelo menos uma pessoa com esse prefixo
    await expect(page.getByText('Teste E2E').first()).toBeVisible({ timeout: 5000 });
    console.log('  ✅ Pessoa encontrada na busca');

    // Limpar busca
    await campoBusca.clear();
    console.log('  ✅ Busca limpa — listagem completa restaurada');

    registrarMetrica('Tempo total CT-07', Date.now() - inicio);
  });

  test('CT-08: Excluir a pessoa cadastrada', async ({ page }) => {
    console.log('\n🔄 CT-08: Excluindo pessoa de teste...');
    await fazerLogin(page);
    await page.getByRole('link', { name: 'Pessoas' }).click();
    await page.waitForURL('**/pessoas', { timeout: 10000 });

    const inicio = Date.now();

    // Filtrar para encontrar a pessoa de teste
    const campoBusca = page.getByPlaceholder('Buscar por nome...');
    await campoBusca.fill('Teste E2E');

    // Aguardar a pessoa aparecer
    const linhaPessoa = page.getByText('Teste E2E').first();
    await expect(linhaPessoa).toBeVisible({ timeout: 5000 });

    // Clicar no botão de excluir (ícone de lixeira na linha)
    const linhaTabela = page.locator('tr', { has: page.getByText('Teste E2E').first() });
    await linhaTabela.getByRole('button', { name: /excluir|deletar|delete/i }).click();

    // Confirmar exclusão no dialog
    await expect(page.getByText('Excluir Pessoa')).toBeVisible({ timeout: 5000 });
    console.log('  ✅ Dialog de confirmação exibido');

    await expect(page.getByText('Tem certeza que deseja excluir esta pessoa?')).toBeVisible();
    console.log('  ✅ Mensagem de confirmação correta');

    const inicioExclusao = Date.now();
    await page.getByRole('button', { name: 'Excluir' }).click();

    // Aguardar dialog fechar
    await expect(page.getByText('Excluir Pessoa')).not.toBeVisible({ timeout: 10000 });
    const tempoExclusao = Date.now() - inicioExclusao;
    registrarMetrica('Tempo de exclusão (confirmar → dialog fechar)', tempoExclusao);
    console.log('  ✅ Pessoa excluída com sucesso');

    registrarMetrica('Tempo total CT-08', Date.now() - inicio);
  });

  test('CT-09: Fluxo completo sem interrupção — login, cadastrar, verificar, excluir', async ({ page }) => {
    const nomePessoa = `Fluxo Completo ${Date.now().toString().slice(-5)}`;
    console.log(`\n🔄 CT-09: Fluxo end-to-end completo — "${nomePessoa}"...`);
    const inicio = Date.now();

    // ── ETAPA 1: Login ──
    console.log('\n  📍 Etapa 1: Login');
    const inicioLogin = Date.now();
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.getByLabel('Email').fill('admin@email.com');
    await page.getByRole('textbox', { name: 'Senha' }).fill('123456');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    registrarMetrica('Etapa 1 — Login', Date.now() - inicioLogin);
    console.log('  ✅ Login OK → /dashboard');

    // ── ETAPA 2: Navegar para Pessoas ──
    console.log('  📍 Etapa 2: Navegar para Pessoas');
    const inicioNav = Date.now();
    await page.getByRole('link', { name: 'Pessoas' }).click();
    await page.waitForURL('**/pessoas', { timeout: 10000 });
    registrarMetrica('Etapa 2 — Navegação', Date.now() - inicioNav);
    console.log('  ✅ Navegação OK → /pessoas');

    // ── ETAPA 3: Cadastrar pessoa ──
    console.log('  📍 Etapa 3: Cadastrar pessoa');
    const inicioCadastro = Date.now();
    await page.getByRole('button', { name: 'Nova Pessoa' }).click();
    await expect(page.getByText('Nova Pessoa').first()).toBeVisible();

    await page.getByLabel('Nome completo').fill(nomePessoa);
    await page.getByLabel('Data de nascimento').fill('20/03/1990');
    await page.getByRole('button', { name: 'Criar' }).click();

    await expect(page.getByLabel('Nome completo')).not.toBeVisible({ timeout: 15000 });
    registrarMetrica('Etapa 3 — Cadastro', Date.now() - inicioCadastro);
    console.log(`  ✅ Pessoa "${nomePessoa}" cadastrada`);

    // ── ETAPA 4: Verificar na tabela ──
    console.log('  📍 Etapa 4: Verificar na tabela');
    const inicioVerificacao = Date.now();
    await expect(page.getByText(nomePessoa)).toBeVisible({ timeout: 10000 });
    registrarMetrica('Etapa 4 — Verificação na tabela', Date.now() - inicioVerificacao);
    console.log(`  ✅ Pessoa "${nomePessoa}" encontrada na tabela`);

    // ── ETAPA 5: Excluir pessoa ──
    console.log('  📍 Etapa 5: Excluir pessoa');
    const inicioExclusao = Date.now();
    const linhaTabela = page.locator('tr', { has: page.getByText(nomePessoa) });
    await linhaTabela.getByRole('button', { name: /excluir|deletar|delete/i }).click();

    await expect(page.getByText('Excluir Pessoa')).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByText('Excluir Pessoa')).not.toBeVisible({ timeout: 10000 });
    registrarMetrica('Etapa 5 — Exclusão', Date.now() - inicioExclusao);
    console.log('  ✅ Pessoa excluída');

    // ── RESULTADO FINAL ──
    const tempoTotal = Date.now() - inicio;
    registrarMetrica('TEMPO TOTAL DO FLUXO COMPLETO', tempoTotal);
    console.log(`\n  🏁 Fluxo completo finalizado: ${tempoTotal}ms`);
  });
});
