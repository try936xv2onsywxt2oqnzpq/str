import axios from 'axios';

const instance = axios.create({
  baseURL: '/api', // relatif ke domain yang sama
  withCredentials: true,
});

export default instance;