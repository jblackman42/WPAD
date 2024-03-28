import React, { useState, useEffect } from "react";

import Error from "../pages/Error.jsx";

import instance from "../lib/globals.js";
import Loading from "./Loading";

const AuthPage = ({children}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getUser = async () => {
    return await instance({
      method: 'get',
      url: '/api/wpad/user'
    })
      .then(response => response.data)
  }
  
  useEffect(() => {
    getUser()
      .then(user => {
        // console.log(user);
        // go to login screen if no user is found
        if (Object.keys(user).length === 0) window.location.replace("/login");
        else setIsAuthenticated(true);
      })
      .catch(error => {
        console.error(error);
        setErrorMessage('Could not find user account');
        // console.log()
      })
  }, []);

  return isAuthenticated
    ? children
    : errorMessage
      ? <Error errorMessage={errorMessage} />
      : <Loading />
}

export default AuthPage;