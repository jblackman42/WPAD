import React, {useState, useEffect, forwardRef, useRef} from "react";

import { BsBoxArrowLeft } from "react-icons/bs";
import Chart, { defaults } from "chart.js/auto";
import { Line } from "react-chartjs-2";

import Loading from "./Loading";
import instance from "../lib/globals";

defaults.scale.grid.display = false;
defaults.plugins.title.display = false;
defaults.responsive = true;
defaults.plugins.legend.display = false;
defaults.plugins.title.display = false;

const calculatePercentChange = (arr) => {
  if (arr.length < 2) {
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

const KPIChart = forwardRef(({title, unit, values}, ref) => {
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
    let fontSize = 70; // Starting font size in pixels
    let maxWidth = 150;
    h1.style.fontSize = fontSize + 'px';

    while (h1.scrollWidth > maxWidth) {
      fontSize--;
      h1.style.fontSize = fontSize + 'px';
    }
  };

  useEffect(() => {
    adjustFontSize();
  }, [values]); // Dependency array: adjust font size when 'values' changes

  return (
    <div ref={chartCardRef} className="chart-card">
      <h3>{ title }</h3>
      <div className="kpi-card">
        <div className="kpi-data">
          <h1 ref={h1Ref}>{ values.at(-1) } </h1>
          {/* <h1>{ values.at(-1) }</h1> */}
          <p style={{marginBottom:"auto"}}>{unit}</p>
          <p style={{color: borderColor}}> { percentChange > 0 ? '+' : '' }{ percentChange }% - { values.length }</p>
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
                    gradient.addColorStop(0.9, "#c4beb6"); // End color
                    
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

const Dashboard = ({community, showSwitchCommunity, switchCommunity}) => {
  const [isLoading, setIsLoading] = useState(true);

  const [allCommunityPrayers, setAllCommunityPrayers] = useState([]);
  const [hoursCovered, setHoursCovered] = useState([]);
  const [totalHoursCovered, setTotalHoursCovered] = useState(null);
  const [uniqueUsers, setUniqueUsers] = useState(null);
  const [CountOfUniqueUserSignupsWithinPeriod, setCountOfUniqueUserSignupsWithinPeriod] = useState(null);
  const [period, setPeriod] = useState(30);

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
    // allCommunityPrayers.forEach(prayer => {
    //   const { Email, _Signup_Date } = prayer;
    //   let tempUsersByEarliestSignup = usersByEarliestSignup;
      
    //   if (usersByEarliestSignup[Email]) {
    //     // compare signup dates
    //     if (usersByEarliestSignup[Email] > new Date(_Signup_Date)) {
    //       tempUsersByEarliestSignup[Email] = new Date(_Signup_Date);
    //     }
    //   } else {
    //     tempUsersByEarliestSignup[Email] = new Date(_Signup_Date);
    //   }

    //   setUsersByEarliestSignup(tempUsersByEarliestSignup);
    // });

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
        <div className="header-row" style={{marginTop:"1rem"}}>
          {/* <h1>{totalHoursCovered} Hour{totalHoursCovered !== 1 ? 's' : ''} Covered</h1> */}
          {/* <h1>{uniqueUsers} Unique User{uniqueUsers !== 1 ? 's' : ''}</h1> */}
          {/* <h1>{CountOfUniqueUserSignupsWithinPeriod} New Unique User{CountOfUniqueUserSignupsWithinPeriod !== 1 ? 's' : ''} In {period} Days</h1> */}
          <KPIChart ref={useRef(null)} values={hoursCovered} title={"Total Hours Prayed"} unit={"Hours"} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard;