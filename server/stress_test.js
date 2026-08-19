async function runStressTest() {
  const url = 'http://localhost:5000/api/register/free';
  const requests = [];
  
  const numRequests = 40;
  console.log(`Starting stress test with ${numRequests} parallel registrations...`);
  
  for (let i = 1; i <= numRequests; i++) {
    const userData = {
      name: `Stress User ${i}`,
      email: `stressuser${i}_${Date.now()}@example.com`,
      phone: `9${String(i).padStart(9, '0')}`,
      dept: 'Computer Science',
      year: '2nd Year',
      role: 'Games Participant',
      games: ['Stress Game']
    };

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
        return { user: i, status: res.status, data };
    })
    .catch(err => ({ user: i, status: 'Error', error: err.message }));

    requests.push(request);
  }

  const startTime = Date.now();
  const results = await Promise.all(requests);
  const endTime = Date.now();
  
  const timeTaken = endTime - startTime;
  
  let successCount = 0;
  let errorCount = 0;
  let rateLimitedCount = 0;
  
  results.forEach(res => {
    if (res.status === 200 || res.status === 201) {
      successCount++;
    } else if (res.status === 429) {
      rateLimitedCount++;
    } else {
      errorCount++;
    }
  });

  console.log(`\n========================================`);
  console.log(`STRESS TEST RESULTS`);
  console.log(`========================================`);
  console.log(`Total Time Taken        : ${timeTaken} ms`);
  console.log(`Total Requests Sent     : ${requests.length}`);
  console.log(`Successful Registrations: ${successCount}`);
  console.log(`Rate Limited (429)      : ${rateLimitedCount}`);
  console.log(`Other Errors            : ${errorCount}`);
  console.log(`========================================\n`);
  
  console.log(`Details of 5 random responses:`);
  const samples = results.sort(() => 0.5 - Math.random()).slice(0, 5);
  samples.forEach(s => {
      console.log(`User ${s.user} -> Status: ${s.status}, Response:`, JSON.stringify(s.data).substring(0, 200));
  });
  
  console.log('\nChecking for any errors...');
  const errors = results.filter(r => r.status !== 200 && r.status !== 429);
  if (errors.length > 0) {
      console.log(JSON.stringify(errors.slice(0, 3), null, 2));
  }
}

runStressTest();
