Bora Brasil - Lista Macro de Funcionalidades
🏛️ Dashboard Principal
Visão geral do Congresso Nacional com estatísticas em tempo real
Cards informativos: total de senadores, deputados e parlamentares com score
Filtros avançados por estado, partido, casa legislativa e busca por nome
Ordenação por nome, partido, estado ou score de desempenho
Grade visual com fotos e informações básicas dos parlamentares
📊 Simulador de Impacto Social
Seleção de faixa de renda (Classe E, D, C, B, A) baseada em dados IBGE/ABEP
Cálculo personalizado de impacto das votações para cada classe social
Ranking dos melhores parlamentares para cada faixa de renda
Metodologia detalhada com 5 passos explicativos
Pódio visual com os 3 melhores parlamentares
Filtros específicos por estado e partido nos resultados
👤 Perfil Individual do Parlamentar
Informações básicas: foto, nome completo, partido, estado, email
Score geral com visualização gráfica (0-100)
4 pilares de avaliação:
Impacto Econômico
Serviços Essenciais
Presença e Coerência
Benefício por Renda
Análise detalhada de votações recentes
Métricas de presença e coerência
🗳️ Sistema de Votações
Coleta automática de votações do Senado Federal via API oficial
Classificação inteligente de temas (tributação, saúde, educação, etc.)
Análise de direção (progressivo/regressivo) de cada proposta
Cálculo de impacto por faixa de renda
Fórmula matemática: impacto = peso_tema × voto × direção
📈 Sistema de Scoring
Algoritmo ponderado baseado em dados socioeconômicos
Pesos diferenciados por tema e classe social
Normalização de scores (0-100, onde 50 é neutro)
Cores intuitivas: verde (positivo), amarelo (neutro), vermelho (negativo)
Labels descritivos: "Excelente", "Bom", "Neutro", "Ruim", "Crítico"
🔌 APIs e Integrações
API do Senado Federal (Dados Abertos)
API da Câmara dos Deputados
Cache inteligente para otimizar performance
Endpoints REST para todas as funcionalidades
Dados em tempo real de proposições, votações e presença
🎨 Interface e UX
Design moderno com TailwindCSS e shadcn/ui
Tema claro/escuro automático
Layout responsivo para mobile/desktop
Navegação intuitiva com breadcrumbs
Carregamento assíncrono com estados de loading
Tratamento de erros amigável
📊 Fontes de Dados
Votações: API Dados Abertos do Senado
Classificação: Metadados oficiais das matérias
Renda: IBGE PNAD Contínua + ABEP Critério Brasil 2024
Salário mínimo: R$ 1.621 (Decreto nº 12.797/2025)
🔧 Funcionalidades Técnicas
Next.js 14 com App Router
TypeScript para type safety
React Query para cache e sincronização
Componentes reutilizáveis com UI consistente
SEO otimizado com metadados
Performance com lazy loading e code splitting
