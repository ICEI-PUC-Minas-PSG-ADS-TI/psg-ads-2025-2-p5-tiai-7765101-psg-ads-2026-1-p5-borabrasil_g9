# Projeto de Solução - Sprint 2

## 1. Arquitetura da Solução

A solução foi estruturada seguindo o modelo de **BFF (Backend for Frontend)** integrado ao Next.js, com arquitetura de microsserviços simplificada para consumo de APIs externas.

### 1.1 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Next.js 14 (App Router)                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │   │
│  │  │   Dashboard │  │   Perfil    │  │  Simulador  │  │  Votações │ │   │
│  │  │    Page     │  │   Page      │  │  Component  │  │ Component │ │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘ │   │
│  │         │                │                │              │       │   │
│  │         └────────────────┴────────────────┴──────────────┘       │   │
│  │                         │                                       │   │
│  │              ┌──────────┴──────────┐                            │   │
│  │              │   React Query     │                            │   │
│  │              │   (TanStack)      │                            │   │
│  │              └──────────┬──────────┘                            │   │
│  └─────────────────────────┼──────────────────────────────────────────┘   │
└──────────────────────────┼────────────────────────────────────────────────┘
                           │
                           │ HTTP Requests
                           │
┌──────────────────────────┼────────────────────────────────────────────────┐
│                       BACKEND                                             │
│  ┌───────────────────────┴──────────────────────────────────────────────┐  │
│  │                    API Routes (Next.js)                              │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │  │
│  │  │ /api/       │  │ /api/       │  │ /api/       │  │ /api/      │ │  │
│  │  │  senadores  │  │  deputados  │  │  votacoes/  │  │  presenca/ │ │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────┬──────┘ │  │
│  │         │                │                │               │        │  │
│  │         └────────────────┴────────────────┴───────────────┘        │  │
│  │                              │                                     │  │
│  │                   ┌───────────┴───────────┐                          │  │
│  │                   │    Cache Layer      │                          │  │
│  │                   │  (In-Memory + TTL)  │                          │  │
│  │                   └───────────┬───────────┘                          │  │
│  └───────────────────────────────┼──────────────────────────────────────┘  │
└──────────────────────────────────┼────────────────────────────────────────┘
                                   │
                                   │ External API Calls
                                   │
┌──────────────────────────────────┼────────────────────────────────────────┐
│                              APIs EXTERNAS                                │
│  ┌───────────────────────────────┴──────────────────────────────────┐      │
│  │                                                                  │      │
│  │   ┌─────────────────────┐      ┌─────────────────────┐          │      │
│  │   │   Senado Federal    │      │  Câmara dos         │          │      │
│  │   │   API Dados Abertos │      │  Deputados API      │          │      │
│  │   │   (legis.senado.    │      │  (dadosabertos.     │          │      │
│  │   │    leg.br)          │      │   camara.leg.br)    │          │      │
│  │   └─────────────────────┘      └─────────────────────┘          │      │
│  │                                                                  │      │
│  └──────────────────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Fluxo de Dados

1. **Frontend (Next.js):**
   - O usuário acessa a aplicação via browser
   - Componentes React utilizam hooks do TanStack Query para solicitar dados
   - Interface renderiza com dados em cache enquanto atualiza em background

2. **API Routes (Backend):**
   - Recebem requisições do frontend
   - Verificam se dados existem no **Cache em Memória**
   - Se cache válido: retorna imediatamente
   - Se cache expirado: consome APIs externas

3. **Provedores Externos:**
   - APIs do Senado Federal e Câmara dos Deputados
   - Dados em formato XML/JSON
   - Rate limiting e throttling implementados

4. **Processamento:**
   - Dados brutos são normalizados
   - Algoritmo de Score calcula métricas (0-100)
   - Resultado armazenado em cache e retornado

5. **Retorno:**
   - Frontend recebe dados estruturados
   - UI atualizada com informações processadas

## 2. Tecnologias Utilizadas

### 2.1 Core Stack

| Tecnologia | Versão | Propósito |
| :--- | :--- | :--- |
| **Next.js** | 14.x | Framework React com SSR/SSG |
| **TypeScript** | 5.x | Tipagem estática |
| **React** | 18.x | Biblioteca UI |
| **TailwindCSS** | 3.x | Estilização utilitária |

