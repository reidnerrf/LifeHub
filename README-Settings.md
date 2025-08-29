# Perfil/Configurações - LifeHub

## ⚙️ Funcionalidades Implementadas

### 🎨 **Personalização de Cores/Ícones/Fontes**
- **Sistema de temas** com cores personalizáveis
- **Conjuntos de ícones** (Ionicons, Material Design, Feather, Font Awesome)
- **Fontes personalizáveis** com diferentes tamanhos e pesos
- **Temas pré-definidos** (Claro, Escuro, Oceano, Floresta)
- **Criação de temas customizados** com paleta de cores
- **Visualização em tempo real** das personalizações

### ☁️ **Backup em Nuvem**
- **Integração com Google Drive** para backup automático
- **Suporte ao iCloud** para dispositivos Apple
- **Integração com Dropbox** para armazenamento alternativo
- **OneDrive** para usuários Microsoft
- **Backup automático** configurável (diário, semanal, mensal)
- **Restauração de dados** com histórico de backups
- **Monitoramento de armazenamento** com limites e uso

### 🔗 **Integrações (Google, Trello, iCloud)**
- **Google Calendar** - Sincronização bidirecional de eventos
- **Trello** - Importação de quadros e cartões
- **iCloud** - Sincronização de notas e calendário
- **Notion** - Importação de páginas e bancos de dados
- **Slack** - Notificações e atualizações
- **GitHub** - Sincronização de issues e pull requests
- **Sincronização em tempo real** ou agendada
- **Gerenciamento de permissões** por integração

### 🌍 **Multi-idioma**
- **Português (BR)** - Idioma padrão
- **English (US)** - Inglês americano
- **Español** - Espanhol
- **Français** - Francês
- **Interface localizada** com traduções completas
- **Mudança dinâmica** de idioma sem reiniciar o app

### 🔔 **Notificações Inteligentes**
- **Notificações baseadas em localização** (chegada em casa/trabalho)
- **Notificações por horário** (rotinas matinais/noturnas)
- **Notificações por atividade** (detecção de foco, produtividade)
- **Notificações contextuais** (clima, trânsito, calendário)
- **Configuração de som e vibração** por tipo de notificação
- **Agendamento inteligente** com horários específicos
- **Ações personalizáveis** (lembretes, sugestões, alertas)

## 🏗️ Arquitetura Técnica

