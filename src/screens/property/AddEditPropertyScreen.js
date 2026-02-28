import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { addPropertyBuilding, updatePropertyBuilding } from '../../database/propertyOperations';

const AddEditPropertyScreen = ({ route, navigation }) => {
  const existingBuilding = route.params?.building || null;
  const isEdit = !!existingBuilding;

  const [form, setForm] = useState({
    building_name: '',
    survey_number: '',
    location: '',
    built_date: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingBuilding) {
      setForm({
        building_name: existingBuilding.building_name || '',
        survey_number: existingBuilding.survey_number || '',
        location: existingBuilding.location || '',
        built_date: existingBuilding.built_date || '',
        description: existingBuilding.description || '',
      });
    }
    navigation.setOptions({ title: isEdit ? 'Edit Building' : 'Add Building' });
  }, [existingBuilding, isEdit, navigation]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const validate = () => {
    if (!form.building_name.trim()) { return 'Building name is required'; }
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, id: existingBuilding?.id };
      if (isEdit) {
        await updatePropertyBuilding(data);
        Alert.alert('Success', 'Building updated.');
      } else {
        await addPropertyBuilding(data);
        Alert.alert('Success', 'Building added.');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save building: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionLabel}>Building Details</Text>
      <TextInput
        label="Building Name *"
        value={form.building_name}
        onChangeText={v => update('building_name', v)}
        style={styles.input}
        mode="outlined"
        placeholder="e.g. Municipal Office Block A"
      />
      <TextInput
        label="Survey Number"
        value={form.survey_number}
        onChangeText={v => update('survey_number', v)}
        style={styles.input}
        mode="outlined"
        placeholder="e.g. SN-1234"
      />
      <TextInput
        label="Location"
        value={form.location}
        onChangeText={v => update('location', v)}
        style={styles.input}
        mode="outlined"
        placeholder="Full address or area"
        multiline
      />
      <TextInput
        label="Built Date"
        value={form.built_date}
        onChangeText={v => update('built_date', v)}
        style={styles.input}
        mode="outlined"
        placeholder="YYYY-MM-DD"
      />
      <TextInput
        label="Description"
        value={form.description}
        onChangeText={v => update('description', v)}
        style={styles.input}
        mode="outlined"
        placeholder="Brief description of the building"
        multiline
        numberOfLines={3}
      />
      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveBtn}
        icon="content-save">
        {isEdit ? 'Update Building' : 'Add Building'}
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

export default AddEditPropertyScreen;
