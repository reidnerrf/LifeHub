import { create } from 'zustand';

export interface Transaction {
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

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  category: string;
  description?: string;
  isRecurring: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'yearly';
  reminderDays: number[]; // dias antes do vencimento para lembrar
  priority: 'low' | 'medium' | 'high' | 'urgent';
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Receivable {
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

export interface SavingsGoal {
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

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialReport {
  id: string;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  topExpenseCategories: { category: string; amount: number }[];
  topIncomeSources: { source: string; amount: number }[];
  billsPaid: number;
  billsOverdue: number;
  receivablesCollected: number;
  receivablesOverdue: number;
  createdAt: Date;
}

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
  
  // Ações para Transações
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsForPeriod: (startDate: Date, endDate: Date) => Transaction[];
  
  // Ações para Contas a Pagar
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  markBillAsPaid: (id: string) => void;
  getBillsForPeriod: (startDate: Date, endDate: Date) => Bill[];
  getOverdueBills: () => Bill[];
  getUpcomingBills: (days: number) => Bill[];
  
  // Ações para Contas a Receber
  addReceivable: (receivable: Omit<Receivable, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReceivable: (id: string, updates: Partial<Receivable>) => void;
  deleteReceivable: (id: string) => void;
  markReceivableAsReceived: (id: string) => void;
  getReceivablesForPeriod: (startDate: Date, endDate: Date) => Receivable[];
  getOverdueReceivables: () => Receivable[];
  getUpcomingReceivables: (days: number) => Receivable[];
  
  // Ações para Metas de Economia
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addToSavingsGoal: (goalId: string, amount: number) => void;
  getSavingsGoals: () => SavingsGoal[];
  
  // Ações para Orçamentos
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  getBudgetsForPeriod: (startDate: Date, endDate: Date) => Budget[];
  
  // Relatórios
  generateMonthlyReport: (year: number, month: number) => FinancialReport;
  generateWeeklyReport: (startDate: Date) => FinancialReport;
  generateYearlyReport: (year: number) => FinancialReport;
  
  // Análises
  getBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getSavingsRate: () => number;
  getTopExpenseCategories: (limit?: number) => { category: string; amount: number }[];
  getTopIncomeSources: (limit?: number) => { source: string; amount: number }[];
  
  // Lembretes
  getDueReminders: () => { bills: Bill[]; receivables: Receivable[] };
  getUpcomingReminders: (days: number) => { bills: Bill[]; receivables: Receivable[] };
  
  // Configurações
  setSelectedPeriod: (period: 'week' | 'month' | 'year') => void;
  setSelectedDate: (date: Date) => void;
}

export const useFinances = create<FinancesStore>((set, get) => ({
  // Estado inicial
  transactions: [
    {
      id: '1',
      title: 'Salário',
      amount: 5000.00,
      type: 'income',
      category: 'Trabalho',
      date: new Date(),
      description: 'Salário mensal',
      tags: ['salário', 'trabalho'],
      isRecurring: true,
      recurringInterval: 'monthly',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      title: 'Supermercado',
      amount: -180.50,
      type: 'expense',
      category: 'Alimentação',
      date: new Date(),
      description: 'Compras do mês',
      tags: ['alimentação', 'supermercado'],
      isRecurring: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  
  bills: [
    {
      id: '1',
      name: 'Aluguel',
      amount: 1200.00,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      status: 'pending',
      category: 'Moradia',
      description: 'Aluguel do apartamento',
      isRecurring: true,
      recurringInterval: 'monthly',
      reminderDays: [7, 3, 1],
      priority: 'high',
      paymentMethod: 'PIX',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Energia Elétrica',
      amount: 180.50,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 2)),
      status: 'pending',
      category: 'Utilidades',
      description: 'Conta de energia',
      isRecurring: true,
      recurringInterval: 'monthly',
      reminderDays: [5, 2],
      priority: 'medium',
      paymentMethod: 'Cartão de Crédito',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  
  receivables: [
    {
      id: '1',
      name: 'Cliente ACME',
      amount: 1200.00,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      status: 'pending',
      category: 'Serviços',
      description: 'Desenvolvimento de website',
      client: 'ACME Corp',
      invoiceNumber: 'INV-001',
      reminderDays: [7, 3, 1],
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  
  savingsGoals: [
    {
      id: '1',
      name: 'Viagem para Europa',
      targetAmount: 15000.00,
      currentAmount: 8500.00,
      deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      category: 'Viagem',
      description: 'Economia para viagem de 3 semanas',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Reserva de Emergência',
      targetAmount: 10000.00,
      currentAmount: 6500.00,
      category: 'Emergência',
      description: 'Fundo de emergência para 6 meses',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  
  budgets: [
    {
      id: '1',
      category: 'Alimentação',
      limit: 600.00,
      spent: 420.50,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      category: 'Transporte',
      limit: 400.00,
      spent: 280.00,
      period: 'monthly',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  
  reports: [],
  selectedPeriod: 'month',
  selectedDate: new Date(),
  
  // Transações
  addTransaction: (transaction) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      transactions: [newTransaction, ...state.transactions],
    }));
  },
  
  updateTransaction: (id, updates) => {
    set((state) => ({
      transactions: state.transactions.map((transaction) =>
        transaction.id === id
          ? { ...transaction, ...updates, updatedAt: new Date() }
          : transaction
      ),
    }));
  },
  
  deleteTransaction: (id) => {
    set((state) => ({
      transactions: state.transactions.filter((transaction) => transaction.id !== id),
    }));
  },
  
  getTransactionsForPeriod: (startDate, endDate) => {
    const { transactions } = get();
    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  },
  
  // Contas a Pagar
  addBill: (bill) => {
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      bills: [newBill, ...state.bills],
    }));
  },
  
  updateBill: (id, updates) => {
    set((state) => ({
      bills: state.bills.map((bill) =>
        bill.id === id
          ? { ...bill, ...updates, updatedAt: new Date() }
          : bill
      ),
    }));
  },
  
  deleteBill: (id) => {
    set((state) => ({
      bills: state.bills.filter((bill) => bill.id !== id),
    }));
  },
  
  markBillAsPaid: (id) => {
    get().updateBill(id, { status: 'paid' });
  },
  
  getBillsForPeriod: (startDate, endDate) => {
    const { bills } = get();
    return bills.filter((bill) => {
      const billDate = new Date(bill.dueDate);
      return billDate >= startDate && billDate <= endDate;
    });
  },
  
  getOverdueBills: () => {
    const { bills } = get();
    const today = new Date();
    return bills.filter((bill) => {
      const dueDate = new Date(bill.dueDate);
      return dueDate < today && bill.status !== 'paid';
    });
  },
  
  getUpcomingBills: (days) => {
    const { bills } = get();
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    return bills.filter((bill) => {
      const dueDate = new Date(bill.dueDate);
      return dueDate >= today && dueDate <= futureDate && bill.status !== 'paid';
    });
  },
  
  // Contas a Receber
  addReceivable: (receivable) => {
    const newReceivable: Receivable = {
      ...receivable,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      receivables: [newReceivable, ...state.receivables],
    }));
  },
  
  updateReceivable: (id, updates) => {
    set((state) => ({
      receivables: state.receivables.map((receivable) =>
        receivable.id === id
          ? { ...receivable, ...updates, updatedAt: new Date() }
          : receivable
      ),
    }));
  },
  
  deleteReceivable: (id) => {
    set((state) => ({
      receivables: state.receivables.filter((receivable) => receivable.id !== id),
    }));
  },
  
  markReceivableAsReceived: (id) => {
    get().updateReceivable(id, { status: 'received' });
  },
  
  getReceivablesForPeriod: (startDate, endDate) => {
    const { receivables } = get();
    return receivables.filter((receivable) => {
      const receivableDate = new Date(receivable.dueDate);
      return receivableDate >= startDate && receivableDate <= endDate;
    });
  },
  
  getOverdueReceivables: () => {
    const { receivables } = get();
    const today = new Date();
    return receivables.filter((receivable) => {
      const dueDate = new Date(receivable.dueDate);
      return dueDate < today && receivable.status !== 'received';
    });
  },
  
  getUpcomingReceivables: (days) => {
    const { receivables } = get();
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    return receivables.filter((receivable) => {
      const dueDate = new Date(receivable.dueDate);
      return dueDate >= today && dueDate <= futureDate && receivable.status !== 'received';
    });
  },
  
  // Metas de Economia
  addSavingsGoal: (goal) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      savingsGoals: [newGoal, ...state.savingsGoals],
    }));
  },
  
