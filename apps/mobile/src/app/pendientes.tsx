import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Hexagon, HexBar, HexImage, HexPill } from '../components/Hexagon';
import ParallaxDotBackground from '../components/ParallaxDotBackground';

const { height: SCREEN_H } = Dimensions.get('window');
const CARD_HEIGHT = Math.min(510, Math.max(440, SCREEN_H * 0.58));

const C = {
  cyan: '#5DD62C',
  cyanBright: '#5DD62C',
  cyanText: '#5DD62C',
  indigo: '#5DD62C',
  purple: '#5DD62C',
  purpleBright: '#5DD62C',
  pink: '#5DD62C',
  rose: '#5DD62C',
  amber: '#5DD62C',
  white: '#f8f8f8',
  slate100: '#f8f8f8',
  slate200: '#f8f8f8',
  slate300: '#f8f8f8',
  slate400: '#5DD62C',
  onSurfaceVariant: '#f8f8f8',
};

type TabKey = 'universidad' | 'personal';

type TaskAccent = 'cyan' | 'indigo' | 'purple' | 'pink' | 'amber' | 'rose' | 'slate';

interface TaskCard {
  id: string;
  subject: string;
  status: string;
  statusTone: TaskAccent;
  title: string;
  description: string;
  remaining: string;
  remainingTone: TaskAccent;
  progress: number;
  deadlineLabel: string;
  deadlineValue: string;
  timeLabel: string;
  timeValue: string;
  peopleLabel: string;
  peopleValue: string;
  peopleTag?: string;
  avatars?: string[];
  borderAccent: TaskAccent;
  glow: TaskAccent;
  actionLabel: string;
  actionIcon?: 'check' | 'edit' | 'none';
  actionStyle: 'gradient-cyan' | 'gradient-indigo' | 'gradient-purple' | 'outline-purple' | 'outline-pink' | 'outline-indigo';
  showMore?: boolean;
  pulseSubject?: boolean;
  showProgress?: boolean;
}

const UNI_TASKS: TaskCard[] = [
  {
    id: 'u1',
    subject: 'Inteligencia Artificial',
    status: 'URGENTE',
    statusTone: 'rose',
    title: 'Implementación de Red Neuronal Convolucional (CNN)',
    description:
      'Entrenamiento del modelo en PyTorch, optimización de hiperparámetros y reporte analítico con curvas de pérdida y matriz de confusión.',
    remaining: '06h : 42m : 18s',
    remainingTone: 'rose',
    progress: 0.85,
    deadlineLabel: 'Fecha Límite',
    deadlineValue: 'Hoy, 24 Octubre',
    timeLabel: 'Hora de Cierre',
    timeValue: '23:59 hrs',
    peopleLabel: 'Profesor a Cargo',
    peopleValue: 'Dr. Javier Arismendi',
    peopleTag: 'Lab 402',
    borderAccent: 'cyan',
    glow: 'cyan',
    actionLabel: 'Marcar Entregada',
    actionIcon: 'check',
    actionStyle: 'gradient-cyan',
    showMore: true,
    pulseSubject: true,
    showProgress: true,
  },
  {
    id: 'u2',
    subject: 'Sistemas Operativos',
    status: 'EN PROGRESO',
    statusTone: 'indigo',
    title: 'Simulador de Planificación de Procesos CPU',
    description:
      'Implementación de algoritmos Round Robin, SJF y FIFO en C++ con métricas de tiempo de espera y retorno.',
    remaining: '1d : 14h : 05m',
    remainingTone: 'indigo',
    progress: 0.45,
    deadlineLabel: 'Fecha Límite',
    deadlineValue: 'Mañana, 25 Octubre',
    timeLabel: 'Hora de Cierre',
    timeValue: '18:00 hrs',
    peopleLabel: 'Equipo de Trabajo',
    peopleValue: 'Carlos M. & Sofia R.',
    avatars: ['C', 'S'],
    borderAccent: 'indigo',
    glow: 'indigo',
    actionLabel: 'Editar Avance',
    actionIcon: 'edit',
    actionStyle: 'gradient-indigo',
    showMore: true,
    showProgress: true,
  },
  {
    id: 'u3',
    subject: 'Desarrollo Móvil',
    status: 'PENDIENTE',
    statusTone: 'purple',
    title: 'Módulo de Autenticación Biométrica & Sync',
    description:
      'Integración de FaceID / Huella dactilar con Expo LocalAuthentication y sincronización en tiempo real con Supabase.',
    remaining: '3d : 08h : 30m',
    remainingTone: 'purple',
    progress: 0.2,
    deadlineLabel: 'Fecha Límite',
    deadlineValue: '27 Octubre',
    timeLabel: 'Hora de Cierre',
    timeValue: '23:59 hrs',
    peopleLabel: 'Modalidad',
    peopleValue: 'Proyecto Individual',
    peopleTag: 'Online',
    borderAccent: 'purple',
    glow: 'purple',
    actionLabel: 'Iniciar Tarea',
    actionIcon: 'none',
    actionStyle: 'gradient-purple',
    showMore: true,
    showProgress: true,
  },
];

