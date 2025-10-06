const pool = require('../src/config/database');

async function insertDonorsTestData() {
  try {
    // Donors data with Indian names and organizations
    const donors = [
      {
        name: 'Tata Charitable Trust',
        contact: '+91-22-66658282',
        type: 'Corporate',
        email: 'info@tatacharitabletrust.org'
      },
      {
        name: 'Reliance Foundation',
        contact: '+91-22-30389999',
        type: 'Corporate',
        email: 'contact@reliancefoundation.org'
      },
      {
        name: 'Adani Foundation',
        contact: '+91-79-26565555',
        type: 'Corporate',
        email: 'info@adanifoundation.org'
      },
      {
        name: 'Infosys Foundation',
        contact: '+91-80-28520261',
        type: 'Corporate',
        email: 'foundation@infosys.com'
      },
      {
        name: 'Rajesh Agarwal',
        contact: '+91-9876543210',
        type: 'Individual',
        email: 'rajesh.agarwal@gmail.com'
      },
      {
        name: 'Dr. Sunita Malhotra',
        contact: '+91-8765432109',
        type: 'Individual',
        email: 'sunita.malhotra@gmail.com'
      },
      {
        name: 'Arjun Enterprises',
        contact: '+91-9988776655',
        type: 'Organization',
        email: 'info@arjunenterprises.com'
      },
      {
        name: 'Mumbai Gurudwara Committee',
        contact: '+91-22-26633333',
        type: 'Organization',
        email: 'info@mumbaigurudwara.org'
      },
      {
        name: 'Government of Maharashtra',
        contact: '+91-22-22024444',
        type: 'Government',
        email: 'relief@maharashtra.gov.in'
      },
      {
        name: 'Government of Kerala',
        contact: '+91-471-2518000',
        type: 'Government',
        email: 'disaster@kerala.gov.in'
      },
      {
        name: 'Kavya Sharma Foundation',
        contact: '+91-9876012345',
        type: 'Individual',
        email: 'kavya.sharma@foundation.org'
      },
      {
        name: 'Bharti Airtel Foundation',
        contact: '+91-124-4222222',
        type: 'Corporate',
        email: 'foundation@bharti.in'
      }
    ];

    console.log('🔄 Inserting Indian donors test data...');
    
    for (const donor of donors) {
      const result = await pool.query(
        'INSERT INTO Donor (name, contact, type, email) VALUES ($1, $2, $3, $4) RETURNING *',
        [donor.name, donor.contact, donor.type, donor.email]
      );
      console.log('✅ Created donor:', result.rows[0]);
    }
    
    console.log('🎉 Indian donors test data inserted successfully!');
    console.log('🌐 Test your API at: http://localhost:5000/api/donors');
    
  } catch (error) {
    console.error('❌ Error inserting donors test data:', error.message);
  } finally {
    await pool.end();
  }
}

insertDonorsTestData();
