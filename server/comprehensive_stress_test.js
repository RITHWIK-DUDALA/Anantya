async function runComprehensiveStressTest() {
  const freeUrl = 'http://localhost:5000/api/register/free';
  const paidUrl = 'http://localhost:5000/api/register/paid';
  const requests = [];
  
  const numRequests = 60;
  console.log(`Starting comprehensive stress test with ${numRequests} parallel registrations...`);
  
  for (let i = 1; i <= numRequests; i++) {
    // 0: Free, 1: Volunteer, 2: Paid
    const type = i % 3; 
    let url, userData;
    
    const baseUserData = {
      name: `Comprehensive User ${i}`,
      email: `compuser${i}_${Date.now()}@example.com`,
      phone: `9${String(i).padStart(9, '0')}`,
      dept: 'Information Technology',
      year: '3rd Year',
    };

    if (type === 0) {
      // Free
      url = freeUrl;
      userData = {
        ...baseUserData,
        role: 'Games Participant',
        games: ['Rangoli']
      };
    } else if (type === 1) {
      // Volunteer
      url = freeUrl;
      userData = {
        ...baseUserData,
        role: 'Decoration Volunteer',
        games: ['Fancy Dress']
      };
    } else {
      // Paid
      url = paidUrl;
      userData = {
        ...baseUserData,
        role: 'Games Participant',
        games: ['Cricket', 'Dahi Handi'],
        transactionId: `TXN${Date.now()}${i}`
      };
    }

    const request = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    .then(async res => {
        const text = await res.text();
        let data = {};
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { error: text };
        }
        return { user: i, type: type === 0 ? 'Free' : (type === 1 ? 'Volunteer' : 'Paid'), status: res.status, data };
    })
    .catch(err => ({ user: i, type: type === 0 ? 'Free' : (type === 1 ? 'Volunteer' : 'Paid'), status: 'Error', error: err.message }));

    requests.push(request);
  }

  const startTime = Date.now();
  const results = await Promise.all(requests);
  const endTime = Date.now();
  
  const timeTaken = endTime - startTime;
  
  const stats = {
    total: requests.length,
    success: 0,
    rateLimited: 0,
    errors: 0,
    byType: {
      Free: { success: 0, fail: 0 },
      Volunteer: { success: 0, fail: 0 },
      Paid: { success: 0, fail: 0 }
    }
  };
  
  results.forEach(res => {
    if (res.status === 200 || res.status === 201) {
      stats.success++;
      stats.byType[res.type].success++;
    } else if (res.status === 429) {
      stats.rateLimited++;
      stats.byType[res.type].fail++;
    } else {
      stats.errors++;
      stats.byType[res.type].fail++;
    }
  });

  console.log(`\n========================================`);
  console.log(`COMPREHENSIVE STRESS TEST RESULTS`);
  console.log(`========================================`);
  console.log(`Total Time Taken        : ${timeTaken} ms`);
  console.log(`Total Requests Sent     : ${stats.total}`);
  console.log(`Successful Registrations: ${stats.success}`);
  console.log(`Rate Limited (429)      : ${stats.rateLimited}`);
  console.log(`Other Errors            : ${stats.errors}`);
  console.log(`\nBreakdown by Type:`);
  console.log(`  Free      : ${stats.byType.Free.success} success, ${stats.byType.Free.fail} fail`);
  console.log(`  Volunteer : ${stats.byType.Volunteer.success} success, ${stats.byType.Volunteer.fail} fail`);
  console.log(`  Paid      : ${stats.byType.Paid.success} success, ${stats.byType.Paid.fail} fail`);
  console.log(`========================================\n`);
  
  console.log(`Details of 3 random responses:`);
  const samples = results.sort(() => 0.5 - Math.random()).slice(0, 3);
  samples.forEach(s => {
      console.log(`User ${s.user} (${s.type}) -> Status: ${s.status}, Response:`, JSON.stringify(s.data).substring(0, 150));
  });
  
  console.log('\nChecking for any errors...');
  const errors = results.filter(r => r.status !== 200 && r.status !== 429);
  if (errors.length > 0) {
      console.log(JSON.stringify(errors.slice(0, 3), null, 2));
  }
}

runComprehensiveStressTest();
