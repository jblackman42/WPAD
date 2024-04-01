var cron = require('node-cron');
const MinistryPlatformAPI = require('ministry-platform-api-wrapper');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getPrayerSchedules = async () => await MinistryPlatformAPI.request('get', '/tables/Prayer_Schedules', {"$select":"WPAD_Community_ID_Table.[Reminder_Text], Prayer_Schedules.[Prayer_Schedule_ID], Prayer_Schedules.[First_Name], Prayer_Schedules.[Last_Name], Prayer_Schedules.[Start_Date], Prayer_Schedules.[End_Date], Prayer_Schedules.[Email], Prayer_Schedules.[Phone], Prayer_Schedules.[Contact_ID], Prayer_Schedules.[_Signup_Date], Prayer_Schedules.[Message_Status], Prayer_Schedules.[Message_SID], Prayer_Schedules.[WPAD_Community_ID], Prayer_Schedules.[Cancelled], Prayer_Schedules.[_Prayer_Schedule_GUID], Prayer_Schedules.[WPAD_User_ID], Prayer_Schedules.[5min_Reminder], Prayer_Schedules.[1hr_Reminder], Prayer_Schedules.[24hr_Reminder], Prayer_Schedules.[3d_Reminder], Prayer_Schedules.[7d_Reminder]","$filter":"Prayer_Schedules.[Start_Date] > GETDATE() AND Prayer_Schedules.[Start_Date] < GETDATE()+7 AND ([5min_Reminder]=1 OR [1hr_Reminder]=1 OR [24hr_Reminder]=1 OR [3d_Reminder]=1 OR [7d_Reminder]=1)","$orderby":"Prayer_Schedules.[Start_Date]"}, {});

