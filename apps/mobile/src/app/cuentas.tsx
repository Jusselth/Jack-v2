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
import { useAppStore, TransactionItem } from '../store/useAppStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.82, 320);

// Design Tokens
const C = {
  primary: '#5DD62C',
  secondary: '#337418',
  tertiary: '#5DD62C',
  error: '#ef4444',
  pink: '#5DD62C',
  onSurface: '#f8f8f8',
  onSurfaceVariant: '#f8f8f8',
  surfaceContainer: 'rgba(32, 32, 32, 0.95)',
  surfaceContainerHigh: 'rgba(32, 32, 32, 0.85)',
  secondaryContainer: '#337418',
};

export default function CuentasScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { transactions, accounts, addTransaction } = useAppStore();

  const [showAddTx, setShowAddTx] = useState(false);
  const [merchantInput, setMerchantInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [typeInput, setTypeInput] = useState<'income' | 'expense'>('expense');

  // Pulse animations
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
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
  const scrollPaddingTop = headerTop + 62 + 16;
  const scrollPaddingBot = bottomNavBottom + 80 + 16;

  // Real calculation from dynamic store
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.current_balance, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCOP = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleCreateTx = () => {
    const num = parseFloat(amountInput.replace(/[^0-9.]/g, ''));
    if (!merchantInput.trim() || isNaN(num) || num <= 0) return;

    addTransaction({
      merchant: merchantInput.trim(),
      amount: num,
      type: typeInput,
      category: typeInput === 'income' ? 'Cobro / Ingreso' : 'Gasto General',
      description: 'Registrado desde la app Jack',
      account_name: 'Bancolombia',
      date: 'Hoy',
    });

    setMerchantInput('');
    setAmountInput('');
    setShowAddTx(false);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f0f" translucent />
      <ParallaxDotBackground />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: scrollPaddingTop, paddingBottom: scrollPaddingBot },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── BALANCE GLOBAL CARD ── */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardCornerGlow} />

          <View style={styles.balanceStatusRow}>
            <Animated.View style={{ opacity: pulseAnim }}>
              <Hexagon size={10} fill={C.tertiary} />
            </Animated.View>
            <Text style={styles.balanceStatusLabel}>Balance Global Activo</Text>
          </View>

          <Text style={styles.balanceAmount}>{formatCOP(totalBalance || 2450000)}</Text>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceStatsRow}>
            <View style={styles.balanceStat}>
              <MaterialIcons name="call-received" size={16} color={C.tertiary} />
              <Text style={styles.balanceStatLabel}>Ingresos:</Text>
              <Text style={[styles.balanceStatValue, { color: C.tertiary }]}>{formatCOP(totalIncome)}</Text>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <MaterialIcons name="trending-down" size={16} color={C.error} />
              <Text style={styles.balanceStatLabel}>Gastos:</Text>
              <Text style={[styles.balanceStatValue, { color: C.error }]}>{formatCOP(totalExpense)}</Text>
            </View>
          </View>
        </View>

        {/* ── QUICK ADD TRANSACTION BAR ── */}
        <View style={styles.addBarWrap}>
          {showAddTx ? (
            <View style={styles.addTxForm}>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[styles.typeBtn, typeInput === 'expense' && styles.typeBtnActiveExpense]}
                  onPress={() => setTypeInput('expense')}
                >
                  <Text style={[styles.typeBtnText, typeInput === 'expense' && { color: '#ef4444' }]}>Gasto</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, typeInput === 'income' && styles.typeBtnActiveIncome]}
                  onPress={() => setTypeInput('income')}
                >
                  <Text style={[styles.typeBtnText, typeInput === 'income' && { color: '#5DD62C' }]}>Ingreso</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.inputField, { flex: 2 }]}
                  placeholder="Persona / Establecimiento..."
                  placeholderTextColor="#71717a"
                  value={merchantInput}
                  onChangeText={setMerchantInput}
                />
                <TextInput
                  style={[styles.inputField, { flex: 1.2 }]}
                  placeholder="Monto $"
                  placeholderTextColor="#71717a"
                  keyboardType="numeric"
                  value={amountInput}
                  onChangeText={setAmountInput}
                  onSubmitEditing={handleCreateTx}
                />
                <TouchableOpacity style={styles.saveTxBtn} onPress={handleCreateTx}>
                  <MaterialIcons name="check" size={18} color="#0f0f0f" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelTxBtn} onPress={() => setShowAddTx(false)}>
                  <MaterialIcons name="close" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.openAddTxBtn}
              activeOpacity={0.8}
              onPress={() => setShowAddTx(true)}
            >
              <MaterialIcons name="add" size={18} color="#5DD62C" />
              <Text style={styles.openAddTxText}>Registrar Movimiento / Transacción</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── CUENTAS Y MOVIMIENTOS DESTACADOS (DYNAMIC FROM STORE) ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="group" size={18} color={C.tertiary} />
              <Text style={styles.sectionTitle}>Cuentas & Personas</Text>
              <HexPill
                fill="rgba(51, 116, 24, 0.4)"
                stroke="rgba(93, 214, 44, 0.4)"
                height={22}
                paddingHorizontal={8}
              >
                <Text style={styles.queueBadgeText}>Movimientos</Text>
              </HexPill>
            </View>
            {transactions.length > 0 && <Text style={styles.sectionHint}>Desliza →</Text>}
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Hexagon size={56} fill="#202020" stroke="rgba(93, 214, 44, 0.4)">
                <MaterialIcons name="account-balance-wallet" size={28} color="#5DD62C" />
              </Hexagon>
              <Text style={styles.emptyTitle}>No hay transacciones registradas</Text>
              <Text style={styles.emptySubtitle}>
                Registra tus cobros y gastos tocando "Registrar Movimiento" o mediante notificación bancaria.
              </Text>
            </View>
          ) : (
            <View style={styles.cardsWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + 14}
                decelerationRate="fast"
                contentContainerStyle={styles.cardsScrollContent}
              >
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'income';
                  const initial = (tx.merchant || tx.category || 'M')[0].toUpperCase();

                  return (
                    <View key={tx.id} style={[styles.personCard, { width: CARD_WIDTH }]}>
                      <View style={styles.avatarWrap}>
                        <Hexagon
                          size={88}
                          fill="rgba(51, 116, 24, 0.4)"
                          stroke="rgba(93, 214, 44, 0.5)"
                          style={styles.avatarGlow}
                        >
                          <Text style={styles.avatarInitial}>{initial}</Text>
                        </Hexagon>
                        <View style={styles.statusBadgePos}>
                          <Hexagon size={22} fill="#202020" stroke="rgba(93, 214, 44, 0.7)">
                            <MaterialIcons
                              name={isIncome ? 'arrow-downward' : 'arrow-upward'}
                              size={11}
                              color={isIncome ? '#5DD62C' : '#ef4444'}
                            />
                          </Hexagon>
                        </View>
                      </View>

                      <Text style={styles.personName}>{tx.merchant || 'Transacción'}</Text>
                      <Text style={styles.personMeta}>
                        {tx.category} • {tx.date || 'Reciente'}
                      </Text>

                      <View style={styles.personAmountRow}>
                        <Text style={styles.personAmountLabel}>{isIncome ? 'Por Recibir / Cobro' : 'Gasto / Pago'}</Text>
                        <Text style={[styles.personAmountValue, isIncome ? { color: '#5DD62C' } : { color: '#ef4444' }]}>
                          {isIncome ? '+' : '-'} {formatCOP(tx.amount)}
                        </Text>
                      </View>

                      <View style={styles.personActions}>
                        <TouchableOpacity style={styles.remindBtn} activeOpacity={0.7}>
                          <MaterialIcons name="notifications-active" size={14} color="#5DD62C" />
                          <Text style={styles.remindBtnText}>Recordar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.collectBtn} activeOpacity={0.7}>
                          <MaterialIcons name="payments" size={14} color="#f8f8f8" />
                          <Text style={styles.collectBtnText}>Detalle</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ── CUENTAS BANCARIAS VINCULADAS ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <MaterialIcons name="account-balance" size={18} color="#5DD62C" />
              <Text style={styles.sectionTitle}>Cuentas Vinculadas</Text>
            </View>
          </View>

          <View style={styles.accountsGrid}>
            {accounts.map((acc) => (
              <View key={acc.id} style={styles.accountCard}>
                <View style={styles.accountTopRow}>
                  <Text style={styles.accountName}>{acc.name}</Text>
                  <HexPill fill="#202020" stroke="rgba(93, 214, 44, 0.4)" height={20} paddingHorizontal={6}>
                    <Text style={styles.accountType}>{acc.account_type.toUpperCase()}</Text>
                  </HexPill>
                </View>
                <Text style={styles.accountBalance}>{formatCOP(acc.current_balance)}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

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
            <Text style={styles.headerTitle}>JACK</Text>
          </View>

          <View style={styles.headerRightGroup}>
            <View style={styles.latencyBadge}>
              <Text style={styles.latencyText}>12 ms</Text>
              <Animated.View style={{ opacity: pulseAnim }}>
                <MaterialCommunityIcons name="wifi" size={15} color={C.tertiary} style={styles.wifiIcon} />
              </Animated.View>
            </View>
            <Hexagon size={34} fill="#337418" stroke="#5DD62C" strokeWidth={1.5}>
              <Text style={{ fontSize: 16, fontWeight: '900', color: '#5DD62C', fontFamily: 'Demonized' }}>J</Text>
            </Hexagon>
          </View>
        </HexBar>
      </View>

      {/* ── FLOATING BOTTOM NAV (Using router.replace for clean tab navigation) ── */}
      <View style={[styles.floatingBottomNavWrap, { bottom: bottomNavBottom }]}>
        <HexBar
          height={80}
          fill="rgba(32, 32, 32, 0.95)"
          stroke="rgba(93, 214, 44, 0.4)"
          contentStyle={styles.floatingBottomNavContent}
        >
          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => router.replace('/pendientes')}
          >
            <MaterialIcons name="checklist" size={24} color={C.onSurfaceVariant} />
            <Text style={styles.navItemLabel}>PENDIENTES</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            activeOpacity={0.7}
            onPress={() => router.replace('/')}
          >
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
              <View style={styles.addBadgePos}>
                <Hexagon size={22} fill="#202020" stroke="rgba(93, 214, 44, 0.8)">
                  <MaterialIcons name="bolt" size={13} color={C.tertiary} />
                </Hexagon>
              </View>
            </View>
            <Text style={styles.centerNavLabel}>CUENTAS</Text>
          </View>
        </HexBar>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0f0f0f', overflow: 'hidden' },
  scrollView: { flex: 1, zIndex: 10 },
  scrollContent: { paddingHorizontal: 16, gap: 18 },

  // BALANCE GLOBAL CARD
  balanceCard: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  balanceCardCornerGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: 'rgba(93, 214, 44, 0.15)',
  },
  balanceStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  balanceStatusLabel: {
    fontFamily: 'Demonized',
    fontSize: 9,
    fontWeight: '700',
    color: '#f8f8f8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  balanceAmount: {
    fontFamily: 'Demonized',
    fontSize: 26,
    fontWeight: '700',
    color: '#5DD62C',
    letterSpacing: -0.5,
    marginVertical: 4,
    textShadowColor: 'rgba(93, 214, 44, 0.5)',
    textShadowRadius: 10,
  },
  balanceDivider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(93, 214, 44, 0.2)',
    marginVertical: 10,
  },
  balanceStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  balanceStat: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, justifyContent: 'center' },
  balanceStatLabel: { fontSize: 10, color: '#f8f8f8', fontWeight: '500' },
  balanceStatValue: { fontFamily: 'Demonized', fontSize: 11, fontWeight: '700' },
  balanceStatDivider: { width: 1, height: 14, backgroundColor: 'rgba(93, 214, 44, 0.3)' },

  // QUICK ADD BAR
  addBarWrap: {
    zIndex: 20,
  },
  openAddTxBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    borderRadius: 12,
    paddingVertical: 10,
  },
  openAddTxText: {
    fontFamily: 'Demonized',
    fontSize: 11,
    color: '#5DD62C',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  addTxForm: {
    backgroundColor: 'rgba(32, 32, 32, 0.95)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#5DD62C',
    padding: 12,
    gap: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
  },
  typeBtnActiveExpense: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#ef4444',
  },
  typeBtnActiveIncome: {
    backgroundColor: 'rgba(93, 214, 44, 0.2)',
    borderColor: '#5DD62C',
  },
  typeBtnText: {
    fontFamily: 'Demonized',
    fontSize: 11,
    fontWeight: '700',
    color: '#f8f8f8',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  inputField: {
    height: 38,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 8,
    color: '#f8f8f8',
    fontSize: 12,
  },
  saveTxBtn: {
    backgroundColor: '#5DD62C',
    padding: 9,
    borderRadius: 8,
  },
  cancelTxBtn: {
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: '#ef4444',
    padding: 9,
    borderRadius: 8,
  },

  // SECTION
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: {
    fontFamily: 'Demonized',
    fontSize: 15,
    fontWeight: '700',
    color: '#f8f8f8',
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontFamily: 'Demonized',
    fontSize: 10,
    color: '#5DD62C',
    fontWeight: '700',
  },
  queueBadgeText: {
    fontFamily: 'Demonized',
    fontSize: 9,
    fontWeight: '700',
    color: '#5DD62C',
    textTransform: 'uppercase',
  },

  emptyCard: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: {
    fontFamily: 'Demonized',
    fontSize: 14,
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

  // PERSON CARDS
  cardsWrapper: { marginHorizontal: -16 },
  cardsScrollContent: { paddingHorizontal: 16, gap: 14, paddingBottom: 4 },
  personCard: {
    backgroundColor: C.surfaceContainer,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarWrap: {
    marginBottom: 10,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlow: {
    shadowColor: '#5DD62C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
  },
  statusBadgePos: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  avatarInitial: {
    fontFamily: 'Demonized',
    fontSize: 40,
    fontWeight: '900',
    color: '#5DD62C',
  },
  personName: {
    fontFamily: 'Demonized',
    fontSize: 16,
    fontWeight: '700',
    color: '#f8f8f8',
    textAlign: 'center',
    marginBottom: 2,
  },
  personMeta: {
    fontSize: 11,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 10,
  },
  personAmountRow: {
    backgroundColor: '#202020',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    marginBottom: 12,
  },
  personAmountLabel: { fontSize: 11, color: '#f8f8f8' },
  personAmountValue: {
    fontFamily: 'Demonized',
    fontSize: 13,
    fontWeight: '700',
  },
  personActions: { flexDirection: 'row', gap: 8, width: '100%' },
  remindBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#202020',
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.4)',
  },
  remindBtnText: { fontFamily: 'Demonized', fontSize: 10, fontWeight: '700', color: '#5DD62C' },
  collectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#337418',
    borderWidth: 1,
    borderColor: '#5DD62C',
  },
  collectBtnText: { fontFamily: 'Demonized', fontSize: 10, fontWeight: '700', color: '#f8f8f8' },

  // ACCOUNTS GRID
  accountsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  accountCard: {
    flex: 1,
    backgroundColor: C.surfaceContainer,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(93, 214, 44, 0.3)',
    padding: 12,
    gap: 6,
  },
  accountTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountName: {
    fontFamily: 'Demonized',
    fontSize: 13,
    fontWeight: '700',
    color: '#f8f8f8',
  },
  accountType: {
    fontFamily: 'Demonized',
    fontSize: 8,
    fontWeight: '700',
    color: '#5DD62C',
  },
  accountBalance: {
    fontFamily: 'Demonized',
    fontSize: 16,
    fontWeight: '700',
    color: '#5DD62C',
  },

  // FLOATING HEADER / NAV
  floatingHeaderWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
    shadowColor: '#000',
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

  floatingBottomNavWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.65,
    shadowRadius: 20,
    elevation: 14,
  },
  floatingBottomNavContent: { justifyContent: 'space-around' },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
    paddingVertical: 6,
  },
  navItemLabel: {
    fontFamily: 'Demonized',
    fontSize: 9,
    fontWeight: '700',
    color: '#f8f8f8',
    marginTop: 4,
    letterSpacing: 0.8,
  },
  centerButtonContainer: { alignItems: 'center', marginTop: -24 },
  centerButtonWrap: {
    width: 64,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerHexGlow: {
    shadowColor: '#337418',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 24,
    elevation: 12,
  },
  addBadgePos: { position: 'absolute', top: -4, right: -4 },
  centerNavLabel: {
    fontFamily: 'Demonized',
    fontSize: 9,
    fontWeight: '700',
    color: '#5DD62C',
    marginTop: 4,
    letterSpacing: 1.2,
  },
});
