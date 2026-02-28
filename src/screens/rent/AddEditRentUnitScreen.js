import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { addRentUnit, updateRentUnit } from '../../database/rentOperations';

const AddEditRentUnitScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const existingUnit = route.params?.unit || null;
  const isEdit = !!existingUnit;

  const [form, setForm] = useState({
    unit_name: '',
    building_name: '',
    owner_name: '',
    address: '',
    rent_amount: '',
    agreement_start: '',
    agreement_end: '',
    inspector_name: '',
    contact_number: '',
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingUnit) {
      setForm({
        unit_name: existingUnit.unit_name || '',
        building_name: existingUnit.building_name || '',
        owner_name: existingUnit.owner_name || '',
        address: existingUnit.address || '',
        rent_amount: String(existingUnit.rent_amount || ''),
        agreement_start: existingUnit.agreement_start || '',
        agreement_end: existingUnit.agreement_end || '',
        inspector_name: existingUnit.inspector_name || '',
        contact_number: existingUnit.contact_number || '',
        notes: existingUnit.notes || '',
      });
    }
    navigation.setOptions({ title: isEdit ? 'Edit Rent Unit' : 'Add Rent Unit' });
  }, [existingUnit, isEdit, navigation]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const validate = () => {
    if (!form.unit_name.trim()) { return 'Unit name is required'; }
    if (!form.building_name.trim()) { return 'Building name is required'; }
    if (!form.owner_name.trim()) { return 'Owner name is required'; }
    if (!form.rent_amount || isNaN(parseFloat(form.rent_amount))) {
      return 'Valid rent amount is required';
    }
    if (!form.agreement_start.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return 'Agreement start must be YYYY-MM-DD';
    }
    if (!form.agreement_end.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return 'Agreement end must be YYYY-MM-DD';
    }
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
      const data = {
        ...form,
        rent_amount: parseFloat(form.rent_amount),
        id: existingUnit?.id,
      };
      if (isEdit) {
        await updateRentUnit(data);
        Alert.alert('Success', 'Rent unit updated.');
      } else {
        await addRentUnit(data);
        Alert.alert('Success', 'Rent unit added.');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save rent unit: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, field, keyboardType, placeholder, multiline }) => (
    <TextInput
      label={label}
      value={form[field]}
      onChangeText={v => update(field, v)}
      style={styles.input}
      mode="outlined"
      keyboardType={keyboardType || 'default'}
      placeholder={placeholder}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
    />
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionLabel}>Basic Information</Text>
      <Field label="Unit Name *" field="unit_name" placeholder="e.g. Unit A-101" />
      <Field label="Building Name *" field="building_name" placeholder="e.g. Block A" />
      <Field label="Owner Name *" field="owner_name" placeholder="e.g. Rajesh Kumar" />
      <Field label="Address" field="address" placeholder="Full address" multiline />

      <Text style={styles.sectionLabel}>Financial Details</Text>
      <Field
        label="Rent Amount (₹) *"
        field="rent_amount"
        keyboardType="numeric"
        placeholder="e.g. 12000"
      />

      <Text style={styles.sectionLabel}>Agreement Dates</Text>
      <Field
        label="Agreement Start Date *"
        field="agreement_start"
        placeholder="YYYY-MM-DD"
      />
      <Field
        label="Agreement End Date *"
        field="agreement_end"
        placeholder="YYYY-MM-DD"
      />

      <Text style={styles.sectionLabel}>Contact Information</Text>
      <Field label="Inspector Name" field="inspector_name" placeholder="e.g. Mr. Sharma" />
      <Field
        label="Contact Number"
        field="contact_number"
        keyboardType="phone-pad"
        placeholder="e.g. 9876543210"
      />

      <Text style={styles.sectionLabel}>Additional</Text>
      <Field label="Notes" field="notes" multiline placeholder="Any additional notes..." />

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
  input: { marginBottom: 8, backgroundColor: '#fff' },
  saveBtn: { marginTop: 20, marginBottom: 40 },
});

export default AddEditRentUnitScreen;
