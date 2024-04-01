import axios from "axios";

const fetchURL = '';
// const fetchURL = 'https://dev.phc.events';
const instance = axios.create({
  withCredentials: true,
  baseURL: fetchURL
});

export default instance;