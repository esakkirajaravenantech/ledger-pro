import getDatabase from './database';

// ── Property Buildings ───────────────────────────────────────────────────────

export const getAllPropertyBuildings = async () => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM property_buildings ORDER BY building_name',
  );
  const buildings = [];
  for (let i = 0; i < result.rows.length; i++) {
    buildings.push(result.rows.item(i));
  }
  return buildings;
};

export const getPropertyBuildingById = async id => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM property_buildings WHERE id = ?',
    [id],
  );
  if (result.rows.length > 0) {
    return result.rows.item(0);
  }
  return null;
};

export const addPropertyBuilding = async building => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    `INSERT INTO property_buildings (building_name, survey_number, location, built_date, description)
     VALUES (?, ?, ?, ?, ?)`,
    [
      building.building_name,
      building.survey_number || '',
      building.location || '',
      building.built_date || '',
      building.description || '',
    ],
  );
  return result.insertId;
};

export const updatePropertyBuilding = async building => {
  const db = await getDatabase();
  await db.executeSql(
    `UPDATE property_buildings SET
      building_name = ?, survey_number = ?, location = ?,
      built_date = ?, description = ?
     WHERE id = ?`,
    [
      building.building_name,
      building.survey_number || '',
      building.location || '',
      building.built_date || '',
      building.description || '',
      building.id,
    ],
  );
};

export const deletePropertyBuilding = async id => {
  const db = await getDatabase();
  await db.transaction(tx => {
    tx.executeSql('DELETE FROM property_tax_records WHERE building_id = ?', [id]);
    tx.executeSql('DELETE FROM property_buildings WHERE id = ?', [id]);
  });
};

// ── Property Tax Records ─────────────────────────────────────────────────────

export const getTaxRecordsForBuilding = async buildingId => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM property_tax_records WHERE building_id = ? ORDER BY year DESC, period',
    [buildingId],
  );
  const records = [];
  for (let i = 0; i < result.rows.length; i++) {
    records.push(result.rows.item(i));
  }
  return records;
};

export const getTaxRecordById = async id => {
  const db = await getDatabase();
  const [result] = await db.executeSql(
    'SELECT * FROM property_tax_records WHERE id = ?',
    [id],
  );
  if (result.rows.length > 0) {
    return result.rows.item(0);
  }
  return null;
};

export const saveTaxRecord = async record => {
  const db = await getDatabase();
  if (record.id) {
    await db.executeSql(
      `UPDATE property_tax_records SET
        year = ?, period = ?, amount = ?,
        receipt_number = ?, receipt_date = ?, paid = ?
       WHERE id = ?`,
      [
        record.year,
        record.period,
        record.amount || 0,
        record.receipt_number || '',
        record.receipt_date || '',
        record.paid ? 1 : 0,
        record.id,
      ],
    );
    return record.id;
  } else {
    const [result] = await db.executeSql(
      `INSERT INTO property_tax_records
        (building_id, year, period, amount, receipt_number, receipt_date, paid)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        record.building_id,
        record.year,
        record.period,
        record.amount || 0,
        record.receipt_number || '',
        record.receipt_date || '',
        record.paid ? 1 : 0,
      ],
    );
    return result.insertId;
  }
};

export const deleteTaxRecord = async id => {
  const db = await getDatabase();
  await db.executeSql('DELETE FROM property_tax_records WHERE id = ?', [id]);
};

export const getPendingTaxCount = async year => {
  const db = await getDatabase();
  const [buildings] = await db.executeSql(
    'SELECT COUNT(*) as count FROM property_buildings',
  );
  const totalBuildings = buildings.rows.item(0).count;
  const [paid] = await db.executeSql(
    'SELECT COUNT(DISTINCT building_id) as count FROM property_tax_records WHERE year = ? AND paid = 1',
    [year],
  );
  const paidCount = paid.rows.item(0).count;
  return Math.max(0, totalBuildings - paidCount);
};
