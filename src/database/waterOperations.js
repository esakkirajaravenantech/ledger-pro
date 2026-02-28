import getDatabase from './database';

// ── Water Units ──────────────────────────────────────────────────────────────

export const getAllWaterUnits = async () => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM water_units ORDER BY unit_name',
  );
  const units = [];
  for (let i = 0; i < result.rows.length; i++) {
    units.push(result.rows.item(i));
  }
  return units;
};

export const getWaterUnitById = async id => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM water_units WHERE id = ?',
    [id],
  );
  if (result.rows.length > 0) {
    return result.rows.item(0);
  }
  return null;
};

export const addWaterUnit = async unit => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    `INSERT INTO water_units (unit_name, connection_number, location)
     VALUES (?, ?, ?)`,
    [
      unit.unit_name,
      unit.connection_number || '',
      unit.location || '',
    ],
  );
  return result.insertId;
};

export const updateWaterUnit = async unit => {
  const db = await getDatabase();
  await db.executeSql(
    `UPDATE water_units SET unit_name = ?, connection_number = ?, location = ?
     WHERE id = ?`,
    [
      unit.unit_name,
      unit.connection_number || '',
      unit.location || '',
      unit.id,
    ],
  );
};

export const deleteWaterUnit = async id => {
  const db = await getDatabase();
  await db.transaction(tx => {
    tx.executeSql('DELETE FROM water_receipts WHERE unit_id = ?', [id]);
    tx.executeSql('DELETE FROM water_units WHERE id = ?', [id]);
  });
};

// ── Water Receipts ───────────────────────────────────────────────────────────

export const getWaterReceiptsForUnit = async (unitId, year) => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM water_receipts WHERE unit_id = ? AND year = ? ORDER BY month',
    [unitId, year],
  );
  const receipts = [];
  for (let i = 0; i < result.rows.length; i++) {
    receipts.push(result.rows.item(i));
  }
  return receipts;
};

export const getWaterReceiptForMonth = async (unitId, month, year) => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM water_receipts WHERE unit_id = ? AND month = ? AND year = ?',
    [unitId, month, year],
  );
  if (result.rows.length > 0) {
    return result.rows.item(0);
  }
  return null;
};

export const saveWaterReceipt = async receipt => {
  const db = await getDatabase();
  const existing = await getWaterReceiptForMonth(
    receipt.unit_id,
    receipt.month,
    receipt.year,
  );
  if (existing) {
    await db.executeSql(
      `UPDATE water_receipts SET
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
      `INSERT INTO water_receipts
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

export const getPendingWaterReceiptsThisMonth = async (month, year) => {
  const db = await getDatabase();
  const [allUnits] = await db.executeSql('SELECT id FROM water_units');
  const [received] = await db.executeSql(
    'SELECT unit_id FROM water_receipts WHERE month = ? AND year = ? AND received = 1',
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
