// Lightweight script to test all backend API endpoints without Postman
// Run with: node test-api.js

const BASE_URL = "http://localhost:5001/api/notes";

async function testAPI() {
  console.log("🚀 Starting API Tests against", BASE_URL);

  try {
    // 1. GET all notes
    console.log("\n1️⃣ GET /api/notes");
    let res = await fetch(BASE_URL);
    let data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);

    // 2. CREATE a note
    console.log("\n2️⃣ POST /api/notes");
    res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Note from Script",
        content: "Testing backend API automatically."
      })
    });
    data = await res.json();
    console.log("Status:", res.status);
    console.log("Response:", data);

    const createdId = data.note?._id;

    if (createdId) {
      // 3. GET note by ID
      console.log(`\n3️⃣ GET /api/notes/${createdId}`);
      res = await fetch(`${BASE_URL}/${createdId}`);
      data = await res.json();
      console.log("Status:", res.status);
      console.log("Response:", data);

      // 4. UPDATE the note
      console.log(`\n4️⃣ PUT /api/notes/${createdId}`);
      res = await fetch(`${BASE_URL}/${createdId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Updated Test Note",
          content: "Updated content via automated script."
        })
      });
      data = await res.json();
      console.log("Status:", res.status);
      console.log("Response:", data);

      // 4. DELETE the note
      console.log(`\n4️⃣ DELETE /api/notes/${createdId}`);
      res = await fetch(`${BASE_URL}/${createdId}`, {
        method: "DELETE"
      });
      data = await res.json();
      console.log("Status:", res.status);
      console.log("Response:", data);
    }

    console.log("\n✅ All API tests completed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log("💡 Tip: Make sure your server is running on http://localhost:5001");
  }
}

testAPI();
