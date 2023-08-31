import axios from 'axios';
import https from 'https';

//const httpsAgent = new https.Agent({ rejectUnauthorized: false });

const buildClient = ({ req }) => {
  if (typeof window === 'undefined') {
    //on server
    return;
  } else {
    //on browser
  }
};

export default buildClient;
