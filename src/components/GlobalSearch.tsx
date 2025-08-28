import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, X, Calendar, CheckSquare, Target, DollarSign, FileText, Clock, Sparkles } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface SearchResult {
  id: string;
  type: 'task' | 'habit' | 'event' | 'transaction' | 'note' | 'session';
  title: string;
  description?: string;
  date?: string;
  status?: string;
  priority?: 'high' | 'medium' | 'low';
  amount?: number;
  category?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (type: string, id: string) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'tarefas importantes',
    'gastos alimentação',
    'hábitos exercício',
    'reuniões semana'
  ]);

  // Mock data - em um app real, isso viria de uma API ou estado global
  const allData: SearchResult[] = [
    // Tasks
    { id: '1', type: 'task', title: 'Revisar relatórios', description: 'Análise mensal de vendas', date: '2025-08-26', status: 'completed', priority: 'high' },
    { id: '2', type: 'task', title: 'Reunião com cliente', description: 'Apresentação do projeto', date: '2025-08-26', status: 'pending', priority: 'high' },
    { id: '3', type: 'task', title: 'Exercitar-se', description: 'Treino de força', date: '2025-08-26', status: 'pending', priority: 'medium' },
    
    // Habits
    { id: '4', type: 'habit', title: 'Beber água', description: '8 copos por dia', status: 'active', category: 'saúde' },
    { id: '5', type: 'habit', title: 'Exercício', description: 'Atividade física diária', status: 'active', category: 'fitness' },
    { id: '6', type: 'habit', title: 'Meditação', description: '10 minutos diários', status: 'active', category: 'bem-estar' },
    
    // Events
    { id: '7', type: 'event', title: 'Dentista', description: 'Consulta de rotina', date: '2025-08-27' },
    { id: '8', type: 'event', title: 'Reunião de equipe', description: 'Planejamento sprint', date: '2025-08-28' },
    
    // Transactions
    { id: '9', type: 'transaction', title: 'Almoço restaurante', amount: 45.80, category: 'alimentação', date: '2025-08-26' },
    { id: '10', type: 'transaction', title: 'Uber', amount: 18.50, category: 'transporte', date: '2025-08-26' },
    { id: '11', type: 'transaction', title: 'Supermercado', amount: 127.90, category: 'alimentação', date: '2025-08-25' },
    
    // Notes
    { id: '12', type: 'note', title: 'Ideias projeto', description: 'Brainstorming para nova funcionalidade' },
    { id: '13', type: 'note', title: 'Lista de compras', description: 'Itens para o mercado' },
    
    // Focus Sessions
    { id: '14', type: 'session', title: 'Sessão Pomodoro', description: 'Desenvolvimento de código', date: '2025-08-26' },
  ];

  const filters = [
    { id: 'task', label: 'Tarefas', icon: CheckSquare, count: allData.filter(d => d.type === 'task').length },
    { id: 'habit', label: 'Hábitos', icon: Target, count: allData.filter(d => d.type === 'habit').length },
    { id: 'event', label: 'Eventos', icon: Calendar, count: allData.filter(d => d.type === 'event').length },
    { id: 'transaction', label: 'Finanças', icon: DollarSign, count: allData.filter(d => d.type === 'transaction').length },
    { id: 'note', label: 'Notas', icon: FileText, count: allData.filter(d => d.type === 'note').length },
    { id: 'session', label: 'Foco', icon: Clock, count: allData.filter(d => d.type === 'session').length },
  ];

  const filteredResults = useMemo(() => {
    let results = allData;

    // Apply type filters
    if (selectedFilters.length > 0) {
      results = results.filter(item => selectedFilters.includes(item.type));
    }

    // Apply search query
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(item => 
        item.title.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by relevance (completed items last, recent items first)
    return results.sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      if (a.date && b.date) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return 0;
    });
  }, [query, selectedFilters]);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.trim() && !recentSearches.includes(searchQuery)) {
      setRecentSearches(prev => [searchQuery, ...prev.slice(0, 4)]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'task': return CheckSquare;
      case 'habit': return Target;
      case 'event': return Calendar;
      case 'transaction': return DollarSign;
      case 'note': return FileText;
      case 'session': return Clock;
      default: return Search;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'var(--app-blue)';
      case 'habit': return 'var(--app-green)';
      case 'event': return 'var(--app-purple)';
      case 'transaction': return 'var(--app-yellow)';
      case 'note': return 'var(--app-gray)';
      case 'session': return 'var(--app-red)';
      default: return 'var(--app-gray)';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const clearAll = () => {
    setQuery('');
    setSelectedFilters([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fade-in" onClick={onClose}>
      <div 
        className="fixed top-0 left-0 right-0 bg-[var(--app-card)] animate-slide-down shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-6 border-b border-[var(--app-light-gray)]">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--app-gray)]" />
              <input
                type="text"
                placeholder="Buscar em tudo..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[var(--app-light-gray)] border-0 rounded-2xl focus:ring-2 focus:ring-[var(--app-blue)] outline-none text-[var(--app-text)] placeholder-[var(--app-text-light)] transition-all"
                autoFocus
              />
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl text-[var(--app-gray)] hover:text-[var(--app-text)] hover:bg-[var(--app-light-gray)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {filters.map((filter) => {
                const Icon = filter.icon;
                const isSelected = selectedFilters.includes(filter.id);
                return (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${
                      isSelected 
                        ? 'border-[var(--app-blue)] bg-[var(--app-blue)]15 text-[var(--app-blue)]'
                        : 'border-[var(--app-light-gray)] bg-[var(--app-card)] text-[var(--app-text-light)] hover:border-[var(--app-blue)] hover:text-[var(--app-text)]'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{filter.label}</span>
                    <Badge variant="secondary" className="text-xs px-2 py-1 bg-white/50">
                      {filter.count}
                    </Badge>
                  </button>
                );
              })}
            </div>
            
            {(selectedFilters.length > 0 || query) && (
              <Button
                onClick={clearAll}
                variant="ghost"
                size="sm"
                className="text-[var(--app-text-light)] hover:text-[var(--app-text)] px-3"
              >
                Limpar
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          {query && (
            <div className="text-sm text-[var(--app-text-light)]">
              {filteredResults.length} {filteredResults.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {!query && recentSearches.length > 0 && (
            <div className="p-6">
              <h3 className="font-medium text-[var(--app-text)] mb-4 flex items-center space-x-2">
                <Clock size={16} />
                <span>Buscas Recentes</span>
              </h3>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(search)}
                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-[var(--app-light-gray)] transition-colors text-left"
                  >
                    <Search size={16} className="text-[var(--app-gray)]" />
                    <span className="text-[var(--app-text)]">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query && filteredResults.length === 0 && (
            <div className="p-12 text-center">
              <Search size={48} className="text-[var(--app-gray)] mx-auto mb-4" />
              <h3 className="font-medium text-[var(--app-text)] mb-2">Nenhum resultado encontrado</h3>
              <p className="text-sm text-[var(--app-text-light)]">
                Tente buscar por outro termo ou ajuste os filtros
              </p>
            </div>
          )}

          {query && filteredResults.length > 0 && (
            <div className="p-6 space-y-4">
              {filteredResults.map((result) => {
                const Icon = getIcon(result.type);
                const typeColor = getTypeColor(result.type);
                
                return (
                  <button
                    key={result.id}
                    onClick={() => onNavigate(result.type, result.id)}
                    className="w-full p-4 bg-[var(--app-card)] hover:bg-[var(--app-light-gray)] rounded-2xl border border-[var(--app-light-gray)] transition-all text-left group"
                  >
                    <div className="flex items-start space-x-4">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${typeColor}15` }}
                      >
                        <Icon size={20} style={{ color: typeColor }} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-[var(--app-text)] group-hover:text-[var(--app-blue)] transition-colors truncate">
                            {result.title}
                          </h4>
                          <div className="flex items-center space-x-2 ml-4">
                            {result.date && (
                              <span className="text-xs text-[var(--app-text-light)]">
                                {formatDate(result.date)}
                              </span>
                            )}
                            {result.amount && (
                              <span className="text-xs font-medium text-[var(--app-text)]">
                                R$ {result.amount.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {result.description && (
                          <p className="text-sm text-[var(--app-text-light)] mb-3 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant="secondary" 
                            className="text-xs px-2 py-1"
                            style={{ 
                              backgroundColor: `${typeColor}10`,
                              color: typeColor
                            }}
                          >
                            {result.type === 'task' ? 'Tarefa' :
                             result.type === 'habit' ? 'Hábito' :
                             result.type === 'event' ? 'Evento' :
                             result.type === 'transaction' ? 'Transação' :
                             result.type === 'note' ? 'Nota' : 'Sessão'}
                          </Badge>
                          
                          {result.status && (
                            <Badge 
                              variant="secondary"
                              className={`text-xs px-2 py-1 ${
                                result.status === 'completed' 
                                  ? 'bg-[var(--app-green)]10 text-[var(--app-green)]'
                                  : result.status === 'pending'
                                  ? 'bg-[var(--app-yellow)]10 text-[var(--app-yellow)]'
                                  : 'bg-[var(--app-gray)]10 text-[var(--app-gray)]'
                              }`}
                            >
                              {result.status === 'completed' ? 'Concluído' :
                               result.status === 'pending' ? 'Pendente' :
                               result.status === 'active' ? 'Ativo' : result.status}
                            </Badge>
                          )}
                          
                          {result.priority && (
                            <Badge 
                              variant="secondary"
                              className={`text-xs px-2 py-1 ${
                                result.priority === 'high' 
                                  ? 'bg-[var(--app-red)]10 text-[var(--app-red)]'
                                  : result.priority === 'medium'
                                  ? 'bg-[var(--app-yellow)]10 text-[var(--app-yellow)]'
                                  : 'bg-[var(--app-gray)]10 text-[var(--app-gray)]'
                              }`}
                            >
                              {result.priority === 'high' ? 'Alta' :
                               result.priority === 'medium' ? 'Média' : 'Baixa'}
                            </Badge>
                          )}
                          
                          {result.category && (
                            <Badge variant="secondary" className="text-xs px-2 py-1">
                              {result.category}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Suggestions */}
        {query && filteredResults.length > 0 && (
          <div className="p-6 border-t border-[var(--app-light-gray)] bg-[var(--app-light-gray)]">
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-purple)] rounded-2xl text-white">
              <Sparkles size={20} />
              <div className="flex-1">
                <h4 className="font-medium mb-1">Sugestão IA</h4>
                <p className="text-sm text-white/90">
                  Com base na sua busca, que tal criar um lembrete para {query}?
                </p>
              </div>
              <Button size="sm" variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                Criar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;