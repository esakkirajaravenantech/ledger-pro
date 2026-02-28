import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, FAB, Chip, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getAllPropertyBuildings } from '../../database/propertyOperations';

const PropertyListScreen = ({ navigation }) => {
  const theme = useTheme();
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBuildings = useCallback(async () => {
    try {
      const data = await getAllPropertyBuildings();
      setBuildings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadBuildings);
    loadBuildings();
    return unsubscribe;
  }, [navigation, loadBuildings]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('PropertyDetail', { buildingId: item.id })}>
      <View style={styles.cardRow}>
        <Icon name="office-building" size={24} color={theme.colors.primary} style={styles.cardIcon} />
        <View style={styles.cardBody}>
          <Text style={styles.buildingName}>{item.building_name}</Text>
          <Text style={styles.surveyNumber}>Survey: {item.survey_number || 'N/A'}</Text>
          <Text style={styles.location}>{item.location || ''}</Text>
        </View>
        <Icon name="chevron-right" size={20} color="#ccc" />
      </View>
      {item.built_date ? (
        <Text style={styles.builtDate}>Built: {item.built_date}</Text>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.countLabel}>{buildings.length} buildings</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={buildings}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No buildings found.</Text>
          }
        />
      )}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('AddEditProperty', {})}
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
  buildingName: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  surveyNumber: { fontSize: 12, color: '#555' },
  location: { fontSize: 12, color: '#777' },
  builtDate: { fontSize: 11, color: '#aaa', marginTop: 4 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});

export default PropertyListScreen;
