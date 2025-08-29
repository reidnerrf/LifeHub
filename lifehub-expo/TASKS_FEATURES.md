# Tarefas & Planner - Funcionalidades Avançadas

## 🎯 **Funcionalidades Implementadas**

### 📋 **Lista com Prioridade/Tags**
- **Sistema de Prioridades**: Urgente, Alta, Média, Baixa
- **Tags Personalizadas**: Sistema flexível de tags para categorização
- **Tags Comuns**: Trabalho, Pessoal, Estudo, Saúde, Financeiro, Casa, Projeto
- **Filtros Avançados**: Por prioridade, tags, status e busca textual

### ✅ **Subtarefas/Checklists**
- **Subtarefas Ilimitadas**: Adicione quantas subtarefas precisar
- **Progresso Visual**: Contador de subtarefas completas/total
- **Edição Inline**: Adicione e remova subtarefas diretamente
- **Status Individual**: Cada subtarefa pode ser marcada como completa

### 🎨 **Views Múltiplas**

#### 📝 **Lista**
- Visualização tradicional em lista
- Cards expandíveis com todas as informações
- Ações rápidas (editar, excluir, reagendar)
- Ordenação por prioridade e data

#### 📊 **Kanban Semanal**
- **4 Colunas**: A Fazer, Em Progresso, Concluído, Cancelado
- **Estatísticas por Coluna**: Contagem de tarefas e prioridades
- **Ações Rápidas**: Mover tarefas entre colunas
- **Resumo de Prioridades**: Visualização rápida por cor

#### 📅 **Calendário**
- **Visualização Semanal**: 7 dias em grid horizontal
- **Navegação Intuitiva**: Anterior, próxima, hoje
- **Cards Compactos**: Tarefas organizadas por dia
- **Estatísticas da Semana**: Total, concluídas, urgentes

### 🤖 **Reagendamento Inteligente**
- **Opções Rápidas**: Hoje, amanhã, próxima semana
- **Drag & Drop**: Arraste tarefas entre dias (futuro)
- **Sugestões Automáticas**: Baseadas em carga de trabalho
- **Confirmação Visual**: Feedback imediato de mudanças

### ⏱️ **Estimativa Automática de Duração**
- **Algoritmo Inteligente**: Baseado em múltiplos fatores
- **Fatores Considerados**:
  - Número de subtarefas
  - Prioridade da tarefa
  - Tags específicas (reunião, estudo, exercício, email)
  - Histórico de tarefas similares
- **Botão Auto-estimar**: Calcula duração automaticamente
- **Edição Manual**: Ajuste conforme necessário

## 🔧 **Arquitetura Técnica**

### 📦 **Store (Zustand)**
```typescript
interface TasksStore {
  tasks: Task[];
  view: TaskView;
  filter: FilterOptions;
  
  // Ações
  addTask, updateTask, deleteTask, toggleTask;
  addSubtask, toggleSubtask;
  setView, setFilter;
  getFilteredTasks, getTasksByStatus;
  estimateTaskDuration, rescheduleTask;
}
```

### 🎨 **Componentes Principais**

#### **TaskItem.tsx**
- Card completo de tarefa
- Expansão de subtarefas
- Ações inline (editar, excluir, reagendar)
- Indicadores visuais de prioridade e status

#### **TaskFilters.tsx**
- Busca textual
- Filtros por prioridade, tags, status
- Modal de filtros avançados
- Indicadores de filtros ativos

#### **KanbanView.tsx**
- Layout horizontal com colunas
- Estatísticas por coluna
- Ações rápidas de mudança de status
- Resumo de prioridades

#### **CalendarView.tsx**
- Grid semanal responsivo
- Navegação entre semanas
- Cards compactos de tarefas
- Estatísticas da semana

#### **CreateTaskModal.tsx**
- Formulário completo de criação
- Seleção de prioridade
- Sistema de tags
- Adição de subtarefas
- Estimativa automática de duração

