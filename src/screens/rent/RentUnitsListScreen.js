import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Text, FAB, Chip, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAllRentUnits } from '../../database/rentOperations';
import { getMonthsUntilExpiry } from '../../utils/rentCalculations';

const RentUnitsListScreen = ({ navigation }) => {
  const theme = useTheme();
  const [units, setUnits] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUnits = useCallback(async () => {
    try {
      const data = await getAllRentUnits();
      setUnits(data);
      setFiltered(data);
    } catch (error) {
      console.error('Error loading rent units:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadUnits);
    loadUnits();
    return unsubscribe;
  }, [navigation, loadUnits]);

  useEffect(() => {
    if (search.trim() === '') {
      setFiltered(units);
    } else {
      const q = search.toLowerCase();
      setFiltered(
        units.filter(
          u =>
            u.unit_name.toLowerCase().includes(q) ||
            u.building_name.toLowerCase().includes(q) ||
            u.owner_name.toLowerCase().includes(q),
        ),
      );
    }
  }, [search, units]);

  const renderItem = ({ item }) => {
    const monthsLeft = getMonthsUntilExpiry(item.agreement_end);
    const isExpiring = monthsLeft <= 3;
    const isExpired = monthsLeft < 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('RentUnitDetail', { unitId: item.id })
        }>
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Icon name="home-city" size={20} color={theme.colors.primary} />
          </View>
          <View style={styles.cardBody}>
            <Text style={styles.unitName}>{item.unit_name}</Text>
            <Text style={styles.buildingName}>{item.building_name}</Text>
            <Text style={styles.ownerName}>{item.owner_name}</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.rentAmount}>₹{item.rent_amount.toLocaleString()}</Text>
            {isExpired ? (
              <Chip style={styles.expiredChip} textStyle={styles.chipText}>Expired</Chip>
            ) : isExpiring ? (
              <Chip style={styles.expiringChip} textStyle={styles.chipText}>
                {monthsLeft}m left
              </Chip>
            ) : (
              <Text style={styles.endDate}>{item.agreement_end}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by unit, building or owner..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#bbb"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.countLabel}>{filtered.length} units</Text>

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No rent units found.</Text>
          }
        />
      )}

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('AddEditRentUnit', {})}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
    elevation: 2,
  },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, height: 42, color: '#333', fontSize: 14 },
  countLabel: { fontSize: 12, color: '#777', paddingHorizontal: 14, marginBottom: 4 },
  list: { paddingBottom: 80 },
  loadingText: { textAlign: 'center', marginTop: 40, color: '#999' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#999' },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 2,
    padding: 12,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  cardLeft: { marginRight: 10 },
  cardBody: { flex: 1 },
  cardRight: { alignItems: 'flex-end' },
  unitName: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  buildingName: { fontSize: 12, color: '#555' },
  ownerName: { fontSize: 12, color: '#777' },
  rentAmount: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  endDate: { fontSize: 10, color: '#aaa' },
  expiringChip: { backgroundColor: '#FFF3E0', height: 22 },
  expiredChip: { backgroundColor: '#FFEBEE', height: 22 },
  chipText: { fontSize: 10, color: '#BF360C' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});

export default RentUnitsListScreen;