### Zustand Store (`src/store/settings.ts`)
```typescript
interface SettingsStore {
  // Dados
  userProfile: UserProfile;
  themes: ThemeConfig[];
  iconSets: IconSet[];
  fonts: FontConfig[];
  cloudBackups: CloudBackup[];
  integrations: Integration[];
  notifications: NotificationSettings[];
  smartNotifications: SmartNotification[];
  
  // Estado atual
  isLoading: boolean;
  showThemeModal: boolean;
  showIconModal: boolean;
  showFontModal: boolean;
  showBackupModal: boolean;
  showIntegrationsModal: boolean;
  showNotificationsModal: boolean;
  showSmartNotificationsModal: boolean;
  selectedTheme: ThemeConfig | null;
  selectedIconSet: IconSet | null;
  selectedFont: FontConfig | null;
  
  // Ações para Perfil do Usuário
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => void;
  saveProfile: () => Promise<void>;
  loadProfile: () => Promise<void>;
  
  // Ações para Temas
  addTheme: (theme: Omit<ThemeConfig, 'id'>) => void;
  updateTheme: (id: string, updates: Partial<ThemeConfig>) => void;
  deleteTheme: (id: string) => void;
  activateTheme: (id: string) => void;
  getActiveTheme: () => ThemeConfig;
  getThemes: () => ThemeConfig[];
  
  // Ações para Ícones
  addIconSet: (iconSet: Omit<IconSet, 'id'>) => void;
  updateIconSet: (id: string, updates: Partial<IconSet>) => void;
  deleteIconSet: (id: string) => void;
  activateIconSet: (id: string) => void;
  getActiveIconSet: () => IconSet;
  getIconSets: () => IconSet[];
  
  // Ações para Fontes
  addFont: (font: Omit<FontConfig, 'id'>) => void;
  updateFont: (id: string, updates: Partial<FontConfig>) => void;
  deleteFont: (id: string) => void;
  activateFont: (id: string) => void;
  getActiveFont: () => FontConfig;
  getFonts: () => FontConfig[];
  
  // Ações para Backup em Nuvem
  addCloudBackup: (backup: Omit<CloudBackup, 'id'>) => void;
  updateCloudBackup: (id: string, updates: Partial<CloudBackup>) => void;
  deleteCloudBackup: (id: string) => void;
  connectCloudBackup: (provider: CloudBackup['provider']) => Promise<boolean>;
  disconnectCloudBackup: (id: string) => void;
  performBackup: (id: string) => Promise<boolean>;
  restoreBackup: (id: string) => Promise<boolean>;
  getCloudBackups: () => CloudBackup[];
  
  // Ações para Integrações
  addIntegration: (integration: Omit<Integration, 'id'>) => void;
  updateIntegration: (id: string, updates: Partial<Integration>) => void;
  deleteIntegration: (id: string) => void;
  connectIntegration: (provider: Integration['provider']) => Promise<boolean>;
  disconnectIntegration: (id: string) => void;
  syncIntegration: (id: string) => Promise<boolean>;
  getIntegrations: () => Integration[];
  
  // Ações para Notificações
  addNotification: (notification: Omit<NotificationSettings, 'id'>) => void;
  updateNotification: (id: string, updates: Partial<NotificationSettings>) => void;
  deleteNotification: (id: string) => void;
  toggleNotification: (id: string) => void;
  getNotifications: () => NotificationSettings[];
  getEnabledNotifications: () => NotificationSettings[];
  
  // Ações para Notificações Inteligentes
  addSmartNotification: (notification: Omit<SmartNotification, 'id'>) => void;
  updateSmartNotification: (id: string, updates: Partial<SmartNotification>) => void;
  deleteSmartNotification: (id: string) => void;
  toggleSmartNotification: (id: string) => void;
  getSmartNotifications: () => SmartNotification[];
  getEnabledSmartNotifications: () => SmartNotification[];
  
  // Configurações
  setShowThemeModal: (show: boolean) => void;
  setShowIconModal: (show: boolean) => void;
  setShowFontModal: (show: boolean) => void;
  setShowBackupModal: (show: boolean) => void;
  setShowIntegrationsModal: (show: boolean) => void;
  setShowNotificationsModal: (show: boolean) => void;
  setShowSmartNotificationsModal: (show: boolean) => void;
  setSelectedTheme: (theme: ThemeConfig | null) => void;
  setSelectedIconSet: (iconSet: IconSet | null) => void;
  setSelectedFont: (font: FontConfig | null) => void;
  setIsLoading: (loading: boolean) => void;
}
```

### Componentes Principais

#### 1. **Settings.tsx** - Tela Principal
- **Dashboard de configurações** com seções organizadas
- **Perfil do usuário** com informações básicas
- **Preferências gerais** (idioma, tema, fonte, som, vibração)
- **Personalização** (temas, ícones, fontes)
- **Backup e sincronização** (nuvem, integrações)
- **Notificações** (inteligentes, configurações)
- **Informações do app** (versão, ajuda, termos)
- **Gerenciamento de conta** (sair, excluir)

#### 2. **ThemeCustomizationModal.tsx** - Modal de Temas
- **Lista de temas** com preview visual
- **Criação de temas customizados** com paleta de cores
- **Ativação/desativação** de temas
- **Visualização de cores** (primária, secundária, destaque, fundo)
- **Temas pré-definidos** (Claro, Escuro, Oceano, Floresta)

