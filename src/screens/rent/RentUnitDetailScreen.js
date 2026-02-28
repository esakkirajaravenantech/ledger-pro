import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Card, Divider, Chip, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getRentUnitById, getRentReceiptsForUnit } from '../../database/rentOperations';
import {
  getCurrentRentInfo,
  getMonthsUntilExpiry,
  MONTH_NAMES,
} from '../../utils/rentCalculations';
import { scheduleAgreementExpiryReminder } from '../../utils/notifications';

const MONTHS = MONTH_NAMES;

const RentUnitDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { unitId } = route.params;
  const [unit, setUnit] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const [rentInfo, setRentInfo] = useState(null);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const loadData = useCallback(async () => {
    try {
      const u = await getRentUnitById(unitId);
      setUnit(u);
      if (u) {
        const info = getCurrentRentInfo(u.rent_amount, u.agreement_start);
        setRentInfo(info);
      }
      const r = await getRentReceiptsForUnit(unitId, selectedYear);
      setReceipts(r);
    } catch (err) {
      console.error(err);
    }
  }, [unitId, selectedYear]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    loadData();
    return unsubscribe;
  }, [navigation, loadData]);

  useEffect(() => {
    if (unit) {
      navigation.setOptions({
        title: unit.unit_name,
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 12 }}
            onPress={() => navigation.navigate('AddEditRentUnit', { unit })}>
            <Icon name="pencil" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [unit, navigation, theme]);

  const getReceiptForMonth = month => {
    return receipts.find(r => r.month === month) || null;
  };

  const handleSetExpiryReminder = () => {
    if (!unit) { return; }
    scheduleAgreementExpiryReminder(unit.id, unit.unit_name, unit.agreement_end);
    Alert.alert('Reminder Set', `You will be reminded before the agreement expires on ${unit.agreement_end}`);
  };

  if (!unit) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const monthsLeft = getMonthsUntilExpiry(unit.agreement_end);
  const isExpiring = monthsLeft <= 3;

  return (
    <ScrollView style={styles.container}>
      {isExpiring && (
        <View style={styles.expiryBanner}>
          <Icon name="alert-circle" size={18} color="#fff" />
          <Text style={styles.expiryBannerText}>
            {monthsLeft < 0
              ? 'Agreement has EXPIRED!'
              : `Agreement expires in ${monthsLeft} month(s)!`}
          </Text>
          <TouchableOpacity onPress={handleSetExpiryReminder}>
            <Text style={styles.setReminderText}>Set Reminder</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Unit Details */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Unit Information</Text>
          <Divider style={styles.divider} />
          <DetailRow label="Unit Name" value={unit.unit_name} />
          <DetailRow label="Building" value={unit.building_name} />
          <DetailRow label="Owner" value={unit.owner_name} />
          <DetailRow label="Address" value={unit.address} />
          <DetailRow label="Contact" value={unit.contact_number} />
          <DetailRow label="Inspector" value={unit.inspector_name} />
          {unit.notes ? <DetailRow label="Notes" value={unit.notes} /> : null}
        </Card.Content>
      </Card>

      {/* Agreement Details */}
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Agreement Details</Text>
          <Divider style={styles.divider} />
          <DetailRow label="Start Date" value={unit.agreement_start} />
          <DetailRow label="End Date" value={unit.agreement_end} />
          <DetailRow
            label="Status"
            value={monthsLeft < 0 ? 'Expired' : monthsLeft <= 3 ? `Expiring (${monthsLeft}m)` : 'Active'}
            valueColor={monthsLeft < 0 ? '#F44336' : monthsLeft <= 3 ? '#FF6F00' : '#388E3C'}
          />
        </Card.Content>
      </Card>

      {/* Rent Enhancement */}
      {rentInfo && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Rent Enhancement (15% every 3 years)</Text>
            <Divider style={styles.divider} />
            <DetailRow label="Base Rent" value={`₹${unit.rent_amount.toLocaleString()}`} />
            <DetailRow
              label="Current Rent"
              value={`₹${rentInfo.currentRent.toLocaleString()}`}
              valueColor={theme.colors.primary}
            />
            <DetailRow
              label="Next Enhancement"
              value={rentInfo.nextEnhancementDate}
            />
            <DetailRow
              label="Next Rent Amount"
              value={`₹${rentInfo.nextRent.toLocaleString()}`}
            />
            <DetailRow
              label="Years Elapsed"
              value={`${rentInfo.yearsElapsed} years (${rentInfo.completedCycles} cycles)`}
            />
          </Card.Content>
        </Card>
      )}

      {/* Monthly Receipt Grid */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.yearRow}>
            <Text style={styles.sectionTitle}>Monthly Receipts</Text>
            <View style={styles.yearSelector}>
              <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)}>
                <Icon name="chevron-left" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.yearText}>{selectedYear}</Text>
              <TouchableOpacity onPress={() => setSelectedYear(y => y + 1)}>
                <Icon name="chevron-right" size={22} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
          <Divider style={styles.divider} />
          <View style={styles.grid}>
            {MONTHS.map((name, idx) => {
              const month = idx + 1;
              const receipt = getReceiptForMonth(month);
              const received = receipt?.received === 1;
              const billed = receipt?.bill_passed === 1;
              return (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthCell,
                    received ? styles.receivedCell : styles.pendingCell,
                  ]}
                  onPress={() =>
                    navigation.navigate('RentReceipt', {
                      unitId: unit.id,
                      unitName: unit.unit_name,
                      month,
                      year: selectedYear,
                      receipt,
                    })
                  }>
                  <Text style={styles.monthName}>{name.substring(0, 3)}</Text>
                  <Icon
                    name={received ? 'check-circle' : 'close-circle'}
                    size={14}
                    color={received ? '#388E3C' : '#E53935'}
                  />
                  {billed && (
                    <Icon name="stamp" size={10} color="#1565C0" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <Icon name="check-circle" size={14} color="#388E3C" />
              <Text style={styles.legendText}> Received</Text>
            </View>
            <View style={styles.legendItem}>
              <Icon name="close-circle" size={14} color="#E53935" />
              <Text style={styles.legendText}> Not Received</Text>
            </View>
            <View style={styles.legendItem}>
              <Icon name="stamp" size={14} color="#1565C0" />
              <Text style={styles.legendText}> Bill Passed</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const DetailRow = ({ label, value, valueColor }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>
      {value || '—'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  expiryBanner: {
    backgroundColor: '#F44336',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryBannerText: { flex: 1, color: '#fff', marginLeft: 6, fontSize: 13 },
  setReminderText: { color: '#FFEB3B', fontSize: 12, fontWeight: 'bold' },
  card: { margin: 8, elevation: 2, borderRadius: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  divider: { marginVertical: 6 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  detailLabel: { fontSize: 13, color: '#777', flex: 1 },
  detailValue: { fontSize: 13, color: '#222', flex: 2, textAlign: 'right' },
  yearRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  yearSelector: { flexDirection: 'row', alignItems: 'center' },
  yearText: { fontSize: 15, fontWeight: 'bold', marginHorizontal: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  monthCell: {
    width: '23%',
    margin: '1%',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  receivedCell: { backgroundColor: '#E8F5E9' },
  pendingCell: { backgroundColor: '#FFEBEE' },
  monthName: { fontSize: 11, fontWeight: '600', marginBottom: 2, color: '#333' },
  legend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendText: { fontSize: 11, color: '#555' },
});

export default RentUnitDetailScreen;
