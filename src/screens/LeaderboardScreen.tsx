import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { useGamification } from '../contexts/GamificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LeaderboardScreen: React.FC = () => {
  const { leaderboard, loadLeaderboard, credits, level } = useGamification();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return { name: 'trophy', color: '#FFD700' };
      case 2:
        return { name: 'medal', color: '#C0C0C0' };
      case 3:
        return { name: 'medal', color: '#CD7F32' };
      default:
        return { name: 'person', color: '#666' };
    }
  };

  const getRankBackground = (position: number) => {
    if (position <= 3) {
      return ['#FFD700', '#FFA500'];
    }
    return ['#F8F9FA', '#E9ECEF'];
  };

  const renderLeaderboardItem = (item: any, index: number) => {
    const rankIcon = getRankIcon(item.position);
    const isCurrentUser = item.id === 'current-user'; // Esto debería venir del contexto de autenticación
    
    return (
      <View key={item.id} style={styles.leaderboardItem}>
        <View style={styles.rankContainer}>
          <View style={[styles.rankBadge, { backgroundColor: rankIcon.color }]}>
            <Ionicons name={rankIcon.name} size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.rankNumber}>#{item.position}</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.avatar || 'https://via.placeholder.com/50x50/007AFF/FFFFFF?text=U' }}
            style={styles.userAvatar}
          />
          <View style={styles.userDetails}>
            <Text style={[styles.userName, isCurrentUser && styles.currentUserText]}>
              {item.name}
            </Text>
            <Text style={styles.userLevel}>Nivel {item.level}</Text>
          </View>
        </View>
        
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsValue}>{item.points.toLocaleString()}</Text>
          <Text style={styles.pointsLabel}>puntos</Text>
        </View>
      </View>
    );
  };

  const renderCurrentUserStats = () => (
    <View style={styles.currentUserCard}>
      <LinearGradient
        colors={['#007AFF', '#5856D6']}
        style={styles.currentUserGradient}
      >
        <View style={styles.currentUserHeader}>
          <Text style={styles.currentUserTitle}>Tu Posición</Text>
          <Text style={styles.currentUserRank}>#15</Text>
        </View>
        
        <View style={styles.currentUserStats}>
          <View style={styles.currentUserStat}>
            <Text style={styles.currentUserStatValue}>{credits}</Text>
            <Text style={styles.currentUserStatLabel}>Créditos</Text>
          </View>
          <View style={styles.currentUserStat}>
            <Text style={styles.currentUserStatValue}>{level}</Text>
            <Text style={styles.currentUserStatLabel}>Nivel</Text>
          </View>
          <View style={styles.currentUserStat}>
            <Text style={styles.currentUserStatValue}>1,250</Text>
            <Text style={styles.currentUserStatLabel}>Puntos</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#007AFF', '#5856D6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Ranking</Text>
        <Text style={styles.headerSubtitle}>Los mejores estudiantes</Text>
      </LinearGradient>

      {/* Período de tiempo */}
      <View style={styles.periodContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'daily', label: 'Diario' },
            { key: 'weekly', label: 'Semanal' },
            { key: 'monthly', label: 'Mensual' },
            { key: 'all', label: 'Total' },
          ].map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period.key && styles.periodTextActive,
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Estadísticas del usuario actual */}
      {renderCurrentUserStats()}

      {/* Lista del ranking */}
      <ScrollView
        style={styles.leaderboardList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.leaderboardHeader}>
          <Text style={styles.leaderboardTitle}>Top Estudiantes</Text>
          <Text style={styles.leaderboardSubtitle}>
            {leaderboard.length} estudiantes participando
          </Text>
        </View>

        {leaderboard.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No hay datos disponibles</Text>
            <Text style={styles.emptySubtitle}>
              Completa actividades para aparecer en el ranking
            </Text>
          </View>
        ) : (
          leaderboard.map(renderLeaderboardItem)
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  periodContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  periodButtonActive: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  currentUserCard: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  currentUserGradient: {
    padding: 20,
  },
  currentUserHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentUserTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  currentUserRank: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentUserStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  currentUserStat: {
    alignItems: 'center',
  },
  currentUserStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  currentUserStatLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  leaderboardList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  leaderboardHeader: {
    marginBottom: 20,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
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
  rankContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  currentUserText: {
    color: '#007AFF',
  },
  userLevel: {
    fontSize: 14,
    color: '#666',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  pointsLabel: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default LeaderboardScreen;

