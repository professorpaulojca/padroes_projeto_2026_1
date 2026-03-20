/**
 * Gerador de Relatório de Segurança — Testes de Pentest E2E
 * 
 * Lê security-findings.json e resultados.json do Playwright
 * e gera um relatório HTML profissional de segurança.
 * 
 * Uso: node gerar-relatorio-seguranca.js
 */

const fs = require('fs');
const path = require('path');

const FINDINGS_FILE = path.join(__dirname, 'relatorio', 'security-findings.json');
const RESULTS_FILE = path.join(__dirname, 'relatorio', 'resultados.json');
const OUTPUT_HTML = path.join(__dirname, 'relatorio', 'relatorio-seguranca.html');

function gerarRelatorio() {
  if (!fs.existsSync(FINDINGS_FILE)) {
    console.error('❌ Arquivo security-findings.json não encontrado. Execute os testes primeiro.');
    process.exit(1);
  }

  const findings = JSON.parse(fs.readFileSync(FINDINGS_FILE, 'utf-8'));
  let resultados = null;
  if (fs.existsSync(RESULTS_FILE)) {
    resultados = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'));
  }

  const criticas = findings.filter(f => f.vulneravel && f.severidade === 'CRÍTICA');
  const altas = findings.filter(f => f.vulneravel && f.severidade === 'ALTA');
  const medias = findings.filter(f => f.vulneravel && f.severidade === 'MÉDIA');
  const baixas = findings.filter(f => f.vulneravel && f.severidade === 'BAIXA');
  const seguras = findings.filter(f => !f.vulneravel);
  const totalVulneraveis = findings.filter(f => f.vulneravel).length;

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Relatório de Segurança — Pentest E2E</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0d1117; color: #c9d1d9; line-height: 1.6; }
  .container { max-width: 1100px; margin: 0 auto; padding: 40px 20px; }

  /* Header */
  .header { text-align: center; margin-bottom: 40px; padding: 40px; background: linear-gradient(135deg, #161b22 0%, #1a1e2e 100%); border: 1px solid #30363d; border-radius: 12px; }
  .header h1 { font-size: 2.2em; color: #f0f6fc; margin-bottom: 8px; }
  .header .subtitle { color: #8b949e; font-size: 1.1em; }
  .header .meta { margin-top: 16px; color: #8b949e; font-size: 0.9em; }
  .header .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 600; margin: 4px; }

  /* Score */
  .score-section { display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap; }
  .score-card { flex: 1; min-width: 200px; background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; text-align: center; }
  .score-card .number { font-size: 2.5em; font-weight: 800; }
  .score-card .label { color: #8b949e; font-size: 0.9em; margin-top: 4px; }
  .score-card.critica { border-color: #f85149; }
  .score-card.critica .number { color: #f85149; }
  .score-card.alta { border-color: #f0883e; }
  .score-card.alta .number { color: #f0883e; }
  .score-card.media { border-color: #d29922; }
  .score-card.media .number { color: #d29922; }
  .score-card.segura { border-color: #3fb950; }
  .score-card.segura .number { color: #3fb950; }

  /* Risk meter */
  .risk-meter { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; margin-bottom: 30px; text-align: center; }
  .risk-meter h2 { margin-bottom: 16px; color: #f0f6fc; }
  .risk-bar { height: 24px; background: #21262d; border-radius: 12px; overflow: hidden; margin: 0 auto; max-width: 600px; }
  .risk-fill { height: 100%; border-radius: 12px; transition: width 0.5s; }
  .risk-label { margin-top: 12px; font-size: 1.3em; font-weight: 700; }

  /* Findings */
  .finding { background: #161b22; border: 1px solid #30363d; border-radius: 12px; margin-bottom: 16px; overflow: hidden; }
  .finding-header { display: flex; align-items: center; padding: 16px 20px; gap: 12px; cursor: pointer; }
  .finding-header:hover { background: #1c2129; }
  .finding-icon { font-size: 1.5em; }
  .finding-title { flex: 1; font-weight: 600; font-size: 1.05em; color: #f0f6fc; }
  .finding-sev { padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: 700; text-transform: uppercase; }
  .sev-critica { background: rgba(248,81,73,0.15); color: #f85149; border: 1px solid rgba(248,81,73,0.3); }
  .sev-alta { background: rgba(240,136,62,0.15); color: #f0883e; border: 1px solid rgba(240,136,62,0.3); }
  .sev-media { background: rgba(210,153,34,0.15); color: #d29922; border: 1px solid rgba(210,153,34,0.3); }
  .sev-baixa { background: rgba(63,185,80,0.15); color: #3fb950; border: 1px solid rgba(63,185,80,0.3); }
  .sev-seguro { background: rgba(63,185,80,0.1); color: #3fb950; border: 1px solid rgba(63,185,80,0.2); }
  .finding-body { padding: 0 20px 20px; border-top: 1px solid #21262d; }
  .finding-body p { margin: 12px 0 8px; }
  .finding-body .label-text { color: #8b949e; font-weight: 600; font-size: 0.85em; text-transform: uppercase; letter-spacing: 0.5px; }
  .finding-body .detail-text { color: #c9d1d9; white-space: pre-wrap; font-family: 'Cascadia Code', 'Fira Code', monospace; font-size: 0.9em; background: #0d1117; padding: 12px; border-radius: 8px; margin-top: 4px; border: 1px solid #21262d; }
  .recommendation { background: rgba(56,139,253,0.08); border: 1px solid rgba(56,139,253,0.2); border-radius: 8px; padding: 12px; margin-top: 8px; color: #58a6ff; }

  /* Summary Table */
  .summary-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  .summary-table th, .summary-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #21262d; }
  .summary-table th { color: #8b949e; font-weight: 600; font-size: 0.85em; text-transform: uppercase; background: #161b22; }
  .summary-table td { color: #c9d1d9; }
  .vuln-yes { color: #f85149; font-weight: 700; }
  .vuln-no { color: #3fb950; font-weight: 700; }

  /* Recommendations */
  .reco-section { background: #161b22; border: 1px solid #30363d; border-radius: 12px; padding: 24px; margin-top: 30px; }
  .reco-section h2 { color: #f0f6fc; margin-bottom: 16px; }
  .reco-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #21262d; }
  .reco-item:last-child { border-bottom: none; }
  .reco-priority { font-weight: 700; min-width: 80px; }
  .reco-text { color: #c9d1d9; }

  /* Footer */
  .footer { text-align: center; margin-top: 40px; padding: 20px; color: #484f58; font-size: 0.85em; }

  @media print {
    body { background: white; color: #1a1a1a; }
    .container { max-width: 100%; }
    .finding, .score-card, .risk-meter, .reco-section, .header { border-color: #ddd; background: #fafafa; }
    .finding-title, .header h1, .reco-section h2, .risk-meter h2 { color: #1a1a1a; }
  }
</style>
</head>
<body>
<div class="container">
  <!-- Header -->
  <div class="header">
    <h1>🔒 Relatório de Segurança</h1>
    <div class="subtitle">Pentest Automatizado E2E — Playwright</div>
    <div class="meta">
      <div>📅 ${dataAtual} &nbsp;|&nbsp; 🔧 Playwright Test + Chromium</div>
      <div style="margin-top: 8px;">
        <span class="badge" style="background:rgba(248,81,73,0.15);color:#f85149;">Brute Force</span>
        <span class="badge" style="background:rgba(240,136,62,0.15);color:#f0883e;">SQL Injection</span>
        <span class="badge" style="background:rgba(210,153,34,0.15);color:#d29922;">XSS</span>
        <span class="badge" style="background:rgba(56,139,253,0.15);color:#58a6ff;">Auth Bypass</span>
        <span class="badge" style="background:rgba(163,113,247,0.15);color:#a371f7;">IDOR</span>
      </div>
    </div>
  </div>

  <!-- Score Cards -->
  <div class="score-section">
    <div class="score-card critica">
      <div class="number">${criticas.length}</div>
      <div class="label">CRÍTICAS</div>
    </div>
    <div class="score-card alta">
      <div class="number">${altas.length}</div>
      <div class="label">ALTAS</div>
    </div>
    <div class="score-card media">
      <div class="number">${medias.length}</div>
      <div class="label">MÉDIAS</div>
    </div>
    <div class="score-card segura">
      <div class="number">${seguras.length}</div>
      <div class="label">SEGURAS</div>
    </div>
  </div>

  <!-- Risk Meter -->
  ${(() => {
    const riskScore = (criticas.length * 40 + altas.length * 25 + medias.length * 15 + baixas.length * 5);
    const maxScore = findings.length * 40;
    const riskPct = maxScore > 0 ? Math.min(100, Math.round((riskScore / maxScore) * 100)) : 0;
    let riskColor, riskText;
    if (riskPct >= 70) { riskColor = '#f85149'; riskText = 'RISCO CRÍTICO'; }
    else if (riskPct >= 50) { riskColor = '#f0883e'; riskText = 'RISCO ALTO'; }
    else if (riskPct >= 25) { riskColor = '#d29922'; riskText = 'RISCO MODERADO'; }
    else { riskColor = '#3fb950'; riskText = 'RISCO BAIXO'; }
    return `
  <div class="risk-meter">
    <h2>Nível de Risco Geral</h2>
    <div class="risk-bar"><div class="risk-fill" style="width:${riskPct}%;background:${riskColor};"></div></div>
    <div class="risk-label" style="color:${riskColor};">${riskText} (${riskPct}%)</div>
  </div>`;
  })()}

  <!-- Findings Detalhados -->
  <h2 style="color:#f0f6fc; margin-bottom:16px;">📋 Achados Detalhados (${findings.length} testes)</h2>

  ${findings.map((f, i) => {
    const sevClass = f.vulneravel ? `sev-${f.severidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}` : 'sev-seguro';
    const icon = f.vulneravel ? '🔴' : '🟢';
    const statusText = f.vulneravel ? 'VULNERÁVEL' : 'SEGURO';
    return `
  <div class="finding">
    <div class="finding-header">
      <span class="finding-icon">${icon}</span>
      <span class="finding-title">${f.descricao}</span>
      <span class="finding-sev ${sevClass}">${f.vulneravel ? f.severidade : 'SEGURO'}</span>
    </div>
    <div class="finding-body">
      <p class="label-text">Detalhes do Teste</p>
      <div class="detail-text">${f.detalhes}</div>
      <div class="recommendation">
        <strong>💡 Recomendação:</strong> ${f.recomendacao}
      </div>
    </div>
  </div>`;
  }).join('')}

  <!-- Tabela Resumo -->
  <h2 style="color:#f0f6fc; margin: 30px 0 16px;">📊 Resumo de Vulnerabilidades</h2>
  <table class="summary-table">
    <thead>
      <tr>
        <th>Teste</th>
        <th>Severidade</th>
        <th>Status</th>
        <th>Descrição</th>
      </tr>
    </thead>
    <tbody>
      ${findings.map(f => `
      <tr>
        <td>${f.teste.substring(0, 6)}</td>
        <td><span class="finding-sev ${f.vulneravel ? `sev-${f.severidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}` : 'sev-seguro'}">${f.severidade}</span></td>
        <td class="${f.vulneravel ? 'vuln-yes' : 'vuln-no'}">${f.vulneravel ? '⚠ VULNERÁVEL' : '✔ SEGURO'}</td>
        <td>${f.descricao}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <!-- Recomendações Priorizadas -->
  <div class="reco-section">
    <h2>🛡️ Plano de Correção Priorizado</h2>
    ${[...criticas, ...altas, ...medias, ...baixas].map((f, i) => `
    <div class="reco-item">
      <span class="reco-priority" style="color:${f.severidade === 'CRÍTICA' ? '#f85149' : f.severidade === 'ALTA' ? '#f0883e' : f.severidade === 'MÉDIA' ? '#d29922' : '#3fb950'};">[${f.severidade}]</span>
      <span class="reco-text"><strong>${f.descricao}:</strong> ${f.recomendacao}</span>
    </div>`).join('')}
  </div>

  <!-- OWASP Mapping -->
  <div class="reco-section" style="margin-top: 20px;">
    <h2>📖 Mapeamento OWASP Top 10 (2021)</h2>
    <table class="summary-table">
      <thead><tr><th>OWASP</th><th>Categoria</th><th>Achado</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>A01</td><td>Broken Access Control</td><td>IDOR, Auth Bypass</td><td class="${findings.some(f => f.vulneravel && f.descricao.includes('IDOR')) ? 'vuln-yes' : 'vuln-no'}">${findings.some(f => f.vulneravel && f.descricao.includes('IDOR')) ? '⚠ Encontrado' : '✔ OK'}</td></tr>
        <tr><td>A02</td><td>Cryptographic Failures</td><td>JWT Secret hardcoded</td><td class="vuln-yes">⚠ Encontrado</td></tr>
        <tr><td>A03</td><td>Injection</td><td>SQL Injection, XSS</td><td class="${findings.some(f => f.vulneravel && f.descricao.includes('SQL')) ? 'vuln-yes' : 'vuln-no'}">${findings.some(f => f.vulneravel && f.descricao.includes('SQL')) ? '⚠ Encontrado' : '✔ OK'}</td></tr>
        <tr><td>A04</td><td>Insecure Design</td><td>Reset token na resposta</td><td class="${findings.some(f => f.vulneravel && f.descricao.includes('reset')) ? 'vuln-yes' : 'vuln-no'}">${findings.some(f => f.vulneravel && f.descricao.includes('reset')) ? '⚠ Encontrado' : '✔ OK'}</td></tr>
        <tr><td>A05</td><td>Security Misconfiguration</td><td>Actuator exposto, CORS wildcard</td><td class="${findings.some(f => f.vulneravel && f.descricao.includes('Actuator')) ? 'vuln-yes' : 'vuln-no'}">${findings.some(f => f.vulneravel && f.descricao.includes('Actuator')) ? '⚠ Encontrado' : '✔ OK'}</td></tr>
        <tr><td>A07</td><td>Identification & Auth Failures</td><td>Brute force, credenciais padrão</td><td class="${findings.some(f => f.vulneravel && (f.descricao.includes('Rate') || f.descricao.includes('Lockout') || f.descricao.includes('Credenciais'))) ? 'vuln-yes' : 'vuln-no'}">${findings.some(f => f.vulneravel && (f.descricao.includes('Rate') || f.descricao.includes('Lockout') || f.descricao.includes('Credenciais'))) ? '⚠ Encontrado' : '✔ OK'}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Relatório gerado automaticamente por Playwright Test</p>
    <p>Vídeos e traces disponíveis na pasta <code>relatorio-html/</code></p>
    <p>⚠ Este relatório é para fins educacionais/defensivos. Testes executados apenas em ambiente local autorizado.</p>
  </div>
</div>
</body>
</html>`;

  fs.writeFileSync(OUTPUT_HTML, html, 'utf-8');
  console.log(`✅ Relatório de segurança gerado: ${OUTPUT_HTML}`);

  // Imprimir resumo no console
  console.log('\n' + '═'.repeat(80));
  console.log('  🔒 RELATÓRIO DE SEGURANÇA — RESUMO');
  console.log('═'.repeat(80));
  console.log(`  Total de testes:      ${findings.length}`);
  console.log(`  🔴 Vulneráveis:        ${totalVulneraveis}`);
  console.log(`  🟢 Seguros:            ${seguras.length}`);
  console.log(`  ⛔ Críticas:           ${criticas.length}`);
  console.log(`  🟠 Altas:              ${altas.length}`);
  console.log(`  🟡 Médias:             ${medias.length}`);
  console.log('═'.repeat(80));

  if (totalVulneraveis > 0) {
    console.log('\n  ⚠️ VULNERABILIDADES ENCONTRADAS:\n');
    [...criticas, ...altas, ...medias, ...baixas].forEach((f, i) => {
      console.log(`  ${i + 1}. [${f.severidade}] ${f.descricao}`);
      console.log(`     → ${f.recomendacao}`);
    });
  }

  console.log('\n  📄 Relatório HTML completo: relatorio/relatorio-seguranca.html');
  console.log('  📹 Vídeos dos testes: relatorio-html/');
  console.log('═'.repeat(80) + '\n');
}

gerarRelatorio();
