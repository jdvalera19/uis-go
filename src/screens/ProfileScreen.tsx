import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../contexts/GamificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { credits, level, experience, points, achievements } = useGamification();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Próximamente', 'La edición de perfil estará disponible en la próxima versión');
  };

  const handleChangePassword = () => {
    Alert.alert('Próximamente', 'El cambio de contraseña estará disponible en la próxima versión');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => {} },
      ]
    );
  };

  const experienceToNextLevel = 100 - (experience % 100);
  const progressPercentage = (experience % 100) / 100;

  return (
    <ScrollView style={styles.container}>
      {/* Header con información del usuario */}
      <LinearGradient
        colors={['#007AFF', '#5856D6']}
        style={styles.header}
      >
        <View style={styles.profileInfo}>
          <Image
            source={{ uri: user?.avatar || 'https://via.placeholder.com/100x100/007AFF/FFFFFF?text=U' }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.email}>{user?.email || 'usuario@email.com'}</Text>
        </View>
      </LinearGradient>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{credits}</Text>
          <Text style={styles.statLabel}>Créditos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{level}</Text>
          <Text style={styles.statLabel}>Nivel</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>Puntos</Text>
        </View>
      </View>

      {/* Barra de progreso de nivel */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>
          Progreso al nivel {level + 1}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {experienceToNextLevel} XP para el siguiente nivel
        </Text>
      </View>

      {/* Logros recientes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Logros Recientes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {achievements.slice(0, 5).map((achievement) => (
            <View key={achievement.id} style={styles.achievementCard}>
              <Ionicons
                name={achievement.isUnlocked ? "trophy" : "trophy-outline"}
                size={32}
                color={achievement.isUnlocked ? "#FFD700" : "#CCC"}
              />
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementPoints}>+{achievement.points} pts</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Configuración */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications" size={24} color="#007AFF" />
            <Text style={styles.settingLabel}>Notificaciones</Text>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#E1E1E1', true: '#007AFF' }}
            thumbColor={notifications ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="moon" size={24} color="#007AFF" />
            <Text style={styles.settingLabel}>Modo Oscuro</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#E1E1E1', true: '#007AFF' }}
            thumbColor={darkMode ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="mic" size={24} color="#007AFF" />
            <Text style={styles.settingLabel}>Voz Habilitada</Text>
          </View>
          <Switch
            value={voiceEnabled}
            onValueChange={setVoiceEnabled}
            trackColor={{ false: '#E1E1E1', true: '#007AFF' }}
            thumbColor={voiceEnabled ? '#FFFFFF' : '#FFFFFF'}
          />
        </View>
      </View>

      {/* Acciones */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        
        <TouchableOpacity style={styles.actionItem} onPress={handleEditProfile}>
          <View style={styles.actionInfo}>
            <Ionicons name="person" size={24} color="#007AFF" />
            <Text style={styles.actionLabel}>Editar Perfil</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionItem} 
          onPress={() => navigation.navigate('Questions' as never)}
        >
          <View style={styles.actionInfo}>
            <Ionicons name="help-circle" size={24} color="#007AFF" />
            <Text style={styles.actionLabel}>Sistema de Preguntas</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleChangePassword}>
          <View style={styles.actionInfo}>
            <Ionicons name="lock-closed" size={24} color="#007AFF" />
            <Text style={styles.actionLabel}>Cambiar Contraseña</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
          <View style={styles.actionInfo}>
            <Ionicons name="log-out" size={24} color="#FF3B30" />
            <Text style={[styles.actionLabel, styles.dangerText]}>Cerrar Sesión</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem} onPress={handleDeleteAccount}>
          <View style={styles.actionInfo}>
            <Ionicons name="trash" size={24} color="#FF3B30" />
            <Text style={[styles.actionLabel, styles.dangerText]}>Eliminar Cuenta</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
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
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E1E1E1',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    padding: 20,
    paddingBottom: 10,
  },
  achievementCard: {
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    minWidth: 100,
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  achievementPoints: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  dangerText: {
    color: '#FF3B30',
  },
});

export default ProfileScreen;

