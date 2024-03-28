import React from "react";
import { Navbar, Footer } from "../components";

const Error = ({errorMessage}) => {
  return <>
    <Navbar />
    <div className="error-container">
      <h1>{errorMessage ? 'UH OH. Something went wrong' : '404 PAGE NOT FOUND'}</h1>
      <p>{errorMessage ?? 'Sorry, the page you were looking for could not be found.'}</p>
      <a href="/" className="btn highlight">Back Home</a>
    </div>
    <Footer />
  </>
}

export default Error;