// Token Enforcement Test Script
// Run this in browser console while logged into SkaiScraper

async function testTokenEnforcement() {
  console.log("🧪 Testing Token Enforcement");

  // Test 1: Check current balance
  console.log("\n1️⃣ Checking Current Token Balance");
  try {
    const balanceResponse = await fetch("/api/wallet/balance");
    const balance = await balanceResponse.json();
    console.log("Current balance:", balance);
  } catch (error) {
    console.error("❌ Balance check failed:", error);
  }

  // Test 2: Generate multiple mockups
  console.log("\n2️⃣ Testing Mockup Generation (99 tokens each)");
  for (let i = 1; i <= 4; i++) {
    console.log(`\nAttempting mockup ${i}...`);
    try {
      const response = await fetch("/api/generate-mockup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: `Test mockup ${i} - SkaiScraper dashboard with token display`,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ Mockup ${i} successful. New balance:`, result.balance);
      } else if (response.status === 402) {
        console.log(`💰 Mockup ${i} failed - insufficient tokens (Expected!)`);
        console.log("Error details:", result);
        break;
      } else {
        console.log(`❌ Mockup ${i} failed:`, response.status, result);
      }
    } catch (error) {
      console.error(`❌ Mockup ${i} error:`, error);
    }
  }

  // Test 3: Check balance after
  console.log("\n3️⃣ Final Balance Check");
  try {
    const balanceResponse = await fetch("/api/wallet/balance");
    const balance = await balanceResponse.json();
    console.log("Final balance:", balance);
  } catch (error) {
    console.error("❌ Final balance check failed:", error);
  }
}

// Test wallet top-up flow
async function testTopUpFlow() {
  console.log("\n💰 Testing Top-Up Flow");

  try {
    const response = await fetch("/api/billing/token-pack/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "tokens",
        tokenPackIndex: 0, // $25 pack
        quantity: 1,
      }),
    });

    const result = await response.json();

    if (response.ok && result.url) {
      console.log("✅ Top-up checkout URL generated:", result.url);
      console.log("Open this URL to complete test payment");
    } else {
      console.error("❌ Top-up flow failed:", result);
    }
  } catch (error) {
    console.error("❌ Top-up test error:", error);
  }
}

// Run the tests
console.log("Starting SkaiScraper Token Tests...");
console.log("Make sure you are logged in and have a valid session");
testTokenEnforcement();