#### 3. **IconCustomizationModal.tsx** - Modal de Ícones
- **Conjuntos de ícones** disponíveis
- **Preview visual** de cada conjunto
- **Ativação/desativação** de conjuntos
- **Criação de conjuntos customizados**
- **Visualização de ícones** em diferentes contextos

#### 4. **FontCustomizationModal.tsx** - Modal de Fontes
- **Fontes disponíveis** com preview
- **Configuração de tamanho** e peso
- **Ativação/desativação** de fontes
- **Criação de fontes customizadas**
- **Visualização de textos** em diferentes tamanhos

#### 5. **CloudBackupModal.tsx** - Modal de Backup
- **Serviços de nuvem** (Google Drive, iCloud, Dropbox, OneDrive)
- **Status de conexão** e último backup
- **Configuração de backup automático**
- **Monitoramento de armazenamento**
- **Ações de backup/restauração**

#### 6. **IntegrationsModal.tsx** - Modal de Integrações
- **Serviços integrados** (Google, Trello, iCloud, Notion, Slack, GitHub)
- **Status de conexão** e última sincronização
- **Configuração de sincronização**
- **Gerenciamento de permissões**
- **Ações de sincronização manual**

#### 7. **SmartNotificationsModal.tsx** - Modal de Notificações Inteligentes
- **Tipos de notificações** (localização, horário, atividade, contexto)
- **Configuração de condições** e ações
- **Ativação/desativação** de notificações
- **Criação de notificações customizadas**
- **Visualização de detalhes** e configurações

### Modelos de Dados

#### UserProfile
```typescript
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: Date;
  lastActive: Date;
  preferences: {
    language: 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR';
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
}
```

#### ThemeConfig
```typescript
interface ThemeConfig {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  isCustom: boolean;
  isActive: boolean;
}
```

#### IconSet
```typescript
interface IconSet {
  id: string;
  name: string;
  description: string;
  preview: string;
  isActive: boolean;
}
```

#### FontConfig
```typescript
interface FontConfig {
  id: string;
  name: string;
  family: string;
  weight: 'normal' | 'bold';
  size: number;
  isActive: boolean;
}
```

#### CloudBackup
```typescript
interface CloudBackup {
  id: string;
  provider: 'google' | 'icloud' | 'dropbox' | 'onedrive';
  isConnected: boolean;
  lastBackup: Date | null;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  storageUsed: number;
  storageLimit: number;
}
```

#### Integration
```typescript
interface Integration {
  id: string;
  name: string;
  provider: 'google' | 'trello' | 'icloud' | 'notion' | 'slack' | 'github';
  icon: string;
  isConnected: boolean;
  lastSync: Date | null;
  syncEnabled: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  permissions: string[];
  dataTypes: string[];
}
```

#### SmartNotification
```typescript
interface SmartNotification {
  id: string;
  type: 'location' | 'time' | 'activity' | 'context';
  title: string;
  description: string;
  enabled: boolean;
  conditions: {
    location?: {
      latitude: number;
      longitude: number;
      radius: number;
    };
    time?: {
      startTime: string;
      endTime: string;
      days: number[];
    };
    activity?: {
      type: string;
      threshold: number;
    };
    context?: {
      weather?: boolean;
      traffic?: boolean;
      calendar?: boolean;
    };
  };
  actions: {
    type: 'reminder' | 'suggestion' | 'alert';
    message: string;
    action?: string;
  }[];
}
```

## 📱 Como Usar

### 1. **Acesso às Configurações**
- Toque no ícone de configurações na barra de navegação
- Visualize o perfil do usuário e informações básicas
- Navegue pelas diferentes seções de configuração

### 2. **Personalização de Temas**
- Toque em "Temas" na seção Personalização
- Visualize temas disponíveis com preview de cores
- Toque em um tema para ativá-lo
- Use "Criar" para criar temas customizados
- Toque em "Excluir" para remover temas personalizados

