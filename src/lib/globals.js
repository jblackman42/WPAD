import axios from "axios";

const fetchURL = '';
const instance = axios.create({
  withCredentials: true,
  baseURL: fetchURL
});

export default instance;