import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
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

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.82, 320);

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  primary: '#5DD62C',
  secondary: '#337418',
  tertiary: '#5DD62C',
  error: '#5DD62C',
  pink: '#5DD62C',
  onSurface: '#f8f8f8',
  onSurfaceVariant: '#f8f8f8',
  surfaceContainer: 'rgba(32, 32, 32, 0.95)',
  surfaceContainerHigh: 'rgba(32, 32, 32, 0.85)',
  secondaryContainer: '#337418',
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface Person {
  initial: string;
  name: string;
  description: string;
  date: string;
  amount: string;
  statusIcon: IconName;
  statusColor: string;
  avatarBg: string;
  avatarGlow: string;
  initialColor: string;
}

const PERSONS: Person[] = [
  {
    initial: 'C',
    name: 'Carlos Mendoza',
    description: 'Proyecto Web CyberNode',
    date: 'Vence hoy',
    amount: '$340.00',
    statusIcon: 'schedule',
    statusColor: C.tertiary,
    avatarBg: 'rgba(51, 116, 24, 0.4)',
    avatarGlow: 'rgba(93, 214, 44, 0.5)',
    initialColor: C.primary,
  },
  {
    initial: 'V',
    name: 'Valentina Ríos',
    description: 'Diseño UX/UI',
    date: 'Retraso 2 días',
    amount: '$1,150.00',
    statusIcon: 'priority-high',
    statusColor: C.secondary,
    avatarBg: 'rgba(51, 116, 24, 0.4)',
    avatarGlow: 'rgba(93, 214, 44, 0.5)',
    initialColor: C.pink,
  },
  {
    initial: 'M',
    name: 'Mateo Silva',
    description: 'Cuota Mensual',
    date: 'Próximo lunes',
    amount: '$85.00',
    statusIcon: 'check',
    statusColor: C.tertiary,
    avatarBg: 'rgba(51, 116, 24, 0.4)',
    avatarGlow: 'rgba(93, 214, 44, 0.5)',
    initialColor: C.primary,
  },
];