### 🗄️ **Backend (MongoDB)**
```typescript
const TaskSchema = {
  userId: String,
  title: String,
  description: String,
  status: ['pending', 'in_progress', 'completed', 'cancelled'],
  priority: ['low', 'medium', 'high', 'urgent'],
  tags: [String],
  subtasks: [{
    title: String,
    completed: Boolean,
    createdAt: Date
  }],
  dueDate: Date,
  estimatedDuration: Number,
  actualDuration: Number
}
```

## 🚀 **Como Usar**

### **Criando uma Tarefa**
1. Toque no botão "+" no header
2. Preencha o título (obrigatório)
3. Adicione descrição (opcional)
4. Selecione prioridade
5. Adicione tags (use as comuns ou crie novas)
6. Defina data de vencimento
7. Use "Auto-estimar" para duração ou defina manualmente
8. Adicione subtarefas se necessário
9. Salve a tarefa

### **Alternando Views**
1. Use os botões no header: Lista, Kanban, Calendário
2. Cada view oferece uma perspectiva diferente
3. Filtros funcionam em todas as views

### **Gerenciando Tarefas**
- **Lista**: Toque na tarefa para expandir subtarefas
- **Kanban**: Use os botões de ação para mudar status
- **Calendário**: Toque na tarefa para ver detalhes

### **Filtros e Busca**
1. Use a barra de busca para texto
2. Toque em "Filtros" para opções avançadas
3. Selecione prioridade, tags ou status
4. Veja filtros ativos no topo
5. Use "Limpar" para remover todos

## 📊 **Algoritmo de Estimativa**

### **Fórmula Base**
```
Duração = 30min (base) + (subtarefas × 15min)
```

### **Multiplicadores por Prioridade**
- **Urgente**: ×0.8 (tarefas urgentes tendem a ser mais rápidas)
- **Alta**: ×1.0 (padrão)
- **Média**: ×1.2 (pode demorar um pouco mais)
- **Baixa**: ×1.5 (tarefas de baixa prioridade podem demorar)

### **Ajustes por Tags**
- **Reunião**: 60min (fixo)
- **Estudo**: ×1.5
- **Exercício**: 45min (fixo)
- **Email**: 15min (fixo)

## 🎯 **Próximos Passos**

### **Funcionalidades Futuras**
- [ ] Drag & Drop entre views
- [ ] Templates de tarefas
- [ ] Dependências entre tarefas
- [ ] Time tracking automático
- [ ] Integração com calendário externo
- [ ] Notificações de vencimento
- [ ] Relatórios de produtividade
- [ ] Sincronização offline
- [ ] Compartilhamento de tarefas
- [ ] IA para sugestões de agendamento

### **Melhorias Técnicas**
- [ ] Otimização de performance para listas grandes
- [ ] Cache inteligente
- [ ] Sincronização em tempo real
- [ ] Backup automático
- [ ] Exportação de dados

## 🔍 **Exemplos de Uso**

### **Tarefa de Projeto**
```
Título: Desenvolver feature de login
Prioridade: Alta
Tags: #trabalho #projeto #desenvolvimento
Duração: 120min (auto-estimada)
Subtarefas:
- Criar mockups
- Implementar UI
- Configurar autenticação
- Testes
```

### **Tarefa Pessoal**
```
Título: Organizar armário
Prioridade: Baixa
Tags: #casa #organização
Duração: 45min
Subtarefas:
- Separar roupas por estação
- Doar o que não usa
- Organizar por cor
```

### **Tarefa Urgente**
```
Título: Preparar apresentação para reunião
Prioridade: Urgente
Tags: #trabalho #reunião
Duração: 60min (fixo por tag)
Subtarefas:
- Coletar dados
- Criar slides
- Revisar conteúdo
```

## 📱 **Interface Responsiva**

- **Mobile First**: Otimizado para smartphones
- **Tablet**: Layout adaptativo para telas maiores
- **Desktop**: Interface completa com todas as funcionalidades
- **Acessibilidade**: Suporte a leitores de tela e navegação por teclado

---

**Desenvolvido com ❤️ para maximizar sua produtividade!**