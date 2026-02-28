import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAllWaterUnits } from '../../database/waterOperations';

const WaterUnitsListScreen = ({ navigation }) => {
  const theme = useTheme();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUnits = useCallback(async () => {
    try {
      const data = await getAllWaterUnits();
      setUnits(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadUnits);
    loadUnits();
    return unsubscribe;
  }, [navigation, loadUnits]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('WaterUnitDetail', { unitId: item.id })}>
      <View style={styles.cardRow}>
        <Icon name="water-pump" size={24} color={theme.colors.primary} style={styles.cardIcon} />
        <View style={styles.cardBody}>
          <Text style={styles.unitName}>{item.unit_name}</Text>
          <Text style={styles.connNumber}>Connection: {item.connection_number || 'N/A'}</Text>
          <Text style={styles.location}>{item.location || ''}</Text>
        </View>
        <Icon name="chevron-right" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.countLabel}>{units.length} water units</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={units}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No water units found.</Text>
          }
        />
      )}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('AddEditWaterUnit', {})}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  countLabel: { fontSize: 12, color: '#777', paddingHorizontal: 14, paddingTop: 10, marginBottom: 4 },
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
  cardIcon: { marginRight: 12 },
  cardBody: { flex: 1 },
  unitName: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  connNumber: { fontSize: 12, color: '#555' },
  location: { fontSize: 12, color: '#777' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});

export default WaterUnitsListScreen;
