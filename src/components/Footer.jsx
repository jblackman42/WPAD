import React from "react";
import Logo from "../assets/final-logo-transparent.png"

const Footer = () => {
  return (
    <footer>
      <div className="img-container">
        <img src={Logo} alt="We Pray All Day" />
      </div>
      <div className="links">
        <a href="/">Home</a>
        {/* <a href="/notaboutus">Not About Us</a> */}
        <a href="/leaders">Leaders</a>
        <a href="/dashboard">Dashboard</a>
      </div>
      <a href="mailto:info@weprayallday.com">info@weprayallday.com</a>
      <p>2025 © Better Together Church Network</p>
    </footer>
  )
}

export default Footer;