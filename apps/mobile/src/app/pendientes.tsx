import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
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
import { useAppStore, TaskItem as StoreTaskItem } from '../store/useAppStore';

const { height: SCREEN_H } = Dimensions.get('window');
const CARD_HEIGHT = Math.min(500, Math.max(430, SCREEN_H * 0.55));

type TabKey = 'universidad' | 'personal';

export default function PendientesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { tasks, toggleTaskStatus, addTask } = useAppStore();

  const [tab, setTab] = useState<TabKey>('universidad');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');

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

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    addTask({
      subject: newSubject.trim() || (isUni ? 'Académico' : 'Personal'),
      title: newTitle.trim(),
      description: 'Tarea agregada al gestor de optimización Jack.',
      priority: 'medium',
      status: 'pending',
      due_date: 'Hoy',
      due_time: '23:59 hrs',
      category: tab,
      progress: 0.1,
    });
    setNewTitle('');
    setNewSubject('');
    setShowAddModal(false);
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
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#5DD62C', fontFamily: 'Demonized' }}>J</Text>
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

      {/* Quick Add Bar */}
      <View style={styles.addBarRow}>
        {showAddModal ? (
          <View style={styles.addInputContainer}>
            <TextInput
              style={styles.addInput}
              placeholder="Asignatura / Categoría..."
              placeholderTextColor="#71717a"
              value={newSubject}
              onChangeText={setNewSubject}
            />
            <TextInput
              style={[styles.addInput, { flex: 2 }]}
              placeholder="Título de la tarea..."
              placeholderTextColor="#71717a"
              value={newTitle}
              onChangeText={setNewTitle}
              onSubmitEditing={handleCreateTask}
            />
            <TouchableOpacity style={styles.confirmAddBtn} onPress={handleCreateTask}>
              <MaterialIcons name="check" size={18} color="#0f0f0f" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelAddBtn} onPress={() => setShowAddModal(false)}>
              <MaterialIcons name="close" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.openAddBtn}
            activeOpacity={0.8}
            onPress={() => setShowAddModal(true)}
          >
            <MaterialIcons name="add" size={18} color="#5DD62C" />
            <Text style={styles.openAddText}>Nueva Tarea {isUni ? 'Universitaria' : 'Personal'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Scroll hint */}
      {filteredTasks.length > 0 && (
        <View style={styles.hintRow}>
          <Text style={styles.hintText}>Desliza abajo</Text>
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
          { paddingBottom: bottomNavBottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        snapToInterval={CARD_HEIGHT + 24}
        decelerationRate="fast"
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Hexagon size={64} fill="#202020" stroke="rgba(93, 214, 44, 0.4)">
              <MaterialIcons name="checklist" size={32} color="#5DD62C" />
            </Hexagon>
            <Text style={styles.emptyTitle}>No hay tareas pendientes</Text>
            <Text style={styles.emptySubtitle}>
              Todas tus tareas en {isUni ? 'Universidad' : 'Personal'} están al día. Toca "Nueva Tarea" o pídele a Jack por voz.
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const progressVal = task.progress ?? (isCompleted ? 1 : 0.3);

            return (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  { height: CARD_HEIGHT },
                  isCompleted && styles.taskCardCompleted,
                ]}
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
                      <Text style={styles.remainingLabel}>Tiempo Límite:</Text>
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
                    onPress={() => toggleTaskStatus(task.id)}
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
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ── FLOATING BOTTOM DOCK (Using router.replace for clean tab navigation) ── */}
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
            <Text style={styles.navLabelActive}>Pendientes</Text>
          </View>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.75}
            onPress={() => router.replace('/')}
          >
            <Hexagon size={42} fill="#202020" stroke="rgba(93, 214, 44, 0.4)">
              <MaterialIcons name="graphic-eq" size={20} color="#5DD62C" />
            </Hexagon>
            <Text style={styles.navLabel}>Asistente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.75}
            onPress={() => router.replace('/cuentas')}
          >
            <Hexagon size={42} fill="#202020" stroke="rgba(93, 214, 44, 0.4)">
              <MaterialIcons name="account-balance-wallet" size={20} color="#5DD62C" />
            </Hexagon>
            <Text style={styles.navLabel}>Cuentas</Text>
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
    gap: 6,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    borderRadius: 12,
    paddingVertical: 8,
  },
  openAddText: {
    fontFamily: 'Demonized',
    fontSize: 11,
    color: '#5DD62C',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  addInputContainer: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  addInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: '#5DD62C',
    borderRadius: 8,
    paddingHorizontal: 8,
    color: '#f8f8f8',
    fontSize: 12,
  },
  confirmAddBtn: {
    backgroundColor: '#5DD62C',
    padding: 8,
    borderRadius: 8,
  },
  cancelAddBtn: {
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 8,
    borderRadius: 8,
  },

  hintRow: {
    zIndex: 20,
    paddingHorizontal: 20,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintText: {
    fontFamily: 'Demonized',
    fontSize: 11,
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
    gap: 20,
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
    borderRadius: 24,
    backgroundColor: 'rgba(32, 32, 32, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.5)',
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
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
    marginBottom: 10,
    gap: 8,
  },
  subjectText: {
    fontFamily: 'Demonized',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#5DD62C',
  },
  statusText: {
    fontFamily: 'Demonized',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: '#f8f8f8',
  },
  taskTitle: {
    fontFamily: 'Demonized',
    fontSize: 18,
    fontWeight: '700',
    color: '#f8f8f8',
    lineHeight: 24,
    letterSpacing: -0.3,
    marginBottom: 6,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    padding: 12,
    gap: 10,
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
    fontSize: 12,
    color: '#f8f8f8',
  },
  remainingValue: {
    fontFamily: 'Demonized',
    fontSize: 12,
    fontWeight: '700',
    color: '#5DD62C',
  },
  progressTrack: {
    height: 6,
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
    borderRadius: 10,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.25)',
  },
  metaLabel: {
    fontFamily: 'Demonized',
    fontSize: 9,
    color: '#5DD62C',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f8f8f8',
  },
  metaValueMono: {
    fontFamily: 'Demonized',
    fontSize: 11,
    fontWeight: '700',
    color: '#5DD62C',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  primaryAction: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },

  bottomDockWrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 16,
  },
  bottomDockContent: {
    justifyContent: 'space-between',
  },
  navItemActiveWrap: {
    alignItems: 'center',
    gap: 4,
  },
  navActiveWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBadgePos: {
    position: 'absolute',
    top: -4,
    right: -6,
  },
  navBadgeText: {
    fontFamily: 'Demonized',
    fontSize: 9,
    fontWeight: '800',
    color: '#0f0f0f',
  },
  navLabelActive: {
    fontFamily: 'Demonized',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    color: '#5DD62C',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontFamily: 'Demonized',
    fontSize: 10,
    fontWeight: '500',
    color: '#5DD62C',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
});
