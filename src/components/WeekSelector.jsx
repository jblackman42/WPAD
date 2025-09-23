import React, { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const defaultDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const defaultWeek = Math.ceil((new Date().getDate() + 1) / 7);

const WeekSelector = ({ currDate = defaultDate, setCurrDate = () => {}, currWeek = defaultWeek, setCurrWeek = () => {} }) => {
  // const [currDate, setCurrDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  // const [currWeek, setCurrWeek] = useState(Math.ceil((new Date().getDate() + 1) / 7));
  const [tempMonthDays, setTempMonthDays] = useState([]);


  const handlePrevMonth = () => {
    setCurrDate(new Date(currDate.setMonth(currDate.getMonth() - 1)));
    setCurrWeek(0);
  }
  const handleNextMonth = () => {
    setCurrDate(new Date(currDate.setMonth(currDate.getMonth() + 1)));
    setCurrWeek(0);
  }

  useEffect(() => {
    const tempMonthDays = [];

    const year = currDate.getFullYear();
    const month = currDate.getMonth();
    const startDate = new Date(new Date(year, month, 1).getTime() - ((1000 * 60 * 60 * 24) * new Date(year, month, 1).getDay()));
    const endDate = new Date(new Date(year, month + 1, 0).getTime() + ((1000 * 60 * 60 * 24) * (6 - new Date(year, month + 1, 0).getDay())));
    const date = startDate;
    //loops and iterates day by one until month no longer is the same
    while (date.getTime() <= endDate.getTime()) {
      // const currChampions = allCommunityReservations.filter(reservation => new Date(reservation.Reservation_Date).toDateString() === new Date(date).toDateString())
      // const scheduledHours = allPrayerSchedules.filter(schedule => new Date(schedule.Start_Date).toDateString() === new Date(date).toDateString()).map(schedule => new Date(new Date(schedule.Start_Date).getTime() - ((new Date(schedule.Start_Date).getTimezoneOffset() - 420) * 60000)).getHours())
      //saves each day of the month parameter
      tempMonthDays.push({
        date: new Date(date),
        hidden: date.getMonth() !== month,
        today: date.toDateString() === new Date().toDateString()
      })

      date.setDate(date.getDate() + 1);
    }
    setTempMonthDays(tempMonthDays);
  }, [currDate]);

  return (
    <div className="week-selector">
      <div className="header">
        <div className="header-left">
          <h2>{currDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
        </div>
        <div className="header-right">
          <button onClick={handlePrevMonth}>
            <MdKeyboardArrowLeft />
          </button>
          <button onClick={handleNextMonth}>
            <MdKeyboardArrowRight />
          </button>
        </div>
      </div>
      <div className="days-of-week">
        <div className="day">Su</div>
        <div className="day">Mo</div>
        <div className="day">Tu</div>
        <div className="day">We</div>
        <div className="day">Th</div>
        <div className="day">Fr</div>
        <div className="day">Sa</div>
      </div>
      <div className="month-days">
        {Array.from({length: Math.ceil(tempMonthDays.length / 7)}).map((_, index) => {
          const weekDays = tempMonthDays.slice(index * 7, (index + 1) * 7);
          return (
            <button onClick={() => setCurrWeek(index)} className={`week ${index === currWeek ? 'current' : ''}`} key={index}>
              {weekDays.map((day, index) => (
                <div key={index} className={`day ${day.hidden ? 'hidden' : ''} ${day.today ? 'today' : ''}`}>{day.date.getDate()}</div>
              ))}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default WeekSelector;