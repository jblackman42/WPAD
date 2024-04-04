import React, { useState, useEffect, forwardRef, useRef, useMemo } from "react";

import { BsBoxArrowLeft } from "react-icons/bs";
import { FaEdit, FaTrash, FaSave, FaTimesCircle } from "react-icons/fa";

import { defaults } from "chart.js/auto";
import { Line } from "react-chartjs-2";

import instance from "../lib/globals";

defaults.scale.grid.display = false;
defaults.plugins.title.display = false;
defaults.responsive = true;
defaults.plugins.legend.display = false;
defaults.plugins.title.display = false;

const generateUUID = () => { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;//random number between 0 and 16
    if (d > 0) {//Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    // eslint-disable-next-line
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const calculatePercentChange = (arr) => {
  if (!arr || arr.length < 2) {
    // Not enough data to calculate percent change
    return 0;
  }

  let start = arr[0];
  let end = arr[arr.length - 1];

  if (start === 0 && end === 0) {
    // No change if both start and end are 0
    return 0;
  } else if (start === 0) {
    // If starting from 0 and ending with a non-zero value, it's a 100% increase
    return 100;
  } else {
    // Normal percent change calculation
    return (((end - start) / start) * 100).toFixed(2);
  }
}

const getCSV = (rows) => {
  let csvContent = "data:text/csv;charset=utf-8,"
    + rows.map(e => e.join(",")).join("\n");

  // For compatibility with various browsers
  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "schedule.csv");
  document.body.appendChild(link); // Required for FF

  link.click(); // Trigger download
  document.body.removeChild(link); // Clean up
}

// COMPONENTS
const KPIChart = forwardRef(({ title, unit, values, total }, ref) => {
  const percentChange = calculatePercentChange(values);
  let borderColor = percentChange > 0 ? '#27ae60' : percentChange < 0 ? '#c0392b' : '#2c3e50';
  const minValue = Math.min(...values) - 0.2;

  const h1Ref = useRef(null);
  const chartCardRef = useRef(null);

  const adjustFontSize = () => {
    const h1 = h1Ref.current;
    const card = chartCardRef.current;
    if (!h1 || !card) return;

    // console.log(h1.scrollWidth - h1.offsetWidth);
    let fontSize = 10; // Starting font size in pixels
    const initialWidth = h1.scrollWidth;
    h1.style.fontSize = fontSize + 'px';

    while (h1.scrollWidth <= initialWidth && fontSize < 50) {
      fontSize++;
      h1.style.fontSize = fontSize + 'px';
    }
  };

  useEffect(() => {
    adjustFontSize();
  }, [values]); // Dependency array: adjust font size when 'values' changes

  return (
    <div ref={chartCardRef} className="chart-card">
      <h3>{title} {total ? `(Last 30 Days)` : ''}</h3>
      <div className="kpi-card">
        <div className="kpi-data">
          <h1 ref={h1Ref}>{total ? values.reduce((accum, val) => accum + val, 0) : values.at(-1)} </h1>
          {/* <h1>{ values.at(-1) }</h1> */}
          <p style={{ marginBottom: "auto" }}>{unit}</p>
          {!total && <p style={{ color: borderColor }}> {percentChange > 0 ? '+' : ''}{percentChange}%</p>}
          {/* <p style={{color: borderColor}}> { percentChange > 0 ? '+' : '' }{ percentChange }% Last { values.length } Days</p> */}
        </div>
        <div className="kpi-chart">
          <Line
            ref={ref}
            data={{
              // labels: [...Array(values[0].length)].map(x => 'test'),
              labels: Array(values.length).fill(0),
              datasets: [{
                data: values,
                fill: true,
                borderColor: borderColor,
                // backgroundColor: "#000",
                backgroundColor: () => {
                  if (ref.current) {
                    const chartInstance = ref.current; // Access the chart instance
                    const ctx = chartInstance.ctx;

                    const gradient = ctx.createLinearGradient(0, 0, 0, chartInstance.height);
                    gradient.addColorStop(0.25, borderColor + '88'); // Use the borderColor as the start color
                    gradient.addColorStop(0.9, "#FFF"); // End color

                    return gradient;
                  }
                },
                tension: .3,
                radius: 0
              }]
            }}
            options={{
              scales: {
                y: {
                  beginAtZero: false,
                  min: minValue,
                  ticks: { display: false },
                  grid: { display: false },
                  border: { display: false }
                },
                x: {
                  ticks: { display: false },
                  grid: { display: false },
                  border: { display: false }
                },
              }
            }}
          />
        </div>
      </div>
    </div>
  )
});

const ScheduleTable = ({ schedules }) => {
  const [selectedDropdown, setSelectedDropdown] = useState(null);
  const [timeFilter, setTimeFilter] = useState('This Month'); // State for tracking the current filter

  const filteredSchedules = useMemo(() => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0)); // Reset hours to start of today
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    switch (timeFilter) {
      case 'This Month':
        return schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.Start_Date);
          return scheduleDate >= startOfMonth && scheduleDate <= today;
        });
      case 'YTD':
        return schedules.filter(schedule => {
          const scheduleDate = new Date(schedule.Start_Date);
          return scheduleDate >= startOfYear && scheduleDate <= today;
        });
      case 'Future':
        return schedules.filter(schedule => new Date(schedule.Start_Date) > today);
      case 'All Time':
      default:
        return schedules;
    }
  }, [schedules, timeFilter]);

  const { uniqueDaysArray, schedulesByDate, daysHours } = useMemo(() => {
    const uniqueDays = {};
    const schedulesByDate = {};
    const daysHours = {};

    filteredSchedules.forEach(schedule => {
      const dateString = new Date(schedule.Start_Date).toLocaleDateString();
      uniqueDays[dateString] = (uniqueDays[dateString] || 0) + 1;

      if (!schedulesByDate[dateString]) {
        schedulesByDate[dateString] = [];
      }
      schedulesByDate[dateString].push(schedule);

      const hour = new Date(schedule.Start_Date).getHours();
      if (!daysHours[dateString]) {
        daysHours[dateString] = new Set();
      }
      daysHours[dateString].add(hour);
    });

    const uniqueDaysArray = Object.entries(uniqueDays).sort((a, b) => new Date(a[0]) - new Date(b[0]));

    Object.keys(daysHours).forEach(day => daysHours[day] = daysHours[day].size);

    return { uniqueDaysArray, schedulesByDate, daysHours };
  }, [filteredSchedules]);

  return (
    <div id="table-container">
      <div id="table-header">
        <p className="date">Date</p>
        <p>Signups</p>
        <p className="hours">Hours Covered</p>
      </div>
      <div id="roster-table">
        {
          uniqueDaysArray.map((day, i) => {
            const dayKey = day[0]; // Date string
            const currDayRoster = schedulesByDate[dayKey].sort((a, b) => new Date(a.Start_Date) - new Date(b.Start_Date));

            return (
              <div key={i}>
                <div id={`table-${i}`} className="row day" onClick={() => setSelectedDropdown(selectedDropdown === i ? null : i)}>
                  <p className="date" style={{ textAlign: "left" }}>
                    {new Date(dayKey).toLocaleDateString('en-us', { weekday: "short" })} {dayKey}
                  </p>
                  <p id="signups">{day[1]}</p>
                  <p className="hours">{daysHours[dayKey]} / 24</p>
                </div>
                {selectedDropdown === i && (
                  <div id={`dropdown-table-${i}`} className='dropdown-table open'>
                    <div className="dropdown-scroll-container">
                      <div className="row" id="header">
                        <p className="name">Name</p>
                        <p className="datetime">Time</p>
                        <p className="email">Email</p>
                        <p className="phone">Phone</p>
                      </div>
                      {currDayRoster.map((schedule, j) => {
                        const { First_Name, Last_Name, Email, Phone, Start_Date, End_Date } = schedule;
                        const startDate = new Date(Start_Date).toLocaleTimeString('en-us', { minute: "2-digit", hour: "2-digit" });
                        const endDate = new Date(End_Date).toLocaleTimeString('en-us', { minute: "2-digit", hour: "2-digit" });
                        return (
                          <div className="row" key={j}>
                            <p className="name">{First_Name} {Last_Name || ''}</p>
                            <p className="datetime">{startDate} - {endDate}</p>
                            <p className="email">{Email}</p>
                            <p className="phone">{Phone}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        }
      </div>
      <div id="table-footer">
        <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
          <option value="All Time">All Time</option>
          <option value="YTD">YTD</option>
          <option value="This Month">This Month</option>
          <option value="Future">Future</option>
        </select>
        {/* <button id="csv-download" className="btn" onClick={()=>getCSV(filteredSchedules.map(schedule => [`${schedule.First_Name} ${schedule.Last_Name || ''}`, new Date(schedule.Start_Date).toLocaleDateString(), `${new Date(schedule.Start_Date).toLocaleTimeString('en-us', {"minute": "2-digit", "hour": "2-digit"})} - ${new Date(schedule.End_Date).toLocaleTimeString('en-us', {"minute": "2-digit", "hour": "2-digit"})}`, schedule.Email, schedule.Phone]))}>Download CSV</button> */}
        <button id="csv-download" className="btn" onClick={() => {
          const sortedSchedules = filteredSchedules.sort((a, b) => new Date(a.Start_Date) - new Date(b.Start_Date));
          const csvRows = sortedSchedules.map(schedule => [
            `${schedule.First_Name} ${schedule.Last_Name || ''}`,
            new Date(schedule.Start_Date).toLocaleDateString(),
            `${new Date(schedule.Start_Date).toLocaleTimeString('en-us', { "hour12": false, "hour": "2-digit", "minute": "2-digit" })} - ${new Date(schedule.End_Date).toLocaleTimeString('en-us', { "hour12": false, "hour": "2-digit", "minute": "2-digit" })}`,
            schedule.Email,
            schedule.Phone
          ]);
          getCSV(csvRows);
        }}>Download CSV</button>
      </div>
    </div>
  );
};

const EditPrayerPoints = ({ value, setValue, submit }) => {
  const [tempValue, setTempValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setValue(tempValue);
    setIsEditing(false);

    submit(tempValue);
  }

  return (
    <form id="prayer-point-form" onSubmit={handleSubmit}>
      <div className="header-row">
        <label htmlFor="prayer-points">Prayer Points:</label>
        <div className="button-container">
          {!isEditing && <button className="btn" type="button" onClick={() => setIsEditing(true)}>Edit</button>}
          {isEditing && <button className="btn" type="button" onClick={handleCancel}>Cancel</button>}
          {isEditing && <button className="btn highlight" type="submit">Submit</button>}
        </div>
      </div>
      <div className="input-container">
        <textarea id="prayer-points" placeholder="Example: Unity in the church" maxLength="90" value={tempValue} onInput={(e) => setTempValue(e.target.value)} disabled={!isEditing} required></textarea>
      </div>
    </form>
  )
}

const EditReservationDays = ({ communityID, reservations, setReservations, submit, remove }) => {
  // const [tempReservations, setTempReservations] = useState(reservations);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [newDateFieldValue, setNewDateFieldValue] = useState('');
  const [editDateFieldValue, setEditDateFieldValue] = useState(null);

  const handleCreate = () => {
    if (!newDateFieldValue) return;
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 because getMonth() returns zero-based index
    const day = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    if (newDateFieldValue < formattedDate) return alert('Cannot create past reservations.');

    const reservationToCreate = {
      WPAD_Community_ID: communityID,
      Reservation_Date: `${newDateFieldValue}T00:00:00`
    };
    setNewDateFieldValue('');

    const tempReservations = structuredClone(reservations);
    tempReservations.push({ ...reservationToCreate, WPAD_Community_Reservation_ID: generateUUID() });
    setReservations(tempReservations.sort((a, b) => new Date(a.Reservation_Date) - new Date(b.Reservation_Date)));

    submit(reservationToCreate);
  }

  const handleEdit = (id) => {
    const currReservation = reservations.find(day => day.WPAD_Community_Reservation_ID === id);
    // console.log(currReservation);
    setSelectedReservation(currReservation);
    setEditDateFieldValue(new Date(currReservation.Reservation_Date).toISOString().split('T')[0]);
  }

  const handleCancel = () => {
    setSelectedReservation(null);
    setEditDateFieldValue(null);
  }

  const handleSubmit = () => {
    const tempReservations = reservations;
    const resToChange = tempReservations.find(day => day.WPAD_Community_Reservation_ID === selectedReservation.WPAD_Community_Reservation_ID);
    resToChange.Reservation_Date = editDateFieldValue + 'T00:00:00';

    setReservations(tempReservations);
    handleCancel();

    submit(resToChange);
  }

  const handleDelete = () => {
    const tempReservations = reservations;

    setReservations(tempReservations.filter(res => res.WPAD_Community_Reservation_ID !== selectedReservation.WPAD_Community_Reservation_ID));
    handleCancel();

    remove(selectedReservation.WPAD_Community_Reservation_ID);
  }

  return (
    <div id="reservation-table-container">
      <div id="new-prayer-day-container">
        <p>Add new prayer day:</p>
        <div className="input-container">
          <input type="date" id="new-prayer-date" value={newDateFieldValue} onChange={(e) => setNewDateFieldValue(e.target.value)} />
          <button className="btn highlight" onClick={handleCreate}>Submit</button>
        </div>
      </div>

      <div id="reservation-table">
        <div className="data-row header">
          <p>My Prayer Days:</p>
        </div>
        {reservations.map((day, i) => {
          const { Reservation_Date, WPAD_Community_Reservation_ID: id } = day;
          const currDate = new Date(Reservation_Date);
          const dateString = currDate.toLocaleDateString('en-us', { weekday: "short" }) + " " + currDate.toLocaleDateString();
          const selectedID = selectedReservation?.WPAD_Community_Reservation_ID;
          return (
            <div className="data-row" id={`row-${id}`} key={id}>
              <div className="date-label">
                {selectedID === id ? <input type="date" value={editDateFieldValue} onChange={(e) => setEditDateFieldValue(e.target.value)} /> : dateString}
              </div>
              {selectedID !== id && <button title="edit date" className="reservation-edit-btn btn" onClick={() => handleEdit(id)}><FaEdit /></button>}
              {selectedID === id && <button title="delete date" className="reservation-delete-btn btn" onClick={handleDelete}><FaTrash /></button>}
              {selectedID === id && <button title="save date" className="reservation-save-btn btn" onClick={handleSubmit}><FaSave /></button>}
              {selectedID === id && <button title="cancel" className="reservation-cancel-btn btn" onClick={handleCancel}><FaTimesCircle /></button>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Dashboard = ({ community, showSwitchCommunity, switchCommunity, setIsLoading }) => {
  // const [isLoading, setIsLoading] = useState(true);

  const [allCommunityPrayers, setAllCommunityPrayers] = useState([]);
  const [allCommunityReservations, setAllCommunityReservations] = useState([]);
  const [hoursCovered, setHoursCovered] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [uniqueUserSignupsWithinPeriod, setUniqueUserSignupsWithinPeriod] = useState([]);
  // const [period, setPeriod] = useState(30);
  const period = 30;

  const [usersByEarliestSignup, setUsersByEarliestSignup] = useState({});

  const [prayerPoints, setPrayerPoints] = useState(community.Reminder_Text);

  const getCommunityPrayers = async (id) => instance.get(`/api/wpad/communityPrayers/${id}`)
    .then(response => response.data);

  const getCommunityReservations = async (id) => instance.get(`/api/wpad/communityReservations/${id}`)
    .then(response => response.data);

  const updatePrayerPoints = async (id, data) => instance.post(`/api/wpad/prayerPoints/${id}`, data)
    .then(response => response.data);

  const updateReservation = async (id, data) => instance.post(`/api/wpad/communityReservation/${id}`, data)
    .then(response => response.data);

  const deleteReservation = async (id, resID) => instance.delete(`/api/wpad/communityReservation/${id}/${resID}`)
    .then(response => response.data);


  useEffect(() => {
    const getCommunityData = async () => {
      try {
        const { WPAD_Community_ID } = community;

        setIsLoading(true);
        const tempCommunityPrayers = await getCommunityPrayers(WPAD_Community_ID);
        setAllCommunityPrayers(tempCommunityPrayers);

        const tempCommunityReservations = await getCommunityReservations(WPAD_Community_ID);
        setAllCommunityReservations(tempCommunityReservations);

        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log('something went wront')
      }
    }
    getCommunityData()
  }, [community, setIsLoading]);

  const handlePrayerPointsFormSubmit = (prayerPoints) => {
    try {
      const { WPAD_Community_ID } = community;

      setIsLoading(true);
      updatePrayerPoints(WPAD_Community_ID, { Reminder_Text: prayerPoints })
        .then(() => setIsLoading(false));
    } catch (error) {
      console.log('something went wront')
    }
  }

  const handleReservationChangeSubmit = (reservation) => {
    try {
      const { WPAD_Community_ID } = community;

      setIsLoading(true);
      updateReservation(WPAD_Community_ID, reservation)
        .then(() => setIsLoading(false));
    } catch (error) {
      console.log('something went wront')
    }
  }

  const handleDeleteReservation = (reservationID) => {
    try {
      const { WPAD_Community_ID } = community;

      setIsLoading(true);
      deleteReservation(WPAD_Community_ID, reservationID)
        .then(() => setIsLoading(false));
    } catch (error) {
      console.log('something went wront')
    }
  }

  useEffect(() => {
    const periodList = [];
    // Get today's date
    let currentDate = new Date();
    for (let i = 0; i < period; i++) {
      // Clone the current date
      let date = new Date(currentDate.getTime());
      // Subtract 'i' days from the date
      date.setDate(date.getDate() - i);
      // Format the date as 'YYYY-MM-DD' and add to the array
      periodList.unshift(date.toISOString().split('T')[0]);
    }

    setHoursCovered(periodList.map(date => allCommunityPrayers.filter(prayer => new Date(prayer.Start_Date).toISOString().split('T')[0] <= date).length));

    allCommunityPrayers.forEach(prayer => {
      const { Email, _Signup_Date } = prayer;
      let tempUsersByEarliestSignup = usersByEarliestSignup;

      if (usersByEarliestSignup[Email]) {
        // compare signup dates
        if (usersByEarliestSignup[Email] > new Date(_Signup_Date)) {
          tempUsersByEarliestSignup[Email] = new Date(_Signup_Date);
        }
      } else {
        tempUsersByEarliestSignup[Email] = new Date(_Signup_Date);
      }

      setUsersByEarliestSignup(tempUsersByEarliestSignup);
    });

    setUniqueUsers(periodList.map(date => Object.values(usersByEarliestSignup).filter(startDate => startDate.toISOString().split('T')[0] <= date).length));
    setUniqueUserSignupsWithinPeriod(periodList.map(date => Object.values(usersByEarliestSignup).filter(startDate => startDate.toISOString().split('T')[0] === date).length));

  }, [allCommunityPrayers, usersByEarliestSignup]);

  return (
    <div id="dashboard-container">
      <div id="dashboard-header">
        <div className="header-row">
          <h2 style={{ margin: !showSwitchCommunity ? "0 auto" : "0" }}>{community.Community_Name}</h2>
          {showSwitchCommunity && <button className="btn icon" onClick={switchCommunity} title="Edit Selected Church/Community"><BsBoxArrowLeft /></button>}
        </div>
        <div className="scroll-container">
          <div className="chart-row">
            {/* <h1>{totalHoursCovered} Hour{totalHoursCovered !== 1 ? 's' : ''} Covered</h1> */}
            {/* <h1>{uniqueUsers} Unique User{uniqueUsers !== 1 ? 's' : ''}</h1> */}
            {/* <h1>{CountOfUniqueUserSignupsWithinPeriod} New Unique User{CountOfUniqueUserSignupsWithinPeriod !== 1 ? 's' : ''} In {period} Days</h1> */}
            <KPIChart ref={useRef(null)} values={hoursCovered} title={"Total Hours Prayed"} unit={"Hours"} />
            <KPIChart ref={useRef(null)} values={uniqueUsers} title={"Total Unique Users"} unit={"Users"} />
            <KPIChart ref={useRef(null)} values={uniqueUserSignupsWithinPeriod} total={true} title={"First Time Sign-Ups"} unit={"New Users"} />
          </div>
        </div>
      </div>
      <ScheduleTable schedules={allCommunityPrayers} />

      <div className="dashboard-row">
        <EditPrayerPoints value={prayerPoints} setValue={setPrayerPoints} submit={handlePrayerPointsFormSubmit} />
        <EditReservationDays communityID={community.WPAD_Community_ID} reservations={allCommunityReservations} setReservations={setAllCommunityReservations} submit={handleReservationChangeSubmit} remove={handleDeleteReservation} />
      </div>
    </div>
  )
}

export default Dashboard;