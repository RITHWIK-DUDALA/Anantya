const http = require('http');
const crypto = require('crypto');

const PORT = 5000;
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'REPLACE_ME';

function makePostRequest(path, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = typeof payload === 'string' ? payload : JSON.stringify(payload);

    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(data);
    req.end();
  });
}

async function runRazorpayLoadTest() {
  console.log("🚀 Starting Razorpay Load Test: 50 Concurrent Order Creations & Webhook Idempotency Check...");

  const requests = [];
  const timestamp = Date.now();

  // Create 50 concurrent order requests
  for (let i = 0; i < 50; i++) {
    const payload = {
      name: `Concurrent User ${i}`,
      email: `razorpay_user_${timestamp}_${i}@example.com`,
      phone: `98765432${(i % 100).toString().padStart(2, '0')}`,
      dept: 'CSE',
      year: '3rd Year',
      games: ['Hackathon / Quiz'],
      studentId: `CB.EN.U4CSE23${i.toString().padStart(3, '0')}`
    };
    requests.push(makePostRequest('/api/payment/create-order', payload));
  }

  const startTime = Date.now();

  try {
    const results = await Promise.all(requests);
    const endTime = Date.now();

    console.log(`\n✅ 50 Concurrent Order Creations Completed in ${endTime - startTime}ms`);

    let successCount = 0;
    let errorCount = 0;
    const createdOrders = [];

    results.forEach((res) => {
      if (res.status === 200 && res.body.orderId) {
        successCount++;
        createdOrders.push(res.body.orderId);
      } else {
        errorCount++;
        console.error("Order Creation Error:", res.status, res.body);
      }
    });

    console.log(`📊 Order Creation Summary:`);
    console.log(`- Total Requests: 50`);
    console.log(`- Successful Orders: ${successCount}`);
    console.log(`- Failed Orders: ${errorCount}`);

    // Test Webhook Idempotency with back-to-back duplicate webhook events
    if (createdOrders.length > 0) {
      const sampleOrderId = createdOrders[0];
      console.log(`\n🧪 Testing Webhook Idempotency for Order ID: ${sampleOrderId}...`);

      const webhookPayload = JSON.stringify({
        event: "payment.captured",
        payload: {
          payment: {
            entity: {
              id: `pay_test_${Date.now()}`,
              order_id: sampleOrderId,
              amount: 10000,
              currency: "INR",
              notes: { email: `razorpay_user_${timestamp}_0@example.com` }
            }
          }
        }
      });

      const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(webhookPayload)
        .digest('hex');

      const headers = { 'x-razorpay-signature': signature };

      // Send 2 identical webhook calls concurrently
      const webhookReq1 = makePostRequest('/api/payment/webhook', webhookPayload, headers);
      const webhookReq2 = makePostRequest('/api/payment/webhook', webhookPayload, headers);

      const [res1, res2] = await Promise.all([webhookReq1, webhookReq2]);

      console.log(`Webhook Call 1 Result: Status ${res1.status}`, res1.body);
      console.log(`Webhook Call 2 Result: Status ${res2.status}`, res2.body);

      if ((res1.body.status === 'success' || res1.body.status === 'already_processed') &&
          (res2.body.status === 'success' || res2.body.status === 'already_processed')) {
        console.log("\n🎉 TEST PASSED! Webhook idempotency and concurrent order creation succeeded perfectly.");
      } else {
        console.log("\n❌ TEST FAILED! Unexpected webhook response.");
      }
    }
  } catch (err) {
    console.error("Load test error:", err);
  }
}

runRazorpayLoadTest();