const WEEKLY_DATA = [
  { day: 'Lun', income: 65, expense: 25, incomeAmt: '+$450', expenseAmt: '-$120' },
  { day: 'Mar', income: 45, expense: 40, incomeAmt: '+$300', expenseAmt: '-$180' },
  { day: 'Mié', income: 75, expense: 15, incomeAmt: '+$580', expenseAmt: '-$60' },
  { day: 'Jue', income: 30, expense: 55, incomeAmt: '+$210', expenseAmt: '-$200' },
  { day: 'Vie', income: 40, expense: 20, incomeAmt: '+$280', expenseAmt: '-$80' },
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function CuentasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Pulse animation for status dots and wifi icon
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  // Pulse for the active nav button ring
  const navRingAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 1200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(navRingAnim, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(navRingAnim, { toValue: 0.4, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const headerTop = Math.max(insets.top + 8, 18);
  const bottomNavBottom = Math.max(insets.bottom + 10, 18);
  const scrollPaddingTop = headerTop + 62 + 16;       // header offset + height + gap
  const scrollPaddingBot = bottomNavBottom + 80 + 16; // nav offset + height + gap

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0c15" translucent />

      {/* ── FONDO 3D COMPARTIDO CON INDEX ──────────────────────── */}
      <ParallaxDotBackground />

      {/* ── CONTENIDO SCROLLEABLE PRINCIPAL ─────────────────────── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: scrollPaddingTop, paddingBottom: scrollPaddingBot },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── BALANCE GLOBAL ──────────────────────────────────── */}
        <View style={styles.balanceCard}>
          {/* Corner glow */}
          <View style={styles.balanceCardCornerGlow} />

          <View style={styles.balanceStatusRow}>
            <Animated.View style={{ opacity: pulseAnim }}>
              <Hexagon size={10} fill={C.tertiary} />
            </Animated.View>
            <Text style={styles.balanceStatusLabel}>Balance Global Activo</Text>
          </View>

          <Text style={styles.balanceAmount}>+$2,450.00</Text>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceStatsRow}>
            <View style={styles.balanceStat}>
              <MaterialIcons name="call-received" size={16} color={C.tertiary} />
              <Text style={styles.balanceStatLabel}>Por Cobrar:</Text>
              <Text style={[styles.balanceStatValue, { color: C.tertiary }]}>$1,575.00</Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <MaterialIcons name="trending-down" size={16} color={C.error} />
              <Text style={styles.balanceStatLabel}>Gastos Semanal:</Text>
              <Text style={[styles.balanceStatValue, { color: C.error }]}>$640.00</Text>
            </View>
          </View>
        </View>

        {/* ── PERSONAS ─────────────────────────────────────────── */}
        <View style={styles.section}>
          {/* Section header */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="group" size={18} color={C.tertiary} />
              <Text style={styles.sectionTitle}>Personas</Text>
              <HexPill
                fill="rgba(87, 27, 193, 0.6)"
                stroke="rgba(168, 85, 247, 0.4)"
                height={22}
                paddingHorizontal={8}
              >
                <Text style={styles.queueBadgeText}>Cola de Deudores</Text>
              </HexPill>
            </View>
            <Text style={styles.sectionHint}>Desliza →</Text>
          </View>

          {/* Horizontal snap-scroll cards */}
          <View style={styles.cardsWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 14}
              decelerationRate="fast"
              contentContainerStyle={styles.cardsScrollContent}
            >
              {PERSONS.map((p, i) => (
                <View key={i} style={[styles.personCard, { width: CARD_WIDTH }]}>
                  <View style={styles.avatarWrap}>
                    <Hexagon
                      size={96}
                      fill={p.avatarBg}
                      stroke="rgba(192, 193, 255, 0.3)"
                      style={{
                        shadowColor: p.avatarGlow,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.9,
                        shadowRadius: 24,
                        elevation: 8,
                      }}
                    >
                      <Text style={[styles.avatarInitial, { color: p.initialColor }]}>
                        {p.initial}
                      </Text>
                    </Hexagon>
                    <View style={styles.statusBadgePos}>
                      <Hexagon
                        size={22}
                        fill="#272935"
                        stroke={p.statusColor + '66'}
                      >
                        <MaterialIcons name={p.statusIcon} size={11} color={p.statusColor} />
                      </Hexagon>
                    </View>
                  </View>

                  <Text style={styles.personName}>{p.name}</Text>
                  <Text style={styles.personMeta}>{p.description} • {p.date}</Text>

                  <View style={styles.personAmountRow}>
                    <Text style={styles.personAmountLabel}>Debe pendiente</Text>
                    <Text style={styles.personAmountValue}>{p.amount}</Text>
                  </View>

                  <View style={styles.personActions}>
                    <TouchableOpacity style={styles.remindBtn} activeOpacity={0.7}>
                      <MaterialIcons name="notifications-active" size={15} color={C.primary} />
                      <Text style={styles.remindBtnText}>Recordar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.collectBtn} activeOpacity={0.7}>
                      <MaterialIcons name="payments" size={15} color={C.onSurface} />
                      <Text style={styles.collectBtnText}>Cobrar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* ── REPORTE SEMANAL ──────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="bar-chart" size={18} color={C.secondary} />
              <Text style={styles.sectionTitle}>Reporte Semanal</Text>
            </View>
            <Text style={styles.sectionHint}>Semana 42</Text>
          </View>

          <View style={styles.reportCard}>
            {/* Totals */}
            <View style={styles.reportTotalsRow}>
              <View>
                <Text style={styles.reportTotalLabel}>Ingresos Totales</Text>
                <Text style={[styles.reportTotalValue, { color: C.tertiary }]}>+$1,820.00</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.reportTotalLabel}>Gastos Totales</Text>
                <Text style={[styles.reportTotalValue, { color: C.error }]}>-$640.00</Text>
              </View>
            </View>

            {/* Daily bars */}
            <View style={styles.reportBars}>
              {WEEKLY_DATA.map((item, idx) => (
                <View key={idx} style={styles.reportBarRow}>
                  <Text style={styles.reportDayLabel}>{item.day}</Text>
                  <View style={styles.reportBarTrack}>
                    <View style={[styles.barIncome, { width: `${item.income}%` }]} />
                    <View style={[styles.barExpense, { width: `${item.expense}%` }]} />
                  </View>
                  <View style={styles.reportAmounts}>
                    <Text style={[styles.reportAmt, { color: C.tertiary }]}>{item.incomeAmt}</Text>
                    <Text style={[styles.reportAmt, { color: C.error }]}>{item.expenseAmt}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Legend */}
            <View style={styles.reportLegend}>
              <View style={styles.legendItem}>
                <Hexagon size={10} fill={C.tertiary} />
                <Text style={styles.legendText}>Ingresos</Text>
              </View>
              <View style={styles.legendItem}>
                <Hexagon size={10} fill={C.error} />
                <Text style={styles.legendText}>Gastos</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={[styles.legendText, { color: C.secondary, fontWeight: '600' }]}>Neto: </Text>
                <Text style={[styles.legendText, { color: C.secondary, fontWeight: '700' }]}>+$1,180.00</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── FLOATING HEADER ──────────────────────────────────────── */}
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
              <Animated.View style={{ opacity: pulseAnim }}>
                <MaterialCommunityIcons name="wifi" size={15} color={C.tertiary} style={styles.wifiIcon} />
              </Animated.View>
            </View>
            <Hexagon size={34} fill="#337418" stroke="#5DD62C" strokeWidth={1.5}>
              <Text style={{ fontSize: 18, fontWeight: '900', color: '#5DD62C' }}>J</Text>
            </Hexagon>
          </View>
        </HexBar>
      </View>

      {/* ── BOTTOM NAVIGATION ─────────────────────────────────────── */}
      <View style={[styles.floatingBottomNavWrap, { bottom: bottomNavBottom }]}>
        <HexBar
          height={80}
          fill="rgba(32, 32, 32, 0.95)"
          stroke="rgba(93, 214, 44, 0.4)"
          contentStyle={styles.floatingBottomNavContent}
        >
          <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.push('/pendientes')}>
            <MaterialIcons name="checklist" size={24} color={C.onSurfaceVariant} />
            <Text style={styles.navItemLabel}>PENDIENTES</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem} activeOpacity={0.7} onPress={() => router.back()}>
            <MaterialIcons name="graphic-eq" size={24} color={C.onSurfaceVariant} />
            <Text style={styles.navItemLabel}>ASISTENTE</Text>
          </TouchableOpacity>

          <View style={styles.centerButtonContainer}>
            <View style={styles.centerButtonWrap}>
              <Animated.View style={{ opacity: navRingAnim, position: 'absolute' }}>
                <Hexagon
                  size={64}
                  fill="transparent"
                  stroke="rgba(93, 214, 44, 0.7)"
                  strokeWidth={1.5}
                />
              </Animated.View>
              <Hexagon
                size={56}
                fill={C.secondaryContainer}
                stroke="rgba(93, 214, 44, 0.7)"
                strokeWidth={1.5}
                style={styles.centerHexGlow}
              >
                <MaterialIcons name="account-balance-wallet" size={26} color={C.onSurface} />
              </Hexagon>
              <TouchableOpacity style={styles.addBadgePos} activeOpacity={0.7}>
                <Hexagon
                  size={22}
                  fill="#202020"
                  stroke="rgba(93, 214, 44, 0.8)"
                >
                  <MaterialIcons name="add" size={13} color={C.tertiary} />
                </Hexagon>
              </TouchableOpacity>
            </View>
            <Text style={styles.centerNavLabel}>CUENTAS</Text>
          </View>
        </HexBar>
      </View>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0c15', overflow: 'hidden' },
  scrollView: { flex: 1, zIndex: 10 },
  scrollContent: { paddingHorizontal: 16, gap: 20 },

  // ── BALANCE GLOBAL CARD ──────────────────────────────────────────────────
  balanceCard: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(192, 193, 255, 0.2)',
    alignItems: 'center', position: 'relative', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  balanceCardCornerGlow: {
    position: 'absolute', top: -40, right: -40,
    width: 112, height: 112, borderRadius: 56,
    backgroundColor: 'rgba(56, 189, 248, 0.20)',
  },
  balanceStatusRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4,
  },
  balanceStatusLabel: {
    fontSize: 9, fontWeight: '700', color: C.onSurfaceVariant,
    letterSpacing: 1.5, textTransform: 'uppercase',
  },
  balanceAmount: {
    fontSize: 30, fontWeight: '700', color: C.primary,
    fontFamily: Platform.OS === 'ios' ? 'Space Grotesk' : 'sans-serif-medium',
    letterSpacing: -0.5, marginBottom: 2,
    textShadowColor: 'rgba(192, 193, 255, 0.4)', textShadowRadius: 12,
  },
  balanceDivider: {
    width: '100%', height: 1,
    backgroundColor: 'rgba(192, 193, 255, 0.1)', marginVertical: 12,
  },
  balanceStatsRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-around', width: '100%',
  },
  balanceStat: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1 },
  balanceStatLabel: { fontSize: 9, color: C.onSurfaceVariant, fontWeight: '500' },
  balanceStatValue: { fontSize: 11, fontWeight: '700', letterSpacing: -0.2 },
  balanceStatDivider: { width: 1, height: 12, backgroundColor: 'rgba(192, 193, 255, 0.2)' },

  // ── SECTION ──────────────────────────────────────────────────────────────
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 4,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: C.onSurface, letterSpacing: -0.3,
    fontFamily: Platform.OS === 'ios' ? 'Space Grotesk' : 'sans-serif-medium',
  },
  sectionHint: { fontSize: 11, color: C.tertiary, fontWeight: '600', letterSpacing: 0.3 },
  queueBadgeText: {
    fontSize: 10, fontWeight: '700', color: C.secondary,
    letterSpacing: 0.5, textTransform: 'uppercase',
  },

  // ── PERSON CARDS ─────────────────────────────────────────────────────────
  cardsWrapper: { marginHorizontal: -16 },
  cardsScrollContent: { paddingHorizontal: 16, gap: 14, paddingBottom: 4 },
  personCard: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16, padding: 20, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(192, 193, 255, 0.25)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55, shadowRadius: 20, elevation: 10,
  },
  avatarWrap: {
    marginBottom: 12, position: 'relative', alignItems: 'center', justifyContent: 'center',
  },
  statusBadgePos: {
    position: 'absolute', top: -4, right: -4,
  },
  avatarInitial: {
    fontSize: 48, fontWeight: '900',
    fontFamily: Platform.OS === 'ios' ? 'Space Grotesk' : 'sans-serif-black',
    textShadowRadius: 10,
  },
  personName: {
    fontSize: 18, fontWeight: '700', color: C.onSurface, textAlign: 'center', marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'Space Grotesk' : 'sans-serif-medium',
  },
  personMeta: {
    fontSize: 12, color: C.onSurfaceVariant, textAlign: 'center',
    marginBottom: 12, lineHeight: 16,
  },
  personAmountRow: {
    backgroundColor: C.surfaceContainerHigh,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6,
    width: '100%', flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(236, 72, 153, 0.3)', marginBottom: 16,
  },
  personAmountLabel: { fontSize: 12, color: C.onSurfaceVariant },
  personAmountValue: {
    fontSize: 16, fontWeight: '700', color: C.pink,
    textShadowColor: 'rgba(236, 72, 153, 0.5)', textShadowRadius: 8,
  },
  personActions: { flexDirection: 'row', gap: 8, width: '100%' },
  remindBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 4,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12,
    backgroundColor: 'rgba(128, 131, 255, 0.18)',
    borderWidth: 1, borderColor: 'rgba(192, 193, 255, 0.4)',
  },
  remindBtnText: { fontSize: 12, fontWeight: '600', color: C.primary },
  collectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 4,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12,
    backgroundColor: 'rgba(87, 27, 193, 0.82)',
    borderWidth: 1, borderColor: 'rgba(208, 188, 255, 0.5)',
    shadowColor: C.secondaryContainer, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 4,
  },
  collectBtnText: { fontSize: 12, fontWeight: '600', color: C.onSurface },

  // ── REPORTE SEMANAL ──────────────────────────────────────────────────────
  reportCard: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(192, 193, 255, 0.2)',
    gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  reportTotalsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingBottom: 12, borderBottomWidth: 1,
    borderBottomColor: 'rgba(192, 193, 255, 0.1)',
  },
  reportTotalLabel: {
    fontSize: 10, fontWeight: '600', color: C.onSurfaceVariant,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2,
  },
  reportTotalValue: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  reportBars: { gap: 10 },
  reportBarRow: { flexDirection: 'row', alignItems: 'center' },
  reportDayLabel: {
    width: 36, fontSize: 11, fontWeight: '600',
    color: C.onSurfaceVariant, letterSpacing: 0.2,
  },
  reportBarTrack: {
    flex: 1, height: 8, backgroundColor: '#202020',
    borderRadius: 4, flexDirection: 'row',
    overflow: 'hidden', marginHorizontal: 12,
  },
  barIncome: {
    height: '100%', backgroundColor: C.tertiary, borderRadius: 4,
    shadowColor: C.tertiary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 4,
  },
  barExpense: {
    height: '100%', backgroundColor: C.secondary, borderRadius: 4,
    shadowColor: C.secondary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6, shadowRadius: 4,
  },
  reportAmounts: { flexDirection: 'row', gap: 6 },
  reportAmt: {
    fontSize: 11, fontWeight: '500',
    fontFamily: 'Demonized',
  },
  reportLegend: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(93, 214, 44, 0.2)',
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendText: { fontSize: 11, color: C.onSurfaceVariant },

  // FLOATING HEADER / NAV
  floatingHeaderWrap: {
    position: 'absolute', left: 16, right: 16, zIndex: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6, shadowRadius: 16, elevation: 12,
  },
  floatingHeaderContent: { justifyContent: 'space-between' },
  menuButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontFamily: 'Demonized',
    fontSize: 22, fontWeight: '700', color: C.primary, letterSpacing: -0.5,
  },
  headerRightGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  latencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  latencyText: { fontSize: 11, fontWeight: '600', color: C.tertiary, letterSpacing: -0.3 },
  wifiIcon: {
    shadowColor: C.tertiary, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 6,
  },
  floatingBottomNavWrap: {
    position: 'absolute', left: 16, right: 16, zIndex: 50,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65, shadowRadius: 20, elevation: 14,
  },
  floatingBottomNavContent: { justifyContent: 'space-around' },
  navItem: {
    alignItems: 'center', justifyContent: 'center',
    minWidth: 64, paddingVertical: 6,
  },
  navItemLabel: {
    fontSize: 9, fontWeight: '700', color: C.onSurfaceVariant,
    marginTop: 4, letterSpacing: 0.8,
  },
  centerButtonContainer: { alignItems: 'center', marginTop: -24 },
  centerButtonWrap: {
    width: 64, height: 56, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  centerHexGlow: {
    shadowColor: C.secondaryContainer, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7, shadowRadius: 24, elevation: 12,
  },
  addBadgePos: { position: 'absolute', top: -4, right: -4 },
  centerNavLabel: {
    fontSize: 9, fontWeight: '700', color: C.primary,
    marginTop: 4, letterSpacing: 1.2,
    textShadowColor: 'rgba(192, 193, 255, 0.6)', textShadowRadius: 6,
  },
});
