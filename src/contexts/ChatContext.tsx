import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { addMessage, setMessages, setLoading, setTyping, setError } from '../store/slices/chatSlice';
import { chatAPI } from '../services/api';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

interface ChatContextType {
  messages: any[];
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;
  sendMessage: (text: string, image?: string, audio?: string) => Promise<void>;
  sendVoiceMessage: () => Promise<void>;
  stopVoiceRecording: () => Promise<void>;
  speakMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  retryMessage: (messageId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { messages, isLoading, isTyping, error } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      dispatch(setLoading(true));
      const chatHistory = await chatAPI.getChatHistory();
      dispatch(setMessages(chatHistory));
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al cargar el historial'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const sendMessage = async (text: string, image?: string, audio?: string) => {
    try {
      const userMessage = {
        id: Date.now().toString(),
        text,
        user: {
          _id: user?.id || '1',
          name: user?.name || 'Usuario',
          avatar: user?.avatar,
        },
        createdAt: new Date(),
        image,
        audio,
      };

      dispatch(addMessage(userMessage));
      dispatch(setTyping(true));

      // Verificar si el mensaje contiene solicitudes de tareas o evaluaciones
      const isHomeworkRequest = checkForHomeworkRequest(text);
      const isEvaluationRequest = checkForEvaluationRequest(text);
      
      let response;
      if (isHomeworkRequest || isEvaluationRequest) {
        response = {
          text: "No puedo hacer tareas ni evaluaciones por ti. Mi función es ayudarte a aprender y comprender los conceptos. ¿En qué tema específico te gustaría que te ayude a entender mejor?"
        };
      } else {
        response = await chatAPI.sendMessage(text, image, audio);
        
        // Agregar recomendaciones de fuentes universitarias
        const recommendations = await getUniversitySources(text);
        if (recommendations.length > 0) {
          response.text += `\n\n📚 **Fuentes recomendadas para profundizar:**\n${recommendations.map(rec => `• ${rec}`).join('\n')}`;
        }
      }
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        user: {
          _id: 'bot',
          name: 'ChatBot Estudiantil',
          avatar: 'https://via.placeholder.com/40x40/007AFF/FFFFFF?text=CB',
        },
        createdAt: new Date(),
      };

      dispatch(addMessage(botMessage));
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al enviar mensaje'));
    } finally {
      dispatch(setTyping(false));
    }
  };

  const checkForHomeworkRequest = (text: string): boolean => {
    const homeworkKeywords = [
      'haz mi tarea', 'resuelve mi tarea', 'haz mi trabajo', 'resuelve mi trabajo',
      'haz mi ensayo', 'escribe mi ensayo', 'haz mi proyecto', 'resuelve mi proyecto',
      'haz mi examen', 'resuelve mi examen', 'haz mi prueba', 'resuelve mi prueba'
    ];
    
    return homeworkKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const checkForEvaluationRequest = (text: string): boolean => {
    const evaluationKeywords = [
      'evalúa', 'califica', 'puntúa', 'califica mi', 'evalúa mi',
      'dame una nota', 'qué nota', 'cuánto me pones'
    ];
    
    return evaluationKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const getUniversitySources = async (topic: string): Promise<string[]> => {
    // Simular recomendaciones de fuentes universitarias
    const sources = [
      'Biblioteca Digital de la Universidad',
      'Repositorio Académico Institucional',
      'Base de datos científicas (JSTOR, ScienceDirect)',
      'Recursos de la biblioteca universitaria',
      'Materiales del curso en la plataforma virtual'
    ];
    
    return sources.slice(0, 3); // Retornar máximo 3 fuentes
  };

  const sendVoiceMessage = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permisos de audio no concedidos');
      }

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      
      // Aquí implementarías la lógica para grabar y enviar el audio
      // Por ahora, simularemos el envío de un mensaje de voz
      setTimeout(async () => {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        await sendMessage('Mensaje de voz', undefined, uri);
      }, 3000);
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al grabar audio'));
    }
  };

  const stopVoiceRecording = async () => {
    // Implementar lógica para detener la grabación
  };

  const speakMessage = async (text: string) => {
    try {
      await Speech.speak(text, {
        language: 'es-ES',
        pitch: 1.0,
        rate: 0.8,
      });
    } catch (error: any) {
      dispatch(setError(error.message || 'Error al reproducir audio'));
    }
  };

  const clearChat = () => {
    dispatch(setMessages([]));
  };

  const retryMessage = async (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message && message.user._id !== 'bot') {
      await sendMessage(message.text, message.image, message.audio);
    }
  };

  const value: ChatContextType = {
    messages,
    isLoading,
    isTyping,
    error,
    sendMessage,
    sendVoiceMessage,
    stopVoiceRecording,
    speakMessage,
    clearChat,
    retryMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

