import axios from "axios";

const fetchURL = 'http://localhost:5000';
const instance = axios.create({
  withCredentials: true,
  baseURL: fetchURL
});

export default instance;