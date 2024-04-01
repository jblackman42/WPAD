const path = require('path');
const cors = require('cors');
const express = require('express');
const ical = require('ical-generator').default;
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
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.SESSION_SECRET === 'production', maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(passport.initialize());
app.use(passport.session());


// add middlewares
const root = require('path').join(__dirname, 'build');
app.use(express.static(root));

app.use('/api/wpad', require('./routes/wpad.js'));
app.use('/calendar-invite', (req, res) => {
  const {dates} = req.query;

  try {
    const pattern = dates.split(',')
  
    const cal = ical({name: "We Pray All Day Calendar"});
  
    pattern.forEach(date => {
      const startDate = new Date(date);
      const endDate = new Date(startDate.getTime() + 3600000);
  
      cal.createEvent({
        start: startDate,
        end: endDate,
        summary: "Hour of Prayer",
        description: "It's your time to pray! Here are some things to pray about:\nOur Hearts & Homes\nThe Church\nSalvations\nOurState\nOurNation\nAll the Earth\nYour Church\n\nAccess the full prayer guide here:\nhttps://weprayallday.com/guide",
        organizer: {
          name: "We Pray All Day",
          email: "info@weprayallday.com"
        }
      });
    });
    
    res.setHeader('Content-Disposition', 'attachment; filename="HourOfPrayer.ics"');
    res.setHeader('Content-Type', 'text/calendar');
    res.send(cal.toString());
  } catch (error) {
    console.log(error);
    res.status(500).send({error: 'Something went wrong. Please try again later.'})
  }
});
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