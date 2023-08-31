import axios from 'axios';
import https from 'https';

const Landing = ({ currentUser }) => {
  console.log(currentUser);
  //axios.get('/api/users/currentuser');
  return <h1>Hello, {currentUser?.email ?? 'user'}</h1>;
};

//this one completely disables certificate checks, for dev only
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//this one checks but allows self-signed certs
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

//Landing.getInitialProps = async ({ req }) => {
//  console.log(req.headers);
//  //try {
//  if (typeof window === 'undefined') {
//    // on the server, requests should be made to external namespace service
//    const { data } = await axios.get(
//      'https://ingress-ext/api/users/currentuser',
//      {
//        headers: {
//          Host: 'ticketing.bandzior',
//        },
//      }
//    );
//    return data;
//  } else {
//    // on the browser, can skip site and domain
//    const { data } = await axios.get('/api/users/currentuser');
//    return data;
//  }
//  //} catch (err) {
//  //  console.log(err);
//  //}
//  return {};
//};

export const getServerSideProps = async ({ req }) => {
  let res;
  if (typeof window === 'undefined') {
    res = await axios.get('http://ingress-ext/api/users/currentuser', {
      withCredentials: true,
      headers: req.headers,
    });
    console.log(req.headers);
  } else {
    res = await axios.get('/api/users/currenuser');
  }
  return { props: res.data };
};

export default Landing;
