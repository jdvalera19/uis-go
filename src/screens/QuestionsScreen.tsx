import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useQuestionSystem } from '../contexts/QuestionSystemContext';
import { useGamification } from '../contexts/GamificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const QuestionsScreen: React.FC = () => {
  const {
    questions,
    currentQuestions,
    userLevel,
    creditsRequired,
    hasEnoughCredits,
    answerQuestion,
    getSuggestedQuestions,
    getQuestionsByCategory,
    checkEmotionalVariability,
    detectVocationalInterests,
    detectReinforcementAreas,
    detectExhaustionStages,
  } = useQuestionSystem();
  
  const { credits, earnCredits } = useGamification();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [vocationalInterests, setVocationalInterests] = useState<string[]>([]);
  const [reinforcementAreas, setReinforcementAreas] = useState<string[]>([]);
  const [isExhausted, setIsExhausted] = useState(false);

  useEffect(() => {
    loadUserInsights();
  }, []);

  const loadUserInsights = async () => {
    try {
      const interests = await detectVocationalInterests();
      const areas = await detectReinforcementAreas();
      const exhausted = await detectExhaustionStages();
      
      setVocationalInterests(interests);
      setReinforcementAreas(areas);
      setIsExhausted(exhausted);
    } catch (error) {
      console.error('Error loading user insights:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserInsights();
    setRefreshing(false);
  };

  const handleAnswerQuestion = async (questionId: string) => {
    Alert.prompt(
      'Responder Pregunta',
      'Escribe tu respuesta:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async (answer) => {
            if (answer && answer.trim()) {
              await answerQuestion(questionId, answer.trim());
              Alert.alert('¡Excelente!', 'Has ganado créditos por responder esta pregunta.');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const getFilteredQuestions = () => {
    if (selectedCategory === 'all') {
      return currentQuestions.filter(q => !q.isAnswered);
    }
    return getQuestionsByCategory(selectedCategory).filter(q => !q.isAnswered);
  };

  const getCategories = () => {
    if (userLevel === 'university') {
      return [
        { key: 'all', label: 'Todas', icon: 'list' },
        { key: 'academic', label: 'Académico', icon: 'book' },
        { key: 'career', label: 'Carrera', icon: 'briefcase' },
      ];
    } else {
      return [
        { key: 'all', label: 'Todas', icon: 'list' },
        { key: 'academic', label: 'Académico', icon: 'book' },
        { key: 'career', label: 'Carrera', icon: 'briefcase' },
        { key: 'emotional', label: 'Emocional', icon: 'heart' },
      ];
    }
  };

  const renderQuestion = (question: any) => (
    <View key={question.id} style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <View style={styles.questionInfo}>
          <Text style={styles.questionCategory}>
            {question.category === 'academic' ? 'Académico' :
             question.category === 'career' ? 'Carrera' :
             question.category === 'emotional' ? 'Emocional' :
             question.category === 'vocational' ? 'Vocacional' : 'Refuerzo'}
          </Text>
          <Text style={styles.questionPoints}>+{question.points} pts</Text>
        </View>
        <View style={styles.questionIcon}>
          <Ionicons
            name={question.category === 'academic' ? 'book' :
                  question.category === 'career' ? 'briefcase' :
                  question.category === 'emotional' ? 'heart' :
                  question.category === 'vocational' ? 'star' : 'trending-up'}
            size={20}
            color="#007AFF"
          />
        </View>
      </View>
      
      <Text style={styles.questionText}>{question.text}</Text>
      
      <TouchableOpacity
        style={styles.answerButton}
        onPress={() => handleAnswerQuestion(question.id)}
      >
        <Text style={styles.answerButtonText}>Responder</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInsights = () => (
    <View style={styles.insightsContainer}>
      <Text style={styles.insightsTitle}>Tu Perfil de Aprendizaje</Text>
      
      {vocationalInterests.length > 0 && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.insightTitle}>Intereses Vocacionales</Text>
          </View>
          <View style={styles.insightTags}>
            {vocationalInterests.map((interest, index) => (
              <View key={index} style={styles.insightTag}>
                <Text style={styles.insightTagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {reinforcementAreas.length > 0 && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="trending-up" size={20} color="#10B981" />
            <Text style={styles.insightTitle}>Áreas de Refuerzo</Text>
          </View>
          <View style={styles.insightTags}>
            {reinforcementAreas.map((area, index) => (
              <View key={index} style={[styles.insightTag, styles.reinforcementTag]}>
                <Text style={styles.insightTagText}>{area}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {isExhausted && (
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <Text style={styles.insightTitle}>Estado de Agotamiento</Text>
          </View>
          <Text style={styles.insightText}>
            Te recomendamos tomar un descanso y revisar tu rutina de estudio.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#007AFF', '#5856D6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Sistema de Preguntas</Text>
          <Text style={styles.headerSubtitle}>
            Créditos: {credits} / {creditsRequired} requeridos
          </Text>
        </View>
      </LinearGradient>

      {/* Estado de créditos */}
      <View style={styles.creditsContainer}>
        <View style={styles.creditsInfo}>
          <Text style={styles.creditsLabel}>Créditos para Chat</Text>
          <Text style={styles.creditsValue}>
            {credits} / {creditsRequired}
          </Text>
        </View>
        <View style={styles.creditsBar}>
          <View 
            style={[
              styles.creditsProgress, 
              { width: `${Math.min((credits / creditsRequired) * 100, 100)}%` }
            ]} 
          />
        </View>
        {!hasEnoughCredits && (
          <Text style={styles.creditsWarning}>
            Necesitas {creditsRequired - credits} créditos más para usar el chat
          </Text>
        )}
      </View>

      {/* Categorías */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {getCategories().map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Ionicons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.key ? '#FFFFFF' : '#007AFF'}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.key && styles.categoryTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Insights del usuario */}
      {renderInsights()}

      {/* Lista de preguntas */}
      <ScrollView
        style={styles.questionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {getFilteredQuestions().length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            <Text style={styles.emptyTitle}>¡Excelente trabajo!</Text>
            <Text style={styles.emptySubtitle}>
              Has respondido todas las preguntas de esta categoría
            </Text>
          </View>
        ) : (
          getFilteredQuestions().map(renderQuestion)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  creditsContainer: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  creditsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creditsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  creditsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  creditsBar: {
    height: 8,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    marginBottom: 8,
  },
  creditsProgress: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  creditsWarning: {
    fontSize: 14,
    color: '#F59E0B',
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  insightsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  insightTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  insightTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  reinforcementTag: {
    backgroundColor: '#E8F5E8',
  },
  insightTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1976D2',
  },
  insightText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  questionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionInfo: {
    flex: 1,
  },
  questionCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  questionPoints: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  questionIcon: {
    padding: 8,
    backgroundColor: '#F0F8FF',
    borderRadius: 20,
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 16,
  },
  answerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default QuestionsScreen;
