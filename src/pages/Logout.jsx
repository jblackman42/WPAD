import React, {useEffect, useState} from "react";
import { Navbar, Footer, Loading } from "../components";

import instance from "../lib/globals";

const Logout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    instance.post('/api/wpad/logout')
      .then(() => setIsLoading(false))
      .catch(() => setErrorMessage('Internal server error'));
  }, []);

  return <>
    <Navbar />
    {
      isLoading
        ? <Loading />
        : errorMessage
          ? <div className="error-container">
              <h1>{errorMessage}</h1>
              <p>Try again later or contact support.</p>
              <a href="/" className="btn highlight">Back Home</a>
            </div>
          : <div className="error-container">
              <h1>Logout Successful</h1>
              <p>See you next time</p>
              <a href="/" className="btn highlight">Back Home</a>
            </div>
    }
    
    <Footer />
  </>
}

export default Logout;