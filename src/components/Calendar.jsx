import React, { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const Calendar = () => {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // const [allCommunityReservations, setAllCommunityReservations] = useState([]);
  const [allPrayerSchedules, setAllPrayerSchedules] = useState([]);
  const [monthDays, setMonthDays] = useState([]);
  // const [communityFilter, setCommunityFilter] = useState([]);
  // const [allCommunities, setAllCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Date(new Date().toLocaleString('en-US', {timeZone: 'US/Arizona'}));
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const nextMonth = () => {
    if (month < 11) {
        setMonth(month + 1);
      } else {
        setMonth(0);
        setYear(year + 1);
    }
  }
  const prevMonth = () => {
    if (month > 0) {
        setMonth(month - 1);
      } else {
        setMonth(11);
        setYear(year - 1);
    }
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
  
    if (n % 10 === 1 && n % 100 !== 11)
    {
      ord = 'st';
    }
    else if (n % 10 === 2 && n % 100 !== 12)
    {
      ord = 'nd';
    }
    else if (n % 10 === 3 && n % 100 !== 13)
    {
      ord = 'rd';
    }
  
    return ord;
  }

  
  useEffect(() => {
    const getPrayerSchedules = async (startDate, endDate) =>
      fetch(`http://localhost:5000/api/v2/mp/getSchedules?startDate=${startDate}&endDate=${endDate}`)
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
    
    const currStartDate = formatDate(new Date(new Date(year, month, 1).getTime() - ((1000*60*60*24) * (new Date(year, month, 1).getDay() + 1))));
    const currEndDate = formatDate(new Date(new Date(year, month + 1, 1).getTime()));
    getPrayerSchedules(currStartDate, currEndDate)
      .then(prayerSchedules => setAllPrayerSchedules(prayerSchedules))
      .catch(err => console.log(err));
  }, [month, year]);

  useEffect(() => {
    const tempMonthDays = [];
    const startDate = new Date(new Date(year, month, 1).getTime() - ((1000*60*60*24) * new Date(year, month, 1).getDay()));
    const date = startDate;
    //loops and iterates day by one until month no longer is the same
    while ((date.getMonth() % 12 <= month || date.getFullYear() < year) && date.getFullYear() <= year) {
        // const currChampions = allCommunityReservations.filter(reservation => new Date(reservation.Reservation_Date).toDateString() == new Date(date).toDateString())
        const scheduledHours = allPrayerSchedules.filter(schedule => new Date(schedule.Start_Date).toDateString() === new Date(date).toDateString()).map(schedule => new Date(new Date(schedule.Start_Date).getTime() - ((new Date(schedule.Start_Date).getTimezoneOffset() - 420) * 60000)).getHours())
        //saves each day of the month parameter
  
        tempMonthDays.push({
          date: date.toDateString(),
          scheduledHours: scheduledHours,
          bookedChampions: null,
          hoursCovered: 0
        })
        // console.log(date.toDateString());
  
        date.setDate(date.getDate() + 1);
    }
    setMonthDays(tempMonthDays);
  }, [month, year, allPrayerSchedules])

  return (
    <div className="calendar-container">
      {isLoading && <div id="loading">
        <div className="loader"></div>
      </div>}
      <div className="calendar">
        <div className="calendar-controls">
          <div className="month-selector-container">
            <button className="btn" id="prev-month" style={{fontSize:"1.5rem"}} onClick={prevMonth}><MdKeyboardArrowLeft /></button>
            <h3 id="month-label">{new Date(0,month,1).toLocaleDateString('en-us',{month:'long'})} {year}</h3>
            <button className="btn" id="next-month" style={{fontSize:"1.5rem"}} onClick={nextMonth}><MdKeyboardArrowRight /></button>
          </div>

          <select id="community-select"></select>

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
            const { date } = data;
            const hours = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
            return (
              <button className="calendar-day" key={i}>
                <p className="date">{new Date(date).getDate()}<sup>{getOrdinalIndicator(date)}</sup></p>
                
                <div className="day-row">
                  <p className="community">No Champion Found</p>
                </div>
                <div className="day-row bottom">
                  <p className="hours-label">Fully Covered!</p>
                  <p className="percent-label">100%</p>
                  <div className="hours-container">
                    {hours.map(hour => {
                      
                      return <p className="hour booked" data-content="12:00 AM" key={hour}></p>
                    })}
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar" id={`bar-${date}-${month}-${year}`} style={{maxWidth:"100%"}}></div>
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