  updateSavingsGoal: (id, updates) => {
    set((state) => ({
      savingsGoals: state.savingsGoals.map((goal) =>
        goal.id === id
          ? { ...goal, ...updates, updatedAt: new Date() }
          : goal
      ),
    }));
  },
  
  deleteSavingsGoal: (id) => {
    set((state) => ({
      savingsGoals: state.savingsGoals.filter((goal) => goal.id !== id),
    }));
  },
  
  addToSavingsGoal: (goalId, amount) => {
    const { savingsGoals } = get();
    const goal = savingsGoals.find((g) => g.id === goalId);
    if (goal) {
      get().updateSavingsGoal(goalId, {
        currentAmount: goal.currentAmount + amount,
      });
    }
  },
  
  getSavingsGoals: () => {
    return get().savingsGoals.filter((goal) => goal.isActive);
  },
  
  // Orçamentos
  addBudget: (budget) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    set((state) => ({
      budgets: [newBudget, ...state.budgets],
    }));
  },
  
  updateBudget: (id, updates) => {
    set((state) => ({
      budgets: state.budgets.map((budget) =>
        budget.id === id
          ? { ...budget, ...updates, updatedAt: new Date() }
          : budget
      ),
    }));
  },
  
  deleteBudget: (id) => {
    set((state) => ({
      budgets: state.budgets.filter((budget) => budget.id !== id),
    }));
  },
  
  getBudgetsForPeriod: (startDate, endDate) => {
    const { budgets } = get();
    return budgets.filter((budget) => {
      return budget.startDate <= endDate && budget.endDate >= startDate && budget.isActive;
    });
  },
  
  // Relatórios
  generateMonthlyReport: (year, month) => {
    const { transactions, bills, receivables } = get();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    
    const periodTransactions = get().getTransactionsForPeriod(startDate, endDate);
    const periodBills = get().getBillsForPeriod(startDate, endDate);
    const periodReceivables = get().getReceivablesForPeriod(startDate, endDate);
    
    const totalIncome = periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
    
    // Top categorias de despesa
    const expenseCategories = periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
    
    const topExpenseCategories = Object.entries(expenseCategories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    // Top fontes de renda
    const incomeSources = periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    const topIncomeSources = Object.entries(incomeSources)
      .map(([source, amount]) => ({ source, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const billsPaid = periodBills.filter((b) => b.status === 'paid').length;
    const billsOverdue = periodBills.filter((b) => b.status === 'overdue').length;
    const receivablesCollected = periodReceivables.filter((r) => r.status === 'received').length;
    const receivablesOverdue = periodReceivables.filter((r) => r.status === 'overdue').length;
    
    const report: FinancialReport = {
      id: Date.now().toString(),
      period: 'monthly',
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      topExpenseCategories,
      topIncomeSources,
      billsPaid,
      billsOverdue,
      receivablesCollected,
      receivablesOverdue,
      createdAt: new Date(),
    };
    
    set((state) => ({
      reports: [report, ...state.reports],
    }));
    
    return report;
  },
  
  generateWeeklyReport: (startDate) => {
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);
    
    // Similar to monthly report but for week
    const { transactions, bills, receivables } = get();
    const periodTransactions = get().getTransactionsForPeriod(startDate, endDate);
    const periodBills = get().getBillsForPeriod(startDate, endDate);
    const periodReceivables = get().getReceivablesForPeriod(startDate, endDate);
    
    const totalIncome = periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
    
    const expenseCategories = periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
    
    const topExpenseCategories = Object.entries(expenseCategories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const incomeSources = periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    const topIncomeSources = Object.entries(incomeSources)
      .map(([source, amount]) => ({ source, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const billsPaid = periodBills.filter((b) => b.status === 'paid').length;
    const billsOverdue = periodBills.filter((b) => b.status === 'overdue').length;
    const receivablesCollected = periodReceivables.filter((r) => r.status === 'received').length;
    const receivablesOverdue = periodReceivables.filter((r) => r.status === 'overdue').length;
    
    const report: FinancialReport = {
      id: Date.now().toString(),
      period: 'weekly',
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      topExpenseCategories,
      topIncomeSources,
      billsPaid,
      billsOverdue,
      receivablesCollected,
      receivablesOverdue,
      createdAt: new Date(),
    };
    
    set((state) => ({
      reports: [report, ...state.reports],
    }));
    
    return report;
  },
  
  generateYearlyReport: (year) => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    
    // Similar logic to monthly report but for year
    const { transactions, bills, receivables } = get();
    const periodTransactions = get().getTransactionsForPeriod(startDate, endDate);
    const periodBills = get().getBillsForPeriod(startDate, endDate);
    const periodReceivables = get().getReceivablesForPeriod(startDate, endDate);
    
    const totalIncome = periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netIncome = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;
    
    const expenseCategories = periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
    
    const topExpenseCategories = Object.entries(expenseCategories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const incomeSources = periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    const topIncomeSources = Object.entries(incomeSources)
      .map(([source, amount]) => ({ source, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const billsPaid = periodBills.filter((b) => b.status === 'paid').length;
    const billsOverdue = periodBills.filter((b) => b.status === 'overdue').length;
    const receivablesCollected = periodReceivables.filter((r) => r.status === 'received').length;
    const receivablesOverdue = periodReceivables.filter((r) => r.status === 'overdue').length;
    
    const report: FinancialReport = {
      id: Date.now().toString(),
      period: 'yearly',
      startDate,
      endDate,
      totalIncome,
      totalExpenses,
      netIncome,
      savingsRate,
      topExpenseCategories,
      topIncomeSources,
      billsPaid,
      billsOverdue,
      receivablesCollected,
      receivablesOverdue,
      createdAt: new Date(),
    };
    
    set((state) => ({
      reports: [report, ...state.reports],
    }));
    
    return report;
  },
  
  // Análises
  getBalance: () => {
    const { transactions } = get();
    return transactions.reduce((balance, transaction) => {
      return balance + transaction.amount;
    }, 0);
  },
  
  getMonthlyIncome: () => {
    const { transactions } = get();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return get()
      .getTransactionsForPeriod(startOfMonth, endOfMonth)
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  },
  
  getMonthlyExpenses: () => {
    const { transactions } = get();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    return get()
      .getTransactionsForPeriod(startOfMonth, endOfMonth)
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  },
  
  getSavingsRate: () => {
    const monthlyIncome = get().getMonthlyIncome();
    const monthlyExpenses = get().getMonthlyExpenses();
    return monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  },
  
  getTopExpenseCategories: (limit = 5) => {
    const { transactions } = get();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const periodTransactions = get().getTransactionsForPeriod(startOfMonth, endOfMonth);
    const expenseCategories = periodTransactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(expenseCategories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  },
  
  getTopIncomeSources: (limit = 5) => {
    const { transactions } = get();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const periodTransactions = get().getTransactionsForPeriod(startOfMonth, endOfMonth);
    const incomeSources = periodTransactions
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(incomeSources)
      .map(([source, amount]) => ({ source, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  },
  
  // Lembretes
  getDueReminders: () => {
    const { bills, receivables } = get();
    const today = new Date();
    
    const dueBills = bills.filter((bill) => {
      const dueDate = new Date(bill.dueDate);
      return dueDate <= today && bill.status !== 'paid';
    });
    
    const dueReceivables = receivables.filter((receivable) => {
      const dueDate = new Date(receivable.dueDate);
      return dueDate <= today && receivable.status !== 'received';
    });
    
    return { bills: dueBills, receivables: dueReceivables };
  },
  
  getUpcomingReminders: (days) => {
    const { bills, receivables } = get();
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + days);
    
    const upcomingBills = bills.filter((bill) => {
      const dueDate = new Date(bill.dueDate);
      return dueDate > today && dueDate <= futureDate && bill.status !== 'paid';
    });
    
    const upcomingReceivables = receivables.filter((receivable) => {
      const dueDate = new Date(receivable.dueDate);
      return dueDate > today && dueDate <= futureDate && receivable.status !== 'received';
    });
    
    return { bills: upcomingBills, receivables: upcomingReceivables };
  },
  
  // Configurações
  setSelectedPeriod: (period) => {
    set({ selectedPeriod: period });
  },
  
  setSelectedDate: (date) => {
    set({ selectedDate: date });
  },
}));