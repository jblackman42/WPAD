import React from "react";
import { Navbar, Footer } from "../components";

const Leaders = () => {
  return <>
    <Navbar />

    <section id="leader">
      <div class="video-container">
        <iframe title="Dan intro video" src="https://player.vimeo.com/video/793460981?h=85f2441f77" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture" />
      </div>
    </section>

    <section id="leader">
      <div className="col">
        <h1>We truly believe that we are better together and that revival in our community means every tribe and every tongue.</h1>
        <h1>No matter your denomination or background. We are in this together!</h1>
        <h1>We have three commitments that we ask every partner to make:</h1>
      </div>
    </section>

    <section id="leader" className="list">
      <p>Coordinate and host 24 hours of prayer, one day every month for one year.</p>
      <p>Appoint a prayer coordinator as a point person for mobilizing 24 hours of prayer each month. (Please share their name, email and mobile number with us)</p>
      <p>Share with your community (church, ministry, group) once a month leading up to your day of prayer, encouraging them to sign up.</p>
    </section>
    
    <section id="leader">
      <a href="/register" className="register-btn btn">Register your Church/Community</a>
    </section>

    <Footer />
  </>
}

export default Leaders;