const PER_TASKS: TaskCard[] = [
  {
    id: 'p1',
    subject: 'Finanzas Personales',
    status: 'RECORDATORIO',
    statusTone: 'amber',
    title: 'Revisión y Pago de Servidores AWS & Vercel',
    description:
      'Verificar facturación mensual de la infraestructura en la nube y optimizar instancias EC2 en desuso.',
    remaining: '04h : 15m',
    remainingTone: 'amber',
    progress: 0.9,
    deadlineLabel: 'Fecha Límite',
    deadlineValue: 'Hoy',
    timeLabel: 'Hora Sugerida',
    timeValue: '21:00 hrs',
    peopleLabel: 'Plataformas',
    peopleValue: 'AWS Console / Vercel Dashboard',
    borderAccent: 'amber',
    glow: 'amber',
    actionLabel: 'Pagar Factura',
    actionIcon: 'check',
    actionStyle: 'outline-pink',
    showMore: true,
    showProgress: true,
  },
  {
    id: 'p2',
    subject: 'Salud & Bienestar',
    status: 'RUTINA',
    statusTone: 'pink',
    title: 'Entrenamiento de Alta Intensidad (HIIT)',
    description:
      'Sesión de 45 minutos enfocada en movilidad, resistencia cardiovascular y fuerza de torso.',
    remaining: '01h : 30m',
    remainingTone: 'pink',
    progress: 0.0,
    deadlineLabel: 'Programado',
    deadlineValue: 'Hoy',
    timeLabel: 'Hora de Inicio',
    timeValue: '19:30 hrs',
    peopleLabel: 'Lugar',
    peopleValue: 'Gimnasio Central',
    borderAccent: 'pink',
    glow: 'pink',
    actionLabel: 'Iniciar Rutina',
    actionIcon: 'none',
    actionStyle: 'outline-pink',
    showMore: true,
    showProgress: false,
  },
  {
    id: 'p3',
    subject: 'Lectura & Aprendizaje',
    status: 'HÁBITO',
    statusTone: 'cyan',
    title: 'Capítulo 4: Designing Data-Intensive Applications',
    description:
      'Tomar notas sobre formatos de codificación de datos, Protocol Buffers y evolución de esquemas.',
    remaining: '08h : 00m',
    remainingTone: 'cyan',
    progress: 0.6,
    deadlineLabel: 'Meta Diaria',
    deadlineValue: 'Hoy',
    timeLabel: 'Meta',
    timeValue: '30 Páginas',
    peopleLabel: 'Recurso',
    peopleValue: 'Kindle / O\'Reilly',
    borderAccent: 'cyan',
    glow: 'cyan',
    actionLabel: 'Marcar Leído',
    actionIcon: 'check',
    actionStyle: 'outline-indigo',
    showMore: true,
    showProgress: true,
  },
];

const ACCENT: Record<string, { text: string; border: string; bg: string; soft: string }> = {
  cyan: { text: '#5DD62C', border: 'rgba(93, 214, 44, 0.5)', bg: '#202020', soft: 'rgba(93, 214, 44, 0.15)' },
  indigo: { text: '#5DD62C', border: 'rgba(93, 214, 44, 0.5)', bg: '#202020', soft: 'rgba(93, 214, 44, 0.15)' },
  purple: { text: '#5DD62C', border: 'rgba(93, 214, 44, 0.5)', bg: '#202020', soft: 'rgba(93, 214, 44, 0.15)' },
  pink: { text: '#5DD62C', border: 'rgba(93, 214, 44, 0.5)', bg: '#202020', soft: 'rgba(93, 214, 44, 0.15)' },
  amber: { text: '#5DD62C', border: 'rgba(93, 214, 44, 0.5)', bg: '#202020', soft: 'rgba(93, 214, 44, 0.15)' },
  rose: { text: '#5DD62C', border: 'rgba(93, 214, 44, 0.5)', bg: '#202020', soft: 'rgba(93, 214, 44, 0.15)' },
  slate: { text: '#f8f8f8', border: 'rgba(93, 214, 44, 0.3)', bg: '#202020', soft: 'rgba(93, 214, 44, 0.1)' },
};

