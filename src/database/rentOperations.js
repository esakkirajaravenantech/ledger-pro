import getDatabase from './database';

// ── Rent Units ──────────────────────────────────────────────────────────────

export const getAllRentUnits = async () => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM rent_units ORDER BY building_name, unit_name',
  );
  const units = [];
  for (let i = 0; i < result.rows.length; i++) {
    units.push(result.rows.item(i));
  }
  return units;
};

export const getRentUnitById = async id => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM rent_units WHERE id = ?',
    [id],
  );
  if (result.rows.length > 0) {
    return result.rows.item(0);
  }
  return null;
};

export const addRentUnit = async unit => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    `INSERT INTO rent_units
      (unit_name, building_name, owner_name, address, rent_amount,
       agreement_start, agreement_end, inspector_name, contact_number, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      unit.unit_name,
      unit.building_name,
      unit.owner_name,
      unit.address || '',
      unit.rent_amount,
      unit.agreement_start,
      unit.agreement_end,
      unit.inspector_name || '',
      unit.contact_number || '',
      unit.notes || '',
    ],
  );
  return result.insertId;
};

export const updateRentUnit = async unit => {
  const db = await getDatabase();
  await db.executeSql(
    `UPDATE rent_units SET
      unit_name = ?, building_name = ?, owner_name = ?, address = ?,
      rent_amount = ?, agreement_start = ?, agreement_end = ?,
      inspector_name = ?, contact_number = ?, notes = ?
     WHERE id = ?`,
    [
      unit.unit_name,
      unit.building_name,
      unit.owner_name,
      unit.address || '',
      unit.rent_amount,
      unit.agreement_start,
      unit.agreement_end,
      unit.inspector_name || '',
      unit.contact_number || '',
      unit.notes || '',
      unit.id,
    ],
  );
};

export const deleteRentUnit = async id => {
  const db = await getDatabase();
  await db.transaction(tx => {
    tx.executeSql('DELETE FROM rent_receipts WHERE unit_id = ?', [id]);
    tx.executeSql('DELETE FROM rent_units WHERE id = ?', [id]);
  });
};

// ── Rent Receipts ────────────────────────────────────────────────────────────

export const getRentReceiptsForUnit = async (unitId, year) => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM rent_receipts WHERE unit_id = ? AND year = ? ORDER BY month',
    [unitId, year],
  );
  const receipts = [];
  for (let i = 0; i < result.rows.length; i++) {
    receipts.push(result.rows.item(i));
  }
  return receipts;
};

export const getRentReceiptForMonth = async (unitId, month, year) => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM rent_receipts WHERE unit_id = ? AND month = ? AND year = ?',
    [unitId, month, year],
  );
  if (result.rows.length > 0) {
    return result.rows.item(0);
  }
  return null;
};

export const saveRentReceipt = async receipt => {
  const db = await getDatabase();
  const existing = await getRentReceiptForMonth(
    receipt.unit_id,
    receipt.month,
    receipt.year,
  );
  if (existing) {
    await db.executeSql(
      `UPDATE rent_receipts SET
        receipt_number = ?, receipt_date = ?, amount = ?,
        received = ?, bill_passed = ?
       WHERE id = ?`,
      [
        receipt.receipt_number || '',
        receipt.receipt_date || '',
        receipt.amount || 0,
        receipt.received ? 1 : 0,
        receipt.bill_passed ? 1 : 0,
        existing.id,
      ],
    );
    return existing.id;
  } else {
    const [result] = await db.executeSql(
      `INSERT INTO rent_receipts
        (unit_id, month, year, receipt_number, receipt_date, amount, received, bill_passed)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        receipt.unit_id,
        receipt.month,
        receipt.year,
        receipt.receipt_number || '',
        receipt.receipt_date || '',
        receipt.amount || 0,
        receipt.received ? 1 : 0,
        receipt.bill_passed ? 1 : 0,
      ],
    );
    return result.insertId;
  }
};

export const getPendingRentReceiptsThisMonth = async (month, year) => {
  const db = await getDatabase();
  const [allUnits] = await db.executeSql('SELECT id FROM rent_units');
  const [received] = await db.executeSql(
    'SELECT unit_id FROM rent_receipts WHERE month = ? AND year = ? AND received = 1',
    [month, year],
  );
  const receivedIds = new Set();
  for (let i = 0; i < received.rows.length; i++) {
    receivedIds.add(received.rows.item(i).unit_id);
  }
  let pending = 0;
  for (let i = 0; i < allUnits.rows.length; i++) {
    if (!receivedIds.has(allUnits.rows.item(i).id)) {
      pending++;
    }
  }
  return pending;
};

export const getExpiringAgreements = async monthsAhead => {
  const db = await getDatabase();
  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + monthsAhead);
  const today = new Date().toISOString().split('T')[0];
  const future = futureDate.toISOString().split('T')[0];
  const [result] = await db.executeSql(
    "SELECT * FROM rent_units WHERE agreement_end BETWEEN ? AND ? ORDER BY agreement_end",
    [today, future],
  );
  const units = [];
  for (let i = 0; i < result.rows.length; i++) {
    units.push(result.rows.item(i));
  }
  return units;
};
