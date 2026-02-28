import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { Text, TextInput, Button, Divider, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { saveWaterReceipt } from '../../database/waterOperations';
import { MONTH_NAMES } from '../../utils/rentCalculations';

const WaterReceiptScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { unitId, unitName, month, year, receipt } = route.params;

  const [form, setForm] = useState({
    receipt_number: '',
    receipt_date: '',
    amount: '',
    received: false,
    bill_passed: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (receipt) {
      setForm({
        receipt_number: receipt.receipt_number || '',
        receipt_date: receipt.receipt_date || '',
        amount: receipt.amount ? String(receipt.amount) : '',
        received: receipt.received === 1,
        bill_passed: receipt.bill_passed === 1,
      });
    }
    navigation.setOptions({
      title: `${unitName} — ${MONTH_NAMES[month - 1]} ${year}`,
    });
  }, [receipt, unitName, month, year, navigation]);

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveWaterReceipt({
        unit_id: unitId,
        month,
        year,
        receipt_number: form.receipt_number,
        receipt_date: form.receipt_date,
        amount: parseFloat(form.amount) || 0,
        received: form.received,
        bill_passed: form.bill_passed,
      });
      Alert.alert('Saved', 'Water charge receipt saved.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Icon name="water" size={22} color={theme.colors.primary} />
        <Text style={styles.headerText}>
          {MONTH_NAMES[month - 1]} {year}
        </Text>
      </View>

      <TextInput
        label="Receipt Number"
        value={form.receipt_number}
        onChangeText={v => update('receipt_number', v)}
        style={styles.input}
        mode="outlined"
        placeholder="e.g. WC/2024/001"
      />
      <TextInput
        label="Receipt Date"
        value={form.receipt_date}
        onChangeText={v => update('receipt_date', v)}
        style={styles.input}
        mode="outlined"
        placeholder="YYYY-MM-DD"
      />
      <TextInput
        label="Amount (₹)"
        value={form.amount}
        onChangeText={v => update('amount', v)}
        style={styles.input}
        mode="outlined"
        keyboardType="numeric"
        placeholder="e.g. 500"
      />

      <Divider style={styles.divider} />

      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <Icon
            name={form.received ? 'check-circle' : 'close-circle'}
            size={20}
            color={form.received ? '#1E88E5' : '#E53935'}
          />
          <Text style={styles.toggleText}>Receipt Received</Text>
        </View>
        <Switch
          value={form.received}
          onValueChange={v => update('received', v)}
          trackColor={{ false: '#ddd', true: '#90CAF9' }}
          thumbColor={form.received ? '#1E88E5' : '#f4f3f4'}
        />
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleLabel}>
          <Icon name="stamp" size={20} color={form.bill_passed ? '#1565C0' : '#999'} />
          <Text style={styles.toggleText}>Bill Passed</Text>
        </View>
        <Switch
          value={form.bill_passed}
          onValueChange={v => update('bill_passed', v)}
          trackColor={{ false: '#ddd', true: '#90CAF9' }}
          thumbColor={form.bill_passed ? '#1565C0' : '#f4f3f4'}
        />
      </View>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.saveBtn}
        icon="content-save">
        Save Receipt
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 12 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  headerText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 8 },
  input: { marginBottom: 10, backgroundColor: '#fff' },
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
  toggleLabel: { flexDirection: 'row', alignItems: 'center' },
  toggleText: { fontSize: 15, color: '#333', marginLeft: 8 },
  saveBtn: { marginTop: 10, marginBottom: 40 },
});

export default WaterReceiptScreen;
