import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { supabase } from '../services/api';
import { TransactionItem, useAppStore } from '../store/useAppStore';

interface AccountSummary {
  id: string;
  name: string;
  account_type: string;
  current_balance: number;
  currency: string;
}

export default function CuentasScreen() {
  const { transactions, setTransactions } = useAppStore();
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Cuentas
      const { data: accountsData } = await supabase
        .from('financial_accounts')
        .select('*');

      if (accountsData) setAccounts(accountsData);

      // 2. Transacciones
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (txData) setTransactions(txData as TransactionItem[]);
    } catch (err) {
      console.warn('Error fetching financial data:', err);
    } finally {
      setLoading(false);
    }
  }, [setTransactions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.current_balance || 0), 0);

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const renderTransaction = ({ item }: { item: TransactionItem }) => {
    const isExpense = item.type === 'expense';
    return (
      <View style={styles.txCard}>
        <View style={styles.txLeft}>
          <Text style={styles.txMerchant}>{item.merchant || item.category || 'Movimiento'}</Text>
          <Text style={styles.txCategory}>
            {item.category} • {new Date(item.created_at).toLocaleDateString('es-CO')}
          </Text>
          {item.description ? (
            <Text style={styles.txDesc} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.txRight}>
          <Text style={[styles.txAmount, isExpense ? styles.amountExpense : styles.amountIncome]}>
            {isExpense ? '-' : '+'} {formatCOP(Number(item.amount))}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Total Balance */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Balance Total Estimado</Text>
        <Text style={styles.balanceValue}>{formatCOP(totalBalance)}</Text>
      </View>

      {/* Accounts Horizontal List */}
      {accounts.length > 0 ? (
        <View style={styles.accountsSection}>
          <Text style={styles.sectionTitle}>Tus Cuentas</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={accounts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.accountsList}
            renderItem={({ item }) => (
              <View style={styles.accountItem}>
                <Text style={styles.accountName}>{item.name}</Text>
                <Text style={styles.accountType}>{item.account_type}</Text>
                <Text style={styles.accountBalance}>{formatCOP(Number(item.current_balance))}</Text>
              </View>
            )}
          />
        </View>
      ) : null}

      {/* Transactions List */}
      <View style={styles.txSection}>
        <Text style={styles.sectionTitle}>Últimos Movimientos</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.txListContent}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={fetchData} tintColor="#10b981" />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>💳</Text>
                <Text style={styles.emptyText}>No hay transacciones registradas.</Text>
              </View>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#18181b',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '500',
  },
  balanceValue: {
    color: '#10b981',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 4,
  },
  accountsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#f4f4f5',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  accountsList: {
    gap: 10,
  },
  accountItem: {
    backgroundColor: '#18181b',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272a',
    minWidth: 120,
  },
  accountName: {
    color: '#f4f4f5',
    fontSize: 14,
    fontWeight: '700',
  },
  accountType: {
    color: '#71717a',
    fontSize: 11,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  accountBalance: {
    color: '#93c5fd',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  txSection: {
    flex: 1,
  },
  txListContent: {
    paddingBottom: 20,
    gap: 8,
  },
  txCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#18181b',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272a',
  },
  txLeft: {
    flex: 1,
    marginRight: 10,
  },
  txMerchant: {
    color: '#f4f4f5',
    fontSize: 14,
    fontWeight: '700',
  },
  txCategory: {
    color: '#71717a',
    fontSize: 11,
    marginTop: 2,
  },
  txDesc: {
    color: '#a1a1aa',
    fontSize: 11,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  amountExpense: {
    color: '#ef4444',
  },
  amountIncome: {
    color: '#10b981',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    color: '#71717a',
    fontSize: 14,
  },
});
