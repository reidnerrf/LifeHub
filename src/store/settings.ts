import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  joinDate: Date;
  lastActive: Date;
  isActive: boolean;
  preferences: {
    language: 'pt-BR' | 'en-US' | 'es-ES' | 'fr-FR';
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };
}

export interface UserProfileWithData extends UserProfile {
  data: {
    tasks: any[];
    events: any[];
    habits: any[];
    notes: any[];
    finances: any[];
  };
}

export interface ThemeConfig {
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

export interface IconSet {
  id: string;
  name: string;
  description: string;
  preview: string;
  isActive: boolean;
}

export interface FontConfig {
  id: string;
  name: string;
  family: string;
  weight: 'normal' | 'bold';
  size: number;
  isActive: boolean;
}

export interface CloudBackup {
  id: string;
  provider: 'google' | 'icloud' | 'dropbox' | 'onedrive';
  isConnected: boolean;
  lastBackup: Date | null;
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  storageUsed: number;
  storageLimit: number;
  incrementalBackup: boolean;
  backupRetention: number; // days to keep backups
  compressionEnabled: boolean;
  lastIncrementalBackup: Date | null;
  backupSize: number;
  encrypted: boolean;
}

export interface WearableDevice {
  id: string;
  name: string;
  provider: 'apple-watch' | 'fitbit' | 'samsung';
  model: string;
  isConnected: boolean;
  lastSync: Date | null;
  syncEnabled: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  batteryLevel: number;
  syncFeatures: {
    pomodoro: boolean;
    notifications: boolean;
    newTask: boolean;
    agenda: boolean;
  };
  permissions: string[];
}

export interface Integration {
  id: string;
  name: string;
  provider: 'google' | 'trello' | 'asana' | 'icloud' | 'notion' | 'slack' | 'github';
  icon: string;
  isConnected: boolean;
  lastSync: Date | null;
  syncEnabled: boolean;
  syncFrequency: 'realtime' | 'hourly' | 'daily';
  permissions: string[];
  dataTypes: string[];
}

export interface NotificationSettings {
  id: string;
  type: 'tasks' | 'events' | 'habits' | 'focus' | 'finances' | 'general';
  title: string;
  description: string;
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  priority: 'low' | 'medium' | 'high';
  schedule: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: number[];
  };
}

export interface SmartNotification {
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

interface SettingsStore {
  // Dados
  userProfile: UserProfile;
  userProfiles: UserProfile[];
  themes: ThemeConfig[];
  iconSets: IconSet[];
  fonts: FontConfig[];
  cloudBackups: CloudBackup[];
  wearableDevices: WearableDevice[];
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
  showProfileModal: boolean;
  showWearableDevicesModal: boolean;
  selectedTheme: ThemeConfig | null;
  selectedIconSet: IconSet | null;
  selectedFont: FontConfig | null;
  
  // Ações para Perfil do Usuário
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => void;
  saveProfile: () => Promise<void>;
  loadProfile: () => Promise<void>;
  addUserProfile: (profile: Omit<UserProfile, 'id'>) => void;
  switchUserProfile: (profileId: string) => void;
  deleteUserProfile: (profileId: string) => void;
  exportUserProfile: (profileId: string) => Promise<string>;
  importUserProfile: (profileData: string) => Promise<boolean>;
  
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
  
