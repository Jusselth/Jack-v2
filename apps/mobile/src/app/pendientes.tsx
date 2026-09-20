import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Hexagon, HexBar, HexPill } from '../components/Hexagon';
import ParallaxDotBackground from '../components/ParallaxDotBackground';
import { useAppStore, TaskItem } from '../store/useAppStore';

const { height: SCREEN_H } = Dimensions.get('window');
const CARD_HEIGHT = Math.min(480, Math.max(400, SCREEN_H * 0.52));

type TabKey = 'universidad' | 'personal';

export default function PendientesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, toggleTaskStatus, addTask, updateTask, deleteTask } = useAppStore();

  const [tab, setTab] = useState<TabKey>('universidad');

  // Modal State for Create / Edit Task
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [formCategory, setFormCategory] = useState<'universidad' | 'personal'>('universidad');
  const [formDueDate, setFormDueDate] = useState('Hoy');
  const [formDueTime, setFormDueTime] = useState('23:59 hrs');
  const [formAssignedTo, setFormAssignedTo] = useState('');

  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 5,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const headerTop = Math.max(insets.top + 8, 18);
  const bottomNavBottom = Math.max(insets.bottom + 10, 18);
  const isUni = tab === 'universidad';

  // Filter tasks dynamically from store
  const filteredTasks = tasks.filter((t) => (t.category || 'universidad') === tab);
  const uniCount = tasks.filter((t) => (t.category || 'universidad') === 'universidad').length;
  const perCount = tasks.filter((t) => t.category === 'personal').length;

  const openCreateModal = () => {
    setEditingTaskId(null);
    setFormTitle('');
    setFormSubject(isUni ? 'Académico' : 'Personal');
    setFormDescription('');
    setFormPriority('medium');
    setFormCategory(tab);
    setFormDueDate('Hoy');
    setFormDueTime('23:59 hrs');
    setFormAssignedTo('');
    setModalVisible(true);
  };

  const openEditModal = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setFormTitle(task.title);
    setFormSubject(task.subject || '');
    setFormDescription(task.description || '');
    setFormPriority(task.priority || 'medium');
    setFormCategory(task.category || 'universidad');
    setFormDueDate(task.due_date || 'Hoy');
    setFormDueTime(task.due_time || '23:59 hrs');
    setFormAssignedTo(task.assigned_to || '');
    setModalVisible(true);
  };

  const handleSaveTask = () => {
    if (!formTitle.trim()) return;

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: formTitle.trim(),
        subject: formSubject.trim() || (formCategory === 'universidad' ? 'Académico' : 'Personal'),
        description: formDescription.trim(),
        priority: formPriority,
        category: formCategory,
        due_date: formDueDate.trim() || 'Hoy',
        due_time: formDueTime.trim() || '23:59 hrs',
        assigned_to: formAssignedTo.trim() || 'Tú',
      });
    } else {
      addTask({
        title: formTitle.trim(),
        subject: formSubject.trim() || (formCategory === 'universidad' ? 'Académico' : 'Personal'),
        description: formDescription.trim() || 'Tarea agregada al gestor Jack.',
        priority: formPriority,
        status: 'pending',
        category: formCategory,
        due_date: formDueDate.trim() || 'Hoy',
        due_time: formDueTime.trim() || '23:59 hrs',
        assigned_to: formAssignedTo.trim() || 'Tú',
        progress: 0.1,
      });
    }

    setModalVisible(false);
  };

  const handleDeleteTask = () => {
    if (editingTaskId) {
      deleteTask(editingTaskId);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" translucent />
      <ParallaxDotBackground />

      {/* Ambient Glow */}
      <View
        pointerEvents="none"
        style={[
          styles.ambientGlow,
          {
            backgroundColor: isUni
              ? 'rgba(51, 116, 24, 0.12)'
              : 'rgba(93, 214, 44, 0.12)',
          },
        ]}
      />

      {/* ── FLOATING HEADER ── */}
      <View style={[styles.floatingHeaderWrap, { top: headerTop }]}>
        <HexBar
          height={62}
          fill="rgba(32, 32, 32, 0.95)"
          stroke="rgba(93, 214, 44, 0.4)"
          contentStyle={styles.floatingHeaderContent}
        >
          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
            <MaterialIcons name="menu" size={24} color="#f8f8f8" />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>JACK</Text>
          </View>

          <View style={styles.headerRightGroup}>
            <View style={styles.latencyBadge}>
              <Text style={styles.latencyText}>12 ms</Text>
              <MaterialCommunityIcons name="wifi" size={15} color="#5DD62C" style={styles.wifiIcon} />
            </View>
            <Hexagon size={34} fill="#337418" stroke="#5DD62C" strokeWidth={1.5}>
              <Text style={styles.headerAvatarLetter}>J</Text>
            </Hexagon>
          </View>
        </HexBar>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsWrap, { paddingTop: headerTop + 62 + 12 }]}>
        <View style={styles.tabsTrack}>
          <TouchableOpacity
            style={[styles.tabBtn, isUni && styles.tabBtnActive]}
            activeOpacity={0.85}
            onPress={() => setTab('universidad')}
          >
            <Hexagon
              size={isUni ? 10 : 8}
              fill={isUni ? '#5DD62C' : 'rgba(93, 214, 44, 0.55)'}
            />
            <Text style={[styles.tabLabel, isUni && styles.tabLabelActive]}>Universidad</Text>
            <HexPill
              fill={isUni ? 'rgba(93, 214, 44, 0.25)' : '#202020'}
              height={18}
              paddingHorizontal={6}
            >
              <Text style={[styles.tabCountText, isUni && { color: '#5DD62C' }]}>{uniCount}</Text>
            </HexPill>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, !isUni && styles.tabBtnActive]}
            activeOpacity={0.85}
            onPress={() => setTab('personal')}
          >
            <Hexagon
              size={!isUni ? 10 : 8}
              fill={!isUni ? '#5DD62C' : 'rgba(93, 214, 44, 0.55)'}
            />
            <Text style={[styles.tabLabel, !isUni && styles.tabLabelActive]}>Personal</Text>
            <HexPill
              fill={!isUni ? 'rgba(93, 214, 44, 0.25)' : '#202020'}
              height={18}
              paddingHorizontal={6}
            >
              <Text style={[styles.tabCountText, !isUni && { color: '#5DD62C' }]}>{perCount}</Text>
            </HexPill>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Add Button Bar */}
      <View style={styles.addBarRow}>
        <TouchableOpacity
          style={styles.openAddBtn}
          activeOpacity={0.8}
          onPress={openCreateModal}
        >
          <MaterialIcons name="add" size={20} color="#5DD62C" />
          <Text style={styles.openAddText}>+ Nueva Tarea ({isUni ? 'Universidad' : 'Personal'})</Text>
        </TouchableOpacity>
      </View>

      {/* Scroll hint */}
      {filteredTasks.length > 0 && (
        <View style={styles.hintRow}>
          <Text style={styles.hintText}>Toca cualquier tarjeta para editarla</Text>
          <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
            <MaterialIcons name="south" size={14} color="#5DD62C" />
          </Animated.View>
        </View>
      )}

      {/* Dynamic Task Stack from useAppStore */}
      <ScrollView
        style={styles.taskScroll}
        contentContainerStyle={[
          styles.taskScrollContent,
          { paddingBottom: bottomNavBottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Hexagon size={64} fill="#202020" stroke="rgba(93, 214, 44, 0.4)">
              <MaterialIcons name="checklist" size={32} color="#5DD62C" />
            </Hexagon>
            <Text style={styles.emptyTitle}>No hay tareas pendientes</Text>
            <Text style={styles.emptySubtitle}>
              Todas tus tareas en {isUni ? 'Universidad' : 'Personal'} están al día. Toca "+ Nueva Tarea" para crear una.
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const progressVal = task.progress ?? (isCompleted ? 1 : 0.3);

            return (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  isCompleted && styles.taskCardCompleted,
                ]}
                activeOpacity={0.92}
                onPress={() => openEditModal(task)}
              >
                <View style={styles.cardGlowTop} />

                {/* Header */}
                <View>
                  <View style={styles.taskHeaderRow}>
                    <HexPill
                      fill="#202020"
                      stroke="rgba(93, 214, 44, 0.6)"
                      height={26}
                      paddingHorizontal={10}
                      style={{ flexShrink: 1, maxWidth: '72%' }}
                    >
                      <Hexagon size={8} fill="#5DD62C" />
                      <Text style={styles.subjectText} numberOfLines={1}>
                        {task.subject || 'GENERAL'}
                      </Text>
                    </HexPill>
                    <HexPill
                      fill={isCompleted ? 'rgba(51, 116, 24, 0.4)' : '#202020'}
                      stroke={isCompleted ? '#5DD62C' : 'rgba(93, 214, 44, 0.5)'}
                      height={24}
                      paddingHorizontal={10}
                    >
                      <Text style={[styles.statusText, isCompleted && { color: '#5DD62C' }]}>
                        {isCompleted ? 'COMPLETADA' : task.priority.toUpperCase()}
                      </Text>
                    </HexPill>
                  </View>

                  <Text style={[styles.taskTitle, isCompleted && styles.textCompleted]}>
                    {task.title}
                  </Text>
                  {task.description ? (
                    <Text style={styles.taskDescription} numberOfLines={3}>
                      {task.description}
                    </Text>
                  ) : null}
                </View>

                {/* Meta module */}
                <View style={styles.metaModule}>
                  <View style={styles.remainingRow}>
                    <View style={styles.remainingLeft}>
                      <MaterialIcons name="schedule" size={16} color="#5DD62C" />
                      <Text style={styles.remainingLabel}>Límite de Entrega:</Text>
                    </View>
                    <HexPill
                      fill="#202020"
                      stroke="rgba(93, 214, 44, 0.5)"
                      height={26}
                      paddingHorizontal={10}
                    >
                      <Text style={styles.remainingValue}>
                        {task.due_date || 'Hoy'} • {task.due_time || '23:59'}
                      </Text>
                    </HexPill>
                  </View>

                  {/* Progress Bar */}
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.round(progressVal * 100)}%`,
                          backgroundColor: isCompleted ? '#10b981' : '#5DD62C',
                        },
                      ]}
                    />
                  </View>

                  <View style={styles.metaGrid}>
                    <View style={styles.metaCell}>
                      <Text style={styles.metaLabel}>Responsable</Text>
                      <Text style={styles.metaValue}>{task.assigned_to || 'Tú'}</Text>
                    </View>
                    <View style={styles.metaCell}>
                      <Text style={styles.metaLabel}>Estado</Text>
                      <Text style={styles.metaValueMono}>
                        {isCompleted ? '100% Listo' : `${Math.round(progressVal * 100)}% Avance`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action button */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.primaryAction,
                      isCompleted ? styles.actionCompleted : styles.actionPending,
                    ]}
                    activeOpacity={0.85}
                    onPress={(e) => {
                      e.stopPropagation();
                      toggleTaskStatus(task.id);
                    }}
                  >
                    <MaterialIcons
                      name={isCompleted ? 'check-circle' : 'radio-button-unchecked'}
                      size={18}
                      color={isCompleted ? '#5DD62C' : '#0f0f0f'}
                    />
                    <Text
                      style={[
                        styles.primaryActionText,
                        isCompleted ? { color: '#5DD62C' } : { color: '#0f0f0f' },
                      ]}
                    >
                      {isCompleted ? 'Reabrir Tarea' : 'Marcar Entregada'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editCardBtn}
                    activeOpacity={0.8}
                    onPress={() => openEditModal(task)}
                  >
                    <MaterialIcons name="edit" size={18} color="#5DD62C" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ── TASK CREATION / EDIT MODAL ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingTaskId ? 'EDITAR PENDIENTE' : 'NUEVO PENDIENTE'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <MaterialIcons name="close" size={22} color="#f8f8f8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalFormContent}>
              {/* Category selector */}
              <Text style={styles.inputLabel}>CATEGORÍA</Text>
              <View style={styles.categoryPillsRow}>
                <TouchableOpacity
                  style={[styles.categoryPill, formCategory === 'universidad' && styles.categoryPillActive]}
                  onPress={() => setFormCategory('universidad')}
                >
                  <MaterialIcons name="school" size={16} color={formCategory === 'universidad' ? '#0f0f0f' : '#5DD62C'} />
                  <Text style={[styles.categoryPillText, formCategory === 'universidad' && styles.categoryPillTextActive]}>
                    Universidad
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.categoryPill, formCategory === 'personal' && styles.categoryPillActive]}
                  onPress={() => setFormCategory('personal')}
                >
                  <MaterialIcons name="person" size={16} color={formCategory === 'personal' ? '#0f0f0f' : '#5DD62C'} />
                  <Text style={[styles.categoryPillText, formCategory === 'personal' && styles.categoryPillTextActive]}>
                    Personal
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Title */}
              <Text style={styles.inputLabel}>TÍTULO DE LA TAREA *</Text>
              <TextInput
                style={styles.textInputField}
                placeholder="Ej. Entregar proyecto de Inteligencia Artificial..."
                placeholderTextColor="#71717a"
                value={formTitle}
                onChangeText={setFormTitle}
              />

              {/* Subject */}
              <Text style={styles.inputLabel}>ASIGNATURA O TÓPICO</Text>
              <TextInput
                style={styles.textInputField}
                placeholder="Ej. Redes de Computadores / Finanzas"
                placeholderTextColor="#71717a"
                value={formSubject}
                onChangeText={setFormSubject}
              />

              {/* Description */}
              <Text style={styles.inputLabel}>DESCRIPCIÓN DETALLADA</Text>
              <TextInput
                style={[styles.textInputField, styles.textAreaField]}
                placeholder="Escribe las especificaciones o notas clave..."
                placeholderTextColor="#71717a"
                value={formDescription}
                onChangeText={setFormDescription}
                multiline
                numberOfLines={3}
              />

              {/* Priority */}
              <Text style={styles.inputLabel}>PRIORIDAD</Text>
              <View style={styles.priorityRow}>
                {(['low', 'medium', 'high', 'urgent'] as const).map((p) => {
                  const labels = { low: 'Baja', medium: 'Media', high: 'Alta', urgent: 'Urgente' };
                  const isSelected = formPriority === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.priorityPill, isSelected && styles.priorityPillActive]}
                      onPress={() => setFormPriority(p)}
                    >
                      <Text style={[styles.priorityText, isSelected && styles.priorityTextActive]}>
                        {labels[p]}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Date & Time */}
              <View style={styles.dateTimeGrid}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>FECHA</Text>
                  <TextInput
                    style={styles.textInputField}
                    placeholder="Hoy / 28 Oct"
                    placeholderTextColor="#71717a"
                    value={formDueDate}
                    onChangeText={setFormDueDate}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>HORA</Text>
                  <TextInput
                    style={styles.textInputField}
                    placeholder="23:59 hrs"
                    placeholderTextColor="#71717a"
                    value={formDueTime}
                    onChangeText={setFormDueTime}
                  />
                </View>
              </View>

              {/* Assigned To */}
              <Text style={styles.inputLabel}>RESPONSABLE / PROFESOR</Text>
              <TextInput
                style={styles.textInputField}
                placeholder="Ej. Ing. Carlos / En solitario"
                placeholderTextColor="#71717a"
                value={formAssignedTo}
                onChangeText={setFormAssignedTo}
              />

              {/* Buttons */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity style={styles.modalSaveBtn} activeOpacity={0.85} onPress={handleSaveTask}>
                  <MaterialIcons name="check" size={20} color="#0f0f0f" />
                  <Text style={styles.modalSaveText}>{editingTaskId ? 'GUARDAR CAMBIOS' : 'CREAR PENDIENTE'}</Text>
                </TouchableOpacity>

                {editingTaskId && (
                  <TouchableOpacity style={styles.modalDeleteBtn} activeOpacity={0.85} onPress={handleDeleteTask}>
                    <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                    <Text style={styles.modalDeleteText}>ELIMINAR</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── FLOATING BOTTOM DOCK ── */}
      <View style={[styles.bottomDockWrap, { bottom: bottomNavBottom }]}>
        <HexBar
          height={80}
          fill="rgba(32, 32, 32, 0.95)"
          stroke="rgba(93, 214, 44, 0.4)"
          contentStyle={styles.bottomDockContent}
        >
          <View style={styles.navItemActiveWrap}>
            <View style={styles.navActiveWrap}>
              <Hexagon
                size={52}
                fill="#337418"
                stroke="rgba(93, 214, 44, 0.7)"
                strokeWidth={1.5}
                style={{
                  shadowColor: '#5DD62C',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.45,
                  shadowRadius: 12,
                  elevation: 8,
                }}
              >
                <MaterialIcons name="checklist" size={22} color="#f8f8f8" />
              </Hexagon>
              <View style={styles.navBadgePos}>
                <Hexagon size={18} fill="#5DD62C">
                  <Text style={styles.navBadgeText}>{tasks.length}</Text>
                </Hexagon>
              </View>
            </View>
            <Text style={styles.navLabelActive}>PENDIENTES</Text>
          </View>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.75}
            onPress={() => router.replace('/')}
          >
            <Hexagon size={42} fill="#202020" stroke="rgba(93, 214, 44, 0.4)">
              <MaterialIcons name="graphic-eq" size={20} color="#5DD62C" />
            </Hexagon>
            <Text style={styles.navLabel}>ASISTENTE</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.75}
            onPress={() => router.replace('/cuentas')}
          >
            <Hexagon size={42} fill="#202020" stroke="rgba(93, 214, 44, 0.4)">
              <MaterialIcons name="account-balance-wallet" size={20} color="#5DD62C" />
            </Hexagon>
            <Text style={styles.navLabel}>CUENTAS</Text>
          </TouchableOpacity>
        </HexBar>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    overflow: 'hidden',
  },
  ambientGlow: {
    ...StyleSheet.absoluteFill,
    opacity: 0.9,
    zIndex: 0,
  },
  floatingHeaderWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  floatingHeaderContent: { justifyContent: 'space-between' },
  menuButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: 'Demonized',
    fontSize: 22,
    fontWeight: '700',
    color: '#f8f8f8',
    letterSpacing: 1.5,
  },
  headerAvatarLetter: {
    fontSize: 16,
    fontWeight: '900',
    color: '#5DD62C',
    fontFamily: 'Demonized',
  },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  latencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  latencyText: {
    fontFamily: 'Demonized',
    fontSize: 11,
    fontWeight: '600',
    color: '#5DD62C',
    letterSpacing: -0.3,
  },
  wifiIcon: { shadowColor: '#5DD62C', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.9, shadowRadius: 6 },

  tabsWrap: {
    zIndex: 20,
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  tabsTrack: {
    backgroundColor: 'rgba(32, 32, 32, 0.95)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    padding: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(51, 116, 24, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.6)',
  },
  tabLabel: {
    fontFamily: 'Demonized',
    fontSize: 11,
    fontWeight: '600',
    color: '#f8f8f8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    color: '#5DD62C',
    fontWeight: '700',
  },
  tabCountText: {
    fontFamily: 'Demonized',
    fontSize: 10,
    fontWeight: '700',
    color: '#f8f8f8',
  },

  addBarRow: {
    zIndex: 20,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  openAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: '#5DD62C',
    borderRadius: 12,
    paddingVertical: 10,
    shadowColor: '#5DD62C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  openAddText: {
    fontFamily: 'Demonized',
    fontSize: 11,
    color: '#5DD62C',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },

  hintRow: {
    zIndex: 20,
    paddingHorizontal: 20,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hintText: {
    fontFamily: 'Demonized',
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(93, 214, 44, 0.85)',
  },

  taskScroll: {
    flex: 1,
    zIndex: 10,
  },
  taskScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 16,
  },

  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(32, 32, 32, 0.95)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    padding: 32,
    marginTop: 30,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: 'Demonized',
    fontSize: 16,
    fontWeight: '700',
    color: '#5DD62C',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#a1a1aa',
    textAlign: 'center',
    lineHeight: 18,
  },

  taskCard: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: 'rgba(32, 32, 32, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.5)',
    padding: 18,
    gap: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
  taskCardCompleted: {
    opacity: 0.65,
    borderColor: 'rgba(93, 214, 44, 0.25)',
  },
  cardGlowTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 176,
    height: 176,
    borderRadius: 88,
    backgroundColor: 'rgba(93, 214, 44, 0.15)',
  },
  taskHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  subjectText: {
    fontFamily: 'Demonized',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#5DD62C',
  },
  statusText: {
    fontFamily: 'Demonized',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#f8f8f8',
  },
  taskTitle: {
    fontFamily: 'Demonized',
    fontSize: 17,
    fontWeight: '700',
    color: '#f8f8f8',
    lineHeight: 22,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: '#a1a1aa',
  },
  taskDescription: {
    fontSize: 12,
    color: '#f8f8f8',
    lineHeight: 18,
  },
  metaModule: {
    backgroundColor: '#202020',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    padding: 12,
    gap: 8,
  },
  remainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  remainingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  remainingLabel: {
    fontSize: 11,
    color: '#f8f8f8',
  },
  remainingValue: {
    fontFamily: 'Demonized',
    fontSize: 11,
    fontWeight: '700',
    color: '#5DD62C',
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metaCell: {
    flex: 1,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.25)',
  },
  metaLabel: {
    fontFamily: 'Demonized',
    fontSize: 8,
    color: '#5DD62C',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f8f8f8',
  },
  metaValueMono: {
    fontFamily: 'Demonized',
    fontSize: 10,
    fontWeight: '700',
    color: '#5DD62C',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 2,
  },
  primaryAction: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionPending: {
    backgroundColor: '#5DD62C',
    borderColor: '#5DD62C',
  },
  actionCompleted: {
    backgroundColor: '#202020',
    borderColor: '#5DD62C',
  },
  primaryActionText: {
    fontFamily: 'Demonized',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  editCardBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: 'rgba(28, 28, 28, 0.98)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#5DD62C',
    padding: 20,
    shadowColor: '#5DD62C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(93, 214, 44, 0.25)',
  },
  modalTitle: {
    fontFamily: 'Demonized',
    fontSize: 16,
    fontWeight: '700',
    color: '#5DD62C',
    letterSpacing: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalFormContent: {
    paddingVertical: 12,
    gap: 8,
  },
  inputLabel: {
    fontFamily: 'Demonized',
    fontSize: 10,
    fontWeight: '700',
    color: '#5DD62C',
    letterSpacing: 0.6,
    marginTop: 6,
  },
  textInputField: {
    backgroundColor: '#181818',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#f8f8f8',
    fontSize: 13,
  },
  textAreaField: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  categoryPillsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    borderRadius: 10,
    paddingVertical: 8,
  },
  categoryPillActive: {
    backgroundColor: '#5DD62C',
    borderColor: '#5DD62C',
  },
  categoryPillText: {
    fontFamily: 'Demonized',
    fontSize: 11,
    fontWeight: '700',
    color: '#5DD62C',
  },
  categoryPillTextActive: {
    color: '#0f0f0f',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 6,
  },
  priorityPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    borderRadius: 8,
    paddingVertical: 6,
  },
  priorityPillActive: {
    backgroundColor: 'rgba(93, 214, 44, 0.3)',
    borderColor: '#5DD62C',
  },
  priorityText: {
    fontFamily: 'Demonized',
    fontSize: 9,
    fontWeight: '700',
    color: '#f8f8f8',
  },
  priorityTextActive: {
    color: '#5DD62C',
  },
  dateTimeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  modalActionRow: {
    marginTop: 14,
    gap: 8,
  },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#5DD62C',
    borderRadius: 12,
    paddingVertical: 12,
  },
  modalSaveText: {
    fontFamily: 'Demonized',
    fontSize: 12,
    fontWeight: '700',
    color: '#0f0f0f',
    letterSpacing: 0.8,
  },
  modalDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 10,
  },
  modalDeleteText: {
    fontFamily: 'Demonized',
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 0.8,
  },

  // BOTTOM DOCK
  bottomDockWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 50,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 14,
  },
  bottomDockContent: { justifyContent: 'space-around' },
  navItem: { alignItems: 'center', justifyContent: 'center', minWidth: 64, gap: 3 },
  navItemActiveWrap: { alignItems: 'center', minWidth: 64, marginTop: -24 },
  navActiveWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  navBadgePos: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  navBadgeText: {
    fontFamily: 'Demonized',
    fontSize: 8,
    fontWeight: '900',
    color: '#0f0f0f',
  },
  navLabel: {
    fontFamily: 'Demonized',
    fontSize: 9,
    fontWeight: '700',
    color: '#5DD62C',
    letterSpacing: 0.8,
  },
  navLabelActive: {
    fontFamily: 'Demonized',
    fontSize: 9,
    fontWeight: '700',
    color: '#f8f8f8',
    letterSpacing: 1,
    marginTop: 2,
  },
});