function progressColors(accent: string): [string, string] {
  return ['#5DD62C', '#337418'];
}

function actionButtonStyle(style: TaskCard['actionStyle']) {
  switch (style) {
    case 'gradient-cyan':
    case 'gradient-indigo':
    case 'gradient-purple':
      return { bg: '#337418', border: 'rgba(93, 214, 44, 0.6)', text: '#f8f8f8', shadow: '#5DD62C' };
    case 'outline-purple':
    case 'outline-pink':
    case 'outline-indigo':
      return { bg: '#202020', border: 'rgba(93, 214, 44, 0.5)', text: '#5DD62C', shadow: 'transparent' };
  }
}

function TaskItem({ task, mono }: { task: TaskCard; mono: object }) {
  const subjectAccent = ACCENT[task.borderAccent] ?? ACCENT.cyan;
  const statusAccent = ACCENT[task.statusTone] ?? ACCENT.slate;
  const remainingAccent = ACCENT[task.remainingTone] ?? ACCENT.slate;
  const glowColor = ACCENT[task.glow]?.soft ?? ACCENT.cyan.soft;
  const [barFrom, barTo] = progressColors(task.glow);
  const action = actionButtonStyle(task.actionStyle);
  const cellBg = '#202020';

  return (
    <View
      style={[
        styles.taskCard,
        {
          height: CARD_HEIGHT,
          borderColor: subjectAccent.border,
        },
      ]}
    >
      <View style={[styles.cardGlowTop, { backgroundColor: glowColor }]} />
      <View style={[styles.cardGlowBottom, { backgroundColor: ACCENT.purple.soft }]} />

      <View>
        <View style={styles.taskHeaderRow}>
          <HexPill
            fill={subjectAccent.bg}
            stroke={subjectAccent.border}
            height={26}
            paddingHorizontal={10}
            style={{ flexShrink: 1, maxWidth: '72%' }}
          >
            {task.pulseSubject !== undefined && (
              <Hexagon size={8} fill={subjectAccent.text} />
            )}
            <Text style={[styles.subjectText, mono, { color: subjectAccent.text }]} numberOfLines={1}>
              {task.subject}
            </Text>
          </HexPill>
          <HexPill
            fill={statusAccent.bg}
            stroke={statusAccent.border}
            height={24}
            paddingHorizontal={10}
          >
            <Text style={[styles.statusText, mono, { color: statusAccent.text }]}>{task.status}</Text>
          </HexPill>
        </View>

        <Text style={styles.taskTitle}>{task.title}</Text>
        <Text style={styles.taskDescription}>{task.description}</Text>
      </View>

      <View style={styles.metaModule}>
        <View style={styles.remainingRow}>
          <View style={styles.remainingLeft}>
            <MaterialIcons name="schedule" size={16} color={subjectAccent.text} />
            <Text style={styles.remainingLabel}>Tiempo Restante:</Text>
          </View>
          <HexPill
            fill={remainingAccent.bg}
            stroke={remainingAccent.border}
            height={26}
            paddingHorizontal={10}
          >
            <Text style={[styles.remainingValue, mono, { color: remainingAccent.text }]}>
              {task.remaining}
            </Text>
          </HexPill>
        </View>

        {task.showProgress !== false && task.progress > 0 && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.round(task.progress * 100)}%`,
                  backgroundColor: barFrom,
                  shadowColor: barTo,
                },
              ]}
            />
          </View>
        )}

        <View style={styles.metaGrid}>
          <View style={[styles.metaCell, { backgroundColor: cellBg }]}>
            <Text style={[styles.metaLabel, mono]}>{task.deadlineLabel}</Text>
            <Text style={styles.metaValue}>{task.deadlineValue}</Text>
          </View>
          <View style={[styles.metaCell, { backgroundColor: cellBg }]}>
            <Text style={[styles.metaLabel, mono]}>{task.timeLabel}</Text>
            <Text style={[styles.metaValueMono, mono, { color: subjectAccent.text }]}>
              {task.timeValue}
            </Text>
          </View>
        </View>

        <View style={[styles.peopleRow, { backgroundColor: cellBg }]}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={[styles.metaLabel, mono]}>{task.peopleLabel}</Text>
            <Text style={styles.peopleValue} numberOfLines={2}>{task.peopleValue}</Text>
          </View>
          {task.avatars ? (
            <View style={styles.avatarStack}>
              {task.avatars.map((letter, i) => (
                <Hexagon
                  key={letter + i}
                  size={24}
                  fill={i === 0 ? '#9333ea' : '#db2777'}
                  stroke={i === 0 ? '#c084fc' : '#f472b6'}
                  style={{ marginLeft: i === 0 ? 0 : -6 }}
                >
                  <Text style={styles.miniAvatarText}>{letter}</Text>
                </Hexagon>
              ))}
            </View>
          ) : task.peopleTag ? (
            <HexPill
              fill={task.peopleTag === 'Online' ? '#1e293b' : subjectAccent.bg}
              stroke={task.peopleTag === 'Online' ? '#334155' : subjectAccent.border}
              height={22}
              paddingHorizontal={8}
            >
              <Text
                style={[
                  styles.peopleTagText,
                  mono,
                  { color: task.peopleTag === 'Online' ? C.slate300 : subjectAccent.text },
                ]}
              >
                {task.peopleTag}
              </Text>
            </HexPill>
          ) : null}
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.primaryAction,
            {
              backgroundColor: action.bg,
              borderColor: action.border,
              shadowColor: action.shadow,
            },
          ]}
          activeOpacity={0.85}
        >
          {task.actionIcon === 'check' && (
            <MaterialIcons name="check" size={16} color={action.text} />
          )}
          {task.actionIcon === 'edit' && (
            <MaterialIcons name="edit" size={16} color={action.text} />
          )}
          <Text style={[styles.primaryActionText, { color: action.text }]}>{task.actionLabel}</Text>
        </TouchableOpacity>

        {task.showMore && (
          <TouchableOpacity style={styles.moreBtn} activeOpacity={0.8}>
            <MaterialIcons name="more-vert" size={18} color={C.slate300} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function PendientesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('universidad');

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
  const tasks = isUni ? UNI_TASKS : PER_TASKS;
  const accent = isUni ? C.cyanBright : C.purple;
  const mono = {
    fontFamily: 'Demonized',
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" translucent />
      <ParallaxDotBackground />
      <View
        pointerEvents="none"
        style={[
          styles.ambientGlow,
          {
            backgroundColor: isUni
              ? 'rgba(51, 116, 24, 0.15)'
              : 'rgba(93, 214, 44, 0.15)',
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
            <MaterialIcons name="menu" size={24} color={C.onSurfaceVariant} />
          </TouchableOpacity>

          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Jack</Text>
          </View>

          <View style={styles.headerRightGroup}>
            <View style={styles.latencyBadge}>
              <Text style={styles.latencyText}>12 ms</Text>
              <MaterialCommunityIcons name="wifi" size={15} color="#5DD62C" style={styles.wifiIcon} />
            </View>
            <Hexagon size={34} fill="#337418" stroke="#5DD62C" strokeWidth={1.5}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#5DD62C' }}>J</Text>
            </Hexagon>
          </View>
        </HexBar>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsWrap, { paddingTop: headerTop + 62 + 12 }]}>
        <View style={styles.tabsTrack}>
          <TouchableOpacity
            style={[styles.tabBtn, isUni && styles.tabBtnActiveUni]}
            activeOpacity={0.85}
            onPress={() => setTab('universidad')}
          >
            <Hexagon
              size={isUni ? 10 : 8}
              fill={isUni ? C.cyanBright : 'rgba(93, 214, 44, 0.55)'}
            />
            <Text style={[styles.tabLabel, isUni && styles.tabLabelActiveUni]}>Universidad</Text>
            <HexPill
              fill={isUni ? 'rgba(93, 214, 44, 0.2)' : '#202020'}
              height={18}
              paddingHorizontal={6}
            >
              <Text style={[styles.tabCountText, mono, isUni && { color: '#5DD62C' }]}>3</Text>
            </HexPill>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, !isUni && styles.tabBtnActivePersonal]}
            activeOpacity={0.85}
            onPress={() => setTab('personal')}
          >
            <Hexagon
              size={!isUni ? 10 : 8}
              fill={!isUni ? C.purple : 'rgba(93, 214, 44, 0.55)'}
            />
            <Text style={[styles.tabLabel, !isUni && styles.tabLabelActivePersonal]}>Personal</Text>
            <HexPill
              fill={!isUni ? 'rgba(93, 214, 44, 0.2)' : '#202020'}
              height={18}
              paddingHorizontal={6}
            >
              <Text style={[styles.tabCountText, mono, !isUni && { color: '#5DD62C' }]}>3</Text>
            </HexPill>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scroll hint */}
      <View style={styles.hintRow}>
        <Text style={[styles.hintText, mono, { color: 'rgba(93, 214, 44, 0.85)' }]}>
          Desliza abajo
        </Text>
        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <MaterialIcons name="south" size={14} color="#5DD62C" />
        </Animated.View>
      </View>

      {/* Task stack */}
      <ScrollView
        style={styles.taskScroll}
        contentContainerStyle={[
          styles.taskScrollContent,
          { paddingBottom: bottomNavBottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        snapToInterval={CARD_HEIGHT + 24}
        decelerationRate="fast"
        disableIntervalMomentum
      >
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} mono={mono} />
        ))}
      </ScrollView>

      {/* Bottom dock */}
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
                  <Text style={[styles.navBadgeText, mono]}>6</Text>
                </Hexagon>
              </View>
            </View>
            <Text style={[styles.navLabelActive, { color: '#5DD62C' }]}>
              Pendientes
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.75}
            onPress={() => router.back()}
          >
            <Hexagon size={42} fill="#202020" stroke="rgba(93, 214, 44, 0.4)">
              <MaterialIcons name="graphic-eq" size={20} color="#5DD62C" />
            </Hexagon>
            <Text style={styles.navLabel}>Asistente</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.75}
            onPress={() => router.push('/cuentas')}
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
    position: 'absolute', left: 16, right: 16, zIndex: 50,
    shadowColor: '#000000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 12,
  },
  floatingHeaderContent: { justifyContent: 'space-between' },
  menuButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: 'Demonized',
    fontSize: 22, fontWeight: '700', color: '#f8f8f8', letterSpacing: -0.5,
  },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  latencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  latencyText: { fontSize: 11, fontWeight: '600', color: '#5DD62C', letterSpacing: -0.3 },
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
  tabBtnActiveUni: {
    backgroundColor: 'rgba(51, 116, 24, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.6)',
  },
  tabBtnActivePersonal: {
    backgroundColor: 'rgba(51, 116, 24, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.6)',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f8f8f8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tabLabelActiveUni: {
    color: '#5DD62C',
    fontWeight: '700',
  },
  tabLabelActivePersonal: {
    color: '#5DD62C',
    fontWeight: '700',
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f8f8f8',
  },

  hintRow: {
    zIndex: 20,
    paddingHorizontal: 20,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '500',
  },

  taskScroll: {
    flex: 1,
    zIndex: 10,
  },
  taskScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 24,
  },

  taskCard: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(32, 32, 32, 0.95)',
    borderWidth: 1,
    padding: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  cardGlowTop: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 176,
    height: 176,
    borderRadius: 88,
  },
  cardGlowBottom: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 176,
    height: 176,
    borderRadius: 88,
  },
  taskHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  taskTitle: {
    fontFamily: 'Demonized',
    fontSize: 20,
    fontWeight: '700',
    color: '#f8f8f8',
    lineHeight: 26,
    letterSpacing: -0.3,
    marginBottom: 8,
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
    padding: 14,
    gap: 12,
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
    fontSize: 13,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 2,
    backgroundColor: '#0f0f0f',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metaCell: {
    flex: 1,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.25)',
  },
  metaLabel: {
    fontSize: 10,
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
    fontSize: 12,
    fontWeight: '700',
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.25)',
  },
  peopleValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f8f8f8',
  },
  peopleTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f8f8f8',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  primaryAction: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryActionText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  moreBtn: {
    width: 48,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomDockWrap: {
    position: 'absolute', left: 12, right: 12, zIndex: 50,
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
    fontSize: 9,
    fontWeight: '800',
    color: '#0f0f0f',
  },
  navLabelActive: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#5DD62C',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
});
