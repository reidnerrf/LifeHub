import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useFinances } from '../store/finances';
import FinancialReports from '../components/FinancialReports';
import SavingsGoals from '../components/SavingsGoals';

const { width } = Dimensions.get('window');

export default function Finances() {
  const t = useTheme();
  const {
    transactions,
    bills,
    receivables,
    savingsGoals,
    budgets,
    getBalance,
    getMonthlyIncome,
    getMonthlyExpenses,
    getSavingsRate,
    getTopExpenseCategories,
    getTopIncomeSources,
    getOverdueBills,
    getUpcomingBills,
    getOverdueReceivables,
    getUpcomingReceivables,
    markBillAsPaid,
    markReceivableAsReceived,
    addTransaction,
    addBill,
    addReceivable,
    selectedPeriod,
    setSelectedPeriod
  } = useFinances();

  const [showReports, setShowReports] = useState(false);
  const [showSavingsGoals, setShowSavingsGoals] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  };

  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'received':
        return t.success;
      case 'pending':
        return t.warning;
      case 'overdue':
        return t.error;
      default:
        return t.textLight;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'received':
        return 'Recebido';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Atrasado';
      default:
        return 'Desconhecido';
    }
  };

  const handleAddTransaction = () => {
    Alert.prompt(
      'Nova Transação',
      'Digite o valor:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: (value) => {
            if (value) {
              const amount = parseFloat(value);
              if (!isNaN(amount)) {
                addTransaction({
                  title: 'Nova Transação',
                  amount: amount,
                  type: amount > 0 ? 'income' : 'expense',
                  category: 'Outros',
                  date: new Date(),
                  description: '',
                  tags: [],
                  isRecurring: false,
                });
              }
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleAddBill = () => {
    Alert.prompt(
      'Nova Conta',
      'Digite o valor:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: (value) => {
            if (value) {
              const amount = parseFloat(value);
              if (!isNaN(amount)) {
                addBill({
                  name: 'Nova Conta',
                  amount: amount,
                  dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                  status: 'pending',
                  category: 'Outros',
                  description: '',
                  isRecurring: false,
                  reminderDays: [3, 1],
                  priority: 'medium',
                });
              }
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleAddReceivable = () => {
    Alert.prompt(
      'Novo Recebível',
      'Digite o valor:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Adicionar',
          onPress: (value) => {
            if (value) {
              const amount = parseFloat(value);
              if (!isNaN(amount)) {
                addReceivable({
                  name: 'Novo Recebível',
                  amount: amount,
                  dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                  status: 'pending',
                  category: 'Outros',
                  description: '',
                  reminderDays: [3, 1],
                  priority: 'medium',
                });
              }
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const balance = getBalance();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const savingsRate = getSavingsRate();
  const topExpenseCategories = getTopExpenseCategories(3);
  const topIncomeSources = getTopIncomeSources(3);
  const overdueBills = getOverdueBills();
  const upcomingBills = getUpcomingBills(7);
  const overdueReceivables = getOverdueReceivables();
  const upcomingReceivables = getUpcomingReceivables(7);

  return (
    <View style={[styles.container, { backgroundColor: t.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.card }]}>
        <Text style={[styles.title, { color: t.text }]}>Finanças</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setShowSavingsGoals(true)}
            style={[styles.headerButton, { backgroundColor: t.background }]}
          >
            <Ionicons name="target" size={20} color={t.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowReports(true)}
            style={[styles.headerButton, { backgroundColor: t.background }]}
          >
            <Ionicons name="analytics" size={20} color={t.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seletor de Período */}
        <View style={[styles.periodSelector, { backgroundColor: t.card }]}>
          <View style={styles.periodButtons}>
            {(['week', 'month', 'year'] as const).map((period) => (
              <TouchableOpacity
                key={period}
                onPress={() => setSelectedPeriod(period)}
                style={[
                  styles.periodButton,
                  { backgroundColor: t.background },
                  selectedPeriod === period && { backgroundColor: t.primary + '20' }
                ]}
              >
                <Text style={[
                  styles.periodButtonText,
                  { color: t.text },
                  selectedPeriod === period && { color: t.primary, fontWeight: '600' }
                ]}>
                  {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Saldo Principal */}
        <View style={[styles.balanceCard, { backgroundColor: t.card }]}>
          <Text style={[styles.balanceLabel, { color: t.textLight }]}>Saldo Atual</Text>
          <Text style={[styles.balanceAmount, { color: t.text }]}>
            {formatCurrency(balance)}
          </Text>
          
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Ionicons name="trending-up" size={16} color={t.success} />
              <Text style={[styles.balanceItemText, { color: t.text }]}>
                {formatCurrency(monthlyIncome)}
              </Text>
              <Text style={[styles.balanceItemLabel, { color: t.textLight }]}>
                Entradas
              </Text>
            </View>
            
            <View style={styles.balanceItem}>
              <Ionicons name="trending-down" size={16} color={t.error} />
              <Text style={[styles.balanceItemText, { color: t.text }]}>
                {formatCurrency(monthlyExpenses)}
              </Text>
              <Text style={[styles.balanceItemLabel, { color: t.textLight }]}>
                Saídas
              </Text>
            </View>
            
            <View style={styles.balanceItem}>
              <Ionicons name="save" size={16} color={t.primary} />
              <Text style={[styles.balanceItemText, { color: t.text }]}>
                {formatPercentage(savingsRate)}
              </Text>
              <Text style={[styles.balanceItemLabel, { color: t.textLight }]}>
                Economia
              </Text>
            </View>
          </View>
        </View>

        {/* Metas de Economia */}
        {savingsGoals.length > 0 && (
          <View style={[styles.savingsCard, { backgroundColor: t.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: t.text }]}>Metas de Economia</Text>
              <TouchableOpacity onPress={() => setShowSavingsGoals(true)}>
                <Ionicons name="chevron-forward" size={20} color={t.textLight} />
              </TouchableOpacity>
            </View>
            
            {savingsGoals.slice(0, 2).map((goal) => {
              const percentage = (goal.currentAmount / goal.targetAmount) * 100;
              const progressColor = percentage >= 100 ? t.success : percentage >= 75 ? t.warning : t.primary;
              
              return (
                <View key={goal.id} style={styles.savingsGoal}>
                  <View style={styles.goalInfo}>
                    <Text style={[styles.goalName, { color: t.text }]}>
                      {goal.name}
                    </Text>
                    <Text style={[styles.goalProgress, { color: t.textLight }]}>
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </Text>
                  </View>
                  
                  <View style={styles.goalProgressBar}>
                    <View 
                      style={[
                        styles.goalProgressFill,
                        { 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: progressColor
                        }
                      ]} 
                    />
                  </View>
                  
                  <Text style={[styles.goalPercentage, { color: progressColor }]}>
                    {formatPercentage(percentage)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Contas a Pagar */}
        <View style={[styles.billsCard, { backgroundColor: t.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Contas a Pagar</Text>
            <TouchableOpacity onPress={handleAddBill}>
              <Ionicons name="add" size={20} color={t.primary} />
            </TouchableOpacity>
          </View>
          
          {overdueBills.length > 0 && (
            <View style={styles.overdueSection}>
              <Text style={[styles.overdueTitle, { color: t.error }]}>
                ⚠️ Atrasadas ({overdueBills.length})
              </Text>
              {overdueBills.slice(0, 2).map((bill) => (
                <View key={bill.id} style={styles.billItem}>
                  <View style={styles.billInfo}>
                    <Text style={[styles.billName, { color: t.text }]}>
                      {bill.name}
                    </Text>
                    <Text style={[styles.billDate, { color: t.error }]}>
                      Venceu há {Math.abs(getDaysUntilDue(new Date(bill.dueDate)))} dias
                    </Text>
                  </View>
                  
                  <View style={styles.billActions}>
                    <Text style={[styles.billAmount, { color: t.text }]}>
                      {formatCurrency(bill.amount)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => markBillAsPaid(bill.id)}
                      style={[styles.payButton, { backgroundColor: t.success }]}
                    >
                      <Text style={[styles.payButtonText, { color: '#fff' }]}>
                        Pagar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {upcomingBills.length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={[styles.upcomingTitle, { color: t.textLight }]}>
                📅 Próximas ({upcomingBills.length})
              </Text>
              {upcomingBills.slice(0, 3).map((bill) => (
                <View key={bill.id} style={styles.billItem}>
                  <View style={styles.billInfo}>
                    <Text style={[styles.billName, { color: t.text }]}>
                      {bill.name}
                    </Text>
                    <Text style={[styles.billDate, { color: t.textLight }]}>
                      Vence em {getDaysUntilDue(new Date(bill.dueDate))} dias
                    </Text>
                  </View>
                  
                  <View style={styles.billActions}>
                    <Text style={[styles.billAmount, { color: t.text }]}>
                      {formatCurrency(bill.amount)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => markBillAsPaid(bill.id)}
                      style={[styles.payButton, { backgroundColor: t.primary }]}
                    >
                      <Text style={[styles.payButtonText, { color: '#fff' }]}>
                        Pagar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {bills.length === 0 && (
            <Text style={[styles.emptyText, { color: t.textLight }]}>
              Nenhuma conta registrada
            </Text>
          )}
        </View>

        {/* Contas a Receber */}
        <View style={[styles.receivablesCard, { backgroundColor: t.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>A Receber</Text>
            <TouchableOpacity onPress={handleAddReceivable}>
              <Ionicons name="add" size={20} color={t.primary} />
            </TouchableOpacity>
          </View>
          
          {overdueReceivables.length > 0 && (
            <View style={styles.overdueSection}>
              <Text style={[styles.overdueTitle, { color: t.error }]}>
                ⚠️ Atrasados ({overdueReceivables.length})
              </Text>
              {overdueReceivables.slice(0, 2).map((receivable) => (
                <View key={receivable.id} style={styles.receivableItem}>
                  <View style={styles.receivableInfo}>
                    <Text style={[styles.receivableName, { color: t.text }]}>
                      {receivable.name}
                    </Text>
                    <Text style={[styles.receivableDate, { color: t.error }]}>
                      Venceu há {Math.abs(getDaysUntilDue(new Date(receivable.dueDate)))} dias
                    </Text>
                  </View>
                  
                  <View style={styles.receivableActions}>
                    <Text style={[styles.receivableAmount, { color: t.text }]}>
                      {formatCurrency(receivable.amount)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => markReceivableAsReceived(receivable.id)}
                      style={[styles.receiveButton, { backgroundColor: t.success }]}
                    >
                      <Text style={[styles.receiveButtonText, { color: '#fff' }]}>
                        Receber
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {upcomingReceivables.length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={[styles.upcomingTitle, { color: t.textLight }]}>
                📅 Próximos ({upcomingReceivables.length})
              </Text>
              {upcomingReceivables.slice(0, 3).map((receivable) => (
                <View key={receivable.id} style={styles.receivableItem}>
                  <View style={styles.receivableInfo}>
                    <Text style={[styles.receivableName, { color: t.text }]}>
                      {receivable.name}
                    </Text>
                    <Text style={[styles.receivableDate, { color: t.textLight }]}>
                      Vence em {getDaysUntilDue(new Date(receivable.dueDate))} dias
                    </Text>
                  </View>
                  
                  <View style={styles.receivableActions}>
                    <Text style={[styles.receivableAmount, { color: t.text }]}>
                      {formatCurrency(receivable.amount)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => markReceivableAsReceived(receivable.id)}
                      style={[styles.receiveButton, { backgroundColor: t.primary }]}
                    >
                      <Text style={[styles.receiveButtonText, { color: '#fff' }]}>
                        Receber
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {receivables.length === 0 && (
            <Text style={[styles.emptyText, { color: t.textLight }]}>
              Nenhum recebível registrado
            </Text>
          )}
        </View>

        {/* Top Categorias */}
        <View style={[styles.categoriesCard, { backgroundColor: t.card }]}>
          <Text style={[styles.sectionTitle, { color: t.text }]}>Top Categorias</Text>
          
          <View style={styles.categoriesGrid}>
            <View style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: t.error }]}>Maiores Gastos</Text>
              {topExpenseCategories.map((category, index) => (
                <View key={index} style={styles.categoryItem}>
                  <Text style={[styles.categoryName, { color: t.text }]}>
                    {category.category}
                  </Text>
                  <Text style={[styles.categoryAmount, { color: t.error }]}>
                    {formatCurrency(category.amount)}
                  </Text>
                </View>
              ))}
            </View>
            
            <View style={styles.categorySection}>
              <Text style={[styles.categoryTitle, { color: t.success }]}>Maiores Rendas</Text>
              {topIncomeSources.map((source, index) => (
                <View key={index} style={styles.categoryItem}>
                  <Text style={[styles.categoryName, { color: t.text }]}>
                    {source.source}
                  </Text>
                  <Text style={[styles.categoryAmount, { color: t.success }]}>
                    {formatCurrency(source.amount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Transações Recentes */}
        <View style={[styles.transactionsCard, { backgroundColor: t.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: t.text }]}>Transações Recentes</Text>
            <TouchableOpacity onPress={handleAddTransaction}>
              <Ionicons name="add" size={20} color={t.primary} />
            </TouchableOpacity>
          </View>
          
          {transactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 5).map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={[styles.transactionTitle, { color: t.text }]}>
                      {transaction.title}
                    </Text>
                    <Text style={[styles.transactionCategory, { color: t.textLight }]}>
                      {transaction.category} • {formatDate(new Date(transaction.date))}
                    </Text>
                  </View>
                  
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? t.success : t.error }
                  ]}>
                    {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: t.textLight }]}>
              Nenhuma transação registrada
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Modais */}
      <FinancialReports
        visible={showReports}
        onClose={() => setShowReports(false)}
      />

      <SavingsGoals
        visible={showSavingsGoals}
        onClose={() => setShowSavingsGoals(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  balanceItemText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
  },
  balanceItemLabel: {
    fontSize: 12,
  },
  savingsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  savingsGoal: {
    marginBottom: 12,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalProgress: {
    fontSize: 12,
  },
  goalProgressBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 3,
    marginBottom: 4,
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  goalPercentage: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  billsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  overdueSection: {
    marginBottom: 16,
  },
  overdueTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  upcomingSection: {
    marginBottom: 16,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  billDate: {
    fontSize: 12,
  },
  billActions: {
    alignItems: 'flex-end',
  },
  billAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  payButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  payButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  receivablesCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  receivableItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  receivableInfo: {
    flex: 1,
  },
  receivableName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  receivableDate: {
    fontSize: 12,
  },
  receivableActions: {
    alignItems: 'flex-end',
  },
  receivableAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  receiveButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  receiveButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoriesCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  categorySection: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  categoryName: {
    fontSize: 12,
  },
  categoryAmount: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  transactionsList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});