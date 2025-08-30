import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';

interface Quote {
  text: string;
  author: string;
  category: string;
}

const motivationalQuotes: Quote[] = [
  {
    text: "O sucesso não é final, o fracasso não é fatal: é a coragem de continuar que conta.",
    author: "Winston Churchill",
    category: "Perseverança"
  },
  {
    text: "A jornada de mil milhas começa com um único passo.",
    author: "Lao Tzu",
    category: "Início"
  },
  {
    text: "A melhor maneira de prever o futuro é criá-lo.",
    author: "Peter Drucker",
    category: "Ação"
  },
  {
    text: "Não espere por oportunidades, crie-as.",
    author: "George Bernard Shaw",
    category: "Oportunidade"
  },
  {
    text: "O único limite para nossa realização de amanhã são as nossas dúvidas de hoje.",
    author: "Franklin D. Roosevelt",
    category: "Confiança"
  },
  {
    text: "Grandes coisas nunca vêm de zonas de conforto.",
    author: "Desconhecido",
    category: "Crescimento"
  },
  {
    text: "O progresso é impossível sem mudança.",
    author: "George Bernard Shaw",
    category: "Mudança"
  },
  {
    text: "A disciplina é a ponte entre metas e realizações.",
    author: "Jim Rohn",
    category: "Disciplina"
  }
];

interface MotivationalQuoteProps {
  onRefresh?: () => void;
}

export default function MotivationalQuote({ onRefresh }: MotivationalQuoteProps) {
  const t = useTheme();
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  useEffect(() => {
    getRandomQuote();
  }, []);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setCurrentQuote(motivationalQuotes[randomIndex]);
    onRefresh?.();
  };

  if (!currentQuote) return null;

  return (
    <View style={[styles.container, { backgroundColor: t.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>Inspiração do Dia</Text>
        <TouchableOpacity onPress={getRandomQuote} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color={t.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.quoteContainer}>
        <Ionicons name="chatbubble-outline" size={24} color={t.primary} style={styles.quoteIcon} />
        <Text style={[styles.quoteText, { color: t.text }]}>
          "{currentQuote.text}"
        </Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.author, { color: t.textLight }]}>
          — {currentQuote.author}
        </Text>
        <View style={[styles.categoryBadge, { backgroundColor: t.primary + '20' }]}>
          <Text style={[styles.categoryText, { color: t.primary }]}>
            {currentQuote.category}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  refreshButton: {
    padding: 4,
  },
  quoteContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  quoteIcon: {
    position: 'absolute',
    top: -4,
    left: -8,
    opacity: 0.3,
  },
  quoteText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    marginLeft: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: 14,
    fontStyle: 'italic',
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
