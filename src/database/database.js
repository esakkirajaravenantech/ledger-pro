import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db = null;

export const getDatabase = async () => {
  if (db) {
    return db;
  }
  db = await SQLite.openDatabase({ name: 'LedgerPro.db', location: 'default' });
  await initializeDatabase(db);
  return db;
};

const initializeDatabase = async database => {
  await database.transaction(tx => {
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS rent_units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit_name TEXT NOT NULL,
        building_name TEXT NOT NULL,
        owner_name TEXT NOT NULL,
        address TEXT,
        rent_amount REAL NOT NULL,
        agreement_start TEXT NOT NULL,
        agreement_end TEXT NOT NULL,
        inspector_name TEXT,
        contact_number TEXT,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS rent_receipts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit_id INTEGER NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        receipt_number TEXT,
        receipt_date TEXT,
        amount REAL,
        received INTEGER DEFAULT 0,
        bill_passed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (unit_id) REFERENCES rent_units(id)
      )
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS property_buildings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        building_name TEXT NOT NULL,
        survey_number TEXT,
        location TEXT,
        built_date TEXT,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS property_tax_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        building_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        period TEXT NOT NULL,
        amount REAL,
        receipt_number TEXT,
        receipt_date TEXT,
        paid INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (building_id) REFERENCES property_buildings(id)
      )
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS water_units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit_name TEXT NOT NULL,
        connection_number TEXT,
        location TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS water_receipts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit_id INTEGER NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        receipt_number TEXT,
        receipt_date TEXT,
        amount REAL,
        received INTEGER DEFAULT 0,
        bill_passed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (unit_id) REFERENCES water_units(id)
      )
    `);
  });

  await seedSampleData(database);
};

const seedSampleData = async database => {
  try {
    const [result] = await database.executeSql(
      'SELECT COUNT(*) as count FROM rent_units',
    );
    const count = result.rows.item(0).count;
    if (count > 0) {
      return;
    }

    await database.transaction(tx => {
      // Rent units sample data
      const rentUnits = [
        ['Unit A-101', 'Block A', 'Rajesh Kumar', 'MG Road, Pune', 12000, '2022-01-01', '2025-01-01', 'Mr. Sharma', '9876543210', ''],
        ['Unit B-201', 'Block B', 'Suresh Patil', 'FC Road, Pune', 15000, '2021-06-01', '2024-06-01', 'Mr. Verma', '9876543211', ''],
        ['Unit C-301', 'Block C', 'Priya Singh', 'Shivaji Nagar, Pune', 10000, '2023-03-01', '2026-03-01', 'Ms. Desai', '9876543212', ''],
        ['Unit D-101', 'Block D', 'Anil Joshi', 'Deccan, Pune', 18000, '2020-09-01', '2023-09-01', 'Mr. Kulkarni', '9876543213', 'Renewed'],
        ['Unit E-201', 'Block E', 'Meena Rao', 'Koregaon Park, Pune', 22000, '2022-12-01', '2025-12-01', 'Mr. Nair', '9876543214', ''],
        ['Unit F-301', 'Block F', 'Ramesh Gupta', 'Viman Nagar, Pune', 8500, '2023-07-01', '2026-07-01', 'Mr. Patil', '9876543215', ''],
        ['Unit G-101', 'Block G', 'Seema Mehta', 'Kothrud, Pune', 14000, '2021-11-01', '2024-11-01', 'Ms. Shah', '9876543216', ''],
        ['Unit H-201', 'Block H', 'Vivek Sharma', 'Hadapsar, Pune', 9000, '2022-04-01', '2025-04-01', 'Mr. Yadav', '9876543217', ''],
        ['Unit I-301', 'Block I', 'Anita Patel', 'Baner, Pune', 16500, '2023-01-01', '2026-01-01', 'Mr. Mehta', '9876543218', ''],
        ['Unit J-101', 'Block J', 'Dilip Naik', 'Wakad, Pune', 11000, '2022-08-01', '2025-08-01', 'Mr. Joshi', '9876543219', ''],
        ['Unit K-201', 'Block K', 'Kavita Reddy', 'Pimple Saudagar, Pune', 13500, '2021-02-01', '2024-02-01', 'Ms. Kulkarni', '9876543220', ''],
        ['Unit L-301', 'Block L', 'Manoj Tiwari', 'Aundh, Pune', 20000, '2022-05-01', '2025-05-01', 'Mr. Singh', '9876543221', ''],
        ['Unit M-101', 'Block M', 'Sunita Bhatt', 'Pashan, Pune', 7500, '2023-09-01', '2026-09-01', 'Mr. Rao', '9876543222', ''],
        ['Unit N-201', 'Block N', 'Harish Jain', 'Karve Road, Pune', 17000, '2022-02-01', '2025-02-01', 'Mr. Gupta', '9876543223', ''],
        ['Unit O-301', 'Block O', 'Rekha Shetty', 'Law College Road, Pune', 19000, '2021-07-01', '2024-07-01', 'Mr. Nair', '9876543224', ''],
        ['Unit P-101', 'Block P', 'Sunil Desai', 'Erandwane, Pune', 12500, '2023-05-01', '2026-05-01', 'Ms. Iyer', '9876543225', ''],
        ['Unit Q-201', 'Block Q', 'Madhuri Iyer', 'Model Colony, Pune', 14500, '2022-10-01', '2025-10-01', 'Mr. Bhatt', '9876543226', ''],
        ['Unit R-301', 'Block R', 'Prakash Nair', 'Camp, Pune', 9500, '2021-04-01', '2024-04-01', 'Mr. Reddy', '9876543227', ''],
        ['Unit S-101', 'Block S', 'Usha Kulkarni', 'Sadashiv Peth, Pune', 16000, '2022-07-01', '2025-07-01', 'Mr. Jain', '9876543228', ''],
        ['Unit T-201', 'Block T', 'Ramana Varma', 'Narayan Peth, Pune', 11500, '2023-11-01', '2026-11-01', 'Mr. Shetty', '9876543229', ''],
        ['Unit U-301', 'Block U', 'Geeta Mishra', 'Budhwar Peth, Pune', 8000, '2022-03-01', '2025-03-01', 'Mr. Mishra', '9876543230', ''],
        ['Unit V-101', 'Block V', 'Ashok Pandey', 'Peth Area, Pune', 13000, '2021-09-01', '2024-09-01', 'Mr. Tiwari', '9876543231', ''],
        ['Unit W-201', 'Block W', 'Lata Chavan', 'Cantonment, Pune', 21000, '2023-02-01', '2026-02-01', 'Mr. Pandey', '9876543232', ''],
        ['Unit X-301', 'Block X', 'Vijay Saxena', 'Ghole Road, Pune', 15500, '2022-06-01', '2025-06-01', 'Mr. Chavan', '9876543233', ''],
        ['Unit Y-101', 'Block Y', 'Poonam Agarwal', 'Senapati Bapat Road, Pune', 10500, '2021-12-01', '2024-12-01', 'Mr. Saxena', '9876543234', ''],
      ];

      rentUnits.forEach(u => {
        tx.executeSql(
          `INSERT INTO rent_units (unit_name, building_name, owner_name, address, rent_amount, agreement_start, agreement_end, inspector_name, contact_number, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          u,
        );
      });

      // Property buildings sample data
      const buildings = [
        ['Municipal Office Block A', 'SN-1234', 'Shivaji Nagar, Pune', '1985-06-15', 'Main admin block'],
        ['Community Hall Block B', 'SN-2345', 'FC Road, Pune', '1990-03-20', 'Community gathering hall'],
        ['Warehouse C', 'SN-3456', 'Hadapsar, Pune', '1978-11-10', 'Storage warehouse'],
        ['Staff Quarters D', 'SN-4567', 'Kothrud, Pune', '1992-08-05', 'Staff residential quarters'],
        ['Workshop Block E', 'SN-5678', 'Bhosari, Pune', '1988-01-25', 'Vehicle maintenance workshop'],
        ['Records Office F', 'SN-6789', 'Camp, Pune', '1975-07-30', 'Document archive'],
        ['Guest House G', 'SN-7890', 'Koregaon Park, Pune', '1995-04-12', 'Official guest house'],
        ['Training Centre H', 'SN-8901', 'Baner, Pune', '2000-09-18', 'Training and conference centre'],
        ['Medical Centre I', 'SN-9012', 'Aundh, Pune', '1983-02-28', 'Government medical facility'],
        ['Library J', 'SN-0123', 'Deccan, Pune', '1965-05-14', 'Public library building'],
        ['Sports Complex K', 'SN-1235', 'Viman Nagar, Pune', '2005-12-01', 'Indoor and outdoor sports facility'],
        ['Canteen Block L', 'SN-2346', 'Shivaji Nagar, Pune', '1998-07-22', 'Staff canteen building'],
        ['Security Post M', 'SN-3457', 'Main Gate, Pune', '1972-03-09', 'Main gate security building'],
      ];

      buildings.forEach(b => {
        tx.executeSql(
          `INSERT INTO property_buildings (building_name, survey_number, location, built_date, description) VALUES (?, ?, ?, ?, ?)`,
          b,
        );
      });

      // Water units sample data
      const waterUnits = [
        ['Water Unit Alpha', 'WC-001', 'Block A, Shivaji Nagar'],
        ['Water Unit Beta', 'WC-002', 'Block B, FC Road'],
        ['Water Unit Gamma', 'WC-003', 'Main Office, Camp'],
      ];

      waterUnits.forEach(w => {
        tx.executeSql(
          `INSERT INTO water_units (unit_name, connection_number, location) VALUES (?, ?, ?)`,
          w,
        );
      });
    });
  } catch (error) {
    console.log('Seed data error (may already exist):', error);
  }
};

export default getDatabase;
