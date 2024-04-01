const express = require('express');
const router = express.Router();
const CryptoJS = require('crypto-js');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const passport = require('passport');
const { setLoginSession, getLoginSession, checkLoginSession, checkAuthorizedCommunity } = require('../lib/auth.js');
const { removeTokenCookie  } = require('../lib/auth-cookie.js');

const MinistryPlatformAPI = require('ministry-platform-api-wrapper');

const getWPADEmailTemplate = ({First_Name, DateString, TimeString, Dates}) => {
  return `
  <body style="margin: 0;padding: 0;font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
    <div class="container" style="max-width: 768px;margin: 0 auto;background-color: #f1f2f6 !important;">
      <div class="img-container" style="background-color: #2e2d2b !important;color: white;display: grid;place-items: center;font-size: 1.2rem;padding: 1rem;">
        <img src="http://weprayallday.com/assets/final-logo-transparent.png" alt="We Pray All Day" style="width: 300px;max-width: 90%;margin: 0 auto;">
      </div>
      <p id="banner" style="background-image:url('https://www.pureheart.org/wp-content/uploads/2024/03/wpadyellow.png');background-repeat:repeat;width: 100%;color: black;margin: 0;padding: 1rem 0;text-align: center;text-transform: uppercase;font-weight: bold;">Thanks for signing up to pray</p>
      <div class="content" style="max-width: 90%;margin: 0 auto;padding: 1rem;">
        <p style="margin: 0;">Hi ${First_Name},</p><br>
        <p style="margin: 0;">We are so honored that you would pray with us! We have high expectations that God is going to do immeasurably more than we could ever seek ask or imagine!</p><br>
        <p style="margin: 0;">To help you remember your prayer time, add this to your calendar! It's simple all you gotta do is click it and accept</p><br>
        <p style="text-align: center;margin: 0;">${TimeString}</p>
        <div class="date-info" style="width: max-content;margin: 0 auto;">
          <p style="margin: 0;">${DateString}</p>
        </div><br>
        <div class="btn-container" style="width: 100%;display: flex;justify-content: center;">
          <a href="${process.env.DOMAIN_NAME}/calendar-invite/?dates=${Dates.toString()}" target="_blank" style="background-image:url('https://www.pureheart.org/wp-content/uploads/2024/03/wpadyellow.png');background-repeat:repeat;text-decoration: none;font-size: 1rem;font-weight: bold;border: none;color: black;padding: .5rem 1rem;border-radius: 4px;cursor: pointer;">Add to Calendar</a>
        </div>
      </div>
    </div>
  </body>
  `
};

const hashPassword = (input) => {
  let hash = CryptoJS.MD5(input);
  let base64 = CryptoJS.enc.Base64.stringify(hash);
  return base64;
}

const authenticate = async (method, req, res) => {
  new Promise((resolve, reject) => {
    passport.authenticate(method, {}, (error, user) => {
      if (error) {
        reject(error);
      } else {
        resolve(user);
      }
    })(req, res);
  })
}

router.post('/login', async (req, res) => {
  passport.authenticate('local', {}, (error, user) => {
    if (error) {
      // console.error(error);
      return res.status(401).send(error.message);
    }
    
    const session = { ...user };
    setLoginSession(res, session)
      .then(() => {
        res.status(200).send("Login successful");
      })
  })(req, res);
})

router.post('/logout', (req, res) => {
  try {
    removeTokenCookie(res);
    res.status(200).send("Logout successful");
  } catch(err) {
    res.status(500).send("Internal server error")
  }
})

router.get('/user', async (req, res) => {
  try {
    const session = await getLoginSession(req);
    const user = session ?? null;

    res.status(200).json({ ...user });
  } catch (error) {
    console.error(error);
    res.status(500).end("Authentication token is invalid, please log in");
  }
})

