const path = require('path');
const cors = require('cors');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const app = express(); // create express app
const bodyParser = require('body-parser');

// setup functions
require('dotenv').config();
require('./middleware/passport.js')(passport);

// import local functions
const connectDB = require('./lib/connect.js');
const runScheduler = require('./lib/wpad-notification-scheduler.js');

// middleware
app.use(cors());
app.use(bodyParser.json());

// add middlewares
const root = require('path').join(__dirname, 'build');
app.use(express.static(root));

app.use('/api/wpad', require('./routes/wpad.js'));
app.use('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Start the server
const port = process.env.PORT || 5000;
(async () => {
  try {
    app.listen(port,()=>console.log(`Server is listening on port ${port} - http://localhost:${port}`));
    connectDB();
    runScheduler();
  } catch (error) { console.log(error) }
})();