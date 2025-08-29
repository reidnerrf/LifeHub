# Finanças - LifeHub

## 📊 Funcionalidades Implementadas

### 💰 Gestão de Transações
- **Adicionar/Editar/Excluir transações** com título, valor, tipo (receita/despesa), categoria, data e descrição
- **Categorização automática** de transações
- **Transações recorrentes** com intervalos configuráveis (semanal, mensal, anual)
- **Tags personalizadas** para organização
- **Histórico completo** de transações

### 📋 Contas a Pagar
- **Gestão completa** de contas com nome, valor, data de vencimento e categoria
- **Status automático** (pendente, pago, atrasado) baseado na data de vencimento
- **Lembretes configuráveis** (dias antes do vencimento)
- **Prioridades** (baixa, média, alta, urgente)
- **Contas recorrentes** com intervalos personalizáveis
- **Método de pagamento** opcional

### 💳 Contas a Receber
- **Gestão de recebíveis** com cliente, número da nota fiscal e valor
- **Status automático** (pendente, recebido, atrasado)
- **Lembretes de cobrança** configuráveis
- **Prioridades** para organização
- **Histórico de recebimentos**

### 🎯 Metas de Economia
- **Criação de metas** com valor alvo e prazo
- **Acompanhamento visual** com barras de progresso
- **Adição de valores** às metas existentes
- **Status automático** (em andamento, concluída, atrasada)
- **Categorização** de metas
- **Dicas de economia** integradas

### 📈 Relatórios Financeiros
- **Relatórios mensais, semanais e anuais** com dados completos
- **Análise de receitas e despesas** por período
- **Taxa de economia** calculada automaticamente
- **Top categorias** de gastos e fontes de renda
- **Status de contas** (pagas, atrasadas, pendentes)
- **Histórico de relatórios** gerados

### 🔔 Lembretes Inteligentes
- **Alertas de vencimento** para contas a pagar e receber
- **Notificações configuráveis** (dias antes do vencimento)
- **Destaque visual** para contas atrasadas
- **Ações rápidas** para marcar como pago/recebido

### 📊 Análises e Insights
- **Saldo atual** em tempo real
- **Receitas e despesas mensais** com comparação
- **Taxa de economia** percentual
- **Top categorias** de gastos e rendas
- **Tendências** financeiras

## 🏗️ Arquitetura Técnica

### Zustand Store (`src/store/finances.ts`)
```typescript
interface FinancesStore {
  // Dados
  transactions: Transaction[];
  bills: Bill[];
  receivables: Receivable[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  reports: FinancialReport[];

  // Estado atual
  selectedPeriod: 'week' | 'month' | 'year';
  selectedDate: Date;

  // Ações CRUD para todas as entidades
  addTransaction, updateTransaction, deleteTransaction;
  addBill, updateBill, deleteBill, markBillAsPaid;
  addReceivable, updateReceivable, deleteReceivable, markReceivableAsReceived;
  addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, addToSavingsGoal;
  addBudget, updateBudget, deleteBudget;

  // Relatórios e análises
  generateMonthlyReport, generateWeeklyReport, generateYearlyReport;
  getBalance, getMonthlyIncome, getMonthlyExpenses, getSavingsRate;
  getTopExpenseCategories, getTopIncomeSources;

  // Lembretes
  getDueReminders, getUpcomingReminders;
}
```

### Componentes Principais

#### 1. **Finances.tsx** - Tela Principal
- **Visão geral** do saldo, receitas e despesas
- **Seletor de período** (semana/mês/ano)
- **Metas de economia** com progresso visual
- **Contas a pagar** com status e ações rápidas
- **Contas a receber** com cobranças pendentes
- **Top categorias** de gastos e rendas
- **Transações recentes** com histórico

#### 2. **FinancialReports.tsx** - Modal de Relatórios
- **Geração de relatórios** por período
- **Análise detalhada** de receitas e despesas
- **Status de economia** com insights
- **Top categorias** e fontes de renda
- **Histórico** de relatórios gerados

#### 3. **SavingsGoals.tsx** - Modal de Metas
- **Criação e edição** de metas de economia
- **Acompanhamento visual** com barras de progresso
- **Adição de valores** às metas
- **Status e prazos** das metas
- **Dicas** para economizar

### Modelos de Dados

#### Transaction
```typescript
interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
  description?: string;
  tags: string[];
  isRecurring: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}
```

