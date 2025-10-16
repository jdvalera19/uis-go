import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useGamification } from '../contexts/GamificationContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ActivitiesScreen: React.FC = () => {
  const { activities, completeActivity, loadActivities, isLoading } = useGamification();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadActivities();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  const handleCompleteActivity = async (activityId: string, activityTitle: string) => {
    Alert.alert(
      'Completar Actividad',
      `¿Estás seguro de que quieres completar "${activityTitle}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Completar', onPress: () => completeActivity(activityId) },
      ]
    );
  };

  const filteredActivities = activities.filter(activity => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'active') return activity.isActive;
    if (selectedFilter === 'events') return activity.type === 'event';
    if (selectedFilter === 'quiz') return activity.type === 'quiz';
    return true;
  });

  const renderActivity = (activity: any) => (
    <View key={activity.id} style={styles.activityCard}>
      <View style={styles.activityHeader}>
        <View style={styles.activityInfo}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityDescription}>{activity.description}</Text>
        </View>
        <View style={styles.activityPoints}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.pointsText}>{activity.points}</Text>
        </View>
      </View>
      
      {activity.image && (
        <Image source={{ uri: activity.image }} style={styles.activityImage} />
      )}
      
      <View style={styles.activityDetails}>
        <View style={styles.activityMeta}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.metaText}>
            {activity.startDate ? new Date(activity.startDate).toLocaleDateString() : 'Disponible ahora'}
          </Text>
        </View>
        
        {activity.location && (
          <View style={styles.activityMeta}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.metaText}>{activity.location}</Text>
          </View>
        )}
        
        {activity.maxParticipants && (
          <View style={styles.activityMeta}>
            <Ionicons name="people" size={16} color="#666" />
            <Text style={styles.metaText}>
              {activity.currentParticipants || 0}/{activity.maxParticipants} participantes
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.activityActions}>
        <TouchableOpacity
          style={[styles.actionButton, !activity.isActive && styles.actionButtonDisabled]}
          onPress={() => handleCompleteActivity(activity.id, activity.title)}
          disabled={!activity.isActive}
        >
          <Ionicons
            name={activity.isActive ? "checkmark-circle" : "lock-closed"}
            size={20}
            color={activity.isActive ? "#FFFFFF" : "#999"}
          />
          <Text style={[styles.actionText, !activity.isActive && styles.actionTextDisabled]}>
            {activity.isActive ? 'Completar' : 'No disponible'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#007AFF', '#5856D6']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Actividades</Text>
        <Text style={styles.headerSubtitle}>Completa actividades para ganar créditos</Text>
      </LinearGradient>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: 'all', label: 'Todas' },
            { key: 'active', label: 'Activas' },
            { key: 'events', label: 'Eventos' },
            { key: 'quiz', label: 'Quiz' },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter.key && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de actividades */}
      <ScrollView
        style={styles.activitiesList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {filteredActivities.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No hay actividades disponibles</Text>
            <Text style={styles.emptySubtitle}>
              Vuelve más tarde para ver nuevas actividades
            </Text>
          </View>
        ) : (
          filteredActivities.map(renderActivity)
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
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  activitiesList: {
    flex: 1,
    padding: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
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
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityInfo: {
    flex: 1,
    marginRight: 12,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  activityPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginLeft: 4,
  },
  activityImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  activityDetails: {
    marginBottom: 16,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  activityActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonDisabled: {
    backgroundColor: '#E1E1E1',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  actionTextDisabled: {
    color: '#999',
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

export default ActivitiesScreen;

