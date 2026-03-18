# 📋 Planejamento do Projeto Frontend

## Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | 19.x | Biblioteca UI |
| TypeScript | 5.9.x | Tipagem estática |
| Vite | 8.x | Build tool & dev server |
| React Router | 7.x | Roteamento SPA |
| Material UI (MUI) | 6.x | Design System / Componentes UI |
| Emotion | 11.x | CSS-in-JS (engine do MUI) |
| React Hook Form | 7.x | Gerenciamento de formulários |
| Zod | 3.x | Validação de schemas |
| Axios | 1.x | Requisições HTTP |
| Zustand | 5.x | Gerenciamento de estado global |

---

## Fases do Projeto

### 🔵 Fase 1 — Configuração do Ambiente (Infraestrutura)

**Objetivo:** Preparar o projeto com todas as dependências, configurações e estrutura de pastas seguindo as melhores práticas.

- [x] Analisar projeto base existente (React 19 + Vite 8 + TypeScript)
- [ ] Instalar dependências de produção:
  - `@mui/material` `@mui/icons-material` `@emotion/react` `@emotion/styled`
  - `react-router` (v7+)
  - `react-hook-form` `@hookform/resolvers` `zod`
  - `axios`
  - `zustand`
- [ ] Configurar path aliases (`@/`) no `tsconfig` e `vite.config.ts`
- [ ] Criar estrutura de pastas padronizada

**Estrutura de pastas:**
```
src/
├── assets/              # Imagens, ícones, fontes
├── components/          # Componentes reutilizáveis
│   └── ui/              # Componentes UI genéricos
├── features/            # Módulos por domínio (feature-based)
│   └── auth/            # Feature de autenticação
│       ├── components/  # Componentes específicos da feature
│       ├── hooks/       # Hooks específicos da feature
│       ├── services/    # Chamadas API da feature
│       ├── schemas/     # Schemas de validação (Zod)
│       ├── stores/      # Estado global da feature (Zustand)
│       ├── types/       # Tipos TypeScript da feature
│       └── pages/       # Páginas da feature
├── hooks/               # Hooks globais reutilizáveis
├── layouts/             # Layouts da aplicação
├── lib/                 # Configurações de libs externas (axios, etc)
├── pages/               # Páginas globais (404, etc)
├── routes/              # Configuração de rotas
├── services/            # Serviços globais (API base)
├── stores/              # Stores globais (Zustand)
├── styles/              # Tema MUI e estilos globais
├── types/               # Tipos globais TypeScript
└── utils/               # Funções utilitárias
```

---

### 🟢 Fase 2 — Tema e Layout Base

**Objetivo:** Configurar o tema visual (Material UI), estilos globais e o layout principal da aplicação.

- [ ] Criar tema customizado do Material UI (cores, tipografia, espaçamentos)
- [ ] Configurar `CssBaseline` para reset de estilos
- [ ] Criar componente `ThemeProvider` wrapper
- [ ] Criar layout de autenticação (`AuthLayout`) — layout limpo para telas de login/registro
- [ ] Criar layout principal (`MainLayout`) — com sidebar, header, etc. (estrutura base)

---

### 🟡 Fase 3 — Roteamento

**Objetivo:** Configurar o sistema de rotas com proteção de rotas autenticadas.

- [ ] Configurar React Router com `createBrowserRouter`
- [ ] Criar rotas públicas (login)
- [ ] Criar estrutura para rotas protegidas (preparação futura)
- [ ] Criar página 404 (Not Found)

---

### 🔴 Fase 4 — Tela de Login

**Objetivo:** Implementar a tela de login completa com validação, UX moderna e integração preparada para API.

- [ ] Criar schema de validação com Zod (email + senha)
- [ ] Criar formulário de login com React Hook Form + MUI
- [ ] Implementar store de autenticação com Zustand
- [ ] Criar service de autenticação (mock preparado para API real)
- [ ] Implementar feedback visual (loading, erros, toast)
- [ ] Design responsivo (mobile-first)
- [ ] Funcionalidades:
  - Campo de email com validação
  - Campo de senha com toggle de visibilidade
  - Botão "Lembrar-me"
  - Link "Esqueceu a senha?"
  - Botão de login com loading state
  - Mensagens de erro inline e gerais

---

### ⚪ Fase 5 — Melhorias Futuras (Backlog)

- [ ] Implementar interceptors do Axios (token, refresh token)
- [ ] Tela de registro
- [ ] Tela de recuperação de senha
- [ ] Dashboard principal
- [ ] Tema dark/light toggle
- [ ] Testes unitários (Vitest + Testing Library)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD pipeline

---

## Padrões e Convenções

| Padrão | Descrição |
|---|---|
| **Nomenclatura de arquivos** | `PascalCase` para componentes, `camelCase` para utils/hooks |
| **Exports** | `index.ts` barrel exports por módulo |
| **Componentes** | Functional components com arrow functions tipadas |
| **Estado** | Zustand para global, `useState`/`useReducer` para local |
| **Formulários** | React Hook Form + Zod para validação |
| **Estilos** | Material UI `sx` prop + Emotion `styled()` |
| **API** | Axios com instância configurada em `lib/axios.ts` |
| **Imports** | Aliases com `@/` apontando para `src/` |

---

> **Autor:** Gerado automaticamente pelo assistente de arquitetura  
> **Data:** 12 de fevereiro de 2026  
> **Versão:** 1.0.0
