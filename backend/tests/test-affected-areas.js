const pool = require('../src/config/database');

async function seedAreas() {
  try {
    const areas = [
      { disaster_id: 1, name: 'Coastal Odisha', state: 'Odisha', district: 'Puri', pop_affected: 150000, pincode: '752001', status: 'Critical', latitude: 19.8135, longitude: 85.8312 },
      { disaster_id: 2, name: 'North Bihar', state: 'Bihar', district: 'Sitamarhi', pop_affected: 200000, pincode: '843302', status: 'Active', latitude: 26.5933, longitude: 85.4881 },
      { disaster_id: 3, name: 'Chamoli Hills', state: 'Uttarakhand', district: 'Chamoli', pop_affected: 50000, pincode: '246401', status: 'Recovering', latitude: 30.4017, longitude: 79.3206 },
    ];

    console.log('Seeding affected areas...');
    for (const a of areas) {
      const { rows } = await pool.query(
        `INSERT INTO AffectedAreas (disaster_id, name, state, district, pop_affected, pincode, status, latitude, longitude, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, CURRENT_TIMESTAMP)
         RETURNING area_id, name`,
        [a.disaster_id, a.name, a.state, a.district, a.pop_affected, a.pincode, a.status, a.latitude, a.longitude]
      );
      console.log('Inserted:', rows[0]);
    }
    console.log('Done.');
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
}

seedAreas();
