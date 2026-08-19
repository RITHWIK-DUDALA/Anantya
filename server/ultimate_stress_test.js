async function runUltimateStressTest() {
  const baseUrl = 'http://localhost:5000/api';
  const requests = [];
  
  const numRequests = 50;
  console.log(`Starting ULTIMATE stress test with ${numRequests} parallel requests across multiple endpoints...`);
  
  for (let i = 1; i <= numRequests; i++) {
    // 0: Free Reg, 1: Paid Reg, 2: Check Game Status, 3: Check Movie Status
    const type = i % 4; 
    let url, payload;
    let endpointName = '';
    
    const baseUserData = {
      name: `Ultimate User ${i}`,
      email: `ultimate${i}_${Date.now()}@example.com`,
      phone: `9${String(i).padStart(9, '0')}`,
      dept: 'Robotics',
      year: '4th Year',
    };

    if (type === 0) {
      endpointName = 'Free Reg';
      url = `${baseUrl}/register/free`;
      payload = {
        ...baseUserData,
        role: 'Games Participant',
        games: ['Chess', 'Carrom']
      };
    } else if (type === 1) {
      endpointName = 'Paid Reg';
      url = `${baseUrl}/register/paid`;
      payload = {
        ...baseUserData,
        role: 'Games Participant',
        games: ['BGMI', 'FreeFire'],
        transactionId: `ULT_TXN${Date.now()}${i}`
      };
    } else if (type === 2) {
      endpointName = 'Game Status';
      url = `${baseUrl}/verify/status-login`;
      payload = {
        email: `dummy${i}@example.com`,
        token: `123456`
      };
    } else {
      endpointName = 'Movie Status';
      url = `${baseUrl}/verify/movie-status-login`;
      payload = {
        email: `dummy${i}@example.com`,
        token: `123456`
      };
    }

    const request = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(async res => {
        const text = await res.text();
        let data = {};
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { error: text };
        }
        return { user: i, type: endpointName, status: res.status, data };
    })
    .catch(err => ({ user: i, type: endpointName, status: 'Error', error: err.message }));

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
    expectedFails: 0,
    byType: {
      'Free Reg': { success: 0, fail: 0 },
      'Paid Reg': { success: 0, fail: 0 },
      'Game Status': { success: 0, fail: 0 },
      'Movie Status': { success: 0, fail: 0 }
    }
  };
  
  results.forEach(res => {
    // 401 is expected for status checks because we use dummy data
    const isExpectedFail = (res.type.includes('Status') && res.status === 401);
    
    if (res.status === 200 || res.status === 201) {
      stats.success++;
      stats.byType[res.type].success++;
    } else if (isExpectedFail) {
      stats.expectedFails++;
      stats.byType[res.type].success++; // Count it as a successful test of the endpoint
    } else if (res.status === 429) {
      stats.rateLimited++;
      stats.byType[res.type].fail++;
    } else {
      stats.errors++;
      stats.byType[res.type].fail++;
    }
  });

  console.log(`\n========================================`);
  console.log(`ULTIMATE STRESS TEST RESULTS`);
  console.log(`========================================`);
  console.log(`Total Time Taken        : ${timeTaken} ms`);
  console.log(`Total Requests Sent     : ${stats.total}`);
  console.log(`Successful Ops (200s)   : ${stats.success}`);
  console.log(`Expected Fails (401s)   : ${stats.expectedFails}`);
  console.log(`Rate Limited (429)      : ${stats.rateLimited}`);
  console.log(`Other Errors            : ${stats.errors}`);
  console.log(`\nBreakdown by Action Type (Success includes 401s for Status):`);
  console.log(`  Free Reg     : ${stats.byType['Free Reg'].success} success, ${stats.byType['Free Reg'].fail} fail`);
  console.log(`  Paid Reg     : ${stats.byType['Paid Reg'].success} success, ${stats.byType['Paid Reg'].fail} fail`);
  console.log(`  Game Status  : ${stats.byType['Game Status'].success} success, ${stats.byType['Game Status'].fail} fail`);
  console.log(`  Movie Status : ${stats.byType['Movie Status'].success} success, ${stats.byType['Movie Status'].fail} fail`);
  console.log(`========================================\n`);
  
  console.log(`Details of 4 random responses:`);
  const samples = results.sort(() => 0.5 - Math.random()).slice(0, 4);
  samples.forEach(s => {
      console.log(`User ${s.user} (${s.type}) -> HTTP ${s.status}, Response:`, JSON.stringify(s.data).substring(0, 150));
  });
  
  console.log('\nChecking for any unexpected errors...');
  const errors = results.filter(r => r.status !== 200 && r.status !== 201 && r.status !== 429 && !(r.type.includes('Status') && r.status === 401));
  if (errors.length > 0) {
      console.log(JSON.stringify(errors.slice(0, 3), null, 2));
  } else {
      console.log("No unexpected errors found! Server handled the load gracefully.");
  }
}

runUltimateStressTest();