const get5MinReminderText = (name, prayerPoints) => {
  return `Hi ${name}! It's your time to pray! Here are some things to pray about\n\n${prayerPoints}\n\nAccess the full prayer guide here:\nhttps://weprayallday.com/guide\n\nReply 'STOP' to unsubscribe.`
}
const get1HrReminderText = (name) => {
  return `Hi ${name}! In just 1 hour, it will be your moment to joi n in prayer. Ready your heart and find a quiet space.\n\nAccess the full prayer guide here:\nhttps://weprayallday.com/guide\n\nReply 'STOP' to unsubscribe.`
}
const get24HrReminderEmail = (name) => {
  return {
    subject: 'Tommorrow Is Your Prayer Day',
    html: `
      <body style="margin: 0;padding: 0;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
        <div class="container" style="max-width: 768px;margin: 0 auto;background-color: #f1f2f6 !important;">
          <div class="img-container" style="background-color: #2e2d2b !important;color: white;display: grid;place-items: center;font-size: 1.2rem;padding: 1rem;">
            <img src="http://weprayallday.com/static/media/final-logo-transparent.1d7a5db3bbd74cda0d94.png" alt="We Pray All Day" style="width: 300px;max-width: 90%;margin: 0 auto;">
          </div>
          <p id="banner" style="background-image:url('https://www.pureheart.org/wp-content/uploads/2024/03/wpadyellow.png');background-repeat:repeat;width: 100%;color: black;margin: 0;padding: 1rem 0;text-align: center;text-transform: uppercase;font-weight: bold;">Tomorrow is your prayer day</p>
          <div class="content" style="max-width: 90%;margin: 0 auto;padding: 1rem;">
            <p style="margin: 0;">Hi ${name},</p><br>
            <p style="margin: 0;">As we approach your prayer time tomorrow, we hope you are feeling prepared to connect and reflect. This is a gentle reminder to keep your heart and mind open for the experience.</p><br>
            <p style="margin: 0;">Find inspiration for your time of prayer by visiting our prayer guide at the link below.</p><br>
            <div class="btn-container" style="width: 100%;display: flex;justify-content: center;">
              <a href="https://weprayallday.com/guide" target="_blank" style="background-image:url('https://www.pureheart.org/wp-content/uploads/2024/03/wpadyellow.png');background-repeat:repeat;text-decoration: none;font-size: 1rem;font-weight: bold;border: none;color: black;padding: .5rem 1rem;border-radius: 4px;cursor: pointer;">Prayer Guide</a>
            </div>
          </div>
        </div>
      </body>
    `
  }
}
const get3DayReminderEmail = (name) => {
  return {
    subject: 'Your Prayer Time Is In 3 Days',
    html: `
      <body style="margin: 0;padding: 0;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
        <div class="container" style="max-width: 768px;margin: 0 auto;background-color: #f1f2f6 !important;">
          <div class="img-container" style="background-color: #2e2d2b !important;color: white;display: grid;place-items: center;font-size: 1.2rem;padding: 1rem;">
            <img src="http://weprayallday.com/static/media/final-logo-transparent.1d7a5db3bbd74cda0d94.png" alt="We Pray All Day" style="width: 300px;max-width: 90%;margin: 0 auto;">
          </div>
          <p id="banner" style="background-image:url('https://www.pureheart.org/wp-content/uploads/2024/03/wpadyellow.png');background-repeat:repeat;width: 100%;color: black;margin: 0;padding: 1rem 0;text-align: center;text-transform: uppercase;font-weight: bold;">Your Prayer Time Is In 3 Days</p>
          <div class="content" style="max-width: 90%;margin: 0 auto;padding: 1rem;">
            <p style="margin: 0;">Hi ${name},</p><br>
            <p style="margin: 0;">Just a reminder that in 3 days, you'll be dedicating an hour to prayer. This is a wonderful opportunity to gather your thoughts and intentions for this meaningful commitment.</p><br>
            <p style="margin: 0;">Prepare ahead by visiting our prayer guide at the link below.</p><br>
            <div class="btn-container" style="width: 100%;display: flex;justify-content: center;">
              <a href="https://weprayallday.com/guide" target="_blank" style="background-image:url('https://www.pureheart.org/wp-content/uploads/2024/03/wpadyellow.png');background-repeat:repeat;text-decoration: none;font-size: 1rem;font-weight: bold;border: none;color: black;padding: .5rem 1rem;border-radius: 4px;cursor: pointer;">Prayer Guide</a>
            </div>
          </div>
        </div>
      </body>
    `
  }
}
const get7DayReminderEmail = (name) => {
  return {
    subject: 'One Week Until Your Prayer Time',
    html: `
      <body style="margin: 0;padding: 0;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
        <div class="container" style="max-width: 768px;margin: 0 auto;background-color: #f1f2f6 !important;">
          <div class="img-container" style="background-color: #2e2d2b !important;color: white;display: grid;place-items: center;font-size: 1.2rem;padding: 1rem;">
            <img src="http://weprayallday.com/static/media/final-logo-transparent.1d7a5db3bbd74cda0d94.png" alt="We Pray All Day" style="width: 300px;max-width: 90%;margin: 0 auto;">
          </div>
          <p id="banner" style="background-image:url('https://www.pureheart.org/wp-content/uploads/2024/03/wpadyellow.png');background-repeat:repeat;width: 100%;color: black;margin: 0;padding: 1rem 0;text-align: center;text-transform: uppercase;font-weight: bold;">One Week Until Your Prayer Time</p>
          <div class="content" style="max-width: 90%;margin: 0 auto;padding: 1rem;">
            <p style="margin: 0;">Hi ${name},</p><br>
            <p style="margin: 0;">Your prayer time is one week away! This is an excellent time to start preparing mentally and spiritually for this commitment.</p><br>
            <p style="margin: 0;">For guidance and reflection, please visit our prayer guide at the link below.</p><br>
            <div class="btn-container" style="width: 100%;display: flex;justify-content: center;">
              <a href="https://weprayallday.com/guide" target="_blank" style="background-image:url('https://www.pureheart.org/wp-content/uploads/2024/03/wpadyellow.png');background-repeat:repeat;text-decoration: none;font-size: 1rem;font-weight: bold;border: none;color: black;padding: .5rem 1rem;border-radius: 4px;cursor: pointer;">Prayer Guide</a>
            </div>
          </div>
        </div>
      </body>
    `
  }
}

const sendText = (phone, message) => client.messages
  .create({
    body: message,
    to: phone,
    messagingServiceSid: process.env.TWILIO_SERVICE_SID
  })
  .then(message => message)
  .catch(error => console.error(error));

const sendEmail = (email, content) => sgMail
  .send({
    to: email,
    from: 'noreply@weprayallday.com',
    subject: content.subject,
    content: [{
      type: 'text/html',
      value: content.html
    }]
  })
  .then(email => email)
  .catch(error => console.error(error));
// const sendText = (phone, message) => console.log(`texting ${phone}: ${message}`)

