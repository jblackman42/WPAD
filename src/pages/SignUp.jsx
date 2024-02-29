import React, { useState, useEffect } from "react";
import { FaInfo } from "react-icons/fa6";

import { Navbar, Footer, PhoneNumberInput, Loading } from "../components";

const hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
const urlParams = new URLSearchParams(window.location.search);
const date = urlParams.get('date');
const hour = urlParams.get('hour');

const SignUp = () => {
  const [allCommunityReservations, setAllCommunityReservations] = useState(null);
  const [allPrayerSchedules, setAllPrayerSchedules] = useState(null);
  const [allCommunities, setAllCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hightlightSequence, setHightlightSequence] = useState(false);

  const [signUpPattern, setSignUpPattern] = useState([]);
  
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

  const getPrayerSchedules = async (startDate, endDate) =>
    fetch(`http://localhost:5000/api/wpad/getSchedules?startDate=${startDate}&endDate=${endDate}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to retrieve prayer schedules');
      }
      return response.json();
    })
    .catch((error) => {
      console.log(error);
      throw new Error('Failed to retrieve prayer schedules');
    })

  const getCommunityReservations = async (startDate, endDate) =>
    fetch(`http://localhost:5000/api/wpad/getReservations?startDate=${startDate}&endDate=${endDate}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to retrieve prayer schedules');
      }
      return response.json();
    })
    .catch((error) => {
      console.log(error);
      throw new Error('Failed to retrieve prayer schedules');
    });

  const getAllCommunities = async () =>
    fetch(`http://localhost:5000/api/wpad/getCommunities`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to retrieve prayer schedules');
      }
      return response.json();
    })
    .catch((error) => {
      console.log(error);
      throw new Error('Failed to retrieve prayer schedules');
    });

  useEffect(() => {
    
    setIsLoading(true);
    const currStartDate = formatDate(date);
    const currEndDate = formatDate(new Date(new Date(date).getTime() + (1000*60*60*24-1))) //24 hours ahead of startDate
    getPrayerSchedules(currStartDate, currEndDate)
      .then(prayerSchedules => setAllPrayerSchedules(prayerSchedules))
      .catch(err => console.log(err));
    getCommunityReservations(currStartDate, currEndDate)
      .then(communityReservations => setAllCommunityReservations(communityReservations.sort((a, b) => a.Community_Name.localeCompare(b.Community_Name))))
      .catch(err => console.log(err));
    getAllCommunities()
      .then(communitites => setAllCommunities(communitites.sort((a, b) => a.Community_Name.localeCompare(b.Community_Name))))
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    if (allPrayerSchedules === null || allCommunityReservations === null || allCommunities.length === 0) return;
    setIsLoading(false);
  }, [allPrayerSchedules, allCommunityReservations, allCommunities]);

  useEffect(() => {
    const localStartDate = selectedHour ? formatDate(new Date(new Date(date).setHours(selectedHour))) : formatDate(new Date(date));
    const getSequence = async (sequenceInterval, sequenceDayPosition, sequenceWeekdays, sequenceTotalOccurrences) =>
      fetch(`http://localhost:5000/api/wpad/GenerateSequence?Interval=${sequenceInterval}&StartDate=${localStartDate}&DayPosition=${sequenceDayPosition}&TotalOccurrences=${sequenceTotalOccurrences}&Weekdays=${sequenceWeekdays}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to retrieve prayer schedules');
        }
        return response.json();
      })
      .catch((error) => {
        console.log(error);
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
      .catch(err => console.log(err));
  }, [recurringChecked, selectedHour, sequenceInterval, sequenceDayPosition, sequenceWeekdays, sequenceTotalOccurrences])

  return <>
    <Navbar />

    {isLoading && <Loading />}

    <form id="sign-up-form">
        <h2 id="prayer-date">{new Date(date).toLocaleDateString('en-us', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</h2>
        {allCommunityReservations && allCommunityReservations.length > 0 && <p id="community-champions">Championed By: <strong>{allCommunityReservations.map(community => community.Community_Name).join(", ")}</strong></p>}
        <div className="input-container">
            <label htmlFor="Fist_Name">First Name:</label>
            <input type="text" name="First_Name" id="First_Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div className="input-container">
            <label htmlFor="Last_Name">Last Name:</label>
            <input type="text" name="Last_Name" id="Last_Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <div className="input-container">
            <label htmlFor="Email">Email:</label>
            <input type="email" name="Email" id="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="input-container">
            <label htmlFor="Phone">Phone Number:</label>
            <PhoneNumberInput name="Phone" id="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        <div className="dropdown-container">
            <label htmlFor="Community_ID">Community:</label>
            <select name="Community_ID" id="Community_ID" value={community} onChange={(e) => setCommunity(e.target.value)} required>
              <option value="" selected disabled>Choose One...</option>
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
                  {signUpPattern.length && signUpPattern.map((date, i) => <p key={i}>{date.split('T')[0]}</p>)}
                </div>
            </div>
        </div>
        <div className="time-container">
            <label>Hour of Prayer:</label>
            <div id="hours-options">
                {hours.map((hr, i) => {
                  return (
                    <div className="checkbox-container" key={i}>
                      <input type="radio" name="hour" value={hr} id={hr} defaultChecked={hr === parseInt(selectedHour)} onClick={(e) => setSelectedHour(e.target.value)} required />
                      <label htmlFor={hr}>{hr === 0 ? `12 AM` : hr === 12 ? `${hr} PM` : hr > 12 ? `${hr - 12} PM` : `${hr} AM`}</label>
                    </div>
                  )
                })}
            </div>
        </div>
        <div className="form-footer">
            <p id="curr-time">Please Select an Hour of Prayer</p>
            <button className="btn highlight" type="submit">Submit</button>
        </div>
    </form>

    <Footer />
  </>
}

export default SignUp;