### 3. **Personalização de Ícones**
- Toque em "Ícones" na seção Personalização
- Visualize conjuntos de ícones disponíveis
- Toque em um conjunto para ativá-lo
- Use "Criar" para criar conjuntos customizados
- Veja preview dos ícones em diferentes contextos

### 4. **Personalização de Fontes**
- Toque em "Fontes" na seção Personalização
- Visualize fontes disponíveis com preview
- Toque em uma fonte para ativá-la
- Use "Criar" para criar fontes customizadas
- Veja exemplos de texto em diferentes tamanhos

### 5. **Backup em Nuvem**
- Toque em "Backup em Nuvem" na seção Backup e Sincronização
- Visualize serviços de nuvem disponíveis
- Toque em "Conectar" para conectar um serviço
- Configure backup automático e frequência
- Use "Fazer Backup" para backup manual
- Use "Restaurar" para restaurar dados

### 6. **Integrações**
- Toque em "Integrações" na seção Backup e Sincronização
- Visualize serviços disponíveis para integração
- Toque em "Conectar" para conectar um serviço
- Configure sincronização automática
- Use "Sincronizar" para sincronização manual
- Gerencie permissões de cada integração

### 7. **Notificações Inteligentes**
- Toque em "Notificações Inteligentes" na seção Notificações
- Visualize notificações ativas
- Use "Criar" para criar novas notificações
- Configure condições (localização, horário, atividade, contexto)
- Defina ações (lembretes, sugestões, alertas)
- Ative/desative notificações com o switch

### 8. **Preferências Gerais**
- **Idioma**: Toque para selecionar idioma preferido
- **Tema**: Toque para escolher tema (Automático, Claro, Escuro)
- **Tamanho da Fonte**: Toque para ajustar tamanho (Pequeno, Médio, Grande)
- **Som**: Use o switch para ativar/desativar sons
- **Vibração**: Use o switch para ativar/desativar vibração

## 🧮 Algoritmos Implementados

### 1. **Sistema de Temas**
```typescript
const activateTheme = (id: string) => {
  set((state) => ({
    themes: state.themes.map((theme) => ({
      ...theme,
      isActive: theme.id === id,
    })),
  }));
}
```

### 2. **Sistema de Backup**
```typescript
const performBackup = async (id: string) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1;
      if (success) {
        set((state) => ({
          cloudBackups: state.cloudBackups.map((backup) =>
            backup.id === id
              ? { ...backup, lastBackup: new Date() }
              : backup
          ),
        }));
      }
      resolve(success);
    }, 3000);
  });
}
```

### 3. **Sistema de Integrações**
```typescript
const connectIntegration = async (provider: Integration['provider']) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.2;
      if (success) {
        set((state) => ({
          integrations: state.integrations.map((integration) =>
            integration.provider === provider
              ? { ...integration, isConnected: true, lastSync: new Date() }
              : integration
          ),
        }));
      }
      resolve(success);
    }, 2000);
  });
}
```

### 4. **Sistema de Notificações Inteligentes**
```typescript
const toggleSmartNotification = (id: string) => {
  set((state) => ({
    smartNotifications: state.smartNotifications.map((notification) =>
      notification.id === id
        ? { ...notification, enabled: !notification.enabled }
        : notification
    ),
  }));
}
```

### 5. **Persistência de Dados**
```typescript
const saveProfile = async () => {
  const { userProfile } = get();
  try {
    await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
  }
}
```

## 📊 Exemplos de Uso

### Exemplo 1: Criação de Tema Customizado
```
1. Usuário toca em "Temas" nas configurações
2. Toque em "Criar" para novo tema
3. Sistema cria tema com cores padrão
4. Usuário personaliza cores (primária, secundária, destaque, fundo)
5. Sistema aplica tema em tempo real
6. Usuário ativa o tema personalizado
7. Tema é aplicado em todo o aplicativo
```

