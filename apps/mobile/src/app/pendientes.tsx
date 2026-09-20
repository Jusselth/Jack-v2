import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '../services/api';
import { TaskItem, useAppStore } from '../store/useAppStore';

export default function PendientesScreen() {
  const { tasks, setTasks } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setTasks(data as TaskItem[]);
    } catch (err) {
      console.warn('Error fetching tasks from Supabase:', err);
    } finally {
      setLoading(false);
    }
  }, [setTasks]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setAdding(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: newTaskTitle.trim(),
          priority: 'medium',
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTasks([data as TaskItem, ...tasks]);
        setNewTaskTitle('');
      }
    } catch (err) {
      console.error('Error adding task:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleToggleStatus = async (task: TaskItem) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq('id', task.id);

      if (error) throw error;

      setTasks(
        tasks.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
      );
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const renderTask = ({ item }: { item: TaskItem }) => {
    const isDone = item.status === 'completed';
    return (
      <TouchableOpacity
        style={[styles.taskCard, isDone && styles.taskCardDone]}
        activeOpacity={0.7}
        onPress={() => handleToggleStatus(item)}
      >
        <View style={styles.checkIcon}>
          <Text style={{ fontSize: 16 }}>{isDone ? '✅' : '⭕'}</Text>
        </View>
        <View style={styles.taskInfo}>
          <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>{item.title}</Text>
          {item.description ? (
            <Text style={styles.taskDesc}>{item.description}</Text>
          ) : null}
          <View style={styles.badgeRow}>
            <Text style={[styles.badge, getPriorityStyle(item.priority)]}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Añadir nuevo pendiente..."
          placeholderTextColor="#71717a"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAddTask}
          disabled={adding || !newTaskTitle.trim()}
        >
          {adding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addBtnText}>+</Text>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchTasks} tintColor="#3b82f6" />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No tienes tareas pendientes.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

function getPriorityStyle(priority: string) {
  switch (priority) {
    case 'urgent':
      return { backgroundColor: '#ef4444' };
    case 'high':
      return { backgroundColor: '#f97316' };
    case 'low':
      return { backgroundColor: '#10b981' };
    default:
      return { backgroundColor: '#3b82f6' };
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#27272a',
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
    gap: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  taskCardDone: {
    opacity: 0.6,
    backgroundColor: '#121214',
  },
  checkIcon: {
    marginRight: 12,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '600',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#71717a',
  },
  taskDesc: {
    color: '#a1a1aa',
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    overflow: 'hidden',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: '#71717a',
    fontSize: 15,
  },
});