### 2.2 UI Components

| Tecnologia | Propósito |
| :--- | :--- |
| **shadcn/ui** | Componentes base acessíveis |
| **Radix UI** | Primitives para acessibilidade |
| **Lucide React** | Biblioteca de ícones |
| **class-variance-authority** | Variantes de componentes |
| **tailwind-merge** | Merge de classes Tailwind |
| **clsx** | Condições de classes |

### 2.3 Data Fetching & State

| Tecnologia | Propósito |
| :--- | :--- |
| **TanStack Query** | Cache client-side, revalidação |
| **Fetch API** | Requisições HTTP |
| **In-Memory Cache** | Cache server-side |

### 2.4 APIs Externas Integradas

| API | Endpoint Base | Dados |
| :--- | :--- | :--- |
| **Senado Federal** | `https://legis.senado.leg.br/dadosabertos` | Senadores, votações, presença |
| **Câmara dos Deputados** | `https://dadosabertos.camara.leg.br/api/v2` | Deputados, votações, proposições |

### 2.5 Ferramentas de Desenvolvimento

| Ferramenta | Propósito |
| :--- | :--- |
| **ESLint** | Linting de código |
| **Prettier** | Formatação de código |
| **PostCSS** | Processamento CSS |
| **Autoprefixer** | Prefixos CSS automáticos |

## 3. Wireframes e Mockups (Sprint 2)

### 3.1 RF-01 - Dashboard de Parlamentares

**História de Usuário:** HU-01 - Visualizar todos os parlamentares com seus scores

**Descrição:** Interface principal do sistema, apresentando grid de cards com informações resumidas dos parlamentares.

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│  🏛️ Bora Brasil                    [🔍 Buscar] [👤 Perfil]   │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌────────────────────────────────────────┐  │
│  │ FILTROS     │  │        GRID DE PARLAMENTARES           │  │
│  │             │  │                                        │  │
│  │ Estado      │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐  │  │
│  │ [Todos ▼]   │  │  │ 📷 Foto │ │ 📷 Foto │ │ 📷 Foto │  │  │
│  │             │  │  │         │ │         │ │         │  │  │
│  │ Partido     │  │  │  Nome   │ │  Nome   │ │  Nome   │  │  │
│  │ [Todos ▼]   │  │  │ Partido │ │ Partido │ │ Partido │  │  │
│  │             │  │  │   UF    │ │   UF    │ │   UF    │  │  │
│  │ Ordenar     │  │  │ ┌─────┐ │ │ ┌─────┐ │ │ ┌─────┐ │  │  │
│  │ [Score ▼]   │  │  │ │ 85  │ │ │ │ 72  │ │ │ │ 91  │ │  │  │
│  │             │  │  │ └─────┘ │ │ └─────┘ │ │ └─────┘ │  │  │
│  │ [Aplicar]   │  │  └─────────┘ └─────────┘ └─────────┘  │  │
│  └─────────────┘  └────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Grid responsivo de cards
- Filtros laterais (Estado, Partido)
- Ordenação por score
- Score visual em badge destacado
- Foto do parlamentar

---

### 3.2 RF-02 - Simulador de Impacto Social

**História de Usuário:** HU-02 - Saber quais parlamentares mais beneficiam minha faixa de renda

**Descrição:** Tela interativa que permite ao usuário selecionar sua classe social e visualizar um ranking personalizado de parlamentares.

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│  🏛️ Bora Brasil                              [⬅️ Voltar]      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   SIMULADOR DE IMPACTO SOCIAL                                  │
│   ───────────────────────────                                  │
│                                                                │
│   Selecione sua classe social:                                 │
│                                                                │
│   ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│   │   A     │ │   B     │ │   C     │ │   D     │ │   E     │   │
│   │ Renda   │ │ Renda   │ │ Renda   │ │ Renda   │ │ Renda   │   │
│   │  Alta   │ │ Média   │ │ Média   │ │  Baixa  │ │  Baixa  │   │
│   │ [  ]    │ │ [✓]     │ │ [  ]    │ │ [  ]    │ │ [  ]    │   │
│   └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                                │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    PÓDIO - TOP 3                       │   │
│   │                                                         │   │
│   │    🥈                    🥇                    🥉      │   │
│   │   ┌─────┐               ┌─────┐               ┌─────┐   │   │
│   │   │ 📷  │               │ 📷  │               │ 📷  │   │   │
│   │   │Nome2│               │Nome1│               │Nome3│   │   │
│   │   │ 78  │               │ 85  │               │ 72  │   │   │
│   │   └─────┘               └─────┘               └─────┘   │   │
│   │                                                         │   │
│   │   Esses parlamentares mais se alinham aos seus          │   │
│   │   interesses como cidadão da classe B!                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Seletor de classe social (A, B, C, D, E)
- Recálculo automático ao selecionar
- Pódio visual com top 3
- Indicadores de ranking (🥇🥈🥉)
- Explicação contextual

