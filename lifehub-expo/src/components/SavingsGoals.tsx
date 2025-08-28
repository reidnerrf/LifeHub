import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useFinances, SavingsGoal } from '../store/finances';

interface SavingsGoalsProps {
  visible: boolean;
  onClose: () => void;
}

export default function SavingsGoals({ visible, onClose }: SavingsGoalsProps) {
  const t = useTheme();
  const { 
    savingsGoals, 
    addSavingsGoal, 
    updateSavingsGoal, 
    deleteSavingsGoal,
    addToSavingsGoal 
  } = useFinances();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [showAddAmountModal, setShowAddAmountModal] = useState<SavingsGoal | null>(null);

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
      year: 'numeric',
    }).format(date);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return t.success;
    if (percentage >= 75) return t.warning;
    if (percentage >= 50) return t.primary;
    return t.error;
  };

  const getDaysRemaining = (deadline?: Date) => {
    if (!deadline) return null;
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getGoalStatus = (goal: SavingsGoal) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    const daysRemaining = getDaysRemaining(goal.deadline);
    
    if (percentage >= 100) return { status: 'completed', label: 'Concluída', color: t.success };
    if (daysRemaining !== null && daysRemaining < 0) return { status: 'overdue', label: 'Atrasada', color: t.error };
    if (percentage >= 75) return { status: 'on-track', label: 'No Prazo', color: t.warning };
    if (percentage >= 50) return { status: 'progress', label: 'Em Andamento', color: t.primary };
    return { status: 'started', label: 'Iniciada', color: t.textLight };
  };

  const handleAddGoal = () => {
    setShowAddModal(true);
    setEditingGoal(null);
  };

  const handleEditGoal = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setShowAddModal(true);
  };

  const handleDeleteGoal = (goal: SavingsGoal) => {
    Alert.alert(
      'Excluir Meta',
      `Tem certeza que deseja excluir a meta "${goal.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            deleteSavingsGoal(goal.id);
          }
        }
      ]
    );
  };

  const handleAddAmount = (goal: SavingsGoal) => {
    setShowAddAmountModal(goal);
  };

  const renderAddEditModal = () => {
    const [name, setName] = useState(editingGoal?.name || '');
    const [targetAmount, setTargetAmount] = useState(editingGoal?.targetAmount?.toString() || '');
    const [category, setCategory] = useState(editingGoal?.category || '');
    const [description, setDescription] = useState(editingGoal?.description || '');
    const [deadline, setDeadline] = useState(editingGoal?.deadline?.toISOString().slice(0, 10) || '');

    const handleSave = () => {
      if (!name || !targetAmount || !category) {
        Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
        return;
      }

      const amount = parseFloat(targetAmount);
      if (isNaN(amount) || amount <= 0) {
        Alert.alert('Erro', 'Valor deve ser um número positivo');
        return;
      }

      const goalData = {
        name,
        targetAmount: amount,
        currentAmount: editingGoal?.currentAmount || 0,
        category,
        description,
        deadline: deadline ? new Date(deadline) : undefined,
        isActive: true,
      };

      if (editingGoal) {
        updateSavingsGoal(editingGoal.id, goalData);
      } else {
        addSavingsGoal(goalData);
      }

      setShowAddModal(false);
      setEditingGoal(null);
    };

    return (
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: t.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: t.card }]}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color={t.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: t.text }]}>
              {editingGoal ? 'Editar Meta' : 'Nova Meta de Economia'}
            </Text>
            <TouchableOpacity onPress={handleSave}>
              <Ionicons name="checkmark" size={24} color={t.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.inputGroup, { backgroundColor: t.card }]}>
              <Text style={[styles.inputLabel, { color: t.text }]}>Nome da Meta *</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: t.background, 
                  color: t.text,
                  borderColor: t.border 
                }]}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Viagem para Europa"
                placeholderTextColor={t.textLight}
              />
            </View>

            <View style={[styles.inputGroup, { backgroundColor: t.card }]}>
              <Text style={[styles.inputLabel, { color: t.text }]}>Valor Alvo (R$) *</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: t.background, 
                  color: t.text,
                  borderColor: t.border 
                }]}
                value={targetAmount}
                onChangeText={setTargetAmount}
                placeholder="0,00"
                placeholderTextColor={t.textLight}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, { backgroundColor: t.card }]}>
              <Text style={[styles.inputLabel, { color: t.text }]}>Categoria *</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: t.background, 
                  color: t.text,
                  borderColor: t.border 
                }]}
                value={category}
                onChangeText={setCategory}
                placeholder="Ex: Viagem, Emergência, Investimento"
                placeholderTextColor={t.textLight}
              />
            </View>

            <View style={[styles.inputGroup, { backgroundColor: t.card }]}>
              <Text style={[styles.inputLabel, { color: t.text }]}>Descrição</Text>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: t.background, 
                  color: t.text,
                  borderColor: t.border 
                }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Descreva sua meta..."
                placeholderTextColor={t.textLight}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={[styles.inputGroup, { backgroundColor: t.card }]}>
              <Text style={[styles.inputLabel, { color: t.text }]}>Data Limite (opcional)</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: t.background, 
                  color: t.text,
                  borderColor: t.border 
                }]}
                value={deadline}
                onChangeText={setDeadline}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={t.textLight}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  const renderAddAmountModal = () => {
    if (!showAddAmountModal) return null;

    const [amount, setAmount] = useState('');

    const handleSaveAmount = () => {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        Alert.alert('Erro', 'Digite um valor válido');
        return;
      }

      addToSavingsGoal(showAddAmountModal.id, numAmount);
      setShowAddAmountModal(null);
      setAmount('');
    };

    return (
      <Modal
        visible={!!showAddAmountModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddAmountModal(null)}
      >
        <View style={[styles.modalContainer, { backgroundColor: t.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: t.card }]}>
            <TouchableOpacity onPress={() => setShowAddAmountModal(null)}>
              <Ionicons name="close" size={24} color={t.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: t.text }]}>
              Adicionar Valor
            </Text>
            <TouchableOpacity onPress={handleSaveAmount}>
              <Ionicons name="checkmark" size={24} color={t.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={[styles.goalInfo, { backgroundColor: t.card }]}>
              <Text style={[styles.goalName, { color: t.text }]}>
                {showAddAmountModal.name}
              </Text>
              <Text style={[styles.goalProgress, { color: t.textLight }]}>
                {formatCurrency(showAddAmountModal.currentAmount)} / {formatCurrency(showAddAmountModal.targetAmount)}
              </Text>
            </View>

            <View style={[styles.inputGroup, { backgroundColor: t.card }]}>
              <Text style={[styles.inputLabel, { color: t.text }]}>Valor a Adicionar (R$)</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: t.background, 
                  color: t.text,
                  borderColor: t.border 
                }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0,00"
                placeholderTextColor={t.textLight}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: t.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: t.text }]}>
            Metas de Economia
          </Text>
          <TouchableOpacity onPress={handleAddGoal} style={styles.addButton}>
            <Ionicons name="add" size={24} color={t.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {savingsGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="target" size={64} color={t.textLight} />
              <Text style={[styles.emptyTitle, { color: t.text }]}>
                Nenhuma Meta Definida
              </Text>
              <Text style={[styles.emptyDescription, { color: t.textLight }]}>
                Crie sua primeira meta de economia para começar a poupar com propósito
              </Text>
              <TouchableOpacity
                onPress={handleAddGoal}
                style={[styles.createButton, { backgroundColor: t.primary }]}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={[styles.createButtonText, { color: '#fff' }]}>
                  Criar Primeira Meta
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.goalsList}>
              {savingsGoals.map((goal) => {
                const percentage = (goal.currentAmount / goal.targetAmount) * 100;
                const progressColor = getProgressColor(percentage);
                const status = getGoalStatus(goal);
                const daysRemaining = getDaysRemaining(goal.deadline);

                return (
                  <View key={goal.id} style={[styles.goalCard, { backgroundColor: t.card }]}>
                    <View style={styles.goalHeader}>
                      <View style={styles.goalInfo}>
                        <Text style={[styles.goalName, { color: t.text }]}>
                          {goal.name}
                        </Text>
                        <Text style={[styles.goalCategory, { color: t.textLight }]}>
                          {goal.category}
                        </Text>
                      </View>
                      
                      <View style={styles.goalActions}>
                        <TouchableOpacity
                          onPress={() => handleAddAmount(goal)}
                          style={[styles.actionButton, { backgroundColor: t.success + '20' }]}
                        >
                          <Ionicons name="add" size={16} color={t.success} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => handleEditGoal(goal)}
                          style={[styles.actionButton, { backgroundColor: t.primary + '20' }]}
                        >
                          <Ionicons name="create" size={16} color={t.primary} />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          onPress={() => handleDeleteGoal(goal)}
                          style={[styles.actionButton, { backgroundColor: t.error + '20' }]}
                        >
                          <Ionicons name="trash" size={16} color={t.error} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {goal.description && (
                      <Text style={[styles.goalDescription, { color: t.textLight }]}>
                        {goal.description}
                      </Text>
                    )}

                    <View style={styles.goalProgress}>
                      <View style={styles.progressHeader}>
                        <Text style={[styles.progressText, { color: t.text }]}>
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </Text>
                        <Text style={[styles.progressPercentage, { color: progressColor }]}>
                          {formatPercentage(percentage)}
                        </Text>
                      </View>
                      
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill,
                            { 
                              width: `${Math.min(percentage, 100)}%`,
                              backgroundColor: progressColor
                            }
                          ]} 
                        />
                      </View>
                    </View>

                    <View style={styles.goalFooter}>
                      <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>
                          {status.label}
                        </Text>
                      </View>
                      
                      {daysRemaining !== null && (
                        <Text style={[styles.deadlineText, { color: t.textLight }]}>
                          {daysRemaining > 0 
                            ? `${daysRemaining} dias restantes`
                            : daysRemaining < 0 
                            ? `${Math.abs(daysRemaining)} dias atrasado`
                            : 'Vence hoje'
                          }
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* Dicas */}
          <View style={[styles.tipsCard, { backgroundColor: t.card }]}>
            <Text style={[styles.tipsTitle, { color: t.text }]}>
              💡 Dicas para Economizar
            </Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={t.success} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Defina metas realistas e específicas
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={t.success} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Automatize suas economias mensais
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={t.success} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Acompanhe seu progresso regularmente
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={t.success} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Celebre pequenas conquistas no caminho
              </Text>
            </View>
          </View>
        </ScrollView>

        {renderAddEditModal()}
        {renderAddAmountModal()}
      </View>
    </Modal>
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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  goalsList: {
    gap: 16,
  },
  goalCard: {
    borderRadius: 12,
    padding: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 14,
  },
  goalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  goalProgress: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  deadlineText: {
    fontSize: 12,
  },
  tipsCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  goalInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});