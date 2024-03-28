import React, {useState, useEffect, forwardRef, useRef, useMemo} from "react";

import { BsBoxArrowLeft } from "react-icons/bs";
import { defaults } from "chart.js/auto";
import { Line } from "react-chartjs-2";

import Loading from "./Loading";
import instance from "../lib/globals";

defaults.scale.grid.display = false;
defaults.plugins.title.display = false;
defaults.responsive = true;
defaults.plugins.legend.display = false;
defaults.plugins.title.display = false;


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


const KPIChart = forwardRef(({title, unit, values, total}, ref) => {
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
      <h3>{ title } {total ? `(Last 30 Days)` : ''}</h3>
      <div className="kpi-card">
        <div className="kpi-data">
          <h1 ref={h1Ref}>{ total ? values.reduce((accum,val) => accum+val, 0) : values.at(-1) } </h1>
          {/* <h1>{ values.at(-1) }</h1> */}
          <p style={{marginBottom:"auto"}}>{unit}</p>
          {!total && <p style={{color: borderColor}}> { percentChange > 0 ? '+' : '' }{ percentChange }%</p>}
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

const ScheduleTable = ({ schedules }) => {
  const [selectedDropdown, setSelectedDropdown] = useState(null);
  const [timeFilter, setTimeFilter] = useState('YTD'); // State for tracking the current filter

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
            `${new Date(schedule.Start_Date).toLocaleTimeString('en-us', {"hour12": false, "hour": "2-digit", "minute": "2-digit"})} - ${new Date(schedule.End_Date).toLocaleTimeString('en-us', {"hour12": false, "hour": "2-digit", "minute": "2-digit"})}`,
            schedule.Email,
            schedule.Phone
          ]);
          getCSV(csvRows);
        }}>Download CSV</button>
      </div>
    </div>
  );
};

const Dashboard = ({community, showSwitchCommunity, switchCommunity}) => {
  const [isLoading, setIsLoading] = useState(true);

  const [allCommunityPrayers, setAllCommunityPrayers] = useState([]);
  const [hoursCovered, setHoursCovered] = useState([]);
  const [uniqueUsers, setUniqueUsers] = useState([]);
  const [uniqueUserSignupsWithinPeriod, setUniqueUserSignupsWithinPeriod] = useState([]);
  const [period, setPeriod] = useState(30);
  // const period = 30;

  const [usersByEarliestSignup, setUsersByEarliestSignup] = useState({});

  const getCommunityPrayers = async (id) => instance.get(`/api/wpad/communityPrayers/${id}`)
    .then(response => response.data);

  useEffect(() => {
    try {
      const { WPAD_Community_ID } = community;

      // setIsLoading(true);
      getCommunityPrayers(WPAD_Community_ID)
        .then(data => {
          setAllCommunityPrayers(data);
          setIsLoading(false);
        });
    } catch (error) {
      console.log('something went wront')
    }
  }, [community, setIsLoading]);

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

    // setTotalHoursCovered(allCommunityPrayers.length);
    // setUniqueUsers([...new Set(allCommunityPrayers.map(prayer => prayer.Email))].length);

    // console.log(allCommunityPrayers)
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
    // setCountOfUniqueUserSignupsWithinPeriod(Object.values(usersByEarliestSignup).filter(date => date >= new Date(new Date() - (1000*60*60*24*period))).length);

  }, [allCommunityPrayers, usersByEarliestSignup, period])
  return (
    <div id="dashboard-container">
      {isLoading && <Loading />}
      <div id="dashboard-header">
        <div className="header-row">
          <h2 style={{margin: !showSwitchCommunity ? "0 auto" : "0"}}>{community.Community_Name}</h2>
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
      <ScheduleTable schedules={allCommunityPrayers}/>
    </div>
  )
}

export default Dashboard;