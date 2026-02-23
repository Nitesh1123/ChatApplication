const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(() => {
    console.log("✅ CONNECTED");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ FAILED:", err.message);
    process.exit(1);
  });