router.get('/myCommunity', checkLoginSession, async (req, res) => {
  
  // res.send(user);
  try {
    const user = await getLoginSession(req);
    const data = await MinistryPlatformAPI.request('get', '/tables/WPAD_Authorized_Users', {"$select":"WPAD_Community_ID_Table.[WPAD_Community_ID], WPAD_Community_ID_Table.[Community_Name], WPAD_Community_ID_Table.[Address], WPAD_Community_ID_Table.[City], WPAD_Community_ID_Table.[State], WPAD_Community_ID_Table.[Zip], WPAD_Community_ID_Table.[Start_Date], WPAD_Community_ID_Table.[Reminder_Text]","$filter":`user_ID=${user.User_ID} AND (WPAD_Community_ID_Table.[End_Date] IS NULL OR GETDATE() > WPAD_Community_ID_Table.[End_Date])`}, {})
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.get('/communityPrayers/:id', checkAuthorizedCommunity, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MinistryPlatformAPI.request('post', '/tables/Prayer_Schedules/get', {}, {"Filter":`Cancelled=0 AND WPAD_Community_ID=${id}`});
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})
router.get('/communityReservations/:id', checkAuthorizedCommunity, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MinistryPlatformAPI.request('get', '/tables/WPAD_Community_Reservations', {"$filter":`WPAD_Community_ID=${id} AND Reservation_Date > GETDATE()`,"$orderby":"Reservation_Date"}, {});
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.post('/prayerPoints/:id', checkAuthorizedCommunity, async (req, res) => {
  try {
    const {Reminder_Text} = req.body;
    const {id} = req.params;
    const data = await MinistryPlatformAPI.request('put', '/tables/WPAD_Communities', {"$allowCreate":"false"}, [{"WPAD_Community_ID":id,"Reminder_Text":Reminder_Text}]);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.post('/communityReservation/:id', checkAuthorizedCommunity, async (req, res) => {
  try {
    const data = await MinistryPlatformAPI.request('put', '/tables/WPAD_Community_Reservations', {"$allowCreate":"true"}, [req.body]);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.delete('/communityReservation/:id/:reservationID', checkAuthorizedCommunity, async (req, res) => {
  try {
    const {reservationID} = req.params;
    const data = await MinistryPlatformAPI.request('delete', `/tables/WPAD_Community_Reservations/${reservationID}`, {}, {});
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.get('/getCommunities', async (req, res) => {
  try {
    const data = await MinistryPlatformAPI.request('get', '/tables/WPAD_Communities', {"$filter":"ISNULL(End_Date, GETDATE()) >= GETDATE()"}, {});
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.get('/getSchedules', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await MinistryPlatformAPI.request('get', '/tables/Prayer_Schedules', {"$select":"Prayer_Schedule_ID, Prayer_Schedules.[Start_Date], Prayer_Schedules.[End_Date], Prayer_Schedules.[WPAD_Community_ID], WPAD_Community_ID_Table.[Community_Name]","$filter":`Prayer_Schedules.[Start_Date] BETWEEN '${startDate}' AND '${endDate}' AND Cancelled=0`,"$orderby":"Start_Date"}, {});
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.get('/getReservations', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await MinistryPlatformAPI.request('get', '/tables/WPAD_Community_Reservations', {"$select":"Reservation_Date, WPAD_Community_Reservations.WPAD_Community_ID, Community_Name","$filter":`Reservation_Date BETWEEN '${startDate}' AND '${endDate}' AND (WPAD_Community_ID_Table.[End_Date] IS NULL OR WPAD_Community_ID_Table.[End_Date] > GETDATE())`,"$orderby":"Reservation_Date","$distinct":"true"}, {});
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.get('/mySchedules/:guid', async (req, res) => {
  try {
    const { guid } = req.params;
    const data = await MinistryPlatformAPI.request('get', '/tables/Prayer_Schedules', {"$select":"Prayer_Schedules.Start_Date, Prayer_Schedules.First_Name, Prayer_Schedules.Last_Name, Prayer_Schedules.Phone,Prayer_Schedules.Prayer_Schedule_ID, Prayer_Schedules._Prayer_Schedule_GUID","$filter":`WPAD_User_ID_Table.[_User_GUID]='${guid}' AND Prayer_Schedules.Cancelled = 0`}, {});
    res.send(data);
  } catch (error) {
    // console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.delete("/mySchedules", async (req, res) => {
  try {
    const { guid, id } = req.body;
    const data = await MinistryPlatformAPI.request('put', '/tables/Prayer_Schedules', {}, [{"Prayer_Schedule_ID":id,"_Prayer_Schedule_GUID":guid,"Cancelled":"true"}])
    res.send(data);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
})

router.put("/mySchedules/update", async (req, res) => {
  try {
    const { updateData } = req.body;
    const data = await MinistryPlatformAPI.request('put', '/tables/Prayer_Schedules', {}, [updateData])
    res.send(data);
  } catch (error) {
    res.status(500).send("Internal server error");
  }
})

router.get('/championedDays/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MinistryPlatformAPI.request(
      'get',
      '/tables/WPAD_Community_Reservations',
      {"$filter":`WPAD_Community_ID=${id} AND Reservation_Date >= GETDATE()`,"$orderby":"Reservation_Date"},
      {}
    );
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.post('/PrayerSchedules', async (req, res) => {
  try {
    const data = await MinistryPlatformAPI.request('post', '/tables/Prayer_Schedules', {}, req.body);
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.post('/ConfirmationEmail', async (req, res) => {
  const {Email} = req.body;
  try {
    const msg = {
      to: Email,
      from: "noreply@pureheart.org",
      subject: "We Pray All Day",
      html: getWPADEmailTemplate(req.body)
    };

    const email = await sgMail
      .send(msg)
      .then(emailData => emailData);

    res.status(200).send(email).end();
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.get('/GenerateSequence', async (req, res) => {
  const { Interval, StartDate, DayPosition, TotalOccurrences, Weekdays } = req.query;

  try {
    const data = await MinistryPlatformAPI.request('get', '/tasks/generate-sequence', {"$type":"Monthly","$interval":Interval,"$startDate":StartDate,"$totalOccurrences":TotalOccurrences,"$dayPosition":DayPosition,"$weekdays":Weekdays}, {});
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal server error");
  }
})

router.post('/CommunityRegister', async (req, res) => {

  try {
    const { firstName, lastName, phone, email, communityName, address, city, state, postalCode, username, password } = req.body;
    const formattedDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString();
    
    // check if community already exists
    const matchingCommunity = await MinistryPlatformAPI.request('get', '/tables/WPAD_Communities', {"$select":"WPAD_Community_ID","$filter":`Community_Name='${communityName}'`}, {});
    if (matchingCommunity && matchingCommunity.length > 0) {
      return res.status(400).send("Community with this name already exists.");
    }
    // create community
    const [community] = await MinistryPlatformAPI.request('post', '/tables/WPAD_Communities', {}, [{"Community_Name":communityName,"Address":address,"City":city,"State":state,"Zip":postalCode,"Start_Date":formattedDate}]);
    // console.log(community);
    // find user
    const [[user]] = await MinistryPlatformAPI.request('post', '/procs/api_WPAD_Force_New_Contact', {}, {"@FirstName": firstName,"@LastName": lastName,"@EmailAddress": email,"@PhoneNumber": phone,"@Username": username,"@Password": hashPassword(password),"@AddressLine1": address,"@City": city,"@State": state,"@PostalCode": postalCode});
    // console.log(user);
    // make user authorized user for community
    await MinistryPlatformAPI.request('post', '/tables/WPAD_Authorized_Users', {}, [{"WPAD_Community_ID": community.WPAD_Community_ID,"user_ID": user.User_Account}]);
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
})

module.exports = router;