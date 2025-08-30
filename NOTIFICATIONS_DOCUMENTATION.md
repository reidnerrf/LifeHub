# 📱 Sistema de Notificações - LifeHub

## 📋 Visão Geral

O sistema de notificações do LifeHub é uma solução completa baseada no Expo Notifications que oferece suporte a diversos tipos de notificações para manter os usuários engajados e informados sobre suas atividades.

## 🚀 Funcionalidades Principais

### ✅ Tipos de Notificação Suportados

1. **Lembretes de Tarefas** - Notificações para tarefas pendentes
2. **Lembretes de Eventos** - Notificações para eventos agendados
3. **Lembretes de Hábitos** - Notificações recorrentes para hábitos
4. **Conquistas** - Notificações de recompensas e conquistas
5. **Missões** - Notificações de conclusão de missões
6. **Níveis** - Notificações de progresso de nível
7. **Sequências** - Notificações de streaks (ativas e quebradas)
8. **Motivação** - Notificações motivacionais aleatórias
9. **Resumos** - Notificações de resumo diário e semanal

## 🛠️ Como Usar

### Instalação e Configuração

```typescript
// No App.tsx ou ponto de entrada principal
import { notificationService } from './src/services/notificationService';

// Inicializar o serviço
useEffect(() => {
  const initializeNotifications = async () => {
    await notificationService.initialize();
  };
  initializeNotifications();
}, []);
```

### Solicitar Permissões

```typescript
const requestNotificationPermissions = async () => {
  const status = await notificationService.requestPermissions();
  if (status.granted) {
    console.log('Permissões concedidas');
  }
};
```

### Agendar Notificações

#### Tarefas
```typescript
await notificationService.scheduleTaskReminder(
  'task-id-123',
  'Estudar React Native',
  new Date('2024-01-15T10:00:00'),
  30 // minutos de antecedência
);
```

#### Eventos
```typescript
await notificationService.scheduleEventReminder(
  'event-id-456',
  'Reunião de Equipe',
  new Date('2024-01-15T14:00:00'),
  60 // minutos de antecedência
);
```

#### Conquistas
```typescript
await notificationService.scheduleAchievementNotification(
  'Explorador Inicial',
  50 // pontos
);
```

#### Níveis
```typescript
await notificationService.scheduleLevelUpNotification(5);
```

### Gerenciar Notificações

#### Cancelar Todas
```typescript
await notificationService.cancelAllNotifications();
```

#### Obter Estatísticas
```typescript
const stats = await notificationService.getNotificationStats();
console.log(stats.totalScheduled); // Número total de notificações
console.log(stats.byType); // Notificações por tipo
```

## 🎨 Componentes de Interface

### NotificationCenter

Componente completo para gerenciamento de notificações:

```typescript
import NotificationCenter from './src/components/NotificationCenter';

// Uso no navigation
<Stack.Screen 
  name="NotificationCenter" 
  component={NotificationCenter} 
  options={{ title: 'Notificações' }}
/>
```

### NotificationTester

Componente para testes de desenvolvimento:

```typescript
import NotificationTester from './src/components/NotificationTester';

// Uso em telas de desenvolvimento
<NotificationTester />
```

## ⚙️ Configuração Avançada

### Canais Android

O sistema cria automaticamente 4 canais no Android:

1. **default** - Notificações gerais
2. **reminders** - Lembretes de tarefas e eventos
3. **achievements** - Conquistas e recompensas
4. **motivational** - Mensagens motivacionais

### Personalização

```typescript
// Criar canal personalizado
await notificationService.createNotificationChannel({
  id: 'custom-channel',
  name: 'Canal Personalizado',
  description: 'Descrição do canal',
  importance: Notifications.AndroidImportance.HIGH,
  sound: true,
});
```

## 🔧 Integração com Outros Módulos

### Com Sistema de Tarefas

```typescript
// Quando uma tarefa é criada/atualizada
const scheduleTaskNotification = async (task: Task) => {
  if (task.dueDate && task.notificationsEnabled) {
    await notificationService.scheduleTaskReminder(
      task.id,
      task.title,
      task.dueDate,
      task.reminderMinutes || 30
    );
  }
};
```

### Com Sistema de Gamificação

```typescript
// Quando uma conquista é desbloqueada
const onAchievementUnlocked = async (achievement: Achievement) => {
  await notificationService.scheduleAchievementNotification(
    achievement.name,
    achievement.points
  );
};
```

## 🧪 Testes

### Testes Unitários

```typescript
// Testar permissões
const status = await notificationService.getPermissionStatus();
expect(status?.granted).toBe(true);

// Testar agendamento
const notificationId = await notificationService.scheduleTestNotification();
expect(notificationId).toBeDefined();

// Testar cancelamento
await notificationService.cancelNotification(notificationId);
```

### Testes de Interface

Use o componente `NotificationTester` para testar visualmente todos os tipos de notificação.

## 📊 Monitoramento e Estatísticas

```typescript
// Monitorar eventos de notificação
const subscription = notificationService.addNotificationReceivedListener(
  (notification) => {
    console.log('Notificação recebida:', notification);
  }
);

// Obter estatísticas em tempo real
const stats = await notificationService.getNotificationStats();
```

## 🚨 Tratamento de Erros

```typescript
try {
  await notificationService.scheduleNotification(...);
} catch (error) {
  console.error('Falha ao agendar notificação:', error);
  // Mostrar feedback para o usuário
}
```

## 🌐 Configurações de Ambiente

### Variáveis Necessárias

```env
EXPO_PUBLIC_PROJECT_ID=your-expo-project-id
```

### Configuração Platform-Specific

#### iOS
- Requer permissões explícitas
- Suporte a critical alerts (requer permissão adicional)

#### Android
- Canais de notificação automáticos
- Configuração de importância e som por canal

## 📈 Melhores Práticas

1. **Solicitar permissões no contexto certo** - Não solicitar imediatamente no app startup
2. **Fornecer rationale** - Explicar por que as notificações são importantes
3. **Agendar com antecedência** - 15-30 minutos para lembretes
4. **Usar prioridades adequadas** - HIGH para urgente, DEFAULT/MIN para informativo
5. **Limpar notificações antigas** - Cancelar quando não forem mais relevantes

## 🔮 Próximas Melhorias

1. Notificações push com servidor
2. Templates de notificação personalizáveis
3. Agendamento inteligente baseado em comportamento do usuário
4. Integração com calendário do sistema
5. Notificações com ações interativas

## 📞 Suporte

Para issues e dúvidas, consulte:
- [Documentação Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Código-fonte do serviço](./src/services/notificationService.ts)
- [Componente NotificationCenter](./src/components/NotificationCenter.tsx)
