import React, { useRef } from "react";
import { Navbar, Footer, Calendar } from "../components";
import homepageBanner from "../assets/homepage-banner-arizona.png";

const Home = () => {
  const calendarRef = useRef(null);

  // Step 4: Creating a function that scrolls to the Calendar component
  const scrollToCalendar = () => {
    if (calendarRef.current) {
      // Using scrollIntoView for smooth scrolling
      calendarRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return <>
    <Navbar />
    
    <div className="container home-content">
      <section className="content info">
        <h1 className="content-title">Uniting the Church Body Through Prayer</h1>
        <p>"Pray in the Spirit at all times and on every occasion. Stay alert and be persistent in your prayers for all believers everywhere"</p>
        <p style={{textAlign:"right"}}>Ephesians 6:18 NLT</p>
        <div className="button-container">
          <button className="btn highlight" onClick={scrollToCalendar}>Get Started</button>
          <a href="/notaboutus" className="btn">How Does It Work</a>
        </div>
      </section>
      <section className="content">
        <div className="image-container">
          <img src={homepageBanner} alt="Covering Arizona is 24/7 Prayer" />
        </div>
      </section>
    </div>


    <div className="instruction-banner">
      <div className="instructions">
        <h1>Getting Started is Easy</h1>
        <ul>
          <li>Choose a Day to Pray.</li>
          <li>Sign Up For an Hour. (One-Time / Recurring)</li>
          <li>Receive a Text with a Prayer Guide.</li>
        </ul>
      </div>
    </div>

    <div ref={calendarRef}>
      <Calendar />
    </div>

    <Footer />
  </>
}

export default Home;