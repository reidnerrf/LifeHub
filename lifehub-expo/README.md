# LifeHub (Expo)

## Rodando



- Abra no Expo Go (QR) ou use  / .

## Features no app Expo (MVP)
- Navegação tabs + stack (Home, Tasks, Calendar, Focus, Habits, Finance, Notes, Assistant, Profile, Settings, Onboarding)
- Tema light/dark automático via 
- Tokens de design () e 
- Tarefas com persistência 
- Sugestões simples da IA na Home (stub)

## Próximos
- Premium modal, notificações, integrações de calendário, orquestrador IA avançado
=======
# LifeHub Expo App

## Funcionalidades Implementadas

### 🎯 Tela Home/Dashboard

A tela Home foi completamente redesenhada com as seguintes funcionalidades:

#### Timeline Unificada de Hoje
- **Tarefas**: Exibe tarefas pendentes do dia com prioridade e status
- **Eventos**: Mostra eventos agendados para hoje
- **Hábitos**: Hábitos diários com progresso atual
- **Pomodoro Ativo**: Sessão de foco em andamento (se houver)

#### Score de Produtividade
- **"Como estou hoje"**: Score de 0-100 baseado em planejamento e produtividade
- **Insights**: Sugestões personalizadas para melhorar o dia

#### Atalhos Rápidos
- **Tarefa**: Criar nova tarefa via voz
- **Evento**: Agendar novo evento via voz
- **Nota**: Adicionar nota via voz
- **Hábito**: Criar novo hábito via voz

#### Sugestões de IA
- Cards com sugestões inteligentes baseadas no contexto do usuário
- Botão "Aplicar" para implementar sugestões

#### Gráficos de Evolução
- **Progresso de Hoje**: Visualização de métricas diárias
- **Tarefas Completas**: Progresso vs meta
- **Hábitos do Dia**: Acompanhamento de hábitos
- **Foco**: Tempo de foco acumulado
- **Produtividade**: Score geral de produtividade

#### FAB (Floating Action Button)
- Botão flutuante para criação rápida de tarefas
- Integração com comandos de voz

### 🎤 Comandos de Voz

#### Intents Implementados
- **"adicionar tarefa [título]"**: Cria nova tarefa
- **"adicionar nota [conteúdo]"**: Cria nova nota
- **"adicionar evento [título]"**: Agenda novo evento
- **"adicionar hábito [título]"**: Cria novo hábito
- **"iniciar pausa"**: Inicia pausa do Pomodoro
- **"próxima tarefa"**: Mostra próxima tarefa pendente
- **"pausar pomodoro"**: Pausa sessão de foco
- **"resumir pomodoro"**: Resume sessão de foco
- **"finalizar pomodoro"**: Finaliza sessão de foco

#### Feedback no App
- Alertas informativos após execução de comandos
- Recarregamento automático dos dados
- Indicador visual de processamento

### 🎨 Interface Moderna

#### Design System
- **Tema**: Suporte a modo claro/escuro
- **Cores**: Paleta consistente com cores primárias e secundárias
- **Tipografia**: Hierarquia clara de textos
- **Espaçamento**: Layout responsivo e bem espaçado

#### Componentes
- **ProgressChart**: Gráficos de progresso customizáveis
- **VoiceRecognition**: Componente de reconhecimento de voz
- **TimelineItem**: Item da timeline unificada
- **QuickAction**: Botões de ação rápida

### 🔧 Arquitetura

#### Estrutura de Arquivos
```
lifehub-expo/
├── src/
│   ├── components/
│   │   ├── ProgressChart.tsx
│   │   └── VoiceRecognition.tsx
│   ├── screens/
│   │   ├── Home.tsx (redesenhada)
│   │   ├── Tasks.tsx
│   │   ├── Focus.tsx
│   │   └── Notes.tsx
│   ├── services/
│   │   └── api.ts (atualizada)
│   ├── theme/
│   │   └── ThemeProvider.js
│   └── navigation/
│       └── index.js
├── App.js
└── package.json
```

#### Navegação
- **Bottom Tabs**: Home, Tasks, Focus, Notes
- **Ícones**: Ionicons para cada seção
- **Tema**: Cores consistentes com o design system

### 🚀 Como Usar

1. **Instalar dependências**:
   ```bash
   cd lifehub-expo
   npm install
   ```

2. **Iniciar o app**:
   ```bash
   npm start
   ```

3. **Comandos de voz**:
   - Toque no botão de microfone no header
   - Fale um comando (ex: "adicionar tarefa estudar programação")
   - Aguarde o feedback de execução

4. **Atalhos rápidos**:
   - Use os botões coloridos para ações rápidas
   - Cada botão executa um comando de voz específico

5. **Timeline**:
   - Visualize todos os itens de hoje em uma timeline unificada
   - Diferentes cores para diferentes tipos de item

### 🔗 Integração com Backend

O app se integra com o backend através dos seguintes endpoints:

- `POST /assistant/voice/command`: Executa comandos de voz
- `GET /today/items`: Busca timeline unificada
- `GET /ai/suggestions`: Sugestões de IA
- `POST /ai/score-planning`: Score de produtividade

### 📱 Próximos Passos

- [ ] Implementar reconhecimento de voz real (expo-speech)
- [ ] Adicionar mais tipos de gráficos
- [ ] Implementar notificações push
- [ ] Adicionar sincronização offline
- [ ] Implementar gamificação
- [ ] Adicionar mais comandos de voz
- [ ] Implementar busca por voz
- [ ] Adicionar configurações de voz
