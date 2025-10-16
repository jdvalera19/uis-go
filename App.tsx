import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from 'react-query';

// Importar pantallas
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ActivitiesScreen from './src/screens/ActivitiesScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import QuestionsScreen from './src/screens/QuestionsScreen';

// Importar store
import { store } from './src/store/store';

// Importar contextos
import { AuthProvider } from './src/contexts/AuthContext';
import { ChatProvider } from './src/contexts/ChatContext';
import { GamificationProvider } from './src/contexts/GamificationContext';
import { QuestionSystemProvider } from './src/contexts/QuestionSystemContext';

const Stack = createStackNavigator();
const queryClient = new QueryClient();

// Mantener la pantalla de splash visible mientras cargamos
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Precargar fuentes
        await Font.loadAsync({
          'Roboto': require('./assets/fonts/Roboto-Regular.ttf'),
          'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
          'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ChatProvider>
            <GamificationProvider>
              <QuestionSystemProvider>
                <NavigationContainer>
                <StatusBar style="auto" />
                <Stack.Navigator
                  initialRouteName="Login"
                  screenOptions={{
                    headerStyle: {
                      backgroundColor: '#007AFF',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                      fontWeight: 'bold',
                    },
                  }}
                >
                  <Stack.Screen 
                    name="Login" 
                    component={LoginScreen} 
                    options={{ title: 'Iniciar Sesión' }}
                  />
                  <Stack.Screen 
                    name="Register" 
                    component={RegisterScreen} 
                    options={{ title: 'Registrarse' }}
                  />
                  <Stack.Screen 
                    name="Chat" 
                    component={ChatScreen} 
                    options={{ title: 'ChatBot Estudiantil' }}
                  />
                  <Stack.Screen 
                    name="Profile" 
                    component={ProfileScreen} 
                    options={{ title: 'Mi Perfil' }}
                  />
                  <Stack.Screen 
                    name="Activities" 
                    component={ActivitiesScreen} 
                    options={{ title: 'Actividades' }}
                  />
                  <Stack.Screen 
                    name="Leaderboard" 
                    component={LeaderboardScreen} 
                    options={{ title: 'Ranking' }}
                  />
                  <Stack.Screen 
                    name="Questions" 
                    component={QuestionsScreen} 
                    options={{ title: 'Sistema de Preguntas' }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
              </QuestionSystemProvider>
            </GamificationProvider>
          </ChatProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

