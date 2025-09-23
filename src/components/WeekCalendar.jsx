import React, { useState, useEffect } from "react";
import WeekSelector from "./WeekSelector";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

import instance from "../lib/globals.js";

const championColors = [
  '#83afd4',
  '#f9d587',
  '#f5a284'
]

const getWeekOfMonth = (date) => {
  if (!(date instanceof Date)) {
    throw new Error("Input must be a Date object");
  }

  // Get the first day of the month
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 6 = Saturday

  // Offset: how many days from the first day to the first Sunday
  const offset = (7 - firstDayOfWeek) % 7;

  // Day of the month
  const day = date.getDate();

  // If within the first week (before first Sunday passes)
  if (day <= offset) {
    return 0;
  }

  // Calculate full weeks passed since the first Sunday
  return Math.floor((day - offset - 1) / 7) + 1;
}


const WeekCalendar = () => {
  const [isLoading, setIsLoading] = useState(false);
  //default date and week to current month and week
  const [currDate, setCurrDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [currWeek, setCurrWeek] = useState(getWeekOfMonth(new Date()));

  const [weekdays, setWeekdays] = useState([]);
  const [champions, setChampions] = useState([]);
  const [allCommunities, setAllCommunities] = useState([]);
  const [selectedCommunities, setSelectedCommunities] = useState([]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }

  const sameDate = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
  }

  const handleCommunityToggle = (communityId, communityName) => {
    setSelectedCommunities(prev => {
      if (prev.some(c => c.id === communityId)) {
        return prev.filter(c => c.id !== communityId);
      } else {
        return [...prev, { id: communityId, name: communityName }];
      }
    });
  };

  const clearFilters = () => {
    setSelectedCommunities([]);
  };

  const getFilteredChampions = (dayChampions) => {
    if (selectedCommunities.length === 0) {
      return dayChampions;
    }
    return dayChampions.filter(champion => 
      selectedCommunities.some(selected => selected.name === champion.Community_Name)
    );
  };

  useEffect(() => {
    const getAllCommunities = async () =>
      instance.get('/api/wpad/getCommunities')
        .then(response => response.data)
        .catch((error) => {
          console.log(error);
          throw new Error('Failed to retrieve prayer schedules');
        });

    getAllCommunities()
      .then(communitites => setAllCommunities(communitites.sort((a, b) => a.Community_Name.localeCompare(b.Community_Name))))
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    const getCommunityReservations = async (startDate, endDate) =>
      instance.get(`/api/wpad/getReservations?startDate=${startDate}&endDate=${endDate}`)
        .then(response => response.data)
        .catch((error) => {
          console.log(error);
          throw new Error('Failed to retrieve prayer schedules');
        });

    // Get start of month
    const monthStart = new Date(currDate.getFullYear(), currDate.getMonth(), 1);
    
    // Find first Sunday by going back to previous Sunday from month start
    const firstSunday = new Date(monthStart);
    firstSunday.setDate(firstSunday.getDate() - firstSunday.getDay());

    // Calculate week start and end dates based on week index
    const weekStartDate = new Date(firstSunday);
    weekStartDate.setDate(firstSunday.getDate() + (currWeek * 7));
    weekStartDate.setHours(0,0,0,0);

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekStartDate.getDate() + 6);
    weekEndDate.setHours(0,0,0,0);

    setIsLoading(true);

    // Create array of weekdays from start to end date
    const weekdays = [];
    const currentDate = new Date(weekStartDate);
    
    while (currentDate <= weekEndDate) {
      weekdays.push({
        date: new Date(currentDate),
        hidden: currentDate.getMonth() !== currDate.getMonth(),
        today: currentDate.toDateString() === new Date().toDateString()
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setWeekdays(weekdays);

    getCommunityReservations(formatDate(weekStartDate), formatDate(weekEndDate))
        .then(champions => setChampions(champions))
        .catch(err => console.log(err))
        .finally(() => setIsLoading(false));

  }, [currDate, currWeek]);

  return (
    <div className="calendar-container">
      <div className="week-calendar-container">
        <div className="calendar-col-1">
          <WeekSelector currDate={currDate} setCurrDate={setCurrDate} currWeek={currWeek} setCurrWeek={setCurrWeek} />

          <div className="filter-container">
            <div className="filter-header">
              <h3>Champions Filter</h3>
              <button className="clear-filter-btn" onClick={clearFilters}>Clear</button>
            </div>
            <div className="scroll-container">
              {allCommunities.map((community, index) => (
                <div className="filter-community-container" key={index}>
                  <input 
                    type="checkbox" 
                    id={community.WPAD_Community_ID}
                    checked={selectedCommunities.some(c => c.id === community.WPAD_Community_ID)}
                    onChange={() => handleCommunityToggle(community.WPAD_Community_ID, community.Community_Name)}
                  />
                  <label htmlFor={community.WPAD_Community_ID}>{community.Community_Name}</label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="calendar-col-2">
          <div className="week-calendar">
            <div className="week-navigation">
              <div className="header">
                <div className="header-left">
                  {weekdays.length && <h2>{weekdays[0].date.toLocaleDateString('en-US', { month: 'short' })} {weekdays[0].date.getDate()}{['st', 'nd', 'rd'][((weekdays[0].date.getDate() + 90) % 100 - 1) % 10] || 'th'} - {new Date(weekdays[6].date.getTime()).toLocaleDateString('en-US', { month: 'short' })} {new Date(weekdays[6].date.getTime()).getDate()}{['st', 'nd', 'rd'][((new Date(weekdays[6].date.getTime()).getDate() + 90) % 100 - 1) % 10] || 'th'}</h2>}
                  <div className="navigation-controls">
                    <button onClick={() => {
                      if (currWeek > 0) {
                        setCurrWeek(currWeek - 1);
                      } else {
                        // If we're at week 0, go to previous month's last week
                        const newDate = new Date(currDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        setCurrDate(newDate);
                        // Calculate how many weeks are in the previous month
                        const prevMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0);
                        const prevMonthWeeks = Math.ceil(prevMonth.getDate() / 7);
                        setCurrWeek(prevMonthWeeks - 1);
                      }
                    }}>
                      <MdKeyboardArrowLeft />
                    </button>
                    <button onClick={() => {
                      // Calculate how many weeks are in the current month
                      const lastDayOfMonth = new Date(currDate.getFullYear(), currDate.getMonth() + 1, 0);
                      const weeksInMonth = Math.ceil(lastDayOfMonth.getDate() / 7);
                      
                      if (currWeek < weeksInMonth - 1) {
                        setCurrWeek(currWeek + 1);
                      } else {
                        // If we're at the last week, go to next month's week 0
                        const newDate = new Date(currDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setCurrDate(newDate);
                        setCurrWeek(0);
                      }
                    }}>
                      <MdKeyboardArrowRight />
                    </button>
                  </div>
                </div>
                <a href="/leaders" className="champion-button">Champion a Day</a>
              </div>
            </div>
            <div className="week-container">
              {weekdays.map((day, index) => (
                <a key={index} href={`/signup?date=${day.date.toDateString()}`} className={"weekday-container" + (sameDate(new Date(), day.date) ? " today" : "")}>
                  <div className="weekday-day">{day.date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}</div>
                  <div className="weekday-date">{day.date.getDate()}</div>

                  <div className="champion-list">
                    {getFilteredChampions(champions.filter(c => sameDate(new Date(c.Reservation_Date), day.date))).map((champion, index) => (
                      <div key={index} className="champion-container" style={{ backgroundColor: championColors[champions.indexOf(champion) % championColors.length] }}>
                        <p className="champion-label">Championed by: </p>
                        <p className="champion-name">{champion.Community_Name}</p>

                        <p className="pick-hour-btn">Sign Up To Pray</p>
                      </div>
                    ))}
                    {!isLoading && getFilteredChampions(champions.filter(c => sameDate(new Date(c.Reservation_Date), day.date))).length === 0 && <div className="champion-container no-champion">
                      <p className="champion-label">No Champion Found</p>
                      <p className="champion-name">Want to Champion a Day?</p>
                      <p className="pick-hour-btn">Get Started</p>
                    </div>}
                  </div>
                </a>
              ))}
              {/* {isLoading && <div className="loading-container">
                Loading...
              </div>} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WeekCalendar;