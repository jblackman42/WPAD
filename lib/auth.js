// import Iron from "@hapi/iron";
// import { MAX_AGE, setTokenCookie, getTokenCookie } from "./auth-cookie.js";

const Iron = require("@hapi/iron");
const { MAX_AGE, setTokenCookie, getTokenCookie } = require("./auth-cookie.js");
const MinistryPlatformAPI = require('ministry-platform-api-wrapper');

const TOKEN_SECRET = process.env.TOKEN_SECRET;

const setLoginSession = async (res, session) => {
  const createdAt = Date.now();
  // Create a session object with a max age that we can validate later
  const obj = { ...session, createdAt, maxAge: MAX_AGE };
  const token = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults);

  setTokenCookie(res, token);
}

const getLoginSession = async (req) => {
  const token = getTokenCookie(req);

  if (!token) return;

  const session = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
  const expiresAt = session.createdAt + session.maxAge * 1000;

  // Validate the expiration date of the session
  if (Date.now() > expiresAt) {
    throw new Error("Session expired");
  }

  return session;
}

const checkLoginSession = async (req, res, next) => {
  const token = getTokenCookie(req);

  if (!token) return res.sendStatus(401);
  
  const session = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
  const expiresAt = session.createdAt + session.maxAge * 1000;

  // Validate the expiration date of the session
  if (Date.now() > expiresAt) return res.sendStatus(401);

  return next();
}

const checkAuthorizedCommunity = async (req, res, next) => {
  const { id } = req.params;

  if (!id || isNaN(id)) return res.status(400).send('Missing parameter: id')

  const token = getTokenCookie(req);
  if (!token) return res.sendStatus(401);
  
  const session = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
  const expiresAt = session.createdAt + session.maxAge * 1000;

  // Validate the expiration date of the session
  if (Date.now() > expiresAt) return res.sendStatus(401);

  const { User_GUID } = session;
  const [community] = await MinistryPlatformAPI.request('get', '/tables/WPAD_Authorized_Users', {"$select":"WPAD_Community_ID","$filter":`user_ID_Table.[User_GUID] = '${User_GUID}' AND WPAD_Community_ID = ${id}`}, {});
  
  if (!community || parseInt(community.WPAD_Community_ID) !== parseInt(id)) return res.sendStatus(401);

  return next();
}

module.exports = {
  setLoginSession,
  getLoginSession,
  checkLoginSession,
  checkAuthorizedCommunity
}