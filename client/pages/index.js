import buildClient from '../api/build-client';

//import axios from 'axios';
//import https from 'https';

const Landing = ({ currentUser }) => {
  //console.log(currentUser);
  return currentUser ? (
    <h1>You are signed in, {currentUser.email} </h1>
  ) : (
    <h1>You are not signed in</h1>
  );
};

//this one completely disables certificate checks, for dev only
//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//this one checks but allows self-signed certs
//const httpsAgent = new https.Agent({ rejectUnauthorized: false });

//Landing.getInitialProps = async (context) => {
//  const { data } = buildClient(context).get('/api/users/currentuser');
//  console.log({ data });
//  return { data };
//};

//export const getServerSideProps = async ({ req }) => {
//  let res;
//  if (typeof window === 'undefined') {
//    res = await axios.get('http://ingress-ext/api/users/currentuser', {
//      withCredentials: true,
//      headers: req.headers,
//    });
//    console.log(req.headers);
//  } else {
//    res = await axios.get('/api/users/currentuser');
//  }
//  return { props: res.data };
//};

export const getServerSideProps = async ({ req }) => {
  let res;
  //try {
  console.log('LandingPage serversideprops');
  res = await buildClient({ req }).get('/api/users/currentuser');
  //console.log(res.data);
  //} catch {
  //  return { props: {} };
  //}
  return { props: res.data };
};

export default Landing;
