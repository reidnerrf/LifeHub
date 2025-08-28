import React, { useState } from 'react';
import { Bot, Sparkles, TrendingUp, Calendar, Target, DollarSign, Brain, MessageCircle, Send, Mic } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Button } from './ui/button';

const AssistantView: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);

  const suggestions = [
    {
      id: 1,
      type: 'productivity',
      icon: Brain,
      color: 'var(--app-blue)',
      title: 'Otimização de Horário',
      description: 'Você tem 2h livres na manhã. Que tal adiantar a tarefa "Revisar projeto"?',
      action: 'Reorganizar agenda',
      priority: 'high',
    },
    {
      id: 2,
      type: 'habits',
      icon: Target,
      color: 'var(--app-green)',
      title: 'Meta de Exercícios',
      description: 'Você está 20% abaixo da meta semanal de exercícios. Considere uma caminhada hoje.',
      action: 'Adicionar exercício',
      priority: 'medium',
    },
    {
      id: 3,
      type: 'finances',
      icon: DollarSign,
      color: 'var(--app-yellow)',
      title: 'Alerta de Gastos',
      description: 'Seus gastos com alimentação já ultrapassaram 80% do orçamento mensal.',
      action: 'Ver detalhes',
      priority: 'high',
    },
    {
      id: 4,
      type: 'schedule',
      icon: Calendar,
      color: 'var(--app-purple)',
      title: 'Conflito na Agenda',
      description: 'Detectei sobreposição na agenda de amanhã. Deseja que eu reorganize?',
      action: 'Reorganizar',
      priority: 'medium',
    },
  ];

  const insights = [
    {
      title: 'Produtividade Semanal',
      value: '+15%',
      description: 'Seu foco melhorou 15% esta semana comparado à anterior',
      trend: 'up',
      color: 'var(--app-green)',
    },
    {
      title: 'Hábitos Consistentes',
      value: '8/10',
      description: 'Você manteve 8 de 10 hábitos consistentemente',
      trend: 'up',
      color: 'var(--app-blue)',
    },
    {
      title: 'Economia Mensal',
      value: 'R$ 320',
      description: 'Você economizou R$ 320 comparado ao mês passado',
      trend: 'up',
      color: 'var(--app-yellow)',
    },
  ];

  const chatHistory = [
    {
      id: 1,
      type: 'user',
      message: 'Como está minha produtividade esta semana?',
      time: '10:30',
    },
    {
      id: 2,
      type: 'assistant',
      message: 'Sua produtividade está excelente! Você concluiu 85% das tarefas planejadas e manteve foco por 4.2h em média por dia. Seu melhor dia foi terça-feira com 6h de foco.',
      time: '10:30',
    },
    {
      id: 3,
      type: 'user',
      message: 'E minhas finanças?',
      time: '10:32',
    },
    {
      id: 4,
      type: 'assistant',
      message: 'Suas finanças estão bem controladas! Você está dentro do orçamento em 3 de 4 categorias. Apenas "Alimentação" precisa de atenção - já usou 82% do limite mensal.',
      time: '10:32',
    },
  ];

  const quickActions = [
    { icon: Calendar, label: 'Otimizar agenda', color: 'var(--app-blue)' },
    { icon: Target, label: 'Revisar metas', color: 'var(--app-green)' },
    { icon: TrendingUp, label: 'Relatório semanal', color: 'var(--app-purple)' },
    { icon: DollarSign, label: 'Análise financeira', color: 'var(--app-yellow)' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'var(--app-red)';
      case 'medium': return 'var(--app-yellow)';
      case 'low': return 'var(--app-green)';
      default: return 'var(--app-gray)';
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      console.log('Sending message:', inputMessage);
      setInputMessage('');
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // Aqui você implementaria a funcionalidade de reconhecimento de voz
  };

  return (
    <div className="flex flex-col space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-purple)] rounded-xl flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--app-text)]">Assistente IA</h1>
            <p className="text-sm text-[var(--app-text-light)]">Seu copiloto pessoal</p>
          </div>
        </div>
        <Badge className="bg-[var(--app-green)]15 text-[var(--app-green)] border-0">
          <div className="w-2 h-2 bg-[var(--app-green)] rounded-full mr-2 animate-pulse" />
          Online
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className="flex items-center space-x-3 p-4 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm hover:shadow-md transition-all"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <Icon size={20} style={{ color: action.color }} />
              </div>
              <span className="text-sm font-medium text-[var(--app-text)]">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* AI Suggestions */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles size={20} className="text-[var(--app-yellow)]" />
          <h3 className="font-medium text-[var(--app-text)]">Sugestões Inteligentes</h3>
        </div>
        
        <div className="space-y-4">
          {suggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <div key={suggestion.id} className="flex items-start space-x-4 p-4 bg-[var(--app-light-gray)] rounded-xl">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${suggestion.color}15` }}
                >
                  <Icon size={20} style={{ color: suggestion.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-[var(--app-text)]">{suggestion.title}</h4>
                    <Badge 
                      className="text-xs px-2 py-1"
                      style={{ 
                        backgroundColor: `${getPriorityColor(suggestion.priority)}15`,
                        color: getPriorityColor(suggestion.priority)
                      }}
                    >
                      {suggestion.priority === 'high' ? 'Alta' : suggestion.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  <p className="text-sm text-[var(--app-text-light)] mb-3">{suggestion.description}</p>
                  <Button 
                    size="sm" 
                    className="text-xs px-3 py-1 h-7 rounded-lg"
                    style={{ backgroundColor: suggestion.color }}
                  >
                    {suggestion.action}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Insights */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp size={20} className="text-[var(--app-green)]" />
          <h3 className="font-medium text-[var(--app-text)]">Insights da Semana</h3>
        </div>
        
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-[var(--app-light-gray)] rounded-xl">
              <div className="flex-1">
                <h4 className="font-medium text-[var(--app-text)] mb-1">{insight.title}</h4>
                <p className="text-sm text-[var(--app-text-light)]">{insight.description}</p>
              </div>
              <div className="text-right">
                <div 
                  className="text-xl font-bold mb-1"
                  style={{ color: insight.color }}
                >
                  {insight.value}
                </div>
                <TrendingUp size={16} style={{ color: insight.color }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Chat Interface */}
      <Card className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle size={20} className="text-[var(--app-blue)]" />
          <h3 className="font-medium text-[var(--app-text)]">Conversa</h3>
        </div>
        
        <div className="space-y-4 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
          {chatHistory.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] p-3 rounded-xl ${
                  message.type === 'user'
                    ? 'bg-[var(--app-blue)] text-white'
                    : 'bg-[var(--app-light-gray)] text-[var(--app-text)]'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-white/70' : 'text-[var(--app-text-light)]'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Pergunte algo..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="pr-12 bg-[var(--app-light-gray)] border-0 rounded-xl"
            />
            <button
              onClick={toggleListening}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                isListening 
                  ? 'text-[var(--app-red)] bg-[var(--app-red)]15' 
                  : 'text-[var(--app-gray)] hover:text-[var(--app-text)]'
              }`}
            >
              <Mic size={16} />
            </button>
          </div>
          <Button
            onClick={handleSendMessage}
            size="sm"
            className="w-10 h-10 p-0 rounded-xl bg-[var(--app-blue)]"
            disabled={!inputMessage.trim()}
          >
            <Send size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AssistantView;