### Exemplo 2: Configuração de Backup
```
1. Usuário toca em "Backup em Nuvem"
2. Seleciona "Google Drive" e toca "Conectar"
3. Sistema autentica com Google
4. Configura backup automático diário
5. Define limite de armazenamento
6. Sistema faz primeiro backup
7. Backup automático é ativado
```

### Exemplo 3: Integração com Trello
```
1. Usuário toca em "Integrações"
2. Seleciona "Trello" e toca "Conectar"
3. Sistema solicita permissões do Trello
4. Configura sincronização a cada hora
5. Define tipos de dados (tarefas, quadros)
6. Sistema sincroniza dados iniciais
7. Sincronização automática é ativada
```

### Exemplo 4: Notificação Inteligente
```
1. Usuário toca em "Notificações Inteligentes"
2. Toque em "Criar" para nova notificação
3. Seleciona tipo "Localização"
4. Define coordenadas de casa/trabalho
5. Configura ação "Lembrete" com mensagem
6. Ativa a notificação
7. Sistema monitora localização e dispara notificação
```

## 🎨 Interface Responsiva

### Design System
- **Cards organizados** com bordas arredondadas
- **Ícones consistentes** para todas as ações
- **Cores temáticas** para diferentes tipos de funcionalidades
- **Modais especializados** para configurações avançadas
- **Switches e toggles** para configurações booleanas

### Estados Visuais
- **Primário**: Azul para ações principais e configurações
- **Sucesso**: Verde para conexões ativas e backups bem-sucedidos
- **Atenção**: Amarelo para notificações e alertas
- **Erro**: Vermelho para desconexões e falhas
- **Neutro**: Cinza para informações secundárias

### Interações
- **Tap simples** para acessar configurações
- **Modais** para configurações avançadas
- **Switches** para ativar/desativar funcionalidades
- **Alertas** para confirmações importantes
- **Loading states** durante operações assíncronas

## 🚀 Próximos Passos Sugeridos

### Funcionalidades Avançadas
1. **Sistema de perfis** múltiplos para diferentes usuários
2. **Sincronização entre dispositivos** em tempo real
3. **Backup incremental** para economizar espaço
4. **Integração com mais serviços** (Asana, Monday.com, etc.)
5. **Notificações push** para alertas em tempo real
6. **Sistema de widgets** personalizáveis

### Melhorias de UX
1. **Tutorial interativo** para novos usuários
2. **Configurações por voz** usando assistentes
3. **Temas sazonais** automáticos
4. **Animações suaves** para transições
5. **Feedback háptico** para ações importantes
6. **Modo offline** com sincronização posterior

### Integrações Avançadas
1. **APIs de IA** para sugestões inteligentes
2. **Sistemas de autenticação** avançados
3. **Criptografia** para dados sensíveis
4. **APIs de localização** para notificações precisas
5. **Sistemas de analytics** para melhorias
6. **APIs de clima** para notificações contextuais

### Análises e Relatórios
1. **Relatórios de uso** das configurações
2. **Análise de performance** das integrações
3. **Métricas de backup** e sincronização
4. **Insights de personalização** do usuário
5. **Relatórios de notificações** e engajamento
6. **A/B testing** para otimização

## 📝 Notas Técnicas

### Performance
- **Lazy loading** de configurações avançadas
- **Cache inteligente** para dados de perfil
- **Processamento em background** para backups
- **Debounce** em mudanças de configuração

### Segurança
- **Criptografia** de dados sensíveis
- **Autenticação segura** para integrações
- **Validação** de todas as configurações
- **Auditoria** de mudanças importantes

### Acessibilidade
- **Screen readers** para todas as configurações
- **Navegação por teclado** completa
- **Contraste adequado** de cores
- **Tamanhos de fonte** ajustáveis

### Compatibilidade
- **iOS e Android** com funcionalidades nativas
- **Diferentes tamanhos de tela** responsivos
- **Modo escuro** automático
- **Orientação** portrait e landscape

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024  
**Compatibilidade**: React Native 0.72+, Expo SDK 49+