---

### 3.3 RF-03 - Perfil Individual do Parlamentar

**História de Usuário:** HU-03 - Analisar o desempenho detalhado de um parlamentar

**Descrição:** Página completa com informações detalhadas, score, pilares de avaliação e histórico.

**Wireframe:**

```
┌────────────────────────────────────────────────────────────────┐
│  🏛️ Bora Brasil                              [⬅️ Voltar]      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────┐  Nome do Parlamentar          [🔗 Perfil Oficial]│
│  │          │  Nome Completo                                 │
│  │   📷     │  ┌────────┐ ┌────────┐ ┌────────┐                │
│  │   Foto   │  │Partido │ │   UF   │ │ Cargo  │                │
│  │          │  └────────┘ └────────┘ └────────┘                │
│  └──────────┘                                                  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  SCORE GERAL: 87/100                                    │  │
│  │  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           5 PILARES DE AVALIAÇÃO                        │  │
│  │                                                         │  │
│  │       Saúde: 90 ████████░░                              │  │
│  │   Educação: 85 ███████░░░                               │  │
│  │   Economia: 88 ████████░░                               │  │
│  │   Direitos: 92 ████████░                                │  │
│  │  Infraestrutura: 80 ███████░░░                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           HISTÓRICO DE VOTAÇÕES                       │  │
│  │                                                         │  │
│  │ ┌─────────────────────────────────────────────────┐    │  │
│  │ │ [SIM]  PL nº 2148: Reforma Tributária - ...    │ ▶️ │  │
│  │ │      Tema: Economia  │ Impacto: Progressivo      │    │  │
│  │ └─────────────────────────────────────────────────┘    │  │
│  │ ┌─────────────────────────────────────────────────┐    │  │
│  │ │ [NÃO]  PEC nº 31: Reforma Administrativa - ...│ ▶️ │  │
│  │ │      Tema: Direitos  │ Impacto: Regressivo      │    │  │
│  │ └─────────────────────────────────────────────────┘    │  │
│  │ ┌─────────────────────────────────────────────────┐    │  │
│  │ │ [SIM]  MP nº 1210: Auxílio Emergencial - ...   │ ▶️ │  │
│  │ │      Tema: Economia  │ Impacto: Progressivo      │    │  │
│  │ └─────────────────────────────────────────────────┘    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Foto e informações básicas
- Link para perfil oficial
- Score geral com barra de progresso
- Visualização dos 5 pilares
- Histórico de votações expansível
- Indicadores de impacto

---

### 3.4 RF-04 - Detalhes da Votação (Expandido)

**História de Usuário:** HU-04 - Visualizar histórico de votações com contexto

**Descrição:** Componente expansível mostrando detalhes completos de uma votação específica.

**Wireframe (Fechado):**

```
┌────────────────────────────────────────────────────────────────┐
│  [SIM]  PL nº 2148: Reforma Tributária - Aprovado           ▶️ │
│        Tema: Economia │ Impacto: Progressivo                   │
└────────────────────────────────────────────────────────────────┘
```

**Wireframe (Expandido):**

```
┌────────────────────────────────────────────────────────────────┐
│  O QUE FOI VOTADO:                                             │
│  ─────────────────                                             │
│  PL nº 2148: Reforma Tributária - Aprovado                      │
│                                                                │
│  EXPLICAÇÃO DO VOTO:                                           │
│  ────────────────────                                          │
│  O parlamentar votou SIM em uma proposta que foi aprovada.     │
│  Esta medida altera a legislação vigente. Resultado: 305 Sim,  │
│  132 Não. Este voto é considerado progressivo por favorecer   │
│  políticas sociais.                                            │
│                                                                │
│  IMPACTO: [Progressivo ↑]                                      │
│                                                                │
│  [🔗 Ver votação oficial]                                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Funcionalidades:**
- Resumo da votação
- Número identificador
- Explicação detalhada
- Indicador de impacto
- Link para site oficial
- Toggle expandir/colapsar