const handleNotifications = (prayerSchedules) => {
  const schedulesToUpdate = [];
  let date = new Date();
  let options = {timeZone: 'US/Arizona'};
  let aztime = new Date(date.toLocaleString('en-US', options));
  // get any where startdate is within 1hr
  const fiveMinsToMs = 1000 * 60 * 5;
  const hourToMs = 1000 * 60 * 60;
  const dayToMs = 1000 * 60 * 60 * 24;
  const threeDaysToMs = 1000 * 60 * 60 * 24 * 3;
  const sevenDaysToMs = 1000 * 60 * 60 * 24 * 7;
  const prayerSchedulesWithin5Mins = prayerSchedules.filter(schedule => schedule['5min_Reminder'] === true && new Date(schedule.Start_Date) - aztime <= fiveMinsToMs);
  const prayerSchedulesWithin1Hr = prayerSchedules.filter(schedule => schedule['1hr_Reminder'] === true && new Date(schedule.Start_Date) - aztime <= hourToMs);
  const prayerSchedulesWithin1D = prayerSchedules.filter(schedule => schedule['24hr_Reminder'] === true && new Date(schedule.Start_Date) - aztime <= dayToMs);
  const prayerSchedulesWithin3D = prayerSchedules.filter(schedule => schedule['3d_Reminder'] === true && new Date(schedule.Start_Date) - aztime <= threeDaysToMs);
  const prayerSchedulesWithin7D = prayerSchedules.filter(schedule => schedule['7d_Reminder'] === true && new Date(schedule.Start_Date) - aztime <= sevenDaysToMs);

  // loop through 5min and 1hr and send texts
  prayerSchedulesWithin5Mins.forEach(schedule => {
    const prayerPoints = schedule.Reminder_Text ?? 'Our Hearts & Homes\nThe Church\nSalvations\nOur State\nOur Nation\nAll the Earth\nYour Church';
    sendText(process.env.NODE_ENV === 'production' ? schedule.Phone : process.env.TEST_PHONE, get5MinReminderText(schedule.First_Name, prayerPoints));
    schedule['5min_Reminder'] = false;
    schedulesToUpdate.push(schedule);
  });
  prayerSchedulesWithin1Hr.forEach(schedule => {
    sendText(process.env.TEST_PHONE, get1HrReminderText(schedule.First_Name));
    schedule['1hr_Reminder'] = false;
    schedulesToUpdate.push(schedule);
  });
  // loop through 1d, 3d, and 7d and send emails
  prayerSchedulesWithin1D.forEach(schedule => {
    sendEmail(process.env.NODE_ENV === 'production' ? schedule.Email : process.env.TEST_EMAIL, get24HrReminderEmail(schedule.First_Name));
    schedule['24hr_Reminder'] = false;
    schedulesToUpdate.push(schedule);
  });
  prayerSchedulesWithin3D.forEach(schedule => {
    sendEmail(process.env.NODE_ENV === 'production' ? schedule.Email : process.env.TEST_EMAIL, get3DayReminderEmail(schedule.First_Name));
    schedule['3d_Reminder'] = false;
    schedulesToUpdate.push(schedule);
  });
  prayerSchedulesWithin7D.forEach(schedule => {
    sendEmail(process.env.NODE_ENV === 'production' ? schedule.Email : process.env.TEST_EMAIL, get7DayReminderEmail(schedule.First_Name));
    schedule['7d_Reminder'] = false;
    schedulesToUpdate.push(schedule);
  });

  // in MP, turn off any notifications that were sent so they don't get sent again
  MinistryPlatformAPI.request('put', '/tables/Prayer_Schedules', {}, schedulesToUpdate);

  console.log('Schedules within 5mins: ',prayerSchedulesWithin5Mins.length);
  console.log('Schedules within 1hr: ',prayerSchedulesWithin1Hr.length);
  console.log('Schedules within 1d: ',prayerSchedulesWithin1D.length);
  console.log('Schedules within 3d: ',prayerSchedulesWithin3D.length);
  console.log('Schedules within 7d: ',prayerSchedulesWithin7D.length);
  console.log('---------------------------------------------')
}

const scheduler = () => getPrayerSchedules()
  .then(prayerSchedules => handleNotifications(prayerSchedules))
  .catch(error => console.error(error));

const runScheduler = () => {
  console.log('Initiating notification scheduler');
  // scheduler();
  return cron.schedule('*/5 * * * *', scheduler);
};

module.exports = runScheduler;