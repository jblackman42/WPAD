import React, { useState } from "react";

import instance from "../lib/globals.js";
import { Loading } from "../components";

import { MdKeyboardArrowLeft } from "react-icons/md";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

const Login = () => {
  const [showPass, setShowPass] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const body = {
      username: e.currentTarget.username.value,
      password: e.currentTarget.password.value,
    };

    await instance({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      url: '/api/wpad/login',
      data: JSON.stringify(body)
    })
      .then(response => {
        // console.log(response);
        setIsLoading(true);
        window.location = "/dashboard";
      })
      .catch(error => {
        setErrorMessage(error.response?.data ?? "Internal server error");
        // console.log(error);
      })
  }

  return <>
      {isLoading && <Loading />}

      <div className="forms-container">
        <a id="back-btn" href="/"><MdKeyboardArrowLeft /> Back To Calendar</a>
        <form id="loginForm" onSubmit={handleSubmit}>
          <h1>Sign In</h1>
          <div className="inputs">
            <input type="text" name="username" id="username" autoComplete="on" placeholder="Username" required />
            <input type={showPass ? 'text' : 'password'} name="password" id="password" autoComplete="on" placeholder="Password" required />
            {showPass ? <FaRegEye onClick={() => setShowPass(!showPass)} id="togglePassword" /> : <FaRegEyeSlash onClick={() => setShowPass(!showPass)} id="togglePassword" />}
          </div>
          <div className="row">
            <div className="remember-input" title="Keeps you logged in on this device for 30 days">
              <input type="checkbox" name="remember" id="remember" />
              <label htmlFor="remember">Keep Me Logged In</label>
            </div>
            <a href="https://my.pureheart.org/ministryplatformapi/oauth/reset">Forgot Password</a>
          </div>
          <button type="submit" className="login">Sign In</button>
          
          {errorMessage && <p className="form-error">{errorMessage}</p>}
        </form>
      </div>
  </>
}

export default Login;