  // Ações para Dispositivos Wearable
  addWearableDevice: (device: Omit<WearableDevice, 'id'>) => void;
  updateWearableDevice: (id: string, updates: Partial<WearableDevice>) => void;
  deleteWearableDevice: (id: string) => void;
  connectWearableDevice: (id: string) => Promise<boolean>;
  disconnectWearableDevice: (id: string) => void;
  syncWearableDevice: (id: string) => Promise<boolean>;
  getWearableDevices: () => WearableDevice[];
  
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

export const useSettings = create<SettingsStore>((set, get) => ({
  // Estado inicial
  userProfile: {
    id: 'user-1',
    name: 'Usuário LifeHub',
    email: 'usuario@lifehub.com',
    joinDate: new Date('2024-01-01'),
    lastActive: new Date(),
    isActive: true,
    preferences: {
      language: 'pt-BR',
      theme: 'auto',
      fontSize: 'medium',
      soundEnabled: true,
      vibrationEnabled: true,
    },
  },
  wearableDevices: [],
  showWearableDevicesModal: false,
  userProfiles: [
    {
      id: 'user-1',
      name: 'Usuário LifeHub',
      email: 'usuario@lifehub.com',
      joinDate: new Date('2024-01-01'),
      lastActive: new Date(),
      isActive: true,
      preferences: {
        language: 'pt-BR',
        theme: 'auto',
        fontSize: 'medium',
        soundEnabled: true,
        vibrationEnabled: true,
      },
    }
  ],
  themes: [
    {
      id: 'default-light',
      name: 'Claro Padrão',
      primaryColor: '#007AFF',
      secondaryColor: '#5856D6',
      accentColor: '#34C759',
      backgroundColor: '#FFFFFF',
      textColor: '#000000',
      isCustom: false,
      isActive: true,
    },
    {
      id: 'default-dark',
      name: 'Escuro Padrão',
      primaryColor: '#0A84FF',
      secondaryColor: '#5E5CE6',
      accentColor: '#30D158',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      isCustom: false,
      isActive: false,
    },
    {
      id: 'ocean',
      name: 'Oceano',
      primaryColor: '#006994',
      secondaryColor: '#00B4D8',
      accentColor: '#90E0EF',
      backgroundColor: '#F8F9FA',
      textColor: '#2C3E50',
      isCustom: true,
      isActive: false,
    },
    {
      id: 'forest',
      name: 'Floresta',
      primaryColor: '#2E7D32',
      secondaryColor: '#4CAF50',
      accentColor: '#8BC34A',
      backgroundColor: '#F1F8E9',
      textColor: '#1B5E20',
      isCustom: true,
      isActive: false,
    },
  ],
  iconSets: [
    {
      id: 'ionicons',
      name: 'Ionicons',
      description: 'Ícones padrão do sistema',
      preview: '📱',
      isActive: true,
    },
    {
      id: 'material',
      name: 'Material Design',
      description: 'Ícones do Google Material Design',
      preview: '🎨',
      isActive: false,
    },
    {
      id: 'feather',
      name: 'Feather Icons',
      description: 'Ícones minimalistas e elegantes',
      preview: '🪶',
      isActive: false,
    },
    {
      id: 'fontawesome',
      name: 'Font Awesome',
      description: 'Biblioteca completa de ícones',
      preview: '⭐',
      isActive: false,
    },
  ],
  fonts: [
    {
      id: 'system',
      name: 'Sistema',
      family: 'System',
      weight: 'normal',
      size: 16,
      isActive: true,
    },
    {
      id: 'roboto',
      name: 'Roboto',
      family: 'Roboto',
      weight: 'normal',
      size: 16,
      isActive: false,
    },
    {
      id: 'opensans',
      name: 'Open Sans',
      family: 'OpenSans',
      weight: 'normal',
      size: 16,
      isActive: false,
    },
    {
      id: 'montserrat',
      name: 'Montserrat',
      family: 'Montserrat',
      weight: 'normal',
      size: 16,
      isActive: false,
    },
  ],
  cloudBackups: [
    {
      id: 'google-drive',
      provider: 'google',
      isConnected: true,
      lastBackup: new Date(),
      autoBackup: true,
      backupFrequency: 'daily',
      storageUsed: 256,
      storageLimit: 15000,
      incrementalBackup: true,
      backupRetention: 30,
      compressionEnabled: true,
      lastIncrementalBackup: new Date(),
      backupSize: 256,
      encrypted: true,
    },
    {
      id: 'icloud',
      provider: 'icloud',
      isConnected: false,
      lastBackup: null,
      autoBackup: false,
      backupFrequency: 'weekly',
      storageUsed: 0,
      storageLimit: 5000,
      incrementalBackup: false,
      backupRetention: 7,
      compressionEnabled: false,
      lastIncrementalBackup: null,
      backupSize: 0,
      encrypted: false,
    },
    {
      id: 'dropbox',
      provider: 'dropbox',
      isConnected: false,
      lastBackup: null,
      autoBackup: false,
      backupFrequency: 'monthly',
      storageUsed: 0,
      storageLimit: 2000,
      incrementalBackup: false,
      backupRetention: 90,
      compressionEnabled: true,
      lastIncrementalBackup: null,
      backupSize: 0,
      encrypted: false,
    },
  ],
  integrations: [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      provider: 'google',
      icon: 'calendar',
      isConnected: true,
      lastSync: new Date(),
      syncEnabled: true,
      syncFrequency: 'realtime',
      permissions: ['read', 'write'],
      dataTypes: ['events', 'tasks'],
    },
    {
      id: 'trello',
      name: 'Trello',
      provider: 'trello',
      icon: 'grid',
      isConnected: false,
      lastSync: null,
      syncEnabled: false,
      syncFrequency: 'hourly',
      permissions: ['read'],
      dataTypes: ['tasks', 'boards'],
    },
    {
      id: 'icloud',
      name: 'iCloud',
      provider: 'icloud',
      icon: 'cloud',
      isConnected: false,
      lastSync: null,
      syncEnabled: false,
      syncFrequency: 'daily',
      permissions: ['read', 'write'],
      dataTypes: ['notes', 'calendar'],
    },
    {
      id: 'notion',
      name: 'Notion',
      provider: 'notion',
      icon: 'document-text',
      isConnected: false,
      lastSync: null,
      syncEnabled: false,
      syncFrequency: 'daily',
      permissions: ['read'],
      dataTypes: ['notes', 'tasks'],
    },
  ],
  notifications: [
    {
      id: 'task-reminders',
      type: 'tasks',
      title: 'Lembretes de Tarefas',
      description: 'Notificações para tarefas com prazo próximo',
      enabled: true,
      sound: true,
      vibration: true,
      priority: 'medium',
      schedule: {
        enabled: true,
        startTime: '08:00',
        endTime: '22:00',
        days: [1, 2, 3, 4, 5, 6, 7],
      },
    },
    {
      id: 'event-reminders',
      type: 'events',
      title: 'Lembretes de Eventos',
      description: 'Notificações para eventos do calendário',
      enabled: true,
      sound: true,
      vibration: false,
      priority: 'high',
      schedule: {
        enabled: true,
        startTime: '06:00',
        endTime: '23:00',
        days: [1, 2, 3, 4, 5, 6, 7],
      },
    },
    {
      id: 'habit-reminders',
      type: 'habits',
      title: 'Lembretes de Hábitos',
      description: 'Notificações para hábitos diários',
      enabled: true,
      sound: false,
      vibration: true,
      priority: 'low',
      schedule: {
        enabled: true,
        startTime: '09:00',
        endTime: '21:00',
        days: [1, 2, 3, 4, 5, 6, 7],
      },
    },
    {
      id: 'focus-sessions',
      type: 'focus',
      title: 'Sessões de Foco',
      description: 'Notificações para sessões de foco',
      enabled: false,
      sound: true,
      vibration: true,
      priority: 'medium',
      schedule: {
        enabled: false,
        startTime: '08:00',
        endTime: '18:00',
        days: [1, 2, 3, 4, 5],
      },
    },
  ],
  smartNotifications: [
    {
      id: 'location-home',
      type: 'location',
      title: 'Chegada em Casa',
      description: 'Notificações quando chegar em casa',
      enabled: true,
      conditions: {
        location: {
          latitude: -23.5505,
          longitude: -46.6333,
          radius: 100,
        },
      },
      actions: [
        {
          type: 'reminder',
          message: 'Bem-vindo de volta! Que tal revisar suas tarefas do dia?',
          action: 'open_tasks',
        },
      ],
    },
    {
      id: 'time-morning',
      type: 'time',
      title: 'Rotina da Manhã',
      description: 'Lembretes para rotina matinal',
      enabled: true,
      conditions: {
        time: {
          startTime: '06:00',
          endTime: '08:00',
          days: [1, 2, 3, 4, 5],
        },
      },
      actions: [
        {
          type: 'suggestion',
          message: 'Bom dia! Hora de começar sua rotina matinal.',
          action: 'start_morning_routine',
        },
      ],
    },
    {
      id: 'activity-focus',
      type: 'activity',
      title: 'Detecção de Foco',
      description: 'Sugestões baseadas em atividade de foco',
      enabled: false,
      conditions: {
        activity: {
          type: 'focus_session',
          threshold: 25,
        },
      },
      actions: [
        {
          type: 'suggestion',
          message: 'Você está focado há 25 minutos. Que tal uma pausa?',
          action: 'suggest_break',
        },
      ],
    },
    {
      id: 'context-weather',
      type: 'context',
      title: 'Contexto do Clima',
      description: 'Sugestões baseadas no clima',
      enabled: false,
      conditions: {
        context: {
          weather: true,
          traffic: true,
          calendar: true,
        },
      },
      actions: [
        {
          type: 'alert',
          message: 'Chuva prevista para hoje. Considere ajustar seus planos.',
          action: 'weather_alert',
        },
      ],
    },
  ],
  isLoading: false,
  showThemeModal: false,
  showIconModal: false,
  showFontModal: false,
  showBackupModal: false,
  showIntegrationsModal: false,
  showNotificationsModal: false,
  showSmartNotificationsModal: false,
  selectedTheme: null,
  selectedIconSet: null,
  selectedFont: null,

  // Implementações das ações
  updateUserProfile: (updates) => {
    set((state) => ({
      userProfile: { ...state.userProfile, ...updates },
    }));
  },

  updatePreferences: (preferences) => {
    set((state) => ({
      userProfile: {
        ...state.userProfile,
        preferences: { ...state.userProfile.preferences, ...preferences },
      },
    }));
  },

  saveProfile: async () => {
    const { userProfile } = get();
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  },

  loadProfile: async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      if (profileData) {
        const profile = JSON.parse(profileData);
        set({ userProfile: profile });
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  },

  addTheme: (theme) => {
    const newTheme = { ...theme, id: `theme-${Date.now()}` };
    set((state) => ({
      themes: [...state.themes, newTheme],
    }));
  },

  updateTheme: (id, updates) => {
    set((state) => ({
      themes: state.themes.map((theme) =>
        theme.id === id ? { ...theme, ...updates } : theme
      ),
    }));
  },

  deleteTheme: (id) => {
    set((state) => ({
      themes: state.themes.filter((theme) => theme.id !== id),
    }));
  },

  activateTheme: (id) => {
    set((state) => ({
      themes: state.themes.map((theme) => ({
        ...theme,
        isActive: theme.id === id,
      })),
    }));
  },

  getActiveTheme: () => {
    const { themes } = get();
    return themes.find((theme) => theme.isActive) || themes[0];
  },

  getThemes: () => {
    const { themes } = get();
    return themes;
  },

  addIconSet: (iconSet) => {
    const newIconSet = { ...iconSet, id: `icon-${Date.now()}` };
    set((state) => ({
      iconSets: [...state.iconSets, newIconSet],
    }));
  },

  updateIconSet: (id, updates) => {
    set((state) => ({
      iconSets: state.iconSets.map((iconSet) =>
        iconSet.id === id ? { ...iconSet, ...updates } : iconSet
      ),
    }));
  },

  deleteIconSet: (id) => {
    set((state) => ({
      iconSets: state.iconSets.filter((iconSet) => iconSet.id !== id),
    }));
  },

  activateIconSet: (id) => {
    set((state) => ({
      iconSets: state.iconSets.map((iconSet) => ({
        ...iconSet,
        isActive: iconSet.id === id,
      })),
    }));
  },

  getActiveIconSet: () => {
    const { iconSets } = get();
    return iconSets.find((iconSet) => iconSet.isActive) || iconSets[0];
  },

  getIconSets: () => {
    const { iconSets } = get();
    return iconSets;
  },

  addFont: (font) => {
    const newFont = { ...font, id: `font-${Date.now()}` };
    set((state) => ({
      fonts: [...state.fonts, newFont],
    }));
  },

  updateFont: (id, updates) => {
    set((state) => ({
      fonts: state.fonts.map((font) =>
        font.id === id ? { ...font, ...updates } : font
      ),
    }));
  },

  deleteFont: (id) => {
    set((state) => ({
      fonts: state.fonts.filter((font) => font.id !== id),
    }));
  },

  activateFont: (id) => {
    set((state) => ({
      fonts: state.fonts.map((font) => ({
        ...font,
        isActive: font.id === id,
      })),
    }));
  },

  getActiveFont: () => {
    const { fonts } = get();
    return fonts.find((font) => font.isActive) || fonts[0];
  },

  getFonts: () => {
    const { fonts } = get();
    return fonts;
  },

  addCloudBackup: (backup) => {
    const newBackup = { ...backup, id: `backup-${Date.now()}` };
    set((state) => ({
      cloudBackups: [...state.cloudBackups, newBackup],
    }));
  },

  updateCloudBackup: (id, updates) => {
    set((state) => ({
      cloudBackups: state.cloudBackups.map((backup) =>
        backup.id === id ? { ...backup, ...updates } : backup
      ),
    }));
  },

  deleteCloudBackup: (id) => {
    set((state) => ({
      cloudBackups: state.cloudBackups.filter((backup) => backup.id !== id),
    }));
  },

  connectCloudBackup: async (provider) => {
    // Simular conexão com serviço de nuvem
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
          set((state) => ({
            cloudBackups: state.cloudBackups.map((backup) =>
              backup.provider === provider
                ? { ...backup, isConnected: true, lastBackup: new Date() }
                : backup
            ),
          }));
        }
        resolve(success);
      }, 2000);
    });
  },

  disconnectCloudBackup: (id) => {
    set((state) => ({
      cloudBackups: state.cloudBackups.map((backup) =>
        backup.id === id
          ? { ...backup, isConnected: false, lastBackup: null }
          : backup
      ),
    }));
  },

  performBackup: async (id) => {
    // Simular backup
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
  },

  restoreBackup: async (id) => {
    // Simular restauração
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Math.random() > 0.1);
      }, 5000);
    });
  },

  getCloudBackups: () => {
    const { cloudBackups } = get();
    return cloudBackups;
  },

  addIntegration: (integration) => {
    const newIntegration = { ...integration, id: `integration-${Date.now()}` };
    set((state) => ({
      integrations: [...state.integrations, newIntegration],
    }));
  },

  updateIntegration: (id, updates) => {
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.id === id ? { ...integration, ...updates } : integration
      ),
    }));
  },

  deleteIntegration: (id) => {
    set((state) => ({
      integrations: state.integrations.filter((integration) => integration.id !== id),
    }));
  },

  connectIntegration: async (provider) => {
    // Simular conexão com integração
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
  },

  disconnectIntegration: (id) => {
    set((state) => ({
      integrations: state.integrations.map((integration) =>
        integration.id === id
          ? { ...integration, isConnected: false, lastSync: null }
          : integration
      ),
    }));
  },

  syncIntegration: async (id) => {
    // Simular sincronização
    return new Promise((resolve) => {
      setTimeout(() => {
        const success = Math.random() > 0.1;
        if (success) {
          set((state) => ({
            integrations: state.integrations.map((integration) =>
              integration.id === id
                ? { ...integration, lastSync: new Date() }
                : integration
            ),
          }));
        }
        resolve(success);
      }, 3000);
    });
  },

  getIntegrations: () => {
    const { integrations } = get();
    return integrations;
  },

  addNotification: (notification) => {
    const newNotification = { ...notification, id: `notification-${Date.now()}` };
    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));
  },

  updateNotification: (id, updates) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, ...updates } : notification
      ),
    }));
  },

  deleteNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },

  toggleNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      ),
    }));
  },

  getNotifications: () => {
    const { notifications } = get();
    return notifications;
  },

  getEnabledNotifications: () => {
    const { notifications } = get();
    return notifications.filter((notification) => notification.enabled);
  },

  addSmartNotification: (notification) => {
    const newNotification = { ...notification, id: `smart-${Date.now()}` };
    set((state) => ({
      smartNotifications: [...state.smartNotifications, newNotification],
    }));
  },

  updateSmartNotification: (id, updates) => {
    set((state) => ({
      smartNotifications: state.smartNotifications.map((notification) =>
        notification.id === id ? { ...notification, ...updates } : notification
      ),
    }));
  },

  deleteSmartNotification: (id) => {
    set((state) => ({
      smartNotifications: state.smartNotifications.filter((notification) => notification.id !== id),
    }));
  },

  toggleSmartNotification: (id) => {
    set((state) => ({
      smartNotifications: state.smartNotifications.map((notification) =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      ),
    }));
  },

  getSmartNotifications: () => {
    const { smartNotifications } = get();
    return smartNotifications;
  },

  getEnabledSmartNotifications: () => {
    const { smartNotifications } = get();
    return smartNotifications.filter((notification) => notification.enabled);
  },

  // Configurações
  setShowThemeModal: (show) => set({ showThemeModal: show }),
  setShowIconModal: (show) => set({ showIconModal: show }),
  setShowFontModal: (show) => set({ showFontModal: show }),
  setShowBackupModal: (show) => set({ showBackupModal: show }),
  setShowIntegrationsModal: (show) => set({ showIntegrationsModal: show }),
  setShowNotificationsModal: (show) => set({ showNotificationsModal: show }),
  setShowSmartNotificationsModal: (show) => set({ showSmartNotificationsModal: show }),
  setSelectedTheme: (theme) => set({ selectedTheme: theme }),
  setSelectedIconSet: (iconSet) => set({ selectedIconSet: iconSet }),
  setSelectedFont: (font) => set({ selectedFont: font }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Multi-user profile actions
  addUserProfile: (profile) => {
    const newProfile = { ...profile, id: `user-${Date.now()}`, isActive: false };
    set((state) => ({
      userProfiles: [...state.userProfiles, newProfile],
    }));
  },

  switchUserProfile: (profileId) => {
    set((state) => {
      const updatedProfiles = state.userProfiles.map((profile) => ({
        ...profile,
        isActive: profile.id === profileId,
      }));
      const activeProfile = updatedProfiles.find((profile) => profile.isActive) || updatedProfiles[0];
      return {
        userProfiles: updatedProfiles,
        userProfile: activeProfile,
      };
    });
  },

  deleteUserProfile: (profileId) => {
    set((state) => {
      const filteredProfiles = state.userProfiles.filter((profile) => profile.id !== profileId);
      let activeProfile = state.userProfile;
      if (activeProfile.id === profileId) {
        activeProfile = filteredProfiles[0] || null;
      }
      return {
        userProfiles: filteredProfiles,
        userProfile: activeProfile,
      };
    });
  },

  exportUserProfile: async (profileId) => {
    const { userProfiles } = get();
    const profile = userProfiles.find((p) => p.id === profileId);
    if (!profile) {
      throw new Error('Profile not found');
    }
    return JSON.stringify(profile);
  },

  importUserProfile: async (profileData) => {
    try {
      const profile = JSON.parse(profileData);
      if (!profile.id) {
        profile.id = `user-${Date.now()}`;
      }
      set((state) => ({
        userProfiles: [...state.userProfiles, profile],
      }));
      return true;
    } catch (error) {
      console.error('Failed to import profile:', error);
      return false;
    }
  },

  showProfileModal: false,
}));
