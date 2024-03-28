import React, { useState, useEffect } from "react";
import { Navbar, Footer } from "../components";

import instance from "../lib/globals";
import { Loading, Dashboard as Dash } from "../components";

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [allCommunities, setAllCommunities] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  
  useEffect(() => {
    instance.get('/api/wpad/myCommunity')
      .then(response => response.data)
      .then(communities => {
        setAllCommunities(communities);
        if (communities.length === 0) return setErrorMessage('You are not authorized to be here, go home.');
        else if (communities.length === 1) setSelectedCommunity(communities[0]);

        setIsLoading(false);
      })
      .catch(() => {
        setErrorMessage('Failed to retrieve your church/community.')
      })
  }, []);

  return <>
    <Navbar />

    {
      errorMessage
        ? <p style={{textAlign:"center",color:"#e74c3c",fontSize:"1.5rem"}}>{errorMessage}</p>
        : isLoading
          ? <Loading />
          : selectedCommunity
            ? <Dash showSwitchCommunity={allCommunities.length>1} switchCommunity={()=>setSelectedCommunity(null)} community={selectedCommunity} />
            : <div id="community-select">
                <p>Multiple communities found, please select one to view it's dashboard:</p>
                <div className="community-option-container">
                  {allCommunities.map((community,i) => <button className="btn highlight" key={i} onClick={()=>setSelectedCommunity(community)}>{community.Community_Name}</button>)}
                </div>
              </div>
    }

    <Footer />
  </>
}

export default Dashboard;