import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Card, Divider, Button, Chip, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getPropertyBuildingById,
  getTaxRecordsForBuilding,
  deleteTaxRecord,
} from '../../database/propertyOperations';

const PERIOD_LABELS = {
  first_half: 'First Half (Apr–Sep)',
  second_half: 'Second Half (Oct–Mar)',
  full_year: 'Full Year',
};

const PropertyDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { buildingId } = route.params;
  const [building, setBuilding] = useState(null);
  const [taxRecords, setTaxRecords] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const b = await getPropertyBuildingById(buildingId);
      setBuilding(b);
      const records = await getTaxRecordsForBuilding(buildingId);
      setTaxRecords(records);
    } catch (err) {
      console.error(err);
    }
  }, [buildingId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    loadData();
    return unsubscribe;
  }, [navigation, loadData]);

  useEffect(() => {
    if (building) {
      navigation.setOptions({
        title: building.building_name,
        headerRight: () => (
          <TouchableOpacity
            style={{ marginRight: 12 }}
            onPress={() => navigation.navigate('AddEditProperty', { building })}>
            <Icon name="pencil" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [building, navigation, theme]);

  const handleDeleteRecord = id => {
    Alert.alert('Delete Record', 'Are you sure you want to delete this tax record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTaxRecord(id);
          loadData();
        },
      },
    ]);
  };

  if (!building) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const groupedByYear = taxRecords.reduce((acc, rec) => {
    if (!acc[rec.year]) { acc[rec.year] = []; }
    acc[rec.year].push(rec);
    return acc;
  }, {});

  const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Building Details</Text>
          <Divider style={styles.divider} />
          <DetailRow label="Building Name" value={building.building_name} />
          <DetailRow label="Survey Number" value={building.survey_number} />
          <DetailRow label="Location" value={building.location} />
          <DetailRow label="Built Date" value={building.built_date} />
          {building.description ? (
            <DetailRow label="Description" value={building.description} />
          ) : null}
        </Card.Content>
      </Card>

      <View style={styles.taxHeader}>
        <Text style={styles.taxHeaderText}>Property Tax Records</Text>
        <Button
          mode="contained"
          compact
          icon="plus"
          onPress={() =>
            navigation.navigate('PropertyTaxRecord', { buildingId, taxRecord: null })
          }>
          Add Record
        </Button>
      </View>

      {sortedYears.length === 0 ? (
        <Text style={styles.emptyText}>No tax records yet. Tap Add Record to begin.</Text>
      ) : (
        sortedYears.map(year => (
          <Card key={year} style={styles.card}>
            <Card.Content>
              <Text style={styles.yearTitle}>Year {year}</Text>
              <Divider style={styles.divider} />
              {groupedByYear[year].map(rec => (
                <View key={rec.id} style={styles.taxRow}>
                  <View style={styles.taxRowLeft}>
                    <Text style={styles.periodLabel}>
                      {PERIOD_LABELS[rec.period] || rec.period}
                    </Text>
                    {rec.amount ? (
                      <Text style={styles.taxAmount}>₹{Number(rec.amount).toLocaleString()}</Text>
                    ) : null}
                    {rec.receipt_number ? (
                      <Text style={styles.receiptNumber}>Receipt: {rec.receipt_number}</Text>
                    ) : null}
                    {rec.receipt_date ? (
                      <Text style={styles.receiptDate}>Date: {rec.receipt_date}</Text>
                    ) : null}
                  </View>
                  <View style={styles.taxRowRight}>
                    <Chip
                      style={rec.paid ? styles.paidChip : styles.unpaidChip}
                      textStyle={styles.chipText}>
                      {rec.paid ? 'Paid' : 'Pending'}
                    </Chip>
                    <View style={styles.taxActions}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('PropertyTaxRecord', {
                            buildingId,
                            taxRecord: rec,
                          })
                        }
                        style={styles.actionBtn}>
                        <Icon name="pencil" size={16} color={theme.colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteRecord(rec.id)}
                        style={styles.actionBtn}>
                        <Icon name="delete" size={16} color="#E53935" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        ))
      )}
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
  taxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 8,
    marginTop: 8,
  },
  taxHeaderText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  emptyText: { textAlign: 'center', color: '#999', margin: 20 },
  yearTitle: { fontSize: 15, fontWeight: 'bold', color: '#1565C0' },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taxRowLeft: { flex: 1 },
  taxRowRight: { alignItems: 'flex-end' },
  periodLabel: { fontSize: 13, color: '#333', fontWeight: '600' },
  taxAmount: { fontSize: 13, color: '#333' },
  receiptNumber: { fontSize: 11, color: '#777' },
  receiptDate: { fontSize: 11, color: '#777' },
  paidChip: { backgroundColor: '#E8F5E9', height: 22 },
  unpaidChip: { backgroundColor: '#FFEBEE', height: 22 },
  chipText: { fontSize: 11 },
  taxActions: { flexDirection: 'row', marginTop: 4 },
  actionBtn: { marginLeft: 10 },
});

export default PropertyDetailScreen;
