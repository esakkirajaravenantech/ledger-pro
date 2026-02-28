import React, { useEffect, useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, Divider, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getWaterUnitById, getWaterReceiptsForUnit } from '../../database/waterOperations';
import { MONTH_NAMES } from '../../utils/rentCalculations';

const WaterUnitDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { unitId } = route.params;
  const [unit, setUnit] = useState(null);
  const [receipts, setReceipts] = useState([]);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const loadData = useCallback(async () => {
    try {
      const u = await getWaterUnitById(unitId);
      setUnit(u);
      const r = await getWaterReceiptsForUnit(unitId, selectedYear);
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
            onPress={() => navigation.navigate('AddEditWaterUnit', { unit })}>
            <Icon name="pencil" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [unit, navigation, theme]);

  const getReceiptForMonth = month =>
    receipts.find(r => r.month === month) || null;

  if (!unit) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Water Unit Details</Text>
          <Divider style={styles.divider} />
          <DetailRow label="Unit Name" value={unit.unit_name} />
          <DetailRow label="Connection No." value={unit.connection_number} />
          <DetailRow label="Location" value={unit.location} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.yearRow}>
            <Text style={styles.sectionTitle}>Monthly Water Charges</Text>
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
            {MONTH_NAMES.map((name, idx) => {
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
                    navigation.navigate('WaterReceipt', {
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
                  {billed && <Icon name="stamp" size={10} color="#1565C0" />}
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
              <Text style={styles.legendText}> Pending</Text>
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

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  monthCell: { width: '23%', margin: '1%', padding: 8, borderRadius: 6, alignItems: 'center' },
  receivedCell: { backgroundColor: '#E3F2FD' },
  pendingCell: { backgroundColor: '#FFEBEE' },
  monthName: { fontSize: 11, fontWeight: '600', marginBottom: 2, color: '#333' },
  legend: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendText: { fontSize: 11, color: '#555' },
});

export default WaterUnitDetailScreen;
