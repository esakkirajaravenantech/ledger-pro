import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, Card, Title, Paragraph, Badge, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPendingRentReceiptsThisMonth, getExpiringAgreements } from '../database/rentOperations';
import { getPendingTaxCount } from '../database/propertyOperations';
import { getPendingWaterReceiptsThisMonth } from '../database/waterOperations';
import moment from 'moment';

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    pendingRent: 0,
    pendingTax: 0,
    pendingWater: 0,
    expiringUnits: [],
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const loadStats = useCallback(async () => {
    try {
      const [pendingRent, pendingTax, pendingWater, expiringUnits] = await Promise.all([
        getPendingRentReceiptsThisMonth(currentMonth, currentYear),
        getPendingTaxCount(currentYear),
        getPendingWaterReceiptsThisMonth(currentMonth, currentYear),
        getExpiringAgreements(3),
      ]);
      setStats({ pendingRent, pendingTax, pendingWater, expiringUnits });
    } catch (error) {
      console.error('Error loading home stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadStats);
    loadStats();
    return unsubscribe;
  }, [navigation, loadStats]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const StatCard = ({ title, value, icon, color, onPress, subtitle }) => (
    <TouchableOpacity onPress={onPress} style={styles.statCardTouchable}>
      <Card style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
        <Card.Content style={styles.statCardContent}>
          <View style={styles.statCardLeft}>
            <Icon name={icon} size={32} color={color} />
          </View>
          <View style={styles.statCardRight}>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={[styles.statValue, { color }]}>{value}</Text>
            {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <Icon name="book-account" size={28} color={theme.colors.primary} />
        <Text style={[styles.headerTitle, { color: theme.colors.primary }]}>
          LedgerPro Dashboard
        </Text>
      </View>

      <Text style={styles.sectionLabel}>
        {moment().format('MMMM YYYY')} Overview
      </Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <>
          <StatCard
            title="Rent Receipts Pending"
            value={stats.pendingRent}
            icon="home-city"
            color="#E53935"
            subtitle={`${moment().format('MMMM YYYY')}`}
            onPress={() => navigation.navigate('Rent')}
          />
          <StatCard
            title="Property Tax Pending"
            value={stats.pendingTax}
            icon="office-building"
            color="#FB8C00"
            subtitle={`Year ${currentYear}`}
            onPress={() => navigation.navigate('Property')}
          />
          <StatCard
            title="Water Charges Pending"
            value={stats.pendingWater}
            icon="water-pump"
            color="#1E88E5"
            subtitle={`${moment().format('MMMM YYYY')}`}
            onPress={() => navigation.navigate('Water')}
          />

          {stats.expiringUnits.length > 0 && (
            <Card style={[styles.alertCard, { borderLeftColor: '#F44336', borderLeftWidth: 4 }]}>
              <Card.Content>
                <View style={styles.alertHeader}>
                  <Icon name="alert-circle" size={20} color="#F44336" />
                  <Text style={styles.alertTitle}> Agreements Expiring Soon</Text>
                </View>
                {stats.expiringUnits.map(unit => (
                  <TouchableOpacity
                    key={unit.id}
                    onPress={() =>
                      navigation.navigate('Rent', {
                        screen: 'RentUnitDetail',
                        params: { unitId: unit.id },
                      })
                    }>
                    <View style={styles.alertRow}>
                      <Icon name="chevron-right" size={16} color="#F44336" />
                      <Text style={styles.alertText}>
                        {unit.unit_name} — {unit.owner_name}
                      </Text>
                      <Text style={styles.alertDate}>
                        Exp: {unit.agreement_end}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </Card.Content>
            </Card>
          )}

          <Text style={styles.sectionLabel}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {[
              { label: 'Rent Units', icon: 'home-city-outline', tab: 'Rent' },
              { label: 'Property Tax', icon: 'office-building-outline', tab: 'Property' },
              { label: 'Water Charges', icon: 'water-outline', tab: 'Water' },
            ].map(action => (
              <TouchableOpacity
                key={action.tab}
                style={styles.quickActionBtn}
                onPress={() => navigation.navigate(action.tab)}>
                <Icon name={action.icon} size={28} color={theme.colors.primary} />
                <Text style={[styles.quickActionLabel, { color: theme.colors.primary }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginLeft: 8 },
  sectionLabel: { fontSize: 13, color: '#777', marginTop: 12, marginBottom: 6, fontWeight: '600', textTransform: 'uppercase' },
  loadingText: { textAlign: 'center', color: '#999', marginTop: 40 },
  statCardTouchable: { marginBottom: 8 },
  statCard: { elevation: 2, borderRadius: 8 },
  statCardContent: { flexDirection: 'row', alignItems: 'center' },
  statCardLeft: { marginRight: 16 },
  statCardRight: { flex: 1 },
  statTitle: { fontSize: 13, color: '#555' },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statSubtitle: { fontSize: 11, color: '#999' },
  alertCard: { marginBottom: 8, elevation: 2, borderRadius: 8 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: '#F44336' },
  alertRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 3 },
  alertText: { flex: 1, fontSize: 13, color: '#333' },
  alertDate: { fontSize: 11, color: '#F44336' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  quickActionBtn: { alignItems: 'center', padding: 16, backgroundColor: '#fff', borderRadius: 12, elevation: 2, flex: 1, marginHorizontal: 4 },
  quickActionLabel: { fontSize: 12, marginTop: 4, fontWeight: '600' },
});

export default HomeScreen;
