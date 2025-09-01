import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useHabits } from '../store/habits';

interface WellnessCheckinProps {
  visible: boolean;
  onClose: () => void;
}

export default function WellnessCheckin({ visible, onClose }: WellnessCheckinProps) {
  const t = useTheme();
  const { addCheckin, getCheckinForDate } = useHabits();
  
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [sleepHours, setSleepHours] = useState(7);

  const moodEmojis = ['😞', '😕', '😐', '🙂', '😊'];
  const energyEmojis = ['😴', '😪', '😐', '😊', '⚡'];
  const sleepEmojis = ['😴', '😪', '😐', '😊', '😎'];

  const getMoodLabel = (value: number) => {
    switch (value) {
      case 1: return 'Muito Ruim';
      case 2: return 'Ruim';
      case 3: return 'Neutro';
      case 4: return 'Bom';
      case 5: return 'Excelente';
      default: return 'Neutro';
    }
  };

  const getEnergyLabel = (value: number) => {
    switch (value) {
      case 1: return 'Muito Baixa';
      case 2: return 'Baixa';
      case 3: return 'Normal';
      case 4: return 'Alta';
      case 5: return 'Muito Alta';
      default: return 'Normal';
    }
  };

  const getSleepLabel = (hours: number) => {
    if (hours < 6) return 'Pouco Sono';
    if (hours < 7) return 'Sono Regular';
    if (hours < 8) return 'Bom Sono';
    if (hours < 9) return 'Muito Bom';
    return 'Excelente';
  };

  const handleSubmit = () => {
    const today = new Date().toISOString().split('T')[0];
    const existingCheckin = getCheckinForDate(new Date());
    
    if (existingCheckin) {
      Alert.alert(
        'Check-in Já Realizado',
        'Você já fez o check-in de hoje. Deseja atualizar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Atualizar',
            onPress: () => {
              addCheckin({
                date: today,
                mood,
                energy,
                sleepHours,
              });
              onClose();
              resetForm();
            }
          }
        ]
      );
    } else {
      addCheckin({
        date: today,
        mood,
        energy,
        sleepHours,
      });
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setMood(3);
    setEnergy(3);
    setSleepHours(7);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { backgroundColor: t.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: t.card }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={t.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: t.text }]}>
            Check-in de Bem-estar
          </Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Ionicons name="checkmark" size={24} color={t.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Mood Section */}
          <View style={[styles.section, { backgroundColor: t.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={24} color="#FF6B6B" />
              <Text style={[styles.sectionTitle, { color: t.text }]}>
                Como você está se sentindo?
              </Text>
            </View>
            
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setMood(value)}
                  style={[
                    styles.ratingButton,
                    { backgroundColor: t.background },
                    mood === value && { backgroundColor: t.primary + '20' }
                  ]}
                >
                  <Text style={styles.emojiText}>{moodEmojis[value - 1]}</Text>
                  <Text style={[
                    styles.ratingLabel,
                    { color: t.text },
                    mood === value && { color: t.primary, fontWeight: '600' }
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.ratingDescription, { color: t.textLight }]}>
              {getMoodLabel(mood)}
            </Text>
          </View>

          {/* Energy Section */}
          <View style={[styles.section, { backgroundColor: t.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash" size={24} color="#FFD93D" />
              <Text style={[styles.sectionTitle, { color: t.text }]}>
                Qual seu nível de energia?
              </Text>
            </View>
            
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setEnergy(value)}
                  style={[
                    styles.ratingButton,
                    { backgroundColor: t.background },
                    energy === value && { backgroundColor: t.primary + '20' }
                  ]}
                >
                  <Text style={styles.emojiText}>{energyEmojis[value - 1]}</Text>
                  <Text style={[
                    styles.ratingLabel,
                    { color: t.text },
                    energy === value && { color: t.primary, fontWeight: '600' }
                  ]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={[styles.ratingDescription, { color: t.textLight }]}>
              {getEnergyLabel(energy)}
            </Text>
          </View>

          {/* Sleep Section */}
          <View style={[styles.section, { backgroundColor: t.card }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="moon" size={24} color="#6C5CE7" />
              <Text style={[styles.sectionTitle, { color: t.text }]}>
                Quantas horas você dormiu?
              </Text>
            </View>
            
            <View style={styles.sleepContainer}>
              <View style={styles.sleepButtons}>
                {[6, 7, 8, 9, 10].map((hours) => (
                  <TouchableOpacity
                    key={hours}
                    onPress={() => setSleepHours(hours)}
                    style={[
                      styles.sleepButton,
                      { backgroundColor: t.background },
                      sleepHours === hours && { backgroundColor: t.primary + '20' }
                    ]}
                  >
                    <Text style={[
                      styles.sleepText,
                      { color: t.text },
                      sleepHours === hours && { color: t.primary, fontWeight: '600' }
                    ]}>
                      {hours}h
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.sleepSlider}>
                <TouchableOpacity
                  onPress={() => setSleepHours(Math.max(0, sleepHours - 1))}
                  style={[styles.sliderButton, { backgroundColor: t.background }]}
                >
                  <Ionicons name="remove" size={20} color={t.text} />
                </TouchableOpacity>
                
                <View style={[styles.sliderValue, { backgroundColor: t.background }]}>
                  <Text style={[styles.sliderText, { color: t.text }]}>
                    {sleepHours}h
                  </Text>
                </View>
                
                <TouchableOpacity
                  onPress={() => setSleepHours(Math.min(12, sleepHours + 1))}
                  style={[styles.sliderButton, { backgroundColor: t.background }]}
                >
                  <Ionicons name="add" size={20} color={t.text} />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={[styles.ratingDescription, { color: t.textLight }]}>
              {getSleepLabel(sleepHours)}
            </Text>
          </View>

          {/* Tips Section */}
          <View style={[styles.tipsSection, { backgroundColor: t.card }]}>
            <Text style={[styles.tipsTitle, { color: t.text }]}>
              💡 Dicas para Melhorar o Bem-estar
            </Text>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={t.success} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Faça o check-in diariamente para acompanhar suas tendências
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={t.success} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Mantenha uma rotina de sono consistente
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={t.success} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Pratique exercícios regularmente para aumentar a energia
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={t.success} />
              <Text style={[styles.tipText, { color: t.textLight }]}>
                Observe como seus hábitos afetam seu bem-estar
              </Text>
            </View>
          </View>
        </ScrollView>
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
  submitButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  emojiText: {
    fontSize: 24,
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingDescription: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  sleepContainer: {
    marginBottom: 12,
  },
  sleepButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sleepButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 50,
  },
  sleepText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sleepSlider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderValue: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  sliderText: {
    fontSize: 18,
    fontWeight: '600',
  },
  tipsSection: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
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
});