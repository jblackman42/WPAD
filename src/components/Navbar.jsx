import React, { useState, useEffect } from "react";
import { IoMenu } from "react-icons/io5";
import Logo from "../assets/final-logo-transparent.png";
import instance from "../lib/globals";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const logoutUser = () => instance.get('/api/wpad/user')
    .then(response => response.data)
    .then(user => {
      if (Object.keys(user).length > 0) setIsLoggedIn(true);
    })
    .catch(err => console.error(err));
  
  useEffect(() => {
    
    if (window.location.pathname !== "/logout") logoutUser()
  }, []);

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
        {isLoggedIn && <div className="link"><a href="/logout">Logout</a></div>}
        <div className="link highlight"><a href="/guide">Prayer Guide</a></div>
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