## 4. Estrutura de Pastas do Projeto

```
Bora-Brasil-main/
├── 📁 .next/                    # Build do Next.js
├── 📁 node_modules/             # Dependências
├── 📁 public/                   # Arquivos estáticos
│   └── placeholder.svg
├── 📁 src/
│   ├── 📁 app/                  # App Router (Next.js 14)
│   │   ├── 📁 api/              # API Routes (Backend)
│   │   │   ├── 📁 deputados/
│   │   │   ├── 📁 presenca/
│   │   │   ├── 📁 proposicoes/
│   │   │   ├── 📁 senadores/
│   │   │   └── 📁 votacoes/
│   │   ├── 📁 dashboard/        # Página Dashboard
│   │   ├── 📁 parlamentar/      # Página Perfil
│   │   ├── globals.css          # Estilos globais
│   │   ├── layout.tsx           # Layout raiz
│   │   └── page.tsx             # Home
│   ├── 📁 components/           # Componentes React
│   │   ├── 📁 ui/               # UI Components (shadcn)
│   │   ├── simulador-impacto.tsx
│   │   ├── parlamentar-card.tsx
│   │   ├── voto-item.tsx
│   │   └── theme-provider.tsx
│   ├── 📁 hooks/                # Custom React Hooks
│   │   ├── use-deputados.ts
│   │   ├── use-senadores.ts
│   │   └── use-simulador-votos.ts
│   ├── 📁 lib/                  # Bibliotecas e utilidades
│   │   ├── 📁 scoring/          # Algoritmo de Score
│   │   │   ├── types.ts
│   │   │   ├── calculator.ts
│   │   │   └── aggregator.ts
│   │   ├── cache.ts             # Sistema de Cache
│   │   ├── utils.ts             # Utilitários
│   │   ├── parlamentar-links.ts # Links oficiais
│   │   └── votacao-details.ts   # Detalhes de votações
│   ├── 📁 services/             # Serviços de API
│   │   ├── 📁 camara/           # API Câmara
│   │   └── 📁 senado/           # API Senado
│   └── 📁 types/                # Tipos TypeScript
├── 📄 .eslintrc.json            # Config ESLint
├── 📄 .gitignore               # Git ignore
├── 📄 components.json          # Config shadcn/ui
├── 📄 next.config.js           # Config Next.js
├── 📄 package.json             # Dependências
├── 📄 tailwind.config.ts       # Config Tailwind
├── 📄 tsconfig.json            # Config TypeScript
├── 📄 Especificação.md          # Documentação Técnica
└── 📄 Projeto-Solucao.md       # Documentação do Projeto
```

## 5. Considerações Finais

### 5.1 Decisões de Arquitetura

1. **Cache em Memória vs Banco de Dados:**
   - Optamos por cache volátil devido à natureza das APIs governamentais
   - Dados são atualizados frequentemente (TTL de 1-6 horas)
   - Reduz carga nas APIs externas

2. **BFF (Backend for Frontend):**
   - API Routes do Next.js atuam como intermediário
   - Permite processamento e cache server-side
   - Abstrai complexidade das APIs externas

3. **Score Calculado em Tempo Real:**
   - Algoritmo processa dados brutos
   - Não armazena scores pre-calculados
   - Garante dados sempre atualizados

### 5.2 Próximos Passos (Sprint 3)

- Persistência em banco de dados (PostgreSQL/MongoDB)
- Sistema de autenticação de usuários
- Funcionalidade de favoritos/comparar parlamentares
- Exportação de relatórios
- Notificações de novas votações

---

**Documento criado em:** 6 de Abril de 2026  
**Sprint:** 2  
**Equipe:** Bora Brasil
