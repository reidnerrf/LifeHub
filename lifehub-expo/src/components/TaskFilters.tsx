import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { useTasks, Task } from '../store/tasks';

interface TaskFiltersProps {
  onFilterChange?: () => void;
}

export default function TaskFilters({ onFilterChange }: TaskFiltersProps) {
  const t = useTheme();
  const { filter, setFilter, tasks } = useTasks();
  const [showFilters, setShowFilters] = useState(false);
  const [searchText, setSearchText] = useState(filter.search || '');

  // Extrair tags únicas de todas as tarefas
  const allTags = Array.from(
    new Set(tasks.flatMap(task => task.tags))
  ).sort();

  const priorities: Task['priority'][] = ['urgent', 'high', 'medium', 'low'];
  const statuses: Task['status'][] = ['pending', 'in_progress', 'completed', 'cancelled'];

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#007AFF';
      case 'low': return '#34C759';
      default: return t.textLight;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return t.success;
      case 'in_progress': return t.warning;
      case 'cancelled': return t.error;
      default: return t.textLight;
    }
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    setFilter({ search: text });
    onFilterChange?.();
  };

  const togglePriority = (priority: Task['priority']) => {
    const newFilter = filter.priority === priority ? undefined : priority;
    setFilter({ priority: newFilter });
    onFilterChange?.();
  };

  const toggleTag = (tag: string) => {
    const currentTags = filter.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    setFilter({ tags: newTags.length > 0 ? newTags : undefined });
    onFilterChange?.();
  };

  const toggleStatus = (status: Task['status']) => {
    const newFilter = filter.status === status ? undefined : status;
    setFilter({ status: newFilter });
    onFilterChange?.();
  };

  const clearFilters = () => {
    setFilter({});
    setSearchText('');
    onFilterChange?.();
  };

  const hasActiveFilters = filter.priority || filter.tags?.length || filter.status || filter.search;

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
      <View style={[styles.searchContainer, { backgroundColor: t.card }]}>
        <Ionicons name="search" size={20} color={t.textLight} style={styles.searchIcon} />
        <TextInput
          value={searchText}
          onChangeText={handleSearch}
          placeholder="Buscar tarefas..."
          placeholderTextColor={t.textLight}
          style={[styles.searchInput, { color: t.text }]}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color={t.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros rápidos */}
      <View style={styles.quickFilters}>
        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          style={[styles.filterButton, { backgroundColor: t.card }]}
        >
          <Ionicons name="filter" size={16} color={t.text} />
          <Text style={[styles.filterButtonText, { color: t.text }]}>Filtros</Text>
          {hasActiveFilters && (
            <View style={[styles.activeIndicator, { backgroundColor: t.primary }]} />
          )}
        </TouchableOpacity>

        {/* Filtros ativos */}
        {hasActiveFilters && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activeFilters}>
            {filter.priority && (
              <View style={[styles.activeFilter, { backgroundColor: getPriorityColor(filter.priority) + '20' }]}>
                <Text style={[styles.activeFilterText, { color: getPriorityColor(filter.priority) }]}>
                  {filter.priority.toUpperCase()}
                </Text>
                <TouchableOpacity onPress={() => togglePriority(filter.priority as Task['priority'])}>
                  <Ionicons name="close" size={14} color={getPriorityColor(filter.priority)} />
                </TouchableOpacity>
              </View>
            )}

            {filter.tags?.map(tag => (
              <View key={tag} style={[styles.activeFilter, { backgroundColor: t.primary + '20' }]}>
                <Text style={[styles.activeFilterText, { color: t.primary }]}>#{tag}</Text>
                <TouchableOpacity onPress={() => toggleTag(tag)}>
                  <Ionicons name="close" size={14} color={t.primary} />
                </TouchableOpacity>
              </View>
            ))}

            {filter.status && (
              <View style={[styles.activeFilter, { backgroundColor: getStatusColor(filter.status) + '20' }]}>
                <Text style={[styles.activeFilterText, { color: getStatusColor(filter.status) }]}>
                  {filter.status.replace('_', ' ')}
                </Text>
                <TouchableOpacity onPress={() => toggleStatus(filter.status as Task['status'])}>
                  <Ionicons name="close" size={14} color={getStatusColor(filter.status)} />
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity onPress={clearFilters} style={[styles.clearButton, { backgroundColor: t.error + '20' }]}>
              <Text style={[styles.clearButtonText, { color: t.error }]}>Limpar</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* Modal de filtros avançados */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: t.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: t.text }]}>Filtros</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Ionicons name="close" size={24} color={t.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Prioridades */}
              <View style={styles.filterSection}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>Prioridade</Text>
                <View style={styles.filterOptions}>
                  {priorities.map(priority => (
                    <TouchableOpacity
                      key={priority}
                      onPress={() => togglePriority(priority)}
                      style={[
                        styles.filterOption,
                        { backgroundColor: t.card },
                        filter.priority === priority && { backgroundColor: getPriorityColor(priority) + '20' }
                      ]}
                    >
                      <Ionicons 
                        name={priority === 'urgent' ? 'flash' : priority === 'high' ? 'arrow-up' : priority === 'low' ? 'arrow-down' : 'remove'} 
                        size={16} 
                        color={getPriorityColor(priority)} 
                      />
                      <Text style={[
                        styles.filterOptionText, 
                        { color: t.text },
                        filter.priority === priority && { color: getPriorityColor(priority) }
                      ]}>
                        {priority.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Status */}
              <View style={styles.filterSection}>
                <Text style={[styles.sectionTitle, { color: t.text }]}>Status</Text>
                <View style={styles.filterOptions}>
                  {statuses.map(status => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => toggleStatus(status)}
                      style={[
                        styles.filterOption,
                        { backgroundColor: t.card },
                        filter.status === status && { backgroundColor: getStatusColor(status) + '20' }
                      ]}
                    >
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
                      <Text style={[
                        styles.filterOptionText, 
                        { color: t.text },
                        filter.status === status && { color: getStatusColor(status) }
                      ]}>
                        {status.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Tags */}
              {allTags.length > 0 && (
                <View style={styles.filterSection}>
                  <Text style={[styles.sectionTitle, { color: t.text }]}>Tags</Text>
                  <View style={styles.filterOptions}>
                    {allTags.map(tag => (
                      <TouchableOpacity
                        key={tag}
                        onPress={() => toggleTag(tag)}
                        style={[
                          styles.filterOption,
                          { backgroundColor: t.card },
                          filter.tags?.includes(tag) && { backgroundColor: t.primary + '20' }
                        ]}
                      >
                        <Text style={[
                          styles.filterOptionText, 
                          { color: t.text },
                          filter.tags?.includes(tag) && { color: t.primary }
                        ]}>
                          #{tag}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                onPress={clearFilters}
                style={[styles.clearAllButton, { backgroundColor: t.error }]}
              >
                <Text style={[styles.clearAllButtonText, { color: '#fff' }]}>Limpar Todos</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowFilters(false)}
                style={[styles.applyButton, { backgroundColor: t.primary }]}
              >
                <Text style={[styles.applyButtonText, { color: '#fff' }]}>Aplicar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  quickFilters: {
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  filterButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  clearAllButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearAllButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});