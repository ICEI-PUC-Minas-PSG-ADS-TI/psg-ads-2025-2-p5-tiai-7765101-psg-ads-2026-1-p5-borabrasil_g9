# 2. Planejamento do Projeto

Esta seção apresenta como o grupo organizará o trabalho ao longo do semestre.  
O projeto adota uma metodologia ágil, simulando o ambiente de uma Software House.

---

### 🚨 Regra de Ouro:

> ❗Não existe divisão entre "quem faz documento", "quem faz Front-end" e "quem faz Back-end".

<br>Todos os integrantes são **Desenvolvedores Full-Stack** e devem implementar **Fatias Verticais (Vertical Slices)**.

✔️ Cada membro deve entregar a funcionalidade completa:  
**Banco de Dados → API → Tela**

---

# 2.1 Sprints do Projeto

O projeto será realizado em **4 Sprints**, com entregas contínuas de código e documentação.

---

## 📅 Visão Geral

### 🟢 Sprint 1 – Setup, Hello World e Visão do Produto
- README com descrição do projeto
- ODS escolhida
- Backlog macro
- Repositório criado
- Banco de dados instanciado (vazio)
- Tela "Hello World" conectada à API

---

### 🟡 Sprint 2 – MVP (Primeira Fatia Vertical)
- Requisitos Funcionais documentados
- Script do Banco de Dados
- 1ª funcionalidade completa funcionando
- Dados sendo salvos no banco

⚠️ Se não salvar no banco, não pontua.

---

### 🔵 Sprint 3 – Core e Regras de Negócio
- Implementação das regras de negócio
- Validações no backend
- DER atualizado via Engenharia Reversa
- Diagrama de Classes atualizado

---

### 🔴 Sprint 4 – Finalização e Deploy
- Correção de bugs
- Testes finais ponta a ponta
- Documentação final consolidada
- Relatório preenchido no APC
- Sistema pronto para Arguição

---

# 👥 Papéis de Gestão

Todos programam.  
Os papéis abaixo são apenas para organização do time.

- 👨‍💻 **Tech Lead (Git Master)**  
  Responsável pelo repositório e merges.

- 🗄️ **Arquiteto de Dados (DBA Guard)**  
  Responsável pela modelagem e padronização do banco.

- 🧪 **Gerente de Qualidade (QA & Code Reviewer)**  
  Responsável por revisar código e validar testes.

- 📋 **Facilitador Ágil (PO / Scrum Master)**  
  Responsável por prazos, Kanban e priorização do backlog.

---

## Definição dos Papéis – Sprint 1

- 👨‍💻 Tech Lead: **Pedro Veloso Soares**
- 🗄️ Arquiteto de Dados: **Reinato Silva Lessa Junior**
- 🧪 Gerente de Qualidade: **Reinato Silva Lessa Junior**
- 📋 Facilitador Ágil: **Pedro Veloso Soares**

> Caso os papéis mudem nas próximas Sprints, atualizar neste documento.

---

# 2.2 Execução e Controle

## 🗂️ Kanban (OBRIGATÓRIO)

O projeto pode utilizar a aba **Projects** do GitHub, porém é **OBRIGATÓRIO preencher os quadros Kanban de cada Sprint** (apresentados abaixo).

### Estrutura obrigatória do Board:

- A Fazer
- Desenvolver
- Fila para Teste
- Teste
- Feito

### Regras

- Cada cartão deve representar uma Fatia Vertical.
- Todo cartão deve conter:
  - Responsável
  - Descrição
  - Prazo
- A avaliação individual considerará:
  - Histórico de commits
  - Movimentação no Kanban

⚠️ Se não está no Git, não foi feito.

---

# 📋 Acompanhamento das Sprints

## Legenda de Status

- [x] ✔️ Concluído
- [ ] 📝 Em andamento
- [ ] ⌛ Atrasado
- [ ] ❌ Não iniciado

---

## 🟢 Sprint 1 – Setup

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|-------|--------|--------|-------|--------|
| Pedro | Facilitador | Preencher Visão do Produto, ODS e Backlog no README | 12/03 | 15/03 | ✔️ |
| Reinato | Arquiteto | Criar instância do Banco de Dados | 12/03 | 16/03 | ✔️ |
| Pedro | Tech Lead | Criar repositório e estruturar pastas | 12/03 | 18/03 | ✔️ |
| Todos | Dev | Criar tela Hello World conectada à API | 15/03 | 20/03 | ✔️ |

---

## 🟡 Sprint 2 – MVP

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|-------|--------|--------|-------|--------|
| Reinato | Arquiteto | Gerar Script do Banco de Dados (Tabelas de Parlamentares) | 21/03 | 24/03 | 📝 |
| Pedro | Dev | Desenvolver Fatia 1 (Dashboard + API de Consumo) | 22/03 | 30/03 | 📝 |
| Pedro | Facilitador | Documentar Requisitos do MVP | 25/03 | 02/04 | ❌ |
| Reinato | QA | Revisão técnica e Merge | 02/04 | 05/04 | ❌ |

---

## 🔵 Sprint 3 – Core

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|-------|--------|--------|-------|--------|
| Pedro | Dev | Implementar Cálculo de Impacto por Classe Social | 06/04 | 15/04 | ❌ |
| Reinato | Dev | Implementar Sistema de Scoring e Filtros | 06/04 | 15/04 | ❌ |
| Reinato | Arquiteto | Atualizar DER via Engenharia Reversa | 16/04 | 20/04 | ❌ |
| Pedro | Tech Lead | Atualizar Diagrama de Classes | 16/04 | 23/04 | ❌ |

---

## 🔴 Sprint 4 – Finalização

| Responsável | Papel | Tarefa | Início | Prazo | Status |
|-------------|-------|--------|--------|-------|--------|
| Reinato | QA | Correção de bugs e Testes de Stress | 22/05 | 05/06 | ❌ |
| Pedro | Dev | Finalizar visualizações e dashboards de análise | 01/06 | 15/06 | ❌ |
| Pedro | Facilitador | Preencher Relatório APC | 10/06 | 20/06 | ❌ |
| Todos | Dev | Testes finais e consolidar README | 15/06 | 25/06 | ❌ |
