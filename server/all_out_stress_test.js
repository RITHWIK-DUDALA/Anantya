async function runAllOutStressTest() {
  const baseUrl = 'http://localhost:5000/api';
  const numRequests = 100;
  console.log(`Starting ALL OUT stress test with ${numRequests} parallel users across EVERYTHING...`);
  
  // 1. Fetch valid showtimes for Movie Booking test
  let showtimeId = null;
  try {
      const showsRes = await fetch(`${baseUrl}/movies/shows`);
      const shows = await showsRes.json();
      if (shows && shows.length > 0) {
          showtimeId = shows[0].id;
      }
  } catch (err) {
      console.log('Failed to fetch showtimes, skipping movie booking test sequence.');
  }

  const requests = [];

  for (let i = 1; i <= numRequests; i++) {
    // Determine user action (0 to 5)
    // 0: Free Game, 1: Paid Game, 2: Volunteer Game, 3: Game Status, 4: Movie Status, 5: Movie Booking Sequence
    const type = i % 6; 
    let endpointName = '';
    
    const baseUserData = {
      name: `AllOut User ${i}`,
      email: `allout${i}_${Date.now()}@example.com`,
      phone: `9${String(i).padStart(9, '0')}`,
      dept: 'Mechanical',
      year: '1st Year',
    };

    let requestPromise;

    if (type === 0) {
      endpointName = 'Free Reg';
      requestPromise = fetch(`${baseUrl}/register/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseUserData, role: 'Games Participant', games: ['Chess'] })
      }).then(res => res.status);
    } 
    else if (type === 1) {
      endpointName = 'Paid Reg';
      requestPromise = fetch(`${baseUrl}/register/paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseUserData, role: 'Games Participant', games: ['BGMI'], transactionId: `ALL_TXN${Date.now()}${i}` })
      }).then(res => res.status);
    }
    else if (type === 2) {
      endpointName = 'Volunteer Reg';
      requestPromise = fetch(`${baseUrl}/register/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...baseUserData, role: 'Decoration Volunteer', games: [] })
      }).then(res => res.status);
    }
    else if (type === 3) {
      endpointName = 'Game Status';
      requestPromise = fetch(`${baseUrl}/verify/status-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `dummy${i}@example.com`, token: `123456` })
      }).then(res => res.status);
    }
    else if (type === 4) {
      endpointName = 'Movie Status';
      requestPromise = fetch(`${baseUrl}/verify/movie-status-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: `dummy${i}@example.com`, token: `123456` })
      }).then(res => res.status);
    }
    else if (type === 5) {
      endpointName = 'Movie Booking Seq';
      if (!showtimeId) {
          requestPromise = Promise.resolve('Skipped (No Showtime)');
      } else {
          // The Movie Sequence
          requestPromise = (async () => {
              try {
                  // 1. Session
                  const sessionRes = await fetch(`${baseUrl}/movies/session`, { method: 'POST' });
                  if (sessionRes.status === 429) return 429;
                  const sessionData = await sessionRes.json();
                  const token = sessionData.token;

                  if (!token) return 500;

                  // 2. Lock Seat (pick a random seat to intentionally cause some conflicts to test transactions)
                  const row = ['B', 'C', 'D'][i % 3];
                  const seatId = `${row}-${(i % 10) + 1}`;
                  
                  const lockRes = await fetch(`${baseUrl}/movies/lock-seat`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ showtimeId, seatId, sessionToken: token })
                  });
                  if (lockRes.status === 429) return 429;
                  if (lockRes.status !== 200) {
                      // Lock conflict (409) is expected under high load
                      return lockRes.status;
                  }

                  // 3. Book Seat
                  const bookRes = await fetch(`${baseUrl}/movies/book`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                          showtimeId, 
                          sessionToken: token, 
                          seats: [seatId],
                          name: baseUserData.name,
                          email: baseUserData.email,
                          phone: baseUserData.phone,
                          transactionId: `MOV_TXN${Date.now()}${i}`
                      })
                  });
                  return bookRes.status;
              } catch (e) {
                  return 'Error';
              }
          })();
      }
    }

    // Wrap the promise to track stats
    requests.push(
        requestPromise
        .then(status => ({ user: i, type: endpointName, status }))
        .catch(err => ({ user: i, type: endpointName, status: 'Error' }))
    );
  }

  const startTime = Date.now();
  const results = await Promise.all(requests);
  const endTime = Date.now();
  
  const timeTaken = endTime - startTime;
  
  const stats = {
    total: requests.length,
    success: 0, // 200s
    expectedFails: 0, // 401s, 400s (Txn format), 409s (Seat lock conflict)
    rateLimited: 0, // 429s
    errors: 0,
    byType: {}
  };
  
  results.forEach(res => {
    if (!stats.byType[res.type]) stats.byType[res.type] = { success: 0, expectedFail: 0, rateLimited: 0, error: 0 };
    
    // Evaluate if the status is a success or expected failure based on the endpoint type
    let category = 'error';
    if (res.status === 200 || res.status === 201) {
        category = 'success';
        stats.success++;
    } else if (res.status === 429) {
        category = 'rateLimited';
        stats.rateLimited++;
    } else if (res.status === 401 && res.type.includes('Status')) {
        // Status APIs will 401 for dummy tokens
        category = 'expectedFail';
        stats.expectedFails++;
    } else if (res.status === 400 && res.type === 'Paid Reg') {
        // Dummy TXN id might fail length validation
        category = 'expectedFail';
        stats.expectedFails++;
    } else if ((res.status === 409 || res.status === 400) && res.type === 'Movie Booking Seq') {
        // Seat conflict (409) or format errors (400) during heavy concurrent bookings
        category = 'expectedFail';
        stats.expectedFails++;
    } else {
        stats.errors++;
    }
    
    stats.byType[res.type][category]++;
  });

  console.log(`\n========================================`);
  console.log(`ALL OUT STRESS TEST RESULTS`);
  console.log(`========================================`);
  console.log(`Total Time Taken        : ${timeTaken} ms`);
  console.log(`Total Requests Sent     : ${stats.total}`);
  console.log(`Successful Ops (200s)   : ${stats.success}`);
  console.log(`Expected Fails          : ${stats.expectedFails} (401 Bad Auth, 409 Seat Lock Conflicts, etc)`);
  console.log(`Rate Limited (429)      : ${stats.rateLimited}`);
  console.log(`Other/Unexpected Errors : ${stats.errors}`);
  console.log(`========================================\n`);
  
  console.log(`Breakdown by Action Type:`);
  for (const [type, data] of Object.entries(stats.byType)) {
      console.log(`  ${type.padEnd(20)}: ${data.success} Success | ${data.expectedFail} Expected Fails | ${data.rateLimited} Rate Limited | ${data.error} Errors`);
  }
}

runAllOutStressTest();
