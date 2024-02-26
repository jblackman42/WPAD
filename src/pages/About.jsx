import React from "react";
import { Navbar, Footer } from "../components";

const About = () => {
  return <>
    <Navbar />

    <section className="about-us" id="about-us-video">
      <div className="video-container">
        <iframe title="Chris Intro Video" src="https://player.vimeo.com/video/794173767?h=9959b4b331" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" />    
      </div>
    </section>
    <section className="about-us" id="about-us-content">
      <div className="col flex-1">
        <h1>This is not about any one church or ministry.</h1>
      </div>
      <div className="col flex-2">
        <p>We are a collective of churches and prayer groups from all sorts of denominations and backgrounds!</p>
        <p>We exist to Unite the Church to seek God's presence, transformation and awakening. We encourage Believers to come together to pray 24/7 for our communities to become better, for people who don't believe in God to learn about Him, and for our churches to grow stronger.</p>
        <a href="mailto:gjust@pureheart.org" className="contact-btn btn">Get In Contact</a>
      </div>
    </section>

    <Footer />
  </>
}

export default About;