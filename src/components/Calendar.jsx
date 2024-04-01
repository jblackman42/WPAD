import React, { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

import instance from "../lib/globals.js";
import TextLoop from "./TextLoop";

const Calendar = () => {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [allCommunityReservations, setAllCommunityReservations] = useState(null);
  const [allPrayerSchedules, setAllPrayerSchedules] = useState(null);
  const [allCommunities, setAllCommunities] = useState([]);

  const [monthDays, setMonthDays] = useState([]);
  const [communityFilter, setCommunityFilter] = useState(0);
  // const [communityFilter, setCommunityFilter] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date(new Date().toLocaleString('en-US', { timeZone: 'US/Arizona' }));
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const nextMonth = () => {
    setAllPrayerSchedules(null);
    setAllCommunityReservations(null);
    if (month < 11) {
      setMonth(month + 1);
    } else {
      setMonth(0);
      setYear(year + 1);
    }
  }
  const prevMonth = () => {
    setAllPrayerSchedules(null);
    setAllCommunityReservations(null);
    if (month > 0) {
      setMonth(month - 1);
    } else {
      setMonth(11);
      setYear(year - 1);
    }
  }

  const SignUp = (e, date, hour) => {
    if ([...e.target.classList].includes('hour') && !hour) return;
    return window.location = hour ? `/signup?date=${date}&hour=${hour}` : `/signup?date=${date}`
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

  const getOrdinalIndicator = (dateString) => {
    const n = new Date(dateString).getDate();
    let ord = 'th';

    if (n % 10 === 1 && n % 100 !== 11) {
      ord = 'st';
    }
    else if (n % 10 === 2 && n % 100 !== 12) {
      ord = 'nd';
    }
    else if (n % 10 === 3 && n % 100 !== 13) {
      ord = 'rd';
    }

    return ord;
  }

  useEffect(() => {
    const getPrayerSchedules = async (startDate, endDate) =>
      instance.get(`/api/wpad/getSchedules?startDate=${startDate}&endDate=${endDate}`)
        .then(response => response.data)
        .catch((error) => {
          console.log(error);
          throw new Error('Failed to retrieve prayer schedules');
        })

    const getCommunityReservations = async (startDate, endDate) =>
      instance.get(`/api/wpad/getReservations?startDate=${startDate}&endDate=${endDate}`)
        .then(response => response.data)
        .catch((error) => {
          console.log(error);
          throw new Error('Failed to retrieve prayer schedules');
        });

    const getAllCommunities = async () =>
      instance.get('/api/wpad/getCommunities')
        .then(response => response.data)
        .catch((error) => {
          console.log(error);
          throw new Error('Failed to retrieve prayer schedules');
        });

    setIsLoading(true);
    const currStartDate = formatDate(new Date(new Date(year, month, 1).getTime() - ((1000 * 60 * 60 * 24) * (new Date(year, month, 1).getDay() + 1))));
    const currEndDate = formatDate(new Date(new Date(year, month + 1, 1).getTime()));
    setIsLoading(true);
    getPrayerSchedules(currStartDate, currEndDate)
      .then(prayerSchedules => setAllPrayerSchedules(prayerSchedules))
      .catch(err => console.log(err));
    getCommunityReservations(currStartDate, currEndDate)
      .then(communityReservations => setAllCommunityReservations(communityReservations.sort((a, b) => a.Community_Name.localeCompare(b.Community_Name))))
      .catch(err => console.log(err));
    getAllCommunities()
      .then(communitites => setAllCommunities(communitites.sort((a, b) => a.Community_Name.localeCompare(b.Community_Name))))
      .catch(err => console.log(err));
  }, [month, year]);

  useEffect(() => {
    if (allPrayerSchedules === null || allCommunityReservations === null || allCommunities.length === 0) return;
    setIsLoading(false);
    const tempMonthDays = [];
    const startDate = new Date(new Date(year, month, 1).getTime() - ((1000 * 60 * 60 * 24) * new Date(year, month, 1).getDay()));
    const date = startDate;
    //loops and iterates day by one until month no longer is the same
    while ((date.getMonth() % 12 <= month || date.getFullYear() < year) && date.getFullYear() <= year) {
      const currChampions = allCommunityReservations.filter(reservation => new Date(reservation.Reservation_Date).toDateString() === new Date(date).toDateString())
      const scheduledHours = allPrayerSchedules.filter(schedule => new Date(schedule.Start_Date).toDateString() === new Date(date).toDateString()).map(schedule => new Date(new Date(schedule.Start_Date).getTime() - ((new Date(schedule.Start_Date).getTimezoneOffset() - 420) * 60000)).getHours())
      //saves each day of the month parameter
      tempMonthDays.push({
        date: date.toDateString(),
        scheduledHours: scheduledHours,
        currChampions: currChampions,
        hoursCovered: [...new Set(scheduledHours)].length
      })

      date.setDate(date.getDate() + 1);
    }
    setMonthDays(tempMonthDays);
  }, [month, year, allPrayerSchedules, allCommunityReservations, allCommunities]);

  return (
    <div className="calendar-container">
      {isLoading && <div id="loading">
        <div className="loader"></div>
      </div>}
      <div className="calendar">
        <div className="calendar-controls">
          <div className="month-selector-container">
            <button className="btn" id="prev-month" style={{ fontSize: "1.5rem" }} onClick={prevMonth}><MdKeyboardArrowLeft /></button>
            <h3 id="month-label">{new Date(0, month, 1).toLocaleDateString('en-us', { month: 'long' })} {year}</h3>
            <button className="btn" id="next-month" style={{ fontSize: "1.5rem" }} onClick={nextMonth}><MdKeyboardArrowRight /></button>
          </div>

          <select id="community-select" value={communityFilter} onChange={(e) => setCommunityFilter(parseInt(e.target.value))}>
            <option value="0">All Churches &amp; Communities...</option>
            {allCommunities.map((community, i) => <option value={community.WPAD_Community_ID} key={i}>{community.Community_Name}</option>)}
          </select>

          <div id="legend">
            <div id="empty-square"></div>
            <p>: Open for Prayer</p>
            <div id="filled-square"></div>
            <p>: Booked for Prayer</p>
          </div>
        </div>

        <div id="weekdays">
          {weekdays.map(day => <p key={day}>{day.split('')[0]}<span>{day.split('').slice(1).join('')}</span></p>)}
        </div>

        <div id="days-grid">
          {monthDays.map((data, i) => {
            const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
            const { date, scheduledHours, currChampions, hoursCovered } = data;
            const currDate = new Date(data.date);
            const blocked = new Date(currDate.toDateString()) < new Date(new Date().toDateString());
            const currChampionsIDs = currChampions ? currChampions.map(data => data.WPAD_Community_ID) : [];
            const hoursPrayedFor = 24 - hoursCovered;
            const percentCovered = Math.floor((hoursCovered / 24) * 100);
            return (
              <button onClick={blocked ? null : (e) => SignUp(e, date)} className={`calendar-day ${currChampionsIDs.includes(communityFilter) || communityFilter === 0 ? '' : 'dull'}`} style={{ "cursor": blocked ? "default" : "pointer" }} key={i}>
                <p className="date">{new Date(date).getDate()}<sup>{getOrdinalIndicator(date)}</sup></p>

                <div className="day-row">
                  {
                    currChampions.length
                      ? <div className="community"><p>Championed By:</p>
                        {
                          currChampionsIDs.includes(communityFilter)
                            ? <span className="community-name">{currChampions[currChampionsIDs.indexOf(communityFilter)].Community_Name}</span>
                            : (
                              <TextLoop>
                                {currChampions.map((champion, i) => <span className="community-name" key={i}>{champion.Community_Name}</span>)}
                              </TextLoop>
                            )
                        }
                      </div>
                      : <p className="community" style={{ "height": "auto", "padding": "0" }}>No Champion Found</p>
                  }
                </div>
                <div className="day-row bottom">
                  <p className="hours-label">{hoursPrayedFor > 0 ? new Date() > currDate ? `${data.hoursCovered} Hours Prayed For` : `${hoursPrayedFor} Hours Remaining` : 'Fully Covered!'}</p>
                  <p className="percent-label">{percentCovered}%</p>
                  <div className="hours-container">
                    {hours.map(hour => {
                      return <p onClick={blocked ? null : (e) => SignUp(e, date, hour)} className={`hour ${scheduledHours.includes(hour) ? 'booked' : ''}`} data-content={`${hour > 12 || hour === 0 ? Math.abs(hour - 12) : hour}:00 ${hour < 12 ? 'AM' : 'PM'}`} style={{ "cursor": blocked ? "default" : "pointer" }} key={hour}></p>
                    })}
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" id={`bar-${date}-${month}-${year}`} style={{ maxWidth: `${percentCovered}%` }}></div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Calendar;