#### Bill
```typescript
interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  category: string;
  description?: string;
  isRecurring: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'yearly';
  reminderDays: number[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Receivable
```typescript
interface Receivable {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'received' | 'overdue';
  category: string;
  description?: string;
  client?: string;
  invoiceNumber?: string;
  reminderDays: number[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  updatedAt: Date;
}
```

#### SavingsGoal
```typescript
interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## 📱 Como Usar

### 1. **Visão Geral Financeira**
- Acesse a tela "Finanças" no menu principal
- Visualize o saldo atual, receitas e despesas do mês
- Acompanhe a taxa de economia em tempo real
- Use o seletor de período para analisar diferentes intervalos

### 2. **Gestão de Transações**
- Toque no botão "+" na seção "Transações Recentes"
- Digite o valor da transação
- O sistema automaticamente categoriza como receita ou despesa
- Visualize o histórico completo de transações

### 3. **Contas a Pagar**
- Toque no botão "+" na seção "Contas a Pagar"
- Digite o valor da conta
- O sistema define vencimento padrão em 7 dias
- Visualize contas atrasadas destacadas em vermelho
- Toque em "Pagar" para marcar como paga

### 4. **Contas a Receber**
- Toque no botão "+" na seção "A Receber"
- Digite o valor do recebível
- Configure cliente e número da nota fiscal
- Toque em "Receber" para marcar como recebido

### 5. **Metas de Economia**
- Toque no ícone de alvo no cabeçalho
- Crie novas metas com valor alvo e prazo
- Acompanhe o progresso com barras visuais
- Adicione valores às metas conforme economiza

### 6. **Relatórios Detalhados**
- Toque no ícone de gráficos no cabeçalho
- Selecione o período desejado (semana/mês/ano)
- Gere relatórios completos com análises
- Visualize histórico de relatórios anteriores

## 🧮 Algoritmos Implementados

### 1. **Cálculo de Saldo**
```typescript
getBalance = () => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return totalIncome - totalExpenses;
}
```

### 2. **Taxa de Economia**
```typescript
getSavingsRate = () => {
  const income = getMonthlyIncome();
  const expenses = getMonthlyExpenses();
  
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
}
```

### 3. **Status Automático de Contas**
```typescript
const getBillStatus = (dueDate: Date) => {
  const today = new Date();
  const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'due_today';
  return 'pending';
}
```

### 4. **Progresso de Metas**
```typescript
const getGoalProgress = (current: number, target: number) => {
  const percentage = (current / target) * 100;
  const status = percentage >= 100 ? 'completed' : 
                 percentage >= 75 ? 'on_track' : 
                 percentage >= 50 ? 'in_progress' : 'needs_attention';
  
  return { percentage, status };
}
```

## 📊 Exemplos de Uso

### Exemplo 1: Gestão Mensal
```
1. Configure metas de economia (ex: R$ 1.000 para viagem)
2. Registre todas as receitas (salário, freelances)
3. Categorize despesas (alimentação, transporte, lazer)
4. Configure contas recorrentes (aluguel, internet)
5. Acompanhe o progresso das metas
6. Gere relatório mensal para análise
```

### Exemplo 2: Controle de Contas
```
1. Adicione contas a pagar com vencimentos
2. Configure lembretes (3 dias antes)
3. Visualize contas atrasadas destacadas
4. Marque como pagas quando efetuar pagamento
5. Acompanhe recebíveis pendentes
6. Configure cobranças automáticas
```

### Exemplo 3: Análise Financeira
```
1. Selecione período de análise (mês/ano)
2. Gere relatório detalhado
3. Analise top categorias de gastos
4. Identifique oportunidades de economia
5. Ajuste metas baseado na análise
6. Planeje próximos meses
```

## 🎨 Interface Responsiva

### Design System
- **Cards** com bordas arredondadas e sombras
- **Cores temáticas** para diferentes tipos de dados
- **Ícones intuitivos** para ações rápidas
- **Tipografia hierárquica** para organização visual
- **Espaçamento consistente** entre elementos

### Estados Visuais
- **Sucesso**: Verde para valores positivos e ações concluídas
- **Atenção**: Amarelo para valores neutros e prazos próximos
- **Erro**: Vermelho para valores negativos e prazos vencidos
- **Primário**: Azul para ações principais e links

### Interações
- **Toque longo** para ações secundárias
- **Deslizar** para navegação entre períodos
- **Pull to refresh** para atualizar dados
- **Haptic feedback** para confirmações

## 🚀 Próximos Passos Sugeridos

### Funcionalidades Avançadas
1. **Sincronização bancária** com APIs de bancos
2. **Importação de extratos** em CSV/PDF
3. **Orçamentos por categoria** com alertas
4. **Investimentos** e acompanhamento de ativos
5. **Relatórios fiscais** para declaração de IR
6. **Backup na nuvem** com sincronização

### Melhorias de UX
1. **Gráficos interativos** para visualização de dados
2. **Notificações push** para lembretes
3. **Widgets** para tela inicial
4. **Modo offline** com sincronização posterior
5. **Exportação** de relatórios em PDF
6. **Compartilhamento** de metas com família

### Integrações
1. **APIs bancárias** para sincronização automática
2. **Serviços de pagamento** (PIX, cartões)
3. **APIs de câmbio** para moedas estrangeiras
4. **Serviços de investimento** para portfólio
5. **APIs fiscais** para declarações
6. **Serviços de nuvem** para backup

### Análises Avançadas
1. **Machine Learning** para categorização automática
2. **Previsões** de gastos futuros
3. **Análise de tendências** sazonais
4. **Recomendações** de economia
5. **Comparação** com médias do mercado
6. **Alertas inteligentes** baseados em padrões

## 📝 Notas Técnicas

### Performance
- **Lazy loading** de dados históricos
- **Cache local** para consultas frequentes
- **Otimização** de re-renders com React.memo
- **Debounce** em inputs de busca

### Segurança
- **Validação** de dados de entrada
- **Sanitização** de valores monetários
- **Backup** automático de dados
- **Criptografia** de dados sensíveis

### Acessibilidade
- **Labels** para screen readers
- **Contraste** adequado de cores
- **Tamanhos de fonte** ajustáveis
- **Navegação** por teclado

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024  
**Compatibilidade**: React Native 0.72+, Expo SDK 49+