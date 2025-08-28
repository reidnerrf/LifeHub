# Hábitos & Bem-estar - LifeHub

## 🎯 Funcionalidades Implementadas

### 🔄 Frequências Flexíveis
- **Frequências padrão**: Diária, semanal, mensal
- **Frequências customizadas**: Dias específicos, vezes por semana/mês
- **Configuração flexível** de metas e objetivos
- **Adaptação automática** baseada no tipo de hábito

### 🔥 Sistema de Streaks
- **Contagem automática** de sequências consecutivas
- **Maior streak** histórico por hábito
- **Streak atual** em tempo real
- **Média de streaks** para análise de consistência
- **Reset automático** quando hábito é quebrado

### 💚 Check-in de Bem-estar (3 Taps)
- **Humor (1-5)**: Avaliação rápida do estado emocional
- **Energia (1-5)**: Nível de disposição e vitalidade
- **Sono (0-12h)**: Horas de descanso na noite anterior
- **Interface intuitiva** com emojis e sliders
- **Histórico completo** de check-ins
- **Tendências** de bem-estar ao longo do tempo

### 📊 Correlações com Produtividade
- **Análise estatística** da relação entre hábitos e produtividade
- **Correlação de Pearson** calculada automaticamente
- **Gráficos visuais** de tendências semanais
- **Insights personalizados** baseados nos dados
- **Métricas de performance** dos hábitos

## 🏗️ Arquitetura Técnica

### Zustand Store (`src/store/habits.ts`)
```typescript
interface HabitsStore {
  // Dados
  habits: Habit[];
  checkins: WellnessCheckin[];
  correlations: ProductivityCorrelation[];

  // Estado atual
  selectedPeriod: 'week' | 'month' | 'year';
  selectedDate: Date;

  // Ações para Hábitos
  addHabit, updateHabit, deleteHabit;
  toggleHabit, incrementHabit, decrementHabit, resetHabit;

  // Ações para Check-ins
  addCheckin, updateCheckin, deleteCheckin;
  getCheckinForDate;

  // Ações para Correlações
  addCorrelation, updateCorrelation;

  // Análises e Relatórios
  getHabitsForDate, getHabitsForPeriod;
  getCompletionRate, getStreakStats;
  getWellnessTrends, getProductivityCorrelation;

  // Configurações
  setSelectedPeriod, setSelectedDate;
}
```

### Componentes Principais

#### 1. **Habits.tsx** - Tela Principal
- **Visão geral** do progresso diário
- **Seletor de período** (semana/mês/ano)
- **Status de check-in** de bem-estar
- **Estatísticas de streaks** (atual, maior, média)
- **Lista de hábitos** com ações rápidas
- **Visão semanal** com progresso visual

#### 2. **WellnessCheckin.tsx** - Modal de Check-in
- **Avaliação de humor** com emojis (1-5)
- **Nível de energia** com indicadores visuais (1-5)
- **Horas de sono** com slider e botões rápidos
- **Interface de 3 taps** para avaliação rápida
- **Dicas de bem-estar** integradas

#### 3. **ProductivityCorrelations.tsx** - Modal de Correlações
- **Correlação principal** entre hábitos e produtividade
- **Métricas de bem-estar** (humor, energia, sono)
- **Performance dos hábitos** (taxa de conclusão, streaks)
- **Gráfico de tendências** semanais
- **Insights personalizados** baseados nos dados

### Modelos de Dados

#### Habit
```typescript
interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  category: string;
  color: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  customFrequency?: {
    type: 'days' | 'times_per_week' | 'times_per_month';
    value: number;
  };
  target: number;
  current: number;
  streak: number;
  longestStreak: number;
  completedToday: boolean;
  completedDates: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### WellnessCheckin
```typescript
interface WellnessCheckin {
  id: string;
  date: string; // ISO date string
  mood: number; // 1-5 scale
  energy: number; // 1-5 scale
  sleepHours: number; // 0-12 hours
  notes?: string;
  createdAt: Date;
}
```

#### ProductivityCorrelation
```typescript
interface ProductivityCorrelation {
  date: string;
  habitsScore: number; // 0-100
  productivity: number; // 0-100
  mood: number;
  energy: number;
  sleepHours: number;
}
```

## 📱 Como Usar

### 1. **Gestão de Hábitos**
- Acesse a tela "Hábitos & Bem-estar" no menu principal
- Visualize o progresso diário e estatísticas de streaks
- Toque no ícone "+" para criar novos hábitos
- Use o toggle para marcar hábitos como concluídos
- Para hábitos com metas múltiplas, use os botões +/- para ajustar

### 2. **Check-in de Bem-estar**
- Toque no ícone de coração no cabeçalho
- Avalie seu humor selecionando um emoji (1-5)
- Defina seu nível de energia (1-5)
- Configure as horas de sono (0-12h)
- Toque em "✓" para salvar o check-in

### 3. **Análise de Correlações**
- Toque no ícone de gráficos no cabeçalho
- Visualize a correlação entre hábitos e produtividade
- Analise as métricas de bem-estar
- Acompanhe as tendências semanais
- Leia os insights personalizados

### 4. **Acompanhamento de Streaks**
- Visualize a sequência atual de cada hábito
- Acompanhe a maior sequência histórica
- Veja a média de sequências para análise
- Use o seletor de período para diferentes análises

## 🧮 Algoritmos Implementados

### 1. **Cálculo de Streaks**
```typescript
const calculateStreak = (completedDates: string[]) => {
  const today = new Date().toISOString().split('T')[0];
  const sortedDates = completedDates.sort().reverse();
  
  let streak = 0;
  let currentDate = new Date();
  
  for (const date of sortedDates) {
    const habitDate = new Date(date);
    const diffDays = Math.ceil((currentDate.getTime() - habitDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
      currentDate = habitDate;
    } else if (diffDays === 0) {
      // Mesmo dia, não incrementa streak
      continue;
    } else {
      break; // Quebra na sequência
    }
  }
  
  return streak;
}
```

### 2. **Correlação de Pearson**
```typescript
const calculateCorrelation = (habitsScores: number[], productivityScores: number[]) => {
  if (habitsScores.length < 2) return 0;

  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const mx = mean(habitsScores);
  const my = mean(productivityScores);

  const numerator = habitsScores.map((x, i) => (x - mx) * (productivityScores[i] - my))
    .reduce((a, b) => a + b, 0);

  const denominator = Math.sqrt(
    habitsScores.map(x => (x - mx) ** 2).reduce((a, b) => a + b, 0) *
    productivityScores.map(y => (y - my) ** 2).reduce((a, b) => a + b, 0)
  ) || 1;

  return +(numerator / denominator).toFixed(2);
}
```

### 3. **Taxa de Conclusão**
```typescript
const getCompletionRate = (period: 'day' | 'week' | 'month') => {
  const { habits } = get();
  if (habits.length === 0) return 0;

  const today = new Date();
  let relevantHabits = habits;

  if (period === 'day') {
    relevantHabits = habits.filter(habit => habit.completedToday);
  } else if (period === 'week') {
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    relevantHabits = habits.filter(habit => 
      new Date(habit.createdAt) >= weekAgo
    );
  }

  const completed = relevantHabits.filter(habit => habit.completedToday).length;
  return Math.round((completed / relevantHabits.length) * 100);
}
```

### 4. **Análise de Tendências**
```typescript
const getWellnessTrends = (days: number) => {
  const { checkins } = get();
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  const recentCheckins = checkins.filter(checkin => {
    const checkinDate = new Date(checkin.date);
    return checkinDate >= startDate && checkinDate <= endDate;
  });

  return {
    mood: recentCheckins.map(c => c.mood),
    energy: recentCheckins.map(c => c.energy),
    sleep: recentCheckins.map(c => c.sleepHours),
  };
}
```

## 📊 Exemplos de Uso

### Exemplo 1: Criação de Hábitos
```
1. Toque no ícone "+" para criar novo hábito
2. Digite o nome: "Beber 8 copos de água"
3. Configure frequência: Diária
4. Defina meta: 8 copos
5. Escolha categoria: Saúde
6. Selecione ícone: 💧
7. Salve o hábito
```

### Exemplo 2: Check-in Diário
```
1. Toque no ícone de coração no cabeçalho
2. Avalie humor: 😊 (4/5)
3. Configure energia: ⚡ (4/5)
4. Defina sono: 7h
5. Salve o check-in
6. Visualize correlações com produtividade
```

### Exemplo 3: Análise de Performance
```
1. Acesse correlações no ícone de gráficos
2. Visualize correlação: 0.75 (Forte Positiva)
3. Analise métricas de bem-estar
4. Acompanhe tendências semanais
5. Leia insights personalizados
6. Ajuste hábitos baseado nas análises
```

## 🎨 Interface Responsiva

### Design System
- **Cards** com bordas arredondadas e sombras
- **Cores temáticas** para diferentes tipos de dados
- **Ícones intuitivos** para ações rápidas
- **Progress bars** visuais para acompanhamento
- **Emojis** para avaliação emocional

### Estados Visuais
- **Sucesso**: Verde para hábitos concluídos e streaks ativos
- **Atenção**: Amarelo para progresso intermediário
- **Erro**: Vermelho para hábitos quebrados
- **Primário**: Azul para ações principais

### Interações
- **Tap simples** para marcar hábitos
- **Tap longo** para ações secundárias
- **Sliders** para avaliações de bem-estar
- **Botões +/-** para ajustar progresso
- **Modais** para funcionalidades avançadas

## 🚀 Próximos Passos Sugeridos

### Funcionalidades Avançadas
1. **Lembretes inteligentes** baseados em padrões
2. **Gamificação** com conquistas e badges
3. **Compartilhamento** de progresso com amigos
4. **Integração** com wearables (Apple Watch, Fitbit)
5. **Análise preditiva** de tendências
6. **Sincronização** com apps de saúde

### Melhorias de UX
1. **Notificações push** para check-ins
2. **Widgets** para tela inicial
3. **Modo offline** com sincronização posterior
4. **Exportação** de relatórios em PDF
5. **Temas personalizáveis** para hábitos
6. **Animações** para celebração de conquistas

### Integrações
1. **APIs de saúde** (Apple Health, Google Fit)
2. **Apps de meditação** (Headspace, Calm)
3. **Trackers de sono** (Sleep Cycle, Pillow)
4. **Apps de exercício** (Strava, Nike Run Club)
5. **Calendários** para agendamento de hábitos
6. **Redes sociais** para compartilhamento

### Análises Avançadas
1. **Machine Learning** para previsões
2. **Análise de padrões** sazonais
3. **Recomendações** personalizadas
4. **Comparação** com médias populacionais
5. **Alertas inteligentes** baseados em tendências
6. **Relatórios detalhados** de progresso

## 📝 Notas Técnicas

### Performance
- **Lazy loading** de dados históricos
- **Cache local** para consultas frequentes
- **Otimização** de re-renders com React.memo
- **Debounce** em inputs de avaliação

### Segurança
- **Validação** de dados de entrada
- **Sanitização** de valores numéricos
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