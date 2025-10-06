const pool = require('../src/config/database');

async function insertVolunteerTestData() {
  try {
    // volunteers data
    const volunteers = [
      {
        name: 'Dr. Aditi Sharma',
        skills: 'Medical, First Aid, Emergency Response, Hindi, English',
        contact: '+91-9876543210',
        email: 'aditi.sharma@gmail.com'
      },
      {
        name: 'Rohan Malhotra',
        skills: 'Civil Engineering, Construction, Project Management, Hindi, English',
        contact: '+91-8765432109',
        email: 'rohan.malhotra@gmail.com'
      },
      {
        name: 'Kavya Iyer',
        skills: 'Social Work, Counseling, Community Development, Tamil, English, Hindi',
        contact: '+91-7654321098',
        email: 'kavya.iyer@gmail.com'
      },
      {
        name: 'Arjun Kapoor',
        skills: 'Logistics, Supply Chain, Transportation, Hindi, Punjabi, English',
        contact: '+91-9988776655',
        email: 'arjun.kapoor@gmail.com'
      },
      {
        name: 'Riya Agarwal',
        skills: 'Nursing, Public Health, Nutrition, Hindi, English',
        contact: '+91-8877665544',
        email: 'riya.agarwal@gmail.com'
      },
      {
        name: 'Karthik Reddy',
        skills: 'Rescue Operations, Emergency Response, Leadership, Telugu, Hindi, English',
        contact: '+91-7766554433',
        email: 'karthik.reddy@gmail.com'
      }
    ];

    console.log('🔄 Inserting  volunteer test data...');
    
    for (const volunteer of volunteers) {
      const result = await pool.query(
        'INSERT INTO Volunteers (name, skills, contact, email) VALUES ($1, $2, $3, $4) RETURNING *',
        [volunteer.name, volunteer.skills, volunteer.contact, volunteer.email]
      );
      console.log('✅ Created volunteer:', result.rows[0]);
    }
    
    console.log('🎉 Volunteer test data inserted successfully!');
    console.log('🌐 Test your API at: http://localhost:5000/api/volunteers');
    
  } catch (error) {
    console.error('❌ Error inserting volunteer test data:', error.message);
  } finally {
    await pool.end();
  }
}

insertVolunteerTestData();
