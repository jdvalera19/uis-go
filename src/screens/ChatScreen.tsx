import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { useChat } from '../contexts/ChatContext';
import { useGamification } from '../contexts/GamificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  createdAt: Date;
  image?: string;
  audio?: string;
  isTyping?: boolean;
}

const ChatScreen: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showSuggestedQuestions, setShowSuggestedQuestions] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { messages, isLoading, isTyping, sendMessage, sendVoiceMessage, speakMessage } = useChat();
  const { credits, level, earnCredits } = useGamification();

  // Preguntas sugeridas por categoría
  const suggestedQuestions = {
    university: {
      academic: [
        "Explica la mecánica cuántica en términos simples",
        "¿Cómo funciona la fotosíntesis a nivel molecular?",
        "¿Cuáles son los principios de la economía circular?",
        "Analiza las causas de la Primera Guerra Mundial"
      ],
      career: [
        "¿Qué habilidades necesito para ser ingeniero de software?",
        "¿Cómo puedo prepararme para una carrera en medicina?",
        "¿Qué opciones tengo con un título en psicología?",
        "¿Cómo es el día a día de un arquitecto?"
      ]
    },
    highschool: {
      academic: [
        "Explica la fotosíntesis paso a paso",
        "¿Cómo resolver ecuaciones cuadráticas?",
        "¿Cuáles son las partes de la célula?",
        "¿Qué es la tabla periódica?"
      ],
      career: [
        "¿Qué carreras puedo estudiar si me gusta la biología?",
        "¿Qué hace un ingeniero?",
        "¿Cómo sé qué carrera elegir?",
        "¿Qué universidades ofrecen medicina?"
      ],
      emotional: [
        "¿Cómo manejar el estrés de los exámenes?",
        "¿Qué hacer si no entiendo una materia?",
        "¿Cómo organizar mi tiempo de estudio?",
        "¿Cómo mantener la motivación?"
      ]
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const messageText = message.trim();
    setMessage('');
    setShowSuggestedQuestions(false);
    await sendMessage(messageText);
    
    // Otorgar créditos por usar el chat
    await earnCredits(5, 'Uso del chat');
  };

  const handleVoiceMessage = async () => {
    try {
      setIsRecording(true);
      await sendVoiceMessage();
    } catch (error) {
      Alert.alert('Error', 'No se pudo grabar el mensaje de voz');
    } finally {
      setIsRecording(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        await sendMessage('', result.assets[0].uri);
        setShowSuggestedQuestions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleSuggestedQuestion = async (question: string) => {
    setMessage(question);
    setShowSuggestedQuestions(false);
    await sendMessage(question);
    await earnCredits(3, 'Pregunta sugerida');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.user._id !== 'bot';
    
    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessage : styles.botMessage]}>
        {!isUser && (
          <Image
            source={{ uri: item.user.avatar || 'https://via.placeholder.com/40x40/007AFF/FFFFFF?text=CB' }}
            style={styles.avatar}
          />
        )}
        
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.messageImage} />
          )}
          
          <Text style={[styles.messageText, isUser ? styles.userText : styles.botText]}>
            {item.text}
          </Text>
          
          {item.audio && (
            <TouchableOpacity
              style={styles.audioButton}
              onPress={() => speakMessage(item.text)}
            >
              <Ionicons name="play-circle" size={24} color="#007AFF" />
            </TouchableOpacity>
          )}
          
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.botTimestamp]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {isUser && (
          <Image
            source={{ uri: item.user.avatar || 'https://via.placeholder.com/40x40/34C759/FFFFFF?text=U' }}
            style={styles.avatar}
          />
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={[styles.messageContainer, styles.botMessage]}>
      <Image
        source={{ uri: 'https://via.placeholder.com/40x40/007AFF/FFFFFF?text=CB' }}
        style={styles.avatar}
      />
      <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header con navegación */}
      <View style={styles.header}>
        <View style={styles.statusBar}>
          <Text style={styles.time}>9:41</Text>
          <View style={styles.statusIcons}>
            <Ionicons name="cellular" size={16} color="#000" />
            <Ionicons name="wifi" size={16} color="#000" />
            <Ionicons name="battery-full" size={16} color="#000" />
          </View>
        </View>
        
        <View style={styles.navigationBar}>
          <TouchableOpacity style={styles.navButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.navRight}>
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="volume-high" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <Ionicons name="arrow-forward" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Contenido principal */}
      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* Título principal */}
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Hello, Ask Me Anything...</Text>
          <Text style={styles.lastUpdate}>Last Update: 12.02.26</Text>
        </View>

        {/* Preguntas sugeridas */}
        {showSuggestedQuestions && (
          <View style={styles.suggestionsContainer}>
            {/* Ejemplos */}
            <View style={styles.suggestionGroup}>
              <View style={styles.suggestionIcon}>
                <View style={[styles.iconCircle, { borderColor: '#8B5CF6' }]}>
                  <View style={[styles.iconInner, { backgroundColor: '#8B5CF6' }]} />
                </View>
              </View>
              <View style={styles.suggestionItems}>
                <TouchableOpacity 
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestedQuestion("Explica la computación cuántica en términos simples")}
                >
                  <View style={[styles.bullet, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.suggestionText}>Explica la computación cuántica en términos simples</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestedQuestion("¿Cómo hacer una petición HTTP en Javascript?")}
                >
                  <View style={[styles.bullet, { backgroundColor: '#8B5CF6' }]} />
                  <Text style={styles.suggestionText}>¿Cómo hacer una petición HTTP en Javascript?</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Características principales */}
            <View style={styles.suggestionGroup}>
              <View style={styles.suggestionIcon}>
                <Ionicons name="cloud" size={24} color="#10B981" />
              </View>
              <View style={styles.suggestionItems}>
                <View style={styles.suggestionItem}>
                  <View style={[styles.bullet, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.suggestionText}>Recuerda lo que dijiste anteriormente</Text>
                </View>
                <View style={styles.suggestionItem}>
                  <View style={[styles.bullet, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.suggestionText}>Permite correcciones de seguimiento</Text>
                </View>
              </View>
            </View>

            {/* Limitaciones */}
            <View style={styles.suggestionGroup}>
              <View style={styles.suggestionIcon}>
                <Ionicons name="flash" size={24} color="#F59E0B" />
              </View>
              <View style={styles.suggestionItems}>
                <View style={styles.suggestionItem}>
                  <View style={[styles.bullet, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.suggestionText}>Puede generar información incorrecta ocasionalmente</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Lista de mensajes */}
        {messages.length > 0 && (
          <View style={styles.messagesContainer}>
            {messages.map((message) => renderMessage({ item: message }))}
            {isTyping && renderTypingIndicator()}
          </View>
        )}
      </ScrollView>

      {/* Input de mensaje */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.inputIcon}
            onPress={() => {}}
          >
            <Ionicons name="sparkles" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.inputIcon}
            onPress={handleImagePicker}
          >
            <Ionicons name="images" size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.inputIcon}
            onPress={handleVoiceMessage}
            disabled={isRecording}
          >
            <Ionicons
              name={isRecording ? "stop" : "mic"}
              size={20}
              color={isRecording ? "#FF3B30" : "#666"}
            />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Pregúntame cualquier cosa..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim() || isLoading}
          >
            <Ionicons name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Barra de navegación inferior */}
        <View style={styles.bottomBar} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  navRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  titleContainer: {
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  lastUpdate: {
    fontSize: 16,
    color: '#666',
  },
  suggestionsContainer: {
    marginBottom: 32,
  },
  suggestionGroup: {
    marginBottom: 24,
  },
  suggestionIcon: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  suggestionItems: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  messagesContainer: {
    marginBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: width * 0.7,
    padding: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    padding: 16,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userText: {
    color: '#FFFFFF',
  },
  botText: {
    color: '#374151',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  audioButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  userTimestamp: {
    color: '#FFFFFF',
  },
  botTimestamp: {
    color: '#666',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    padding: 8,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  bottomBar: {
    height: 4,
    backgroundColor: '#000',
    marginTop: 8,
    borderRadius: 2,
  },
});

export default ChatScreen;

