const pool = require('../src/config/database');
const UserModel = require('../src/models/user');

async function insertUsersTestData() {
  try {
    console.log('🔄 Creating test users with different roles...');

    // Check existing volunteers and donors for linking
    const volunteersResult = await pool.query('SELECT volunteer_id, name FROM Volunteers LIMIT 3');
    const donorsResult = await pool.query('SELECT donor_id, name FROM Donor WHERE type = \'Individual\' LIMIT 2');
    
    const users = [
      // Admin user
      {
        username: 'admin',
        email: 'admin@disastermanagement.org',
        password: 'admin123',
        role: 'Admin',
        full_name: 'System Administrator',
        phone: '+91-9999999999'
      },
      
      // Camp Manager
      {
        username: 'camp_manager',
        email: 'manager@reliefcamp.org',
        password: 'manager123',
        role: 'Camp Manager',
        full_name: 'Rajesh Kumar',
        phone: '+91-9876543210',
        volunteer_id: volunteersResult.rows[0]?.volunteer_id || null
      },
      
      // Volunteer users
      {
        username: 'volunteer1',
        email: 'aditi.sharma@volunteer.org',
        password: 'volunteer123',
        role: 'Volunteer',
        full_name: 'Dr. Aditi Sharma',
        phone: '+91-9876543211',
        volunteer_id: volunteersResult.rows[1]?.volunteer_id || null
      },
      
      {
        username: 'volunteer2',
        email: 'rohan.malhotra@volunteer.org',
        password: 'volunteer123',
        role: 'Volunteer',
        full_name: 'Rohan Malhotra',
        phone: '+91-9876543212',
        volunteer_id: volunteersResult.rows[2]?.volunteer_id || null
      },
      
      // Donor users
      {
        username: 'donor1',
        email: 'rajesh.agarwal@donor.org',
        password: 'donor123',
        role: 'Donor',
        full_name: 'Rajesh Agarwal',
        phone: '+91-9876543213',
        donor_id: donorsResult.rows[0]?.donor_id || null
      },
      
      {
        username: 'donor2',
        email: 'sunita.malhotra@donor.org',
        password: 'donor123',
        role: 'Donor',
        full_name: 'Dr. Sunita Malhotra',
        phone: '+91-9876543214',
        donor_id: donorsResult.rows[1]?.donor_id || null
      }
    ];

    for (const userData of users) {
      try {
        const newUser = await UserModel.createUser(userData);
        console.log(`✅ Created user: ${newUser.username} (${newUser.role})`);
      } catch (error) {
        console.log(`⚠️ Skipping user ${userData.username}: ${error.message}`);
      }
    }
    
    console.log('🎉 Test users created successfully!');
    console.log('🔐 Login credentials:');
    console.log('   Admin: admin / admin123');
    console.log('   Camp Manager: camp_manager / manager123');
    console.log('   Volunteer: volunteer1 / volunteer123');
    console.log('   Donor: donor1 / donor123');
    console.log('');
    console.log('🧪 Test authentication endpoints:');
    console.log('   POST /api/auth/register');
    console.log('   POST /api/auth/login');
    console.log('   GET /api/auth/profile (requires token)');
    console.log('   GET /api/auth/users (admin only)');
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  } finally {
    await pool.end();
  }
}

insertUsersTestData();
