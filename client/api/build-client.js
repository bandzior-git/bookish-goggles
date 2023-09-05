import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });
const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    //on server
    return axios.create({
      baseURL: 'http://ingress-ext',
      headers: req.headers,
      withCredentials: true,
      httpsAgent,
    });
  } else {
    //on browser
    return axios.create({
      baseURL: '/',
      withCredentials: true,
      httpsAgent,
    });
  }
};

export default buildClient;
