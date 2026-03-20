/**
 * Gerador de Relatório Final — Testes E2E de Login
 * 
 * Lê o arquivo resultados.json gerado pelo Playwright
 * e imprime um relatório formatado no console.
 * 
 * Uso: node gerar-relatorio.js
 */

const fs = require('fs');
const path = require('path');

const ARQUIVO_RESULTADO = path.join(__dirname, 'relatorio', 'resultados.json');

function formatarDuracao(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function gerarRelatorio() {
  if (!fs.existsSync(ARQUIVO_RESULTADO)) {
    console.error('❌ Arquivo de resultados não encontrado. Execute os testes primeiro: npm test');
    process.exit(1);
  }

  const dados = JSON.parse(fs.readFileSync(ARQUIVO_RESULTADO, 'utf-8'));
  const suites = dados.suites || [];

  const linha = '═'.repeat(80);
  const linhaSub = '─'.repeat(80);

  console.log('\n' + linha);
  console.log('  📋 RELATÓRIO FINAL — TESTES E2E DE LOGIN');
  console.log('  📅 Data: ' + new Date().toLocaleString('pt-BR'));
  console.log('  🔧 Ferramenta: Playwright Test');
  console.log(linha + '\n');

  let totalTestes = 0;
  let passaram = 0;
  let falharam = 0;
  let ignorados = 0;
  let duracaoTotal = 0;
  const resultados = [];

  function processarSuite(suite, prefixo = '') {
    const nomeGrupo = prefixo ? `${prefixo} > ${suite.title}` : suite.title;

    if (suite.specs) {
      for (const spec of suite.specs) {
        for (const test of spec.tests) {
          for (const result of test.results) {
            totalTestes++;
            const duracao = result.duration || 0;
            duracaoTotal += duracao;

            let status;
            if (result.status === 'passed') {
              passaram++;
              status = '✅ PASSOU';
            } else if (result.status === 'failed') {
              falharam++;
              status = '❌ FALHOU';
            } else {
              ignorados++;
              status = '⏭️ IGNORADO';
            }

            resultados.push({
              grupo: nomeGrupo,
              nome: spec.title,
              status,
              duracao,
              erro: result.status === 'failed'
                ? (result.error?.message || 'Erro desconhecido').substring(0, 200)
                : null,
              anexos: result.attachments || [],
            });
          }
        }
      }
    }

    if (suite.suites) {
      for (const sub of suite.suites) {
        processarSuite(sub, nomeGrupo);
      }
    }
  }

  for (const suite of suites) {
    processarSuite(suite);
  }

  // Resultados individuais
  console.log('  📝 RESULTADOS POR CASO DE TESTE\n');

  let grupoAtual = '';
  for (const r of resultados) {
    if (r.grupo !== grupoAtual) {
      grupoAtual = r.grupo;
      console.log(`\n  📁 ${grupoAtual}`);
      console.log('  ' + linhaSub);
    }

    console.log(`    ${r.status}  ${r.nome}  (${formatarDuracao(r.duracao)})`);
    if (r.erro) {
      console.log(`             💬 ${r.erro}`);
    }

    // Métricas de performance anexadas
    const metricasAnexo = r.anexos.find(a => a.name === 'metricas-performance');
    if (metricasAnexo && metricasAnexo.body) {
      const texto = Buffer.from(metricasAnexo.body, 'base64').toString('utf-8');
      const linhas = texto.split('\n');
      for (const l of linhas) {
        if (l.trim()) console.log(`             📊 ${l.trim()}`);
      }
    }
  }

  // Resumo
  console.log('\n\n' + linha);
  console.log('  📊 RESUMO GERAL');
  console.log(linha);
  console.log(`  Total de testes:     ${totalTestes}`);
  console.log(`  ✅ Passaram:          ${passaram}`);
  console.log(`  ❌ Falharam:          ${falharam}`);
  console.log(`  ⏭️  Ignorados:        ${ignorados}`);
  console.log(`  ⏱️  Duração total:    ${formatarDuracao(duracaoTotal)}`);
  console.log(`  📈 Taxa de sucesso:  ${totalTestes > 0 ? ((passaram / totalTestes) * 100).toFixed(1) : 0}%`);
  console.log(linha);

  // Avaliação
  const taxaSucesso = totalTestes > 0 ? (passaram / totalTestes) * 100 : 0;
  console.log('\n  🏆 AVALIAÇÃO FINAL:');
  if (taxaSucesso === 100) {
    console.log('     🟢 EXCELENTE — Todos os testes passaram!');
  } else if (taxaSucesso >= 80) {
    console.log('     🟡 BOM — A maioria dos testes passou, mas existem falhas a corrigir.');
  } else if (taxaSucesso >= 50) {
    console.log('     🟠 ATENÇÃO — Muitos testes falharam. Revisão necessária.');
  } else {
    console.log('     🔴 CRÍTICO — A maioria dos testes falhou. Ação imediata necessária.');
  }

  // Recomendações
  console.log('\n  💡 SUGESTÕES:');
  if (falharam > 0) {
    console.log('     → Revise os testes que falharam e corrija as inconsistências.');
    console.log('     → Execute "npm run report" para ver o relatório HTML detalhado.');
  }
  console.log('     → Integre esses testes no pipeline de CI/CD para execução automatizada.');
  console.log('     → Adicione testes de acessibilidade (a11y) com @axe-core/playwright.');
  console.log('     → Considere testes de carga usando k6 ou Artillery para o endpoint /auth/login.');
  console.log('     → Screenshots e vídeos dos testes estão na pasta relatorio-html/.\n');

  console.log(linha + '\n');
}

gerarRelatorio();
