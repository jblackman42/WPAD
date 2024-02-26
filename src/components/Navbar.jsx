import React, { useState } from "react";
import { IoMenu } from "react-icons/io5";
import Logo from "../assets/final-logo-transparent.png"

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const guideURL = "/guide/Jan-Feb 2024.pdf"
  return (
    <nav>
      <div className="logo-container">
        <a href="/">
          <img src={Logo} alt="WE PRAY ALL DAY" />
        </a>
      </div>
      <div id="links-container" className={open ? "open" : ""}>
        <div className="link"><a href="/notaboutus">Not About Us</a></div>
        <div className="link"><a href="/leaders">Leaders</a></div>
        <div className="link"><a href="/dashboard">Dashboard</a></div>
        <div className="link" id="logout-btn"><a href="/logout">Logout</a></div>
        <div className="link highlight"><a href={guideURL}>Prayer Guide</a></div>
      </div>
      <div className="toggle-nav">
        <button id="toggle-nav-btn" onClick={() => setOpen(!open)}>
          <IoMenu style={{fontSize:"28px"}} />
        </button>
      </div>
    </nav>
  )
}

export default Navbar;