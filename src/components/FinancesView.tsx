import React, { useEffect, useMemo, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Plus, CreditCard, Receipt, Target, AlertCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { storage, KEYS } from '../services/storage';

const FinancesView: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const financialData = {
    balance: 3250.50,
    monthlyIncome: 5000.00,
    monthlyExpenses: 3180.25,
    savings: 1819.75,
    savingsGoal: 2000.00,
  };

  const [transactions, setTransactions] = useState(() => storage.get<any[]>(KEYS.transactions) || [
    {
      id: 1,
      title: 'Salário',
      amount: 5000.00,
      type: 'income',
      category: 'Trabalho',
      date: '2025-08-25',
      icon: '💰',
      color: 'var(--app-green)',
    },
    {
      id: 2,
      title: 'Supermercado',
      amount: -180.50,
      type: 'expense',
      category: 'Alimentação',
      date: '2025-08-26',
      icon: '🛒',
      color: 'var(--app-red)',
    },
    {
      id: 3,
      title: 'Combustível',
      amount: -120.00,
      type: 'expense',
      category: 'Transporte',
      date: '2025-08-26',
      icon: '⛽',
      color: 'var(--app-red)',
    },
    {
      id: 4,
      title: 'Freelance',
      amount: 800.00,
      type: 'income',
      category: 'Trabalho',
      date: '2025-08-24',
      icon: '💻',
      color: 'var(--app-green)',
    },
    {
      id: 5,
      title: 'Netflix',
      amount: -29.90,
      type: 'expense',
      category: 'Entretenimento',
      date: '2025-08-23',
      icon: '📺',
      color: 'var(--app-red)',
    },
  ]);

  const [bills, setBills] = useState(() => storage.get<any[]>(KEYS.bills) || [
    {
      id: 1,
      name: 'Aluguel',
      amount: 1200.00,
      dueDate: '2025-08-30',
      status: 'pending',
      icon: '🏠',
      category: 'Moradia',
    },
    {
      id: 2,
      name: 'Energia Elétrica',
      amount: 180.50,
      dueDate: '2025-08-28',
      status: 'paid',
      icon: '⚡',
      category: 'Utilidades',
    },
    {
      id: 3,
      name: 'Internet',
      amount: 79.90,
      dueDate: '2025-08-29',
      status: 'overdue',
      icon: '🌐',
      category: 'Utilidades',
    },
    {
      id: 4,
      name: 'Cartão de Crédito',
      amount: 450.30,
      dueDate: '2025-09-05',
      status: 'pending',
      icon: '💳',
      category: 'Cartão',
    },
  ]);

  const [receivables, setReceivables] = useState(() => storage.get<any[]>(KEYS.receivables) || [
    { id: 1, name: 'Cliente ACME', amount: 1200.00, dueDate: '2025-09-02', status: 'pending', icon: '💼', category: 'Serviços' },
  ]);

  useEffect(() => { storage.set(KEYS.transactions, transactions); }, [transactions]);
  useEffect(() => { storage.set(KEYS.bills, bills); }, [bills]);
  useEffect(() => { storage.set(KEYS.receivables, receivables); }, [receivables]);

  const addBill = () => {
    const name = prompt('Descrição da conta');
    const amount = parseFloat(prompt('Valor') || '0');
    const dueDate = prompt('Vencimento (YYYY-MM-DD)') || new Date().toISOString().slice(0,10);
    if (!name || isNaN(amount)) return;
    setBills(prev => [{ id: Date.now(), name, amount, dueDate, status: 'pending', icon: '🧾', category: 'Outros' }, ...prev]);
  };

  const addReceivable = () => {
    const name = prompt('Descrição do recebível');
    const amount = parseFloat(prompt('Valor') || '0');
    const dueDate = prompt('Vencimento (YYYY-MM-DD)') || new Date().toISOString().slice(0,10);
    if (!name || isNaN(amount)) return;
    setReceivables(prev => [{ id: Date.now(), name, amount, dueDate, status: 'pending', icon: '💼', category: 'Outros' }, ...prev]);
  };

  const markBill = (id: number, status: string) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  };

  const monthlySummary = useMemo(() => {
    const incomes = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
    const payables = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
    const receivs = receivables.filter(r => r.status !== 'received').reduce((s, r) => s + r.amount, 0);
    return { incomes, expenses, payables, receivs, balance: incomes - expenses };
  }, [transactions, bills, receivables]);

  const categories = [
    { name: 'Alimentação', spent: 420.50, budget: 600, color: 'var(--app-red)', icon: '🍽️' },
    { name: 'Transporte', spent: 280.00, budget: 400, color: 'var(--app-blue)', icon: '🚗' },
    { name: 'Entretenimento', spent: 150.90, budget: 300, color: 'var(--app-purple)', icon: '🎬' },
    { name: 'Saúde', spent: 120.00, budget: 200, color: 'var(--app-green)', icon: '🏥' },
  ];

  const getBillStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'var(--app-green)';
      case 'pending': return 'var(--app-yellow)';
      case 'overdue': return 'var(--app-red)';
      default: return 'var(--app-gray)';
    }
  };

  const getBillStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'overdue': return 'Atrasado';
      default: return 'Desconhecido';
    }
  };

  const savingsProgress = (financialData.savings / financialData.savingsGoal) * 100;

  return (
    <div className="flex flex-col space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--app-text)]">Finanças</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              selectedPeriod === 'week' 
                ? 'bg-[var(--app-blue)] text-white' 
                : 'bg-[var(--app-light-gray)] text-[var(--app-gray)]'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              selectedPeriod === 'month' 
                ? 'bg-[var(--app-blue)] text-white' 
                : 'bg-[var(--app-light-gray)] text-[var(--app-gray)]'
            }`}
          >
            Mês
          </button>
        </div>
      </div>

      {/* Balance Overview */}
      <Card className="p-6 bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-purple)] rounded-2xl border-0 shadow-lg text-white">
        <div className="text-center mb-4">
          <p className="text-white/80 mb-1">Saldo Atual</p>
          <h2 className="text-3xl font-bold">
            R$ {financialData.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp size={16} className="mr-1" />
              <span className="text-sm text-white/80">Entradas</span>
            </div>
            <p className="font-semibold">
              R$ {financialData.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingDown size={16} className="mr-1" />
              <span className="text-sm text-white/80">Saídas</span>
            </div>
            <p className="font-semibold">
              R$ {financialData.monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>

      {/* Savings Goal */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target size={20} className="text-[var(--app-green)]" />
            <h3 className="font-medium text-[var(--app-text)]">Meta de Economia</h3>
          </div>
          <span className="text-sm text-[var(--app-text-light)]">
            {Math.round(savingsProgress)}%
          </span>
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-[var(--app-text-light)]">
              R$ {financialData.savings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-sm text-[var(--app-text-light)]">
              R$ {financialData.savingsGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <Progress value={savingsProgress} className="h-3" />
        </div>
        
        <p className="text-xs text-[var(--app-text-light)]">
          Faltam R$ {(financialData.savingsGoal - financialData.savings).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para sua meta
        </p>
      </Card>

      {/* Bills to Pay */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[var(--app-text)]">Contas a Pagar</h3>
          <Badge variant="secondary" className="bg-[var(--app-red)]15 text-[var(--app-red)]">
            {bills.filter(b => b.status !== 'paid').length} pendentes
          </Badge>
        </div>
        
        <div className="space-y-3">
          <button onClick={addBill} className="px-3 py-1 rounded-lg bg-[var(--app-blue)] text-white text-sm">Adicionar conta</button>
          {bills.map((bill) => (
            <div key={bill.id} className="flex items-center space-x-4 p-3 rounded-xl bg-[var(--app-light-gray)]">
              <div className="text-2xl">{bill.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-[var(--app-text)]">{bill.name}</h4>
                <p className="text-sm text-[var(--app-text-light)]">
                  Vence em {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--app-text)]">
                  R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <div className="flex items-center space-x-2 justify-end mt-1">
                  <Badge 
                    className="text-xs"
                    style={{ backgroundColor: `${getBillStatusColor(bill.status)}15`, color: getBillStatusColor(bill.status) }}
                  >
                    {getBillStatusText(bill.status)}
                  </Badge>
                  <button onClick={() => markBill(bill.id, 'paid')} className="px-2 py-1 text-xs rounded bg-[var(--app-green)] text-white">Marcar pago</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recebimentos */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-[var(--app-text)]">A Receber</h3>
          <Badge variant="secondary" className="bg-[var(--app-blue)]15 text-[var(--app-blue)]">
            {receivables.filter(r => r.status !== 'received').length} pendentes
          </Badge>
        </div>
        <div className="space-y-3">
          <button onClick={addReceivable} className="px-3 py-1 rounded-lg bg-[var(--app-blue)] text-white text-sm">Adicionar recebível</button>
          {receivables.map((r) => (
            <div key={r.id} className="flex items-center space-x-4 p-3 rounded-xl bg-[var(--app-light-gray)]">
              <div className="text-2xl">{r.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-[var(--app-text)]">{r.name}</h4>
                <p className="text-sm text-[var(--app-text-light)]">Vence em {new Date(r.dueDate).toLocaleDateString('pt-BR')}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[var(--app-text)]">R$ {r.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <div className="flex items-center space-x-2 justify-end mt-1">
                  <Badge className="text-xs" style={{ backgroundColor: 'var(--app-blue)15', color: 'var(--app-blue)' }}>Pendente</Badge>
                  <button onClick={() => setReceivables(prev => prev.map(x => x.id === r.id ? { ...x, status: 'received' } : x))} className="px-2 py-1 text-xs rounded bg-[var(--app-green)] text-white">Marcar recebido</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Resumo mensal */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-2">Resumo do Mês</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded bg-[var(--app-green)]15 text-[var(--app-green)]">Entradas: R$ {monthlySummary.incomes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="p-3 rounded bg-[var(--app-red)]15 text-[var(--app-red)]">Saídas: R$ {monthlySummary.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="p-3 rounded bg-[var(--app-yellow)]15 text-[var(--app-yellow)]">A pagar: R$ {monthlySummary.payables.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="p-3 rounded bg-[var(--app-blue)]15 text-[var(--app-blue)]">A receber: R$ {monthlySummary.receivs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="mt-3 text-sm text-[var(--app-text)]">Saldo: R$ {monthlySummary.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
      </Card>

      {/* Categories Budget */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-4">Orçamento por Categoria</h3>
        <div className="space-y-4">
          {categories.map((category, index) => {
            const progress = (category.spent / category.budget) * 100;
            const isOverBudget = progress > 100;
            
            return (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="text-sm font-medium text-[var(--app-text)]">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${isOverBudget ? 'text-[var(--app-red)]' : 'text-[var(--app-text)]'}`}>
                      R$ {category.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-[var(--app-text-light)]">
                      / R$ {category.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <Progress 
                  value={Math.min(progress, 100)}
                  className="h-2"
                  style={{ 
                    '--progress-foreground': isOverBudget ? 'var(--app-red)' : category.color
                  } as React.CSSProperties}
                />
                {isOverBudget && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertCircle size={12} className="text-[var(--app-red)]" />
                    <span className="text-xs text-[var(--app-red)]">
                      {Math.round(progress - 100)}% acima do orçamento
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-4">Transações Recentes</h3>
        <div className="space-y-3">
          {transactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center space-x-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${transaction.color}15` }}
              >
                <span className="text-lg">{transaction.icon}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-[var(--app-text)]">{transaction.title}</h4>
                <p className="text-sm text-[var(--app-text-light)]">
                  {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-[var(--app-green)]' : 'text-[var(--app-red)]'
                }`}>
                  {transaction.type === 'income' ? '+' : ''}R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FinancesView;