const fetch = require('node-fetch');

// This requires node-fetch to be installed or running on Node v18+ where global fetch is available.
// Let's use standard HTTP requests just in case node-fetch is not installed.
const http = require('http');

const API_URL = 'http://localhost:5001/api/register/paid';

function makeRequest(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);

    const options = {
      hostname: 'localhost',
      port: 5001,
      path: '/api/register/paid',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          body: JSON.parse(body || '{}')
        });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(data);
    req.end();
  });
}

async function runLoadTest() {
  console.log("🚀 Starting Load Test: 50 Concurrent Requests...");

  const requests = [];

  // Group 1: 25 Unique Users with Unique Transaction IDs
  for (let i = 0; i < 25; i++) {
    const payload = {
      name: `Unique User ${i}`,
      email: `user${i}@example.com`,
      phone: `98765432${i.toString().padStart(2, '0')}`,
      dept: 'CSE',
      year: '2',
      role: 'Games Participant',
      games: 'Cricket',
      transactionId: `TXN${Date.now()}${i}`,
      studentId: `CB.EN.U4CSE23${i.toString().padStart(3, '0')}`
    };
    requests.push(makeRequest(payload));
  }

  // Group 2: 25 Concurrent Users trying to use the EXACT SAME transaction ID
  const duplicateTxnId = `DUPE${Date.now()}`;
  for (let i = 0; i < 25; i++) {
    const payload = {
      name: `Duplicate User ${i}`,
      email: `dupe${i}@example.com`,
      phone: `99999999${i.toString().padStart(2, '0')}`,
      dept: 'ECE',
      year: '3',
      role: 'Games Participant',
      games: 'Volleyball',
      transactionId: duplicateTxnId,
      studentId: `CB.EN.U4ECE23${i.toString().padStart(3, '0')}`
    };
    requests.push(makeRequest(payload));
  }

  const startTime = Date.now();
  
  try {
    // Fire all 50 requests simultaneously
    const results = await Promise.all(requests);
    const endTime = Date.now();

    console.log(`\n✅ Test Completed in ${endTime - startTime}ms`);
    
    // Analyze results
    let successCount = 0;
    let conflictCount = 0;
    let otherErrors = 0;

    results.forEach(res => {
      if (res.status === 200) successCount++;
      else if (res.status === 409) conflictCount++; // Duplicate Txn caught
      else {
        otherErrors++;
        console.error("Other error:", res.status, res.body);
      }
    });

    console.log("\n📊 Results Summary:");
    console.log(`Total Requests: 50`);
    console.log(`Successful Registrations: ${successCount}`);
    console.log(`Prevented Duplicates (409 Conflict): ${conflictCount}`);
    console.log(`Other Errors: ${otherErrors}`);

    console.log("\n🧪 Expectations:");
    console.log("- Successful Registrations should be 26 (25 unique + 1 from the duplicate group).");
    console.log("- Prevented Duplicates should be 24 (the remaining 24 from the duplicate group).");
    
    if (successCount === 26 && conflictCount === 24) {
      console.log("\n🎉 TEST PASSED! The server perfectly handled concurrency and atomic transactions.");
    } else {
      console.log("\n❌ TEST FAILED! Unexpected results.");
    }

  } catch (err) {
    console.error("Test failed with error:", err);
  }
}

runLoadTest();
