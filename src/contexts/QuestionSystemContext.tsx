import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useGamification } from './GamificationContext';
import { useAuth } from './AuthContext';

interface Question {
  id: string;
  text: string;
  category: string;
  type: 'academic' | 'career' | 'emotional' | 'vocational' | 'reinforcement';
  level: 'university' | 'highschool';
  points: number;
  isAnswered: boolean;
  answeredAt?: string;
  emotionalVariability?: number;
}

interface QuestionSystemContextType {
  questions: Question[];
  currentQuestions: Question[];
  userLevel: 'university' | 'highschool';
  creditsRequired: number;
  hasEnoughCredits: boolean;
  answerQuestion: (questionId: string, answer: string) => Promise<void>;
  getSuggestedQuestions: () => Question[];
  getQuestionsByCategory: (category: string) => Question[];
  checkEmotionalVariability: () => Promise<void>;
  detectVocationalInterests: () => Promise<string[]>;
  detectReinforcementAreas: () => Promise<string[]>;
  detectExhaustionStages: () => Promise<boolean>;
}

const QuestionSystemContext = createContext<QuestionSystemContextType | undefined>(undefined);

export const useQuestionSystem = () => {
  const context = useContext(QuestionSystemContext);
  if (context === undefined) {
    throw new Error('useQuestionSystem must be used within a QuestionSystemProvider');
  }
  return context;
};

interface QuestionSystemProviderProps {
  children: ReactNode;
}

export const QuestionSystemProvider: React.FC<QuestionSystemProviderProps> = ({ children }) => {
  const { credits, earnCredits } = useGamification();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userLevel, setUserLevel] = useState<'university' | 'highschool'>('university');
  const [creditsRequired, setCreditsRequired] = useState(50); // Mínimo para usar el chat

  // Preguntas de ejemplo
  const sampleQuestions: Question[] = [
    // Preguntas universitarias
    {
      id: '1',
      text: '¿Cuál es tu área de estudio principal?',
      category: 'academic',
      type: 'academic',
      level: 'university',
      points: 10,
      isAnswered: false,
    },
    {
      id: '2',
      text: '¿Qué carrera te interesa más?',
      category: 'career',
      type: 'career',
      level: 'university',
      points: 15,
      isAnswered: false,
    },
    {
      id: '3',
      text: '¿Cómo te sientes con tu rendimiento académico?',
      category: 'emotional',
      type: 'emotional',
      level: 'university',
      points: 5,
      isAnswered: false,
    },
    {
      id: '4',
      text: '¿En qué materias necesitas más ayuda?',
      category: 'reinforcement',
      type: 'reinforcement',
      level: 'university',
      points: 10,
      isAnswered: false,
    },
    {
      id: '5',
      text: '¿Qué te motiva a estudiar?',
      category: 'vocational',
      type: 'vocational',
      level: 'university',
      points: 12,
      isAnswered: false,
    },
    // Preguntas de bachillerato
    {
      id: '6',
      text: '¿Cuál es tu materia favorita?',
      category: 'academic',
      type: 'academic',
      level: 'highschool',
      points: 8,
      isAnswered: false,
    },
    {
      id: '7',
      text: '¿Qué carrera te gustaría estudiar?',
      category: 'career',
      type: 'career',
      level: 'highschool',
      points: 12,
      isAnswered: false,
    },
    {
      id: '8',
      text: '¿Cómo manejas el estrés de los exámenes?',
      category: 'emotional',
      type: 'emotional',
      level: 'highschool',
      points: 6,
      isAnswered: false,
    },
    {
      id: '9',
      text: '¿En qué materias tienes más dificultades?',
      category: 'reinforcement',
      type: 'reinforcement',
      level: 'highschool',
      points: 8,
      isAnswered: false,
    },
    {
      id: '10',
      text: '¿Qué te inspira a seguir estudiando?',
      category: 'vocational',
      type: 'vocational',
      level: 'highschool',
      points: 10,
      isAnswered: false,
    },
  ];

  useEffect(() => {
    setQuestions(sampleQuestions);
    // Determinar nivel del usuario basado en su perfil
    if (user?.university) {
      setUserLevel('university');
    } else {
      setUserLevel('highschool');
    }
  }, [user]);

  const hasEnoughCredits = credits >= creditsRequired;

  const answerQuestion = async (questionId: string, answer: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    // Marcar pregunta como respondida
    const updatedQuestions = questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            isAnswered: true, 
            answeredAt: new Date().toISOString(),
            emotionalVariability: Math.random() * 10 // Simular variabilidad emocional
          }
        : q
    );
    setQuestions(updatedQuestions);

    // Otorgar créditos por responder
    await earnCredits(question.points, `Responder pregunta: ${question.text}`);

    // Guardar respuesta en el historial
    // Aquí se podría implementar lógica para guardar las respuestas
  };

  const getSuggestedQuestions = () => {
    const userQuestions = questions.filter(q => q.level === userLevel);
    const unansweredQuestions = userQuestions.filter(q => !q.isAnswered);
    
    // Retornar máximo 5 preguntas no respondidas
    return unansweredQuestions.slice(0, 5);
  };

  const getQuestionsByCategory = (category: string) => {
    return questions.filter(q => q.category === category && q.level === userLevel);
  };

  const checkEmotionalVariability = async () => {
    // Implementar lógica para medir variabilidad emocional
    // Comparar respuestas del mismo día vs días diferentes
    const today = new Date().toDateString();
    const todayQuestions = questions.filter(q => 
      q.isAnswered && 
      q.answeredAt && 
      new Date(q.answeredAt).toDateString() === today
    );
    
    // Calcular variabilidad emocional basada en las respuestas
    const variability = todayQuestions.reduce((acc, q) => 
      acc + (q.emotionalVariability || 0), 0
    ) / todayQuestions.length;
    
    return variability;
  };

  const detectVocationalInterests = async () => {
    const vocationalQuestions = getQuestionsByCategory('vocational');
    const answeredVocational = vocationalQuestions.filter(q => q.isAnswered);
    
    // Analizar respuestas para detectar intereses vocacionales
    const interests: string[] = [];
    
    // Lógica simplificada para detectar intereses
    if (answeredVocational.length > 0) {
      interests.push('Tecnología', 'Ciencias', 'Humanidades', 'Artes');
    }
    
    return interests;
  };

  const detectReinforcementAreas = async () => {
    const reinforcementQuestions = getQuestionsByCategory('reinforcement');
    const answeredReinforcement = reinforcementQuestions.filter(q => q.isAnswered);
    
    // Detectar áreas que necesitan refuerzo
    const areas: string[] = [];
    
    if (answeredReinforcement.length > 0) {
      areas.push('Matemáticas', 'Ciencias', 'Lenguaje', 'Historia');
    }
    
    return areas;
  };

  const detectExhaustionStages = async () => {
    // Detectar si el usuario está en etapas de agotamiento
    const emotionalQuestions = getQuestionsByCategory('emotional');
    const answeredEmotional = emotionalQuestions.filter(q => q.isAnswered);
    
    // Lógica para detectar agotamiento basada en respuestas emocionales
    const avgEmotionalScore = answeredEmotional.reduce((acc, q) => 
      acc + (q.emotionalVariability || 0), 0
    ) / answeredEmotional.length;
    
    // Si el promedio es bajo, podría indicar agotamiento
    return avgEmotionalScore < 3;
  };

  const value: QuestionSystemContextType = {
    questions,
    currentQuestions: questions.filter(q => q.level === userLevel),
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
  };

  return (
    <QuestionSystemContext.Provider value={value}>
      {children}
    </QuestionSystemContext.Provider>
  );
};
