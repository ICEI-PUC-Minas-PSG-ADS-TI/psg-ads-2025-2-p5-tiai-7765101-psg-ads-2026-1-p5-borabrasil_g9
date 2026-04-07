# Especificação Técnica - Sprint 2

## 1. Histórias de Usuário

| ID | Ator | Desejo | Prioridade |
| :--- | :--- | :--- | :--- |
| **HU-01** | Cidadão | Visualizar todos os parlamentares com seus scores para identificar os melhores representantes. | Alta |
| **HU-02** | Cidadão | Saber quais parlamentares mais beneficiam minha faixa de renda (Classe C, por exemplo). | Alta |
| **HU-03** | Eleitor | Analisar o desempenho detalhado de um parlamentar específico (5 pilares) antes de votar. | Média |
| **HU-04** | Eleitor | Visualizar o histórico de votações de um parlamentar para entender suas posições políticas. | Média |
| **HU-05** | Cidadão | Acessar o perfil oficial do parlamentar no site do governo para obter mais informações. | Baixa |

## 2. Requisitos Funcionais (RF)

### RF-01: Dashboard de Parlamentares
- **Descrição:** Interface com listagem de parlamentares, exibindo fotos, nome, partido, estado e score geral.
- **Funcionalidades:**
  - Listagem em grid de cards
  - Filtros por estado (UF) e partido
  - Ordenação por desempenho (score)
  - Busca por nome
  - Paginação ou scroll infinito
- **Critérios de Aceitação:**
  - Carregamento em menos de 3 segundos
  - Interface responsiva
  - Cache de dados para performance

### RF-02: Simulador de Impacto Social
- **Descrição:** Cálculo de impacto baseado na faixa de renda selecionada (A a E) e exibição de ranking personalizado.
- **Funcionalidades:**
  - Seleção de classe social (A, B, C, D, E)
  - Recálculo automático dos scores por categoria
  - Exibição de pódio com top 3 parlamentares
  - Indicadores visuais de alinhamento
- **Critérios de Aceitação:**
  - Resposta imediata ao mudar a seleção
  - Cálculo preciso baseado nos 5 pilares

### RF-03: Perfil Individual do Parlamentar
- **Descrição:** Página detalhada com informações completas do parlamentar e análise de desempenho.
- **Funcionalidades:**
  - Score geral (0-100)
  - Visualização dos 5 pilares de avaliação
  - Histórico de votações recentes
  - Link para perfil oficial
  - Informações de contato (email, partido, UF)
- **Critérios de Aceitação:**
  - Dados atualizados em tempo real
  - Layout informativo e organizado

### RF-04: Visualização de Votações
- **Descrição:** Exibição detalhada das votações do parlamentar com explicação e contexto.
- **Funcionalidades:**
  - Lista de votações com resultado (Sim/Não)
  - Resumo do projeto votado
  - Número identificador da proposição
  - Explicação do impacto do voto
  - Link para votação oficial
  - Indicador de tema/categoria
- **Critérios de Aceitação:**
  - Expansão/colapso de detalhes
  - Identificação clara do tipo de projeto (PL, PLC, MP, PEC)

## 3. Requisitos Não Funcionais (RNF)

### RNF-01: Performance
- **Descrição:** Tempo de resposta inferior a 3 segundos para carregamento de dados.
- **Implementação:**
  - Cache server-side com TTL (Time To Live)
  - ETag e Last-Modified para requisições condicionais
  - Cache client-side com React Query
  - Compressão de dados

### RNF-02: Responsividade
- **Descrição:** Layout adaptável para dispositivos móveis e desktop.
- **Implementação:**
  - TailwindCSS com breakpoints
  - Grid responsivo para listagem
  - Cards adaptáveis a diferentes tamanhos de tela

### RNF-03: Acessibilidade
- **Descrição:** Uso de semântica HTML5 e contraste adequado para leitura.
- **Implementação:**
  - Tags semânticas (header, main, section, article)
  - Cores com contraste WCAG AA
  - Suporte a temas claro e escuro

### RNF-04: Segurança
- **Descrição:** Proteção contra vulnerabilidades comuns.
- **Implementação:**
  - Sanitização de inputs
  - Headers de segurança
  - Validação de dados

## 4. Banco de Dados / Persistência

Como o projeto utiliza APIs externas do governo (Senado Federal e Câmara dos Deputados), a persistência de dados da Sprint 2 foi implementada via **Cache em Memória**:

### Cache Server-side
- **Tecnologia:** In-Memory Cache nas API Routes do Next.js
- **Funcionalidade:** 
  - Armazenamento temporário de respostas das APIs externas
  - TTL (Time To Live) configurável por endpoint
  - Suporte a ETag e Last-Modified para requisições condicionais
  - Fallback para dados em cache em caso de falha

### Cache Client-side
- **Tecnologia:** TanStack Query (React Query)
- **Funcionalidade:**
  - Cache de dados durante a sessão do usuário
  - Revalidação automática em background
  - Stale-while-revalidate para dados atualizados

### Estrutura de Dados em Cache

```typescript
// Interface do Cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
  lastModified?: string;
}

// Chaves de Cache utilizadas
- "senadores:atuais" - Lista de senadores em exercício
- "senadores:{id}" - Detalhes de senador específico
- "deputados:{params}" - Lista de deputados
- "deputados:{id}" - Detalhes de deputado específico
- "votacoes:senado" - Votações do Senado
- "votacoes:camara" - Votações da Câmara
```

**Nota:** Nesta sprint, optamos por cache volátil em memória para garantir performance no consumo das APIs governamentais. Os dados são atualizados periodicamente (TTL de 6 horas para listas, 1 hora para detalhes).

---

## Resumo das Funcionalidades Implementadas

| Funcionalidade | Status | Arquivos Principais |
| :--- | :--- | :--- |
| Dashboard de Parlamentares | ✅ Completo | `src/app/dashboard/page.tsx` |
| Simulador de Impacto Social | ✅ Completo | `src/components/simulador-impacto.tsx` |
| Perfil Individual | ✅ Completo | `src/app/parlamentar/[id]/page.tsx` |
| Visualização de Votações | ✅ Completo | `src/components/voto-item.tsx` |
| Cache de Performance | ✅ Completo | `src/lib/cache.ts` |
| API Routes | ✅ Completo | `src/app/api/*/route.ts` |
