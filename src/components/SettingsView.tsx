import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Bell, 
  Smartphone, 
  Calendar, 
  CreditCard, 
  Cloud, 
  Shield, 
  Palette, 
  Languages, 
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
  Brain
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import PremiumModal from './PremiumModal';
import { storage, KEYS } from '../services/storage';
import { isPremiumActive } from '../subscription';
import { getLocale, setLocale } from '../i18n';
import { api } from '../services/api';

interface SettingsViewProps {
  onBack: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onBack }) => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showPremium, setShowPremium] = useState(false);
  const [user, setUser] = useState(() => storage.get<any>(KEYS.user) || { id: 'guest', name: 'Convidado' });
  const [locale, setLoc] = useState(getLocale());
  const [subscription, setSubscription] = useState<any>(() => storage.get(KEYS.subscription));
  const trialInfo = (() => {
    if (!subscription || subscription.plan !== 'trial') return null;
    const started = new Date(subscription.startedAt || Date.now());
    const duration = Number(subscription.durationDays || 7);
    const end = new Date(started.getTime() + duration * 24 * 60 * 60 * 1000);
    const now = new Date();
    const msLeft = end.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(msLeft / (24 * 60 * 60 * 1000)));
    const expired = msLeft <= 0;
    return { daysLeft, expired, end };
  })();

  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    taskReminders: true,
    habitReminders: true,
    financeAlerts: true,
    focusBreaks: true,
    smartSuggestions: true,
    weeklyReports: true,
    achievementAlerts: true,
  });

  // Accessibility & Privacy
  const [highContrast, setHighContrast] = useState<boolean>(() => !!storage.get(KEYS.accessibilityHighContrast));
  const [fontScale, setFontScale] = useState<number>(() => storage.get<number>(KEYS.accessibilityFontScale) || 1);
  const [localAI, setLocalAI] = useState<boolean>(() => !!storage.get(KEYS.privacyLocalAI));
  const [dataShare, setDataShare] = useState<boolean>(() => storage.get(KEYS.privacyDataShare) !== false);

  // Modes
  const [modes, setModes] = useState<any>(null);
  const [mode, setMode] = useState<string>(() => (storage.get<string>(KEYS.mode) as any) || 'default');
  useEffect(() => { (async () => { try { setModes(await api.modesPresets()); } catch {} })(); }, []);

  const [integrations, setIntegrations] = useState([
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sincronizar eventos e compromissos',
      icon: <Calendar size={20} />,
      connected: true,
      status: 'active',
      lastSync: '2025-08-26T10:30:00Z',
      features: ['Importar eventos', 'Criar eventos', 'Notificações']
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Backup automático de notas e dados',
      icon: <Cloud size={20} />,
      connected: true,
      status: 'active',
      lastSync: '2025-08-26T09:15:00Z',
      features: ['Backup automático', 'Sincronização', 'Histórico de versões']
    },
    {
      id: 'banco-inter',
      name: 'Banco Inter',
      description: 'Importar transações automaticamente',
      icon: <CreditCard size={20} />,
      connected: false,
      status: 'available',
      features: ['Importar extratos', 'Categorização automática', 'Alertas de gastos']
    },
    {
      id: 'nubank',
      name: 'Nubank',
      description: 'Conectar cartão de crédito e conta',
      icon: <CreditCard size={20} />,
      connected: true,
      status: 'limited',
      lastSync: '2025-08-25T18:45:00Z',
      features: ['Cartão de crédito', 'Conta corrente', 'Investimentos'],
      warning: 'Conexão instável - reconectar recomendado'
    },
    {
      id: 'apple-health',
      name: 'Apple Health',
      description: 'Sincronizar dados de saúde e atividade',
      icon: <Smartphone size={20} />,
      connected: false,
      status: 'available',
      features: ['Passos', 'Exercícios', 'Sono', 'Frequência cardíaca']
    },
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Música para sessões de foco',
      icon: <Zap size={20} />,
      connected: true,
      status: 'active',
      lastSync: '2025-08-26T11:00:00Z',
      features: ['Playlists de foco', 'Controle de reprodução', 'Estatísticas']
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Sync unidirecional de páginas para o LifeHub',
      icon: <ExternalLink size={20} />,
      connected: false,
      status: 'available',
      features: ['Importar páginas', 'Sincronização manual']
    },
    {
      id: 'slack',
      name: 'Slack/Teams',
      description: 'Atualiza seu status para Foco automaticamente',
      icon: <ExternalLink size={20} />,
      connected: false,
      status: 'available',
      features: ['Status Foco', 'Silenciar notificações']
    },
    {
      id: 'wearables',
      name: 'Wearables',
      description: 'Apple Watch/WearOS para hábitos e foco',
      icon: <Smartphone size={20} />,
      connected: false,
      status: 'available',
      features: ['Passos', 'Foco', 'Batimentos']
    }
  ]);

  const menuSections = [
    {
      id: 'notifications',
      title: 'Notificações',
      icon: <Bell size={20} />,
      description: 'Configure alertas e lembretes',
      badge: notificationSettings.pushEnabled ? 'Ativo' : 'Inativo',
      badgeColor: notificationSettings.pushEnabled ? 'var(--app-green)' : 'var(--app-gray)'
    },
    {
      id: 'integrations',
      title: 'Integrações',
      icon: <ExternalLink size={20} />,
      description: 'Conecte serviços externos',
      badge: `${integrations.filter(i => i.connected).length}/${integrations.length} conectadas`,
      badgeColor: 'var(--app-blue)'
    },
    {
      id: 'appearance',
      title: 'Aparência',
      icon: <Palette size={20} />,
      description: 'Tema, cores e layout',
      badge: 'Auto',
      badgeColor: 'var(--app-purple)'
    },
    {
      id: 'accessibility',
      title: 'Acessibilidade',
      icon: <Smartphone size={20} />,
      description: 'Fonte e alto contraste',
      badge: `${Math.round((fontScale||1)*100)}%`,
      badgeColor: 'var(--app-green)'
    },
    {
      id: 'privacy',
      title: 'Privacidade',
      icon: <Shield size={20} />,
      description: 'Controle seus dados',
      badge: 'Seguro',
      badgeColor: 'var(--app-green)'
    },
    {
      id: 'modes',
      title: 'Modos',
      icon: <Settings size={20} />,
      description: 'Presets Estudante/Autônomo',
      badge: mode === 'default' ? 'Padrão' : mode,
      badgeColor: 'var(--app-blue)'
    },
    {
      id: 'ai-settings',
      title: 'Assistente IA',
      icon: <Brain size={20} />,
      description: 'Configure sugestões inteligentes',
      badge: 'Ativo',
      badgeColor: 'var(--app-green)'
    },
    {
      id: 'referrals',
      title: 'Convide Amigos',
      icon: <Zap size={20} />,
      description: 'Ganhe 1 mês Premium por convite',
      badge: 'Convide',
      badgeColor: 'var(--app-yellow)'
    },
    {
      id: 'reports',
      title: 'Resumo Semanal',
      icon: <ExternalLink size={20} />,
      description: 'Enviar resumo por email/push',
      badge: 'Manual',
      badgeColor: 'var(--app-gray)'
    },
    {
      id: 'premium',
      title: 'Plano Premium',
      icon: <Zap size={20} />,
      description: 'Desbloqueie IA completa e relatórios avançados',
      badge: 'Recomendado',
      badgeColor: 'var(--app-yellow)'
    },
    {
      id: 'general',
      title: 'Geral',
      icon: <Settings size={20} />,
      description: 'Idioma, região e outros',
      badge: 'PT-BR',
      badgeColor: 'var(--app-gray)'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle size={16} className="text-[var(--app-green)]" />;
      case 'limited': return <AlertCircle size={16} className="text-[var(--app-yellow)]" />;
      case 'error': return <AlertCircle size={16} className="text-[var(--app-red)]" />;
      default: return null;
    }
  };

  const formatLastSync = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-4">Notificações Push</h3>
        <div className="space-y-4">
          {Object.entries({
            pushEnabled: 'Ativar notificações push',
            taskReminders: 'Lembretes de tarefas',
            habitReminders: 'Lembretes de hábitos',
            financeAlerts: 'Alertas financeiros',
            focusBreaks: 'Pausas do Pomodoro',
            smartSuggestions: 'Sugestões inteligentes',
            weeklyReports: 'Relatórios semanais',
            achievementAlerts: 'Conquistas e marcos'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-[var(--app-text)]">{label}</span>
              <Switch 
                checked={notificationSettings[key as keyof typeof notificationSettings]}
                onCheckedChange={(checked) => 
                  setNotificationSettings(prev => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-4">Horários Inteligentes</h3>
        <p className="text-sm text-[var(--app-text-light)] mb-4">
          Configure quando receber notificações baseado nos seus hábitos
        </p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--app-text)]">Não perturbe</span>
            <span className="text-sm text-[var(--app-text-light)]">22:00 - 07:00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--app-text)]">Horário de trabalho</span>
            <span className="text-sm text-[var(--app-text-light)]">09:00 - 18:00</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--app-text)]">Lembretes de hábitos</span>
            <span className="text-sm text-[var(--app-text-light)]">07:00, 12:00, 19:00</span>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderGeneral = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-4">Usuário</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-[var(--app-text)] font-medium">{user.name}</div>
            <div className="text-xs text-[var(--app-text-light)]">ID: {user.id}</div>
          </div>
          <Button
            onClick={() => {
              const name = prompt('Nome do usuário', user.name) || user.name;
              const updated = { ...user, name };
              setUser(updated);
              storage.set(KEYS.user, updated);
            }}
          >Editar</Button>
        </div>
      </Card>

      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-2">Importar Google (stub)</h3>
        <p className="text-sm text-[var(--app-text-light)] mb-4">Simula uma importação de eventos e tarefas.</p>
        <Button onClick={() => alert('Importação Google simulada!')}>Importar agora</Button>
      </Card>

      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-2">Idioma</h3>
        <div className="flex items-center space-x-2">
          <Button onClick={() => { setLocale('pt'); setLoc('pt'); }} variant={locale==='pt' ? undefined : 'outline'}>PT</Button>
          <Button onClick={() => { setLocale('en'); setLoc('en'); }} variant={locale==='en' ? undefined : 'outline'}>EN</Button>
        </div>
      </Card>

      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-2">Assinatura</h3>
        {subscription ? (
          <div className="space-y-2 text-sm">
            <div className="text-[var(--app-text-light)]">Plano: {subscription.plan}</div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--app-text-light)]">Início: {subscription.startedAt ? new Date(subscription.startedAt).toLocaleDateString('pt-BR') : '—'}</span>
              <Button size="sm" variant="outline" onClick={async () => {
                try {
                  const res = await api.cancelSubscription({ plan: subscription.plan, startedAt: subscription.startedAt, amountAnnual: 14990 });
                  alert(`Assinatura cancelada. Reembolso: R$ ${(res.refund/100).toFixed(2)}`);
                  storage.remove(KEYS.subscription);
                  setSubscription(null);
                } catch { alert('Não foi possível cancelar agora.'); }
              }}>Cancelar</Button>
            </div>
            {trialInfo && (
              <div>
                {trialInfo.expired ? (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--app-yellow)]10">
                    <span className="text-[var(--app-text)]">Seu teste expirou.</span>
                    <Button size="sm" onClick={() => setShowPremium(true)}>Fazer upgrade</Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--app-blue)]10">
                    <span className="text-[var(--app-text)]">Teste ativo: {trialInfo.daysLeft} dias restantes</span>
                    <Button size="sm" onClick={() => setShowPremium(true)}>Upgrade</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button onClick={() => setShowPremium(true)}>Ver planos</Button>
            <Button variant="outline" onClick={() => { const sub = { plan: 'trial', startedAt: new Date().toISOString(), durationDays: 7 }; storage.set(KEYS.subscription, sub); setSubscription(sub); }}>Teste 7 dias</Button>
            <Button variant="outline" onClick={() => { const sub = { plan: 'trial', startedAt: new Date().toISOString(), durationDays: 14 }; storage.set(KEYS.subscription, sub); setSubscription(sub); }}>Teste 14 dias</Button>
          </div>
        )}
      </Card>
    </div>
  );

  const renderPremium = () => (
    <div className="space-y-6">
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-2">LifeHub Premium</h3>
        <p className="text-sm text-[var(--app-text-light)] mb-4">IA proativa, relatórios avançados, finanças e automações.</p>
        <Button onClick={() => setShowPremium(true)} className="bg-[var(--app-blue)] text-white rounded-xl">Ver planos</Button>
      </Card>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <Card key={integration.id} className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
          <div className="flex items-start space-x-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `var(--app-blue)15` }}
            >
              <div style={{ color: 'var(--app-blue)' }}>
                {integration.icon}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-[var(--app-text)]">{integration.name}</h4>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(integration.status)}
                  {integration.connected ? (
                    <Badge className="bg-[var(--app-green)]15 text-[var(--app-green)] border-0">
                      Conectado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-[var(--app-gray)] text-[var(--app-gray)]">
                      Disponível
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-sm text-[var(--app-text-light)] mb-3">
                {integration.description}
              </p>
              
              {integration.warning && (
                <div className="flex items-center space-x-2 mb-3 p-2 bg-[var(--app-yellow)]10 rounded-lg">
                  <AlertCircle size={14} className="text-[var(--app-yellow)]" />
                  <span className="text-xs text-[var(--app-yellow)]">{integration.warning}</span>
                </div>
              )}
              
              <div className="flex flex-wrap gap-1 mb-3">
                {integration.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                    {feature}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                {integration.lastSync && (
                  <span className="text-xs text-[var(--app-text-light)]">
                    Última sync: {formatLastSync(integration.lastSync)}
                  </span>
                )}
                
                <div className="flex space-x-2 ml-auto">
                  {integration.id === 'outlook' && (
                    <Button size="sm" className="text-xs h-7 px-3 bg-[var(--app-blue)]" onClick={async () => {
                      try { const res = await api.outlookAuthUrl(); window.open(res.url, '_blank'); } catch {}
                    }}>Conectar Outlook</Button>
                  )}
                  {integration.id === 'trello' && (
                    <Button size="sm" className="text-xs h-7 px-3 bg-[var(--app-blue)]" onClick={async () => {
                      try { const res = await api.trelloImport({ csvUrl: 'https://example.com/board.csv' }); alert(`Importados: ${res.imported}`); } catch { alert('Falha import Trello'); }
                    }}>Importar Trello CSV</Button>
                  )}
                  {integration.id === 'notion' && (
                    <Button size="sm" className="text-xs h-7 px-3 bg-[var(--app-blue)]" onClick={async () => { try { const r = await api.notionSync({}); alert(`Páginas importadas: ${r.synced}`); } catch { alert('Falha Notion'); } }}>Sync Notion</Button>
                  )}
                  {integration.id === 'slack' && (
                    <Button size="sm" className="text-xs h-7 px-3 bg-[var(--app-blue)]" onClick={async () => { try { const r = await api.slackStatus({ status: 'focusing' }); alert('Status foco atualizado'); } catch { alert('Falha Slack'); } }}>Status Foco</Button>
                  )}
                  {integration.id === 'wearables' && (
                    <Button size="sm" className="text-xs h-7 px-3 bg-[var(--app-blue)]" onClick={async () => { try { const r = await api.wearablesSummary(); alert(`Passos: ${r.steps}, Foco: ${r.focusMinutes}min`); } catch { alert('Falha Wearables'); } }}>Resumo</Button>
                  )}
                  {integration.connected ? (
                    <>
                      <Button size="sm" variant="outline" className="text-xs h-7 px-3">Configurar</Button>
                      <Button size="sm" variant="ghost" className="text-xs h-7 px-3 text-[var(--app-red)]">Desconectar</Button>
                    </>
                  ) : (
                    <Button size="sm" className="text-xs h-7 px-3 bg-[var(--app-blue)]">Conectar</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  if (selectedSection) {
    return (
      <div className="flex flex-col space-y-6 pb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedSection(null)}
            className="p-2 rounded-xl text-[var(--app-gray)] hover:text-[var(--app-text)] hover:bg-[var(--app-light-gray)] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-semibold text-[var(--app-text)]">
            {menuSections.find(s => s.id === selectedSection)?.title}
          </h1>
        </div>

        {selectedSection === 'notifications' && renderNotificationSettings()}
        {selectedSection === 'integrations' && renderIntegrations()}
        {selectedSection === 'appearance' && (
          <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
            <h3 className="font-medium text-[var(--app-text)] mb-4">Aparência</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-[var(--app-text-light)] mb-2">Tema</div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline">Claro</Button>
                  <Button variant="outline">Escuro</Button>
                  <Button variant="outline">Sistema</Button>
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--app-text-light)] mb-2">Personalização Avançada</div>
                <div className="p-3 rounded-lg bg-[var(--app-yellow)]10 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--app-text)]">Temas extras (Sunset, Forest, Neon)</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 opacity-50" />
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 opacity-50" />
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-600 opacity-50" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--app-text)]">Avatares exclusivos</span>
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-[var(--app-blue)] opacity-50 border-2 border-white" />
                      <div className="w-7 h-7 rounded-full bg-[var(--app-purple)] opacity-50 border-2 border-white" />
                      <div className="w-7 h-7 rounded-full bg-[var(--app-green)] opacity-50 border-2 border-white" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--app-text)]">Packs de ícones</span>
                    <div className="text-xs text-[var(--app-text-light)]">Minimal • Rounded • Outline</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--app-text)]">Densidade de layout</span>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="outline" disabled={!isPremiumActive()} onClick={() => { storage.set(KEYS.appearanceDensity, 'compact'); alert('Densidade salva'); }}>Compacto</Button>
                      <Button size="sm" variant="outline" disabled={!isPremiumActive()} onClick={() => { storage.set(KEYS.appearanceDensity, 'default'); alert('Densidade salva'); }}>Padrão</Button>
                      <Button size="sm" variant="outline" disabled={!isPremiumActive()} onClick={() => { storage.set(KEYS.appearanceDensity, 'comfortable'); alert('Densidade salva'); }}>Conforto</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--app-text)]">Fontes</span>
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="outline" disabled={!isPremiumActive()} onClick={() => { storage.set(KEYS.appearanceFont, 'sans'); alert('Fonte salva'); }}>Sans</Button>
                      <Button size="sm" variant="outline" disabled={!isPremiumActive()} onClick={() => { storage.set(KEYS.appearanceFont, 'serif'); alert('Fonte salva'); }}>Serif</Button>
                      <Button size="sm" variant="outline" disabled={!isPremiumActive()} onClick={() => { storage.set(KEYS.appearanceFont, 'mono'); alert('Fonte salva'); }}>Mono</Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    {!isPremiumActive() ? (
                      <Button size="sm" onClick={() => setShowPremium(true)}>Fazer upgrade</Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => alert('Personalizações premium ativadas!')}>Ativado</Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}
        {selectedSection === 'privacy' && (
          <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
            <h3 className="font-medium text-[var(--app-text)] mb-4">Privacidade</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--app-text)]">IA local quando possível</span>
                <Switch checked={localAI} onCheckedChange={(v) => { setLocalAI(!!v); storage.set(KEYS.privacyLocalAI, !!v); }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--app-text)]">Compartilhamento de dados anônimo</span>
                <Switch checked={dataShare} onCheckedChange={(v) => { setDataShare(!!v); storage.set(KEYS.privacyDataShare, !!v); }} />
              </div>
            </div>
          </Card>
        )}
        {selectedSection === 'accessibility' && (
          <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
            <h3 className="font-medium text-[var(--app-text)] mb-4">Acessibilidade</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--app-text)]">Alto contraste</span>
                <Switch checked={highContrast} onCheckedChange={(v) => { setHighContrast(!!v); storage.set(KEYS.accessibilityHighContrast, !!v); }} />
              </div>
              <div>
                <div className="text-sm text-[var(--app-text)] mb-2">Tamanho da fonte ({Math.round(fontScale*100)}%)</div>
                <input type="range" min="0.85" max="1.4" step="0.05" value={fontScale} onChange={(e) => { const v = parseFloat(e.target.value); setFontScale(v); storage.set(KEYS.accessibilityFontScale, v); }} className="w-full" />
              </div>
            </div>
          </Card>
        )}
        {selectedSection === 'modes' && (
          <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
            <h3 className="font-medium text-[var(--app-text)] mb-4">Modos</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Button variant={mode==='default'?undefined:'outline'} onClick={() => { setMode('default'); storage.set(KEYS.mode, 'default'); }}>Padrão</Button>
                <Button variant={mode==='student'?undefined:'outline'} onClick={() => { setMode('student'); storage.set(KEYS.mode, 'student'); }}>Estudante</Button>
                <Button variant={mode==='freelancer'?undefined:'outline'} onClick={() => { setMode('freelancer'); storage.set(KEYS.mode, 'freelancer'); }}>Autônomo</Button>
              </div>
              {modes && (
                <div className="text-xs text-[var(--app-text-light)]">Sugestão: {mode==='student' ? '3 blocos de foco • relatórios de estudo' : mode==='freelancer' ? '2 blocos de foco • relatórios por cliente' : 'Configurável'}</div>
              )}
            </div>
          </Card>
        )}
        {selectedSection === 'referrals' && (
          <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
            <h3 className="font-medium text-[var(--app-text)] mb-4">Convide Amigos</h3>
            <div className="flex items-center space-x-2 mb-3">
              <Button onClick={async () => { try { const r = await api.createReferral(); navigator.clipboard.writeText(r.code); alert('Código copiado: ' + r.code); } catch {} }}>Gerar código</Button>
              <input id="ref-code" placeholder="Código" className="flex-1 p-3 rounded-xl bg-[var(--app-light-gray)] border-0" />
              <Button variant="outline" onClick={async () => { const el = document.getElementById('ref-code') as HTMLInputElement|null; const code = el?.value?.trim(); if (!code) return; try { const r = await api.redeemReferral({ code }); alert(`Resgatado! +${r.bonusDays} dias`); } catch { alert('Falha ao resgatar'); } }}>Resgatar</Button>
            </div>
            <div className="text-xs text-[var(--app-text-light)]">1 mês Premium por convite ativado.</div>
          </Card>
        )}
        {selectedSection === 'reports' && (
          <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
            <h3 className="font-medium text-[var(--app-text)] mb-4">Resumo Semanal</h3>
            <Button onClick={async () => { try { await api.weeklyDispatch(); alert('Resumo semanal enviado'); } catch { alert('Falha ao enviar'); } }}>Enviar agora</Button>
            <div className="mt-2 text-xs text-[var(--app-text-light)]">Serão adicionadas preferências de agendamento em breve.</div>
          </Card>
        )}
        {selectedSection === 'ai-settings' && (
          <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
            <h3 className="font-medium text-[var(--app-text)] mb-4">Em breve...</h3>
            <p className="text-sm text-[var(--app-text-light)]">
              Configurações do assistente IA serão implementadas em breve.
            </p>
          </Card>
        )}
        {selectedSection === 'general' && renderGeneral()}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 pb-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 rounded-xl text-[var(--app-gray)] hover:text-[var(--app-text)] hover:bg-[var(--app-light-gray)] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-semibold text-[var(--app-text)]">Configurações</h1>
      </div>

      <div className="space-y-4">
        {menuSections.map((section) => (
          <Card 
            key={section.id}
            className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedSection(section.id)}
          >
            <div className="flex items-center space-x-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${section.badgeColor}15` }}
              >
                <div style={{ color: section.badgeColor }}>
                  {section.icon}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium text-[var(--app-text)]">{section.title}</h3>
                  <Badge 
                    variant="secondary"
                    className="text-xs px-2 py-1"
                    style={{ 
                      backgroundColor: `${section.badgeColor}15`,
                      color: section.badgeColor
                    }}
                  >
                    {section.badge}
                  </Badge>
                </div>
                <p className="text-sm text-[var(--app-text-light)]">{section.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-purple)] rounded-2xl border-0 shadow-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium mb-1">Backup de Dados</h3>
            <p className="text-sm text-white/80">Última sincronização: 2h atrás</p>
          </div>
          <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
            <Download size={16} className="mr-2" />
            Sincronizar
          </Button>
        </div>
      </Card>

      {/* User Scope */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-2">Usuário atual</h3>
        <div className="flex items-center space-x-2">
          <input id="user-id-input" defaultValue={localStorage.getItem('userId') || ''} placeholder="public" className="flex-1 p-3 rounded-xl bg-[var(--app-light-gray)] border-0" />
          <Button onClick={() => {
            const el = document.getElementById('user-id-input') as HTMLInputElement | null;
            const val = el?.value?.trim() || 'public';
            try { localStorage.setItem('userId', val); } catch {}
            import('../services/api').then(m => m && (m as any).setUserId && (m as any).setUserId(val));
            alert('Usuário definido: ' + val);
          }}>Salvar</Button>
        </div>
      </Card>

      {/* Google Calendar Import (stub) */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <h3 className="font-medium text-[var(--app-text)] mb-2">Integração Google Calendar</h3>
        <Button onClick={async () => {
          try {
            const mod = await import('../services/api');
            const res = await (mod as any).api.importGoogle();
            alert(`Importados: ${res.imported}`);
          } catch {
            alert('Falha ao importar (stub).');
          }
        }}>Importar eventos (stub)</Button>
      </Card>

      <PremiumModal open={showPremium} onClose={() => setShowPremium(false)} />
    </div>
  );
};

export default SettingsView;