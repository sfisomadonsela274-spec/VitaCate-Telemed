const { createClient } = require('@supabase/supabase-js');

// These should be set in your environment
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xyxgldkldowixuqnbopm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is required to seed Auth users.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seed() {
  console.log('--- Starting VitaCare Supabase Seeding ---');

  // 1. Create Doctors
  const doctors = [
    { email: 'dr.smith@vitacare.com', password: 'testpass123', full_name: 'Dr. Sarah Smith', license: 'MED-1001' },
    { email: 'dr.chen@vitacare.com', password: 'testpass123', full_name: 'Dr. Michael Chen', license: 'MED-1002' },
    { email: 'dr.senior@vitacare.com', password: 'testpass123', full_name: 'Senior Doctor', license: 'MED-9999' },
  ];

  for (const doc of doctors) {
    console.log(`Checking/Creating doctor: ${doc.full_name}...`);
    
    // Check if user exists
    const { data: userData } = await supabase.auth.admin.listUsers();
    const existingUser = userData?.users.find(u => u.email === doc.email);
    
    let userId;
    if (existingUser) {
      console.log(`User ${doc.email} already exists. Updating...`);
      userId = existingUser.id;
    } else {
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: doc.email,
        password: doc.password,
        email_confirmed: true,
        user_metadata: { role: 'doctor', full_name: doc.full_name }
      });

      if (authError) {
        console.warn(`Warning: Could not create auth user for ${doc.email}: ${authError.message}`);
        continue;
      }
      userId = authUser.user.id;
    }

    const { error: dbError } = await supabase.from('doctors').upsert({
      id: userId,
      email: doc.email,
      full_name: doc.full_name,
      license_number: doc.license,
      specialization: 'General Practitioner'
    });

    if (dbError) console.error(`Error inserting doctor ${doc.full_name}:`, dbError.message);
  }

  // 2. Create Patients
  const patients = [
    { email: 'patient@test.com', password: 'testpass123', first: 'John', last: 'Doe' },
    { email: 'alice@demo.com', password: 'testpass123', first: 'Alice', last: 'Johnson' },
    { email: 'bob@demo.com', password: 'testpass123', first: 'Bob', last: 'Smith' },
  ];

  for (const pat of patients) {
    console.log(`Checking/Creating patient: ${pat.first} ${pat.last}...`);
    
    const { data: userData } = await supabase.auth.admin.listUsers();
    const existingUser = userData?.users.find(u => u.email === pat.email);
    
    let userId;
    if (existingUser) {
      console.log(`User ${pat.email} already exists.`);
      userId = existingUser.id;
    } else {
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: pat.email,
          password: pat.password,
          email_confirmed: true,
          user_metadata: { role: 'patient', first_name: pat.first, last_name: pat.last }
        });

        if (authError) {
          console.warn(`Warning: Could not create auth user for ${pat.email}: ${authError.message}`);
          continue;
        }
        userId = authUser.user.id;
    }
    
    await supabase.from('profiles').upsert({
      id: userId,
      email: pat.email,
      first_name: pat.first,
      last_name: pat.last,
      role: 'patient'
    });
  }

  console.log('--- Seeding Complete ---');
}

seed().catch(err => console.error(err));
