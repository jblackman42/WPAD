import React, { useState } from "react";
import axios from "axios";
import { Navbar, Footer } from "../components";

import { FaUser, FaHome, FaLock } from "react-icons/fa";

const fetchURL = 'http://localhost:5000'
const stateLabelValues = [{ 'label':'Alabama', 'value': 'AL' },{ 'label':'Alaska', 'value': 'AK'},{ 'label':'American Samoa', 'value': 'AS'},{ 'label':'Arizona', 'value': 'AZ'},{ 'label':'Arkansas', 'value': 'AR'},{ 'label':'California', 'value': 'CA'},{ 'label':'Colorado', 'value': 'CO'},{ 'label':'Connecticut', 'value': 'CT'},{ 'label':'Delaware', 'value': 'DE'},{ 'label':'District of Columbia', 'value': 'DC'},{ 'label':'States of Micronesia', 'value': 'FM'},{ 'label':'Florida', 'value': 'FL'},{ 'label':'Georgia', 'value': 'GA'},{ 'label':'Guam', 'value': 'GU'},{ 'label':'Hawaii', 'value': 'HI'},{ 'label':'Idaho', 'value': 'ID'},{ 'label':'Illinois', 'value': 'IL'},{ 'label':'Indiana', 'value': 'IN'},{ 'label':'Iowa', 'value': 'IA'},{ 'label':'Kansas', 'value': 'KS'},{ 'label':'Kentucky', 'value': 'KY'},{ 'label':'Louisiana', 'value': 'LA'},{ 'label':'Maine', 'value': 'ME'},{ 'label':'Marshall Islands', 'value': 'MH'},{ 'label':'Maryland', 'value': 'MD'},{ 'label':'Massachusetts', 'value': 'MA'},{ 'label':'Michigan', 'value': 'MI'},{ 'label':'Minnesota', 'value': 'MN'},{ 'label':'Mississippi', 'value': 'MS'},{ 'label':'Missouri', 'value': 'MO'},{ 'label':'Montana', 'value': 'MT'},{ 'label':'Nebraska', 'value': 'NE'},{ 'label':'Nevada', 'value': 'NV'},{ 'label':'New Hampshire', 'value': 'NH'},{ 'label':'New Jersey', 'value': 'NJ'},{ 'label':'New Mexico', 'value': 'NM'},{ 'label':'New York', 'value': 'NY'},{ 'label':'North Carolina', 'value': 'NC'},{ 'label':'North Dakota', 'value': 'ND'},{ 'label':'Northern Mariana Islands', 'value': 'MP'},{ 'label':'Ohio', 'value': 'OH'},{ 'label':'Oklahoma', 'value': 'OK'},{ 'label':'Oregan', 'value': 'OR'},{ 'label':'Palau', 'value': 'PW'},{ 'label':'Pennsilvania', 'value': 'PA'},{ 'label':'Puerto Rico', 'value': 'PR'},{ 'label':'Rhode Island', 'value': 'RI'},{ 'label':'South Carolina', 'value': 'SC'},{ 'label':'South Dakota', 'value': 'SD'},{ 'label':'Tennessee', 'value': 'TN'},{ 'label':'Texas', 'value': 'TX'},{ 'label':'Utah', 'value': 'UT'},{ 'label':'Vermont', 'value': 'VT'},{ 'label':'Virgin Islands', 'value': 'VI'},{ 'label':'Virginia', 'value': 'VA'},{ 'label':'Washington', 'value': 'WA'},{ 'label':'West Virginia', 'value': 'WV'},{ 'label':'Wisconsin', 'value': 'WI'},{ 'label':'Wyoming', 'value': 'WY'}];

