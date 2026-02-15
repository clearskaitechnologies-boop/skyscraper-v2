// Test OpenAI Vision Detection
// Run this with: node test-openai-vision.js

const admin = require("firebase-admin");
const { detectRoofDamageOpenAI } = require("./lib/openaiDetect");

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp();
}

async function testOpenAIVision() {
  try {
    console.log("Testing OpenAI Vision Detection...");

    // Mock context and data
    const mockContext = {
      auth: { uid: "test-user" },
    };

    const mockData = {
      userId: "test-user",
      imageUrl: "https://example.com/roof-image.jpg", // Replace with actual image URL
    };

    console.log("Calling detectRoofDamageOpenAI...");
    const result = await detectRoofDamageOpenAI(mockData, mockContext);

    console.log("OpenAI Vision Result:");
    console.log(JSON.stringify(result, null, 2));

    if (result.detections && Array.isArray(result.detections)) {
      console.log(`✅ Found ${result.detections.length} damage detections`);
      result.detections.forEach((detection, i) => {
        console.log(
          `  ${i + 1}. ${detection.label} at (${detection.x}, ${
            detection.y
          }) with score ${detection.score}`
        );
      });
    } else {
      console.log("❌ No detections array found in result");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testOpenAIVision();
