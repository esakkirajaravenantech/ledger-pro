import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { Text, TextInput, Button, Divider, RadioButton, useTheme } from 'react-native-paper';
import { saveTaxRecord } from '../../database/propertyOperations';

const PERIODS = [
  { label: 'First Half (Apr–Sep)', value: 'first_half' },
  { label: 'Second Half (Oct–Mar)', value: 'second_half' },
  { label: 'Full Year', value: 'full_year' },
];

const PropertyTaxRecordScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { buildingId, taxRecord } = route.params;
  const isEdit = !!taxRecord?.id;
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    year: String(currentYear),
    period: 'full_year',
    amount: '',
    receipt_number: '',
    receipt_date: '',
    paid: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (taxRecord) {
      setForm({
        year: String(taxRecord.year || currentYear),
        period: taxRecord.period || 'full_year',
        amount: taxRecord.amount ? String(taxRecord.amount) : '',
        receipt_number: taxRecord.receipt_number || '',
        receipt_date: taxRecord.receipt_date || '',
        paid: taxRecord.paid === 1,
      });
    }
    navigation.setOptions({
      title: isEdit ? 'Edit Tax Record' : 'Add Tax Record',
    });
  }, [taxRecord, isEdit, currentYear, navigation]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.year || isNaN(parseInt(form.year, 10))) {
      Alert.alert('Validation Error', 'Please enter a valid year.');
      return;
    }
    setSaving(true);
    try {
      await saveTaxRecord({
        id: taxRecord?.id,
        building_id: buildingId,
        year: parseInt(form.year, 10),
        period: form.period,
        amount: parseFloat(form.amount) || 0,
        receipt_number: form.receipt_number,
        receipt_date: form.receipt_date,
        paid: form.paid,
      });
      Alert.alert('Saved', 'Tax record saved successfully.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionLabel}>Tax Period</Text>
      <TextInput
        label="Year *"
        value={form.year}
        onChangeText={v => update('year', v)}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        placeholder={String(currentYear)}
      />

      <Text style={styles.fieldLabel}>Period</Text>
      <View style={styles.radioGroup}>
        {PERIODS.map(p => (
          <View key={p.value} style={styles.radioRow}>
            <RadioButton
              value={p.value}
              status={form.period === p.value ? 'checked' : 'unchecked'}
              onPress={() => update('period', p.value)}
              color={theme.colors.primary}
            />
            <Text style={styles.radioLabel}>{p.label}</Text>
          </View>
        ))}
      </View>

      <Divider style={styles.divider} />

      <Text style={styles.sectionLabel}>Payment Details</Text>
      <TextInput
        label="Amount (₹)"
        value={form.amount}
        onChangeText={v => update('amount', v)}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        placeholder="e.g. 5000"
      />
      <TextInput
        label="Receipt Number"
        value={form.receipt_number}
        onChangeText={v => update('receipt_number', v)}
        style={styles.input}
        mode="outlined"
        placeholder="e.g. PT/2024/001"
      />
      <TextInput
        label="Receipt Date"
        value={form.receipt_date}
        onChangeText={v => update('receipt_date', v)}
        style={styles.input}
        mode="outlined"
        placeholder="YYYY-MM-DD"
      />

      <Divider style={styles.divider} />

      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Payment Done</Text>
        <Switch
          value={form.paid}
          onValueChange={v => update('paid', v)}
          trackColor={{ false: '#ddd', true: '#A5D6A7' }}
          thumbColor={form.paid ? '#388E3C' : '#f4f3f4'}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveBtn}
        icon="content-save">
        {isEdit ? 'Update Record' : 'Add Record'}
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
  fieldLabel: { fontSize: 14, color: '#555', marginBottom: 4, marginTop: 8 },
  input: { marginBottom: 10, backgroundColor: '#fff' },
  radioGroup: { backgroundColor: '#fff', borderRadius: 8, paddingVertical: 4, elevation: 1 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: 8 },
  radioLabel: { fontSize: 14, color: '#333' },
  divider: { marginVertical: 12 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
  },
  toggleLabel: { fontSize: 15, color: '#333' },
  saveBtn: { marginTop: 20, marginBottom: 40 },
});

export default PropertyTaxRecordScreen;