const Register = () => {
  const [formPage, setFormPage] = useState(0);
  const [progressSlideDelayMS, setProgressSlideDelayMS] = useState(0);

  const [errorMessage, setErrorMessage] = useState('');

  // form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const formPages = [
    {
      name: 'Contact',
      icon: <FaUser />,
      inputHTML: <>
        <div className="input-container">
          <input type="text" name="First_Name" id="First_Name" placeholder=" " value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <label htmlFor="First_Name">First Name</label>
        </div>
        <div className="input-container">
          <input type="text" name="Last_Name" id="Last_Name" placeholder=" " value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <label htmlFor="Last_Name">Last Name</label>
        </div>
        <div className="input-container">
          <input type="text" name="Phone" id="Phone" placeholder=" " value={phone} onChange={(e) => setPhone(formatPhoneNumber(e.target.value))} />
          <label htmlFor="Phone">Phone Number</label>
        </div>
        <div className="input-container">
          <input type="email" name="Email" id="Email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} />
          <label htmlFor="Email">Email</label>
        </div>
      </>
    },
    {
      name: 'Church',
      icon: <FaHome />,
      inputHTML: <>
        <div className="input-container full-width">
          <input type="text" name="Church_Name" id="Church_Name" placeholder=" " value={communityName} onChange={(e) => setCommunityName(e.target.value)} />
          <label htmlFor="Church_Name">Church/Community Name</label>
        </div>
        <div className="input-container">
          <input type="text" name="Address_Line" id="Address_Line" placeholder=" " value={address} onChange={(e) => setAddress(e.target.value)} />
          <label htmlFor="Address_Line">Address</label>
        </div>
        <div className="input-container">
          <input type="text" name="City" id="City" placeholder=" " value={city} onChange={(e) => setCity(e.target.value)} />
          <label htmlFor="City">City</label>
        </div>
        <div className="input-container">
          <select name="State" id="State" placeholder=" " value={state} onChange={(e) => setState(e.target.value)} >
            <option value="" disabled>Choose One...</option>
            {stateLabelValues.map((state, i) => {
              return <option value={state.value} key={i}>{state.label}</option>
            })}
          </select>
          <label htmlFor="State">State</label>
        </div>
        <div className="input-container">
          <input type="text" name="Postal_Code" id="Postal_Code" placeholder=" " pattern="[0-9]*" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          <label htmlFor="Postal_Code">Postal Code</label>
        </div>
      </>
    },
    {
      name: 'Account',
      icon: <FaLock />,
      inputHTML: <>
        <div className="input-container full-width">
          <input type="text" name="Username" id="Username" placeholder=" " value={username} onChange={(e) => setUsername(e.target.value)} />
          <label htmlFor="Username">Username</label>
        </div>
        <div className="input-container full-width">
          <input type="password" name="Password" id="Password" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} />
          <label htmlFor="Password">Password</label>
        </div>
        <div className="input-container full-width">
          <input type="password" name="Password2" id="Password2" placeholder=" " value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          <label htmlFor="Password2">Confirm Password</label>
        </div>
      </>
    }
  ]

  const formatPhoneNumber = (value) => {
    const numericValue = value.replace(/[^\d]/g, '');
    if (numericValue.length <= 3) {
      return numericValue;
    } else if (numericValue.length <= 6) {
      return `${numericValue.slice(0, 3)}-${numericValue.slice(3)}`;
    } else {
      return `${numericValue.slice(0, 3)}-${numericValue.slice(3, 6)}-${numericValue.slice(6, 10)}`;
    }
  };

  const nextPage = () => {
    if (formPage < formPages.length - 1) {
      setFormPage(formPage + 1);
      setProgressSlideDelayMS(300);
    }
  }
  const prevPage = () => {
    if (formPage > 0) {
      setFormPage(formPage - 1);
      setProgressSlideDelayMS(0);
    }
  }



  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // check if confirm password and password match
    if (confirmPassword !== password) {
      return setErrorMessage('Passwords do not match.')
    }

    const formData = {firstName, lastName, phone, email, communityName, address, city, state, postalCode, username, password};

    // check if there are any missing required fields
    const containsMissingFields = !Object.values(formData).every(x => x !== '');
    if (containsMissingFields) {
      return setErrorMessage('Missing required fields, try again.')
    }

    axios.post(`${fetchURL}/api/wpad/CommunityRegister`, formData)
      .then(response => {
        console.log(response);
      })
      .catch(error => {
        console.log(error);
        setErrorMessage(error.response?.data ?? 'Internal Server Error')
      });
  }

  return <>
    <Navbar />

    <div className="forms-container">
      <form id="register-form" onSubmit={(e) => handleSubmit(e)}>
        <h1 className="title">Register</h1>
        <div id="progress" className={'page-' + formPage} style={{"--progress-width": Math.ceil((formPage / formPages.length) * 100) + '%'}}>
          {formPages.map((page, i) => {
            const { name, icon } = page;
            return <div id="step" className={`step-${i}`} data-title={name} style={{"--delay": `${progressSlideDelayMS}ms`, color: formPage >= i ? '#fcbb09' : 'white'}} key={i}>{icon}</div>
          })}
        </div>
        <div className="error-container">
          <p id="error-msg">{errorMessage}</p>
        </div>
        {formPages.map((page, i) => {
          const { inputHTML } = page;
          return formPage === i && (
            <div className="page" id={`page-${i}`} key={i}>
              {inputHTML}
              <div className="btn-container">
                <button type="button" style={{visibility: i === 0 ? 'hidden' : 'visible'}} onClick={prevPage}>Back</button>
                {i === (formPages.length-1) ? <button type="submit">Submit</button> : <button type="button" onClick={nextPage}>Next</button>}
              </div>
            </div>
          )
        })}
      </form>
    </div>

    <Footer />
  </>
}

export default Register;