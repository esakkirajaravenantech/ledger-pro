import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { addWaterUnit, updateWaterUnit } from '../../database/waterOperations';

const AddEditWaterUnitScreen = ({ route, navigation }) => {
  const existingUnit = route.params?.unit || null;
  const isEdit = !!existingUnit;

  const [form, setForm] = useState({
    unit_name: '',
    connection_number: '',
    location: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingUnit) {
      setForm({
        unit_name: existingUnit.unit_name || '',
        connection_number: existingUnit.connection_number || '',
        location: existingUnit.location || '',
      });
    }
    navigation.setOptions({ title: isEdit ? 'Edit Water Unit' : 'Add Water Unit' });
  }, [existingUnit, isEdit, navigation]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.unit_name.trim()) {
      Alert.alert('Validation Error', 'Unit name is required.');
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, id: existingUnit?.id };
      if (isEdit) {
        await updateWaterUnit(data);
        Alert.alert('Success', 'Water unit updated.');
      } else {
        await addWaterUnit(data);
        Alert.alert('Success', 'Water unit added.');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionLabel}>Water Unit Details</Text>
      <TextInput
        label="Unit Name *"
        value={form.unit_name}
        onChangeText={v => update('unit_name', v)}
        style={styles.input}
        mode="outlined"
        placeholder="e.g. Water Unit Alpha"
      />
      <TextInput
        label="Connection Number"
        value={form.connection_number}
        onChangeText={v => update('connection_number', v)}
        style={styles.input}
        mode="outlined"
        placeholder="e.g. WC-001"
      />
      <TextInput
        label="Location"
        value={form.location}
        onChangeText={v => update('location', v)}
        style={styles.input}
        mode="outlined"
        placeholder="Location of the water meter"
        multiline
      />
      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveBtn}
        icon="content-save">
        {isEdit ? 'Update Unit' : 'Add Unit'}
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 12 },
  sectionLabel: {
    fontSize: 12,
    color: '#777',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
  },
  input: { marginBottom: 10, backgroundColor: '#fff' },
  saveBtn: { marginTop: 20, marginBottom: 40 },
});

export default AddEditWaterUnitScreen;
