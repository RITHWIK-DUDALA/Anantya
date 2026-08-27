const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'; // Adjust as needed
// Note: If running against a deployed URL with auth, you'll need to provide an admin session cookie.
const ADMIN_COOKIE = process.env.ADMIN_COOKIE || '';

async function runTest() {
  console.log(`Starting concurrency load test against ${BASE_URL}\n`);

  // 1. Concurrent Paid Registrations
  console.log('--- Phase 1: 50 Concurrent Paid Registrations ---');
  const uId = Date.now().toString().slice(-6);
  const paidPromises = [];
  let successfulRegIds = [];
  
  const startPaid = Date.now();
  for (let i = 0; i < 50; i++) {
    // We intentionally duplicate some UTRs to test the race condition
    const utr = i < 10 ? `DUPEUTR${uId}A` : `UTR${uId}B${i.toString().padStart(4, '0')}`;
    const req = fetch(`${BASE_URL}/api/register/paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Test User ${i}`,
        email: `test${uId}_${i}@example.com`,
        phone: `9876543210`, // Hardcoded valid format
        dept: 'CSE', year: '3', role: 'Games Participant',
        games: ['Free Fire'],
        transactionId: utr
      })
    }).then(res => res.json()).catch(err => ({ error: err.message }));
    paidPromises.push(req);
  }

  const paidResults = await Promise.all(paidPromises);
  const paidLatency = Date.now() - startPaid;
  
  const paidSuccesses = paidResults.filter(r => r.success);
  const paidErrors = paidResults.filter(r => r.error);
  
  console.log(`Completed in ${paidLatency}ms`);
  console.log(`Successes: ${paidSuccesses.length}`);
  console.log(`Errors (Expected duplicates/conflicts): ${paidErrors.length}`);
  
  // Extract a successful regId to use for Phase 2 & 3
  if (paidSuccesses.length > 0) {
    successfulRegIds = paidSuccesses.map(r => r.regId);
  }

  // 2. Concurrent Free Registrations (Latency Test)
  console.log('\n--- Phase 2: 50 Concurrent Free Registrations ---');
  const freePromises = [];
  const startFree = Date.now();
  for (let i = 0; i < 50; i++) {
    const req = fetch(`${BASE_URL}/api/register/free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Free User ${i}`,
        email: `free${uId}_${i}@example.com`,
        phone: `9876543210`, 
        dept: 'CSE', year: '3', role: 'Games Participant',
        games: [] // Empty games = amount 0
      })
    }).then(res => res.json()).catch(err => ({ error: err.message }));
    freePromises.push(req);
  }

  const freeResults = await Promise.all(freePromises);
  const freeLatency = Date.now() - startFree;
  
  const freeSuccesses = freeResults.filter(r => r.success);
  const freeErrors = freeResults.filter(r => r.error);
  
  console.log(`Completed in ${freeLatency}ms (Avg: ${freeLatency / 50}ms/req)`);
  console.log(`Successes: ${freeSuccesses.length}`);
  console.log(`Errors: ${freeErrors.length}`);

  // We cannot easily test Venue Check-in & Game Entry automatically here without 
  // bypassing the Admin auth middleware or mocking an admin session.
  // The below code is a template for how to test it if you provide a valid admin cookie.

  if (ADMIN_COOKIE && successfulRegIds.length > 0) {
    console.log('\n--- Phase 3: 50 Concurrent Venue Check-ins (Race Condition) ---');
    const targetRegId = successfulRegIds[0];
    const checkinPromises = [];
    for (let i = 0; i < 50; i++) {
      checkinPromises.push(
        fetch(`${BASE_URL}/api/verify/venue-token-checkin`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Cookie': ADMIN_COOKIE 
          },
          body: JSON.stringify({ token: targetRegId })
        }).then(res => res.json()).catch(e => ({ error: e.message }))
      );
    }
    const checkinResults = await Promise.all(checkinPromises);
    const checkinSuccesses = checkinResults.filter(r => r.success);
    const checkinAlready = checkinResults.filter(r => r.error === 'ALREADY_CHECKED_IN');
    console.log(`Success (First scan): ${checkinSuccesses.length}`);
    console.log(`Blocked (Subsequent scans): ${checkinAlready.length}`);
    if (checkinSuccesses.length === 1) {
      console.log('✅ PASS: Only one check-in succeeded. Race condition prevented.');
    } else {
      console.log(`❌ FAIL: ${checkinSuccesses.length} check-ins succeeded!`);
    }
  } else {
    console.log('\n(Skipping Phase 3 & 4: No ADMIN_COOKIE provided to authenticate check-in endpoints)');
  }
}

runTest();
