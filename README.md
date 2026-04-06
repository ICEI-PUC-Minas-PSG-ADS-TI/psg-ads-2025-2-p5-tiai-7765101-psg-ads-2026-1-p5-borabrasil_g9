This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

# 🇧🇷 Bora Brasil

**Plataforma de transparência legislativa e análise de impacto social das votações no Congresso Nacional**

## 📋 Descrição do Produto

O **Bora Brasil** é uma plataforma digital inovadora que transforma dados legislativos complexos em informações acessíveis e relevantes para o cidadão comum. Através de algoritmos inteligentes e análise socioeconômica, o sistema avalia o impacto real das votações parlamentares para diferentes classes sociais, permitindo que cada brasileiro compreenda como as decisões do Congresso afetam diretamente sua vida.

### Funcionalidades Principais:
- **Dashboard interativo** com todos os parlamentares em exercício
- **Simulador de impacto** personalizado por faixa de renda
- **Análise individual** de desempenho parlamentar
- **Sistema de scoring** baseado em dados reais das votações
- **Interface intuitiva** com visualizações e filtros avançados

## 🎯 ODS Escolhida: ODS 16 - Paz, Justiça e Instituições Eficazes

### Meta 16.6: Desenvolver instituições eficazes, responsáveis e transparentes em todos os níveis

O **Bora Brasil** contribui diretamente para esta meta através de:

- **🔍 Transparência Ativa**: Torna acessível dados legislativos antes restritos a especialistas
- **📊 Educação Cívica**: Capacita cidadãos a entenderem o processo legislativo
- **⚖️ Responsabilização**: Cria métricas objetivas para avaliação parlamentar
- **🌐 Participação Social**: Facilita o engajamento informado na vida política

### Indicadores Impactados:
- **16.6.1**: Gastos públicos primários como proporção do orçamento
- **16.6.2**: Proporção da população satisfeita com sua experiência com os serviços públicos
- **16.7.2**: Proporção da população que se sente segura ao caminhar sozinha na área onde mora

## 🌍 Problema Social que o Sistema Resolve

### O Desafio da Opacidade Legislativa

No Brasil, mais de **70% da população** não compreende o impacto das decisões legislativas em seu cotidiano. Esta lacuna de conhecimento cria:

#### ❌ **Problemas Identificados:**
1. **Assimetria Informacional**: Cidadãos sem acesso a dados compreensíveis sobre votações
2. **Desconexão Social**: Distanciamento entre parlamentares e necessidades reais da população
3. **Voto Desinformado**: Eleitores sem métricas objetivas para avaliar desempenho parlamentar
4. **Exclusão Digital**: Dados legislativos complexos e inacessíveis para leigos
5. **Falta de Personalização**: Análises genéricas que não consideram realidades socioeconômicas distintas

#### ✅ **Soluções Implementadas:**

**📊 Análise Personalizada por Classe Social**
- Sistema calcula impacto específico para cada faixa de renda (Classe E, D, C, B, A)
- Pesos diferenciados baseados em dados IBGE/ABEP sobre impacto real de políticas públicas

**🗳️ Tradução de Votações em Impacto Real**
- Algoritmo classifica temas: tributação, saúde, educação, trabalho, previdência
- Análise de direção: progressivo (beneficia classes baixas) vs regressivo (prejudica)

**📈 Métricas Objetivas de Desempenho**
- Score de 0-100 normalizado com cores intuitivas
- 4 pilares: impacto econômico, serviços essenciais, presença, coerência

**🎯 Empoderamento Cívico**
- Interface amigável que traduz jargão legislativo
- Simulador interativo para visualização de impacto pessoal
- Ranking personalizado mostrando "melhores parlamentares para você"

### Impacto Social Esperado:

**📊 Dados Estimados:**
- **+5 milhões** de brasileiros com acesso facilitado a dados legislativos
- **-30%** tempo para compreender impacto de votações importantes
- **+40%** engajamento cívico em comunidades carentes
- **+25%** transparência na relação parlamentar-eleitor

**🌟 Transformação Social:**
- Cidadãos mais informados e participativos
- Parlamentares mais responsáveis e conectados
- Processo legislativo mais transparente e compreensível
- Democracia mais forte e representativa

---

## 🚀 Getting Started (Bora Brasil)

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

```bash
# Clonar repositório
git clone https://github.com/Reijunior-CM/Bora-Brasil.git
cd Bora-Brasil

# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) para ver a aplicação.

### Tecnologias

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilização**: TailwindCSS, shadcn/ui
- **Dados**: React Query, APIs do Senado/Câmara
- **Deploy**: Vercel

---

## 📊 Fontes de Dados

- **Votações**: [API Dados Abertos do Senado](https://legis.senado.leg.br/dadosabertos)
- **Parlamentares**: [API da Câmara dos Deputados](https://dadosabertos.camara.leg.br/)
- **Socioeconômicos**: IBGE PNAD Contínua, ABEP Critério Brasil 2024
- **Salário Mínimo**: Decreto nº 12.797/2025 (R$ 1.621)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🌟 Feito com ❤️ pela transparência e democracia brasileira
