const mongoose = require('mongoose');

//connection to database
mongoose.connect(process.env.CONN_STR);

//connection state
const db = mongoose.connection;

//checking connection
db.on('connected', () => {
    console.log('Database connected successfully');
});

db.on('error', (err) => {
    console.log('Database connection error: ' + err);
});

module.exports = db;