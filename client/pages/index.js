import buildClient from '../api/build-client';
import Link from 'next/link';

//import axios from 'axios';
//import https from 'https';

const Landing = (props) => {
  console.log(props.currentUser);
  const ticketList = props.tickets.map((ticket) => {
    return (
      <tr key={ticket.id}>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${ticket.id}`}>
            {ticket.title}
          </Link>
        </td>
        <td>{ticket.price}</td>
        <td>{ticket.orderId}</td>
      </tr>
    );
  });
  return (
    <div>
      <h1>Tickets</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Order Id</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
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
  //let res;
  //let tickets;
  //try {
  console.log('LandingPage serversideprops');
  const res = await buildClient({ req }).get('/api/users/currentuser');
  const tickets = await buildClient({ req }).get('/api/tickets');
  const currentUser = res.data.currentUser;
  console.log({ currentUser: currentUser, tickets: tickets.data });
  //} catch {
  //  return { props: {} };
  //}

  return { props: { currentUser: currentUser, tickets: tickets.data } };
};

export default Landing;
