const mongoose = require('mongoose');

const uri =
  "mongodb+srv://chat-user:lYciX0Np0hMT8uDD@cluster0.ivpxxpx.mongodb.net/chatdb?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => {
    console.log("✅ CONNECTED");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ FAILED:", err.message);
    process.exit(1);
  });
