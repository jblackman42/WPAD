import React, { useState, useEffect } from "react";
import { FaInfo } from "react-icons/fa6";

import instance from "../lib/globals.js";
import { Navbar, Footer, Loading } from "../components";

const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
const urlParams = new URLSearchParams(window.location.search);
const date = urlParams.get('date');
const hour = urlParams.get('hour');

const SignUp = () => {
  const [allCommunityReservations, setAllCommunityReservations] = useState(null);
  const [allPrayerSchedules, setAllPrayerSchedules] = useState(null);
  const [hoursCovered, setHoursCovered] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hightlightSequence, setHightlightSequence] = useState(false);

  const [signUpPattern, setSignUpPattern] = useState([]);

  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    content: '',
    btnText: '',
    btnLink: '',
    btn2Text: null,
    btn2Function: null
  })

  // FORM FIELD VALUES
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [community, setCommunity] = useState('');
  const [recurringChecked, setRecurringChecked] = useState(false);
  const [sequenceInterval, setSequenceInterval] = useState("Monthly");
  const [sequenceDayPosition, setSequenceDayPosition] = useState("First");
  const [sequenceWeekdays, setSequenceWeekdays] = useState("Sunday");
  const [sequenceTotalOccurrences, setSequenceTotalOccurrences] = useState(1);
  const [selectedHour, setSelectedHour] = useState(hour);

  const [text5min, setText5min] = useState(true);
  const [text1hr, setText1hr] = useState(false);
  const [email24hr, setEmail24hr] = useState(true);
  const [email3d, setEmail3d] = useState(false);
  const [email7d, setEmail7d] = useState(false);

  const showPopup = (title, content, btnText = "Confirm", btnLink, btn2Text = null, btn2Function = null) =>
    setPopup({
      visible: true,
      title: title,
      content: content,
      btnText: btnText,
      btnLink: btnLink,
      btn2Text: btn2Text,
      btn2Function: btn2Function
    })

  const handleError = () => {
    setIsLoading(false);
    showPopup("Error", '<p style="text-align: center; color: #c0392b;">Something went wrong, please try again later.</p>', "Okay")
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-based in JavaScript
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
  const formatPhoneNumber = (value) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue.length <= 3) {
      return numericValue;
    } else if (numericValue.length <= 6) {
      return `${numericValue.slice(0, 3)}-${numericValue.slice(3)}`;
    } else {
      return `${numericValue.slice(0, 3)}-${numericValue.slice(3, 6)}-${numericValue.slice(6, 10)}`;
    }
  };

  const getPrayerSchedules = async (startDate, endDate) =>
    instance.get(`/api/wpad/getSchedules?startDate=${startDate}&endDate=${endDate}`)
      .then(response => response.data)
      .catch((error) => {
        console.error(error);
        throw new Error('Failed to retrieve prayer schedules');
      })

  const getCommunityReservations = async (startDate, endDate) =>
    instance.get(`/api/wpad/getReservations?startDate=${startDate}&endDate=${endDate}`)
      .then(response => response.data)
      .catch((error) => {
        throw new Error('Failed to retrieve prayer schedules');
      });

  const getAllCommunities = async () =>
    instance.get('/api/wpad/getCommunities')
      .then(response => response.data)
      .catch((error) => {
        throw new Error('Failed to retrieve prayer schedules');
      });

  const sendConfirmationEmail = async (Email, First_Name, DateString, TimeString, Dates) => {
    return instance.post('/api/wpad/ConfirmationEmail', { Email, First_Name, DateString, TimeString, Dates })
      .then(response => response.data)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const AZTimezoneOffset = 420;
    const localStart = new Date(new Date(date).setHours(selectedHour));
    const localEnd = new Date(new Date(date).setHours(parseInt(selectedHour) + 1));

    const signUpDates = recurringChecked ? signUpPattern : [date];
    const prayerSchedules = signUpDates.map(date => {
      const localStartDate = new Date(new Date(date).setHours(selectedHour));
      const localTimezoneOffsetFromAZ = AZTimezoneOffset - localStartDate.getTimezoneOffset();
      const startDate = localStartDate.setMinutes(localStartDate.getMinutes() - localTimezoneOffsetFromAZ);
      const endDate = startDate + (1000 * 60 * 60);

      return {
        "First_Name": firstName,
        "Last_Name": lastName,
        "Start_Date": formatDate(startDate),
        "End_Date": formatDate(endDate),
        "Email": email,
        "Phone": formatPhoneNumber(phone),
        "WPAD_Community_ID": community,
        "5min_Reminder": text5min,
        "1hr_Reminder": text1hr,
        "24hr_Reminder": email24hr,
        "3d_Reminder": email3d,
        "7d_Reminder": email7d

      };
    });

    instance.post('/api/wpad/PrayerSchedules', prayerSchedules)
      .then(() => {
        setIsLoading(false);
        sendConfirmationEmail(
          email,
          firstName,
          recurringChecked ? signUpPattern.map(date => new Date(date).toLocaleDateString('en-us', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })).join('</br>') : new Date(date).toLocaleDateString('en-us', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
          `${localStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${localEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          signUpDates.map(date => new Date(new Date(date).setHours(selectedHour)).toISOString())
        );
        showPopup(
          "Thank you for signing up!",
          `
            <p>You should recieve a confirmation email regarding your scheduled time of prayer.</p>
            <p style="text-align: center;">${localStart.toLocaleDateString('en-us', { weekday: "long", year: "numeric", month: "short", day: "numeric" })}${signUpPattern.length > 1 ? ` + ${signUpPattern.length - 1} More` : ''}</p>
            <p style="text-align: center;">${localStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${localEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          `,
          'Confirm',
          '/'
        );
      })
      .catch(() => handleError())
  }

  useEffect(() => {

    setIsLoading(true);
    const currStartDate = formatDate(date);
    const currEndDate = formatDate(new Date(new Date(date).getTime() + (1000 * 60 * 60 * 24 - 1))) //24 hours ahead of startDate
    getPrayerSchedules(currStartDate, currEndDate)
      .then(prayerSchedules => setAllPrayerSchedules(prayerSchedules))
    getCommunityReservations(currStartDate, currEndDate)
      .then(communityReservations => setAllCommunityReservations(communityReservations.sort((a, b) => a.Community_Name.localeCompare(b.Community_Name))))
    getAllCommunities()
      .then(communitites => setAllCommunities(communitites.sort((a, b) => a.Community_Name.localeCompare(b.Community_Name))))
  }, []);

  useEffect(() => {
    if (allPrayerSchedules === null || allCommunityReservations === null || allCommunities.length === 0) return;
    setHoursCovered(allPrayerSchedules.map(schedule => new Date(new Date(schedule.Start_Date).getTime() - ((new Date(schedule.Start_Date).getTimezoneOffset() - 420) * 60000)).getHours()));
    setIsLoading(false);
  }, [allPrayerSchedules, allCommunityReservations, allCommunities]);

  useEffect(() => {
    const localStartDate = selectedHour ? formatDate(new Date(new Date(date).setHours(selectedHour))) : formatDate(new Date(date));
    const getSequence = async (sequenceInterval, sequenceDayPosition, sequenceWeekdays, sequenceTotalOccurrences) =>
      instance.get(`/api/wpad/GenerateSequence?Interval=${sequenceInterval}&StartDate=${localStartDate}&DayPosition=${sequenceDayPosition}&TotalOccurrences=${sequenceTotalOccurrences}&Weekdays=${sequenceWeekdays}`)
        .then(response => response.data)
        .catch((error) => {
          throw new Error('Failed to retrieve prayer schedules');
        });

    if (!recurringChecked) return;
    getSequence(sequenceInterval, sequenceDayPosition, sequenceWeekdays, sequenceTotalOccurrences)
      .then(sequence => {
        const tempSequence = sequence;
        if (!tempSequence.includes(localStartDate)) tempSequence.unshift(localStartDate);
        setSignUpPattern(tempSequence);
        setHightlightSequence(true);
      })
  }, [recurringChecked, selectedHour, sequenceInterval, sequenceDayPosition, sequenceWeekdays, sequenceTotalOccurrences])

  return <>
    <Navbar />

    {isLoading && <Loading />}

    {popup.visible && (
      <div className="popup-container">
        <div className="popup">
          <div id="title-row">
            <p id="popup-title">{popup.title}</p>
          </div>
          <div id="content">
            <div id="popup-content" dangerouslySetInnerHTML={{ __html: popup.content }}></div>
          </div>
          <div id="btn-row">
            <button className="popup-btn" id="popup-btn1" onClick={() => { setPopup(prev => { return { ...prev, visible: false } }); if (popup.btnLink) window.location = popup.btnLink }}>{popup.btnText}</button>
            {(popup.btn2Text !== null && popup.btn2Function !== null) && <button className="popup-btn" id="popup-btn2" onClick={popup.btn2Function}>{popup.btn2Text}</button>}
          </div>
        </div>
      </div>
    )}

    <form id="sign-up-form" onSubmit={handleFormSubmit}>
      <h2 id="prayer-date">{new Date(date).toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</h2>
      {allCommunityReservations && allCommunityReservations.length > 0 && <p id="community-champions">Championed By: <strong>{allCommunityReservations.map(community => community.Community_Name).join(", ")}</strong></p>}
      <div className="input-container">
        <label htmlFor="First_Name">First Name:</label>
        <input type="text" name="First_Name" id="First_Name" autoComplete="on" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </div>
      <div className="input-container">
        <label htmlFor="Last_Name">Last Name:</label>
        <input type="text" name="Last_Name" id="Last_Name" autoComplete="on" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
      <div className="input-container">
        <label htmlFor="Email">Email:</label>
        <input type="email" name="Email" id="Email" autoComplete="on" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="input-container">
        <label htmlFor="Phone">Phone Number:</label>
        <input type="text" name="Phone" id="Phone" autoComplete="on" value={phone} onChange={(e) => setPhone(formatPhoneNumber(e.target.value))} />
      </div>
      <div className="dropdown-container">
        <label htmlFor="Community_ID">Community:</label>
        <select name="Community_ID" id="Community_ID" value={community} onChange={(e) => setCommunity(e.target.value)} required>
          <option value="" disabled>Choose One...</option>
          {allCommunities.map((community, i) => <option value={community.WPAD_Community_ID} key={i}>{community.Community_Name}</option>)}
        </select>
      </div>
      <div className="recurring-container">
        <label htmlFor="Recurring">Recurring Signup:</label>
        <input type="checkbox" id="Recurring" value={recurringChecked} onChange={(e) => setRecurringChecked(e.target.checked)} />
        <label htmlFor="Recurring">
          <select id="sequenceInterval" value={sequenceInterval} onChange={(e) => setSequenceInterval(e.target.value)} disabled={!recurringChecked}>
            <option value="Monthly">Monthly</option>
            <option value="Bi-Monthly">Bi-Monthly</option>
            <option value="Quarterly">Quarterly</option>
          </select>
          <span>on the</span>
          <select id="sequenceDayPosition" value={sequenceDayPosition} onChange={(e) => setSequenceDayPosition(e.target.value)} disabled={!recurringChecked}>
            <option value="First">First</option>
            <option value="Second">Second</option>
            <option value="Third">Third</option>
            <option value="Fourth">Fourth</option>
            <option value="Last">Last</option>
          </select>
          <select id="sequenceWeekdays" value={sequenceWeekdays} onChange={(e) => setSequenceWeekdays(e.target.value)} disabled={!recurringChecked}>
            <option value="Sunday">Sunday</option>
            <option value="Monday">Monday</option>
            <option value="Tuesday">Tuesday</option>
            <option value="Wednesday">Wednesday</option>
            <option value="Thursday">Thursday</option>
            <option value="Friday">Friday</option>
            <option value="Saturday">Saturday</option>
            <option value="Weekday">Weekday</option>
            <option value="WeekendDay">Weekend Day</option>
            <option value="Day">Day</option>
          </select>
          <span>for</span>
          <input type="number" id="sequenceTotalOccurrences" value={sequenceTotalOccurrences} onChange={(e) => setSequenceTotalOccurrences(e.target.value)} min="1" max="12" inputMode="numeric" disabled={!recurringChecked} />
          <span>occurrences.</span>
        </label>
        <div id="update-icon-container" className={hightlightSequence ? "highlight" : ""} onMouseOver={() => setHightlightSequence(false)}>
          <FaInfo />
          <div id="update-date-container">
            {signUpPattern.length > 0 && signUpPattern.map((date, i) => <p key={i}>{date.split('T')[0]}</p>)}
          </div>
        </div>
      </div>
      <div className="reminder-container">
        <label>Reminder Notifications:</label>

        <div className="reminder-option" title="Text me 5 minutes before my time to pray.">
          <input type="checkbox" name="5m-reminder" id="5m-reminder" checked={text5min} onChange={(e) => setText5min(e.target.checked)} />
          <label htmlFor="5m-reminder">Text - 5 Minutes</label>
        </div>

        <div className="reminder-option" title="Text me 1 hour before my time to pray.">
          <input type="checkbox" name="1h-reminder" id="1h-reminder" checked={text1hr} onChange={(e) => setText1hr(e.target.checked)} />
          <label htmlFor="1h-reminder">Text - 1 Hour</label>
        </div>

        <div className="reminder-option" title="Email me 24 hours before my time to pray.">
          <input type="checkbox" name="24h-reminder" id="24h-reminder" checked={email24hr} onChange={(e) => setEmail24hr(e.target.checked)} />
          <label htmlFor="24h-reminder">Email - 24 Hours</label>
        </div>

        <div className="reminder-option" title="Email me 3 days before my time to pray.">
          <input type="checkbox" name="3d-reminder" id="3d-reminder" checked={email3d} onChange={(e) => setEmail3d(e.target.checked)} />
          <label htmlFor="3d-reminder">Email - 3 Days</label>
        </div>

        <div className="reminder-option" title="Email me 7 days before my time to pray.">
          <input type="checkbox" name="7d-reminder" id="7d-reminder" checked={email7d} onChange={(e) => setEmail7d(e.target.checked)} />
          <label htmlFor="7d-reminder">Email - 7 Days</label>
        </div>

      </div>
      <div className="time-container">
        <label>Hour of Prayer:</label>
        <div id="hours-options">
          {hours.map((hr, i) => {
            return (
              <div className="checkbox-container" key={i}>
                <input type="radio" name="hour" value={hr} id={hr} defaultChecked={hr === parseInt(selectedHour)} onClick={(e) => setSelectedHour(e.target.value)} className={hoursCovered.includes(hr) ? "covered" : ""} required />
                <label htmlFor={hr}>{hr === 0 ? `12 AM` : hr === 12 ? `${hr} PM` : hr > 12 ? `${hr - 12} PM` : `${hr} AM`}</label>
              </div>
            )
          })}
        </div>
      </div>
      <div className="form-footer">
        <p id="curr-time">{(() => {
          const Start_Date = new Date(new Date(date).setHours(selectedHour));
          const End_Date = new Date(new Date(Start_Date).getTime() + 3600000);
          return selectedHour ? `Hour of Prayer: ${Start_Date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${End_Date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Please Select an Hour of Prayer";
        })()}</p>
        <button className="btn highlight" type="submit">Submit</button>
      </div>
      <div className="form-legal">
        <p style={{ "fontSize": "16px", "fontStyle": "italic", "margin": "0" }}>By providing us with your phone number, you consent to receive text messages from us for the purpose of sending reminders about your scheduled time to pray. Additionally, you consent to receive a confirmation email at the provided email address. Standard messaging and data rates may apply. You may opt-out of receiving these communications at any time by contacting us directly.</p>
      </div>
    </form>

    <Footer />
  </>
}

export default SignUp;