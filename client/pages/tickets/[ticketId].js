import buildClient from '../../api/build-client';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const TicketShow = (props) => {
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId: props.ticket.id,
    },
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  });
  return (
    <div>
      <h1>{props.ticket.title}</h1>
      <h4>Price: {props.ticket.price}</h4>
      <h4>Status: {props.ticket.status}</h4>
      {errors}
      <button onClick={() => doRequest()} className="btn btn-primary">
        Purchase
      </button>
    </div>
  );
};

export default TicketShow;

export const getServerSideProps = async (context) => {
  //let res;
  //let tickets;
  //try {
  const req = context.req;
  console.log('ticketId serversideprops');
  //console.log(context);
  const client = buildClient({ req });
  //console.log('CLient 1:', client);
  const res = await client.get('/api/users/currentuser');
  //console.log(res);
  const { ticketId } = context.query;
  //console.log(await client.get(`/api/tickets/${ticketId}`));
  const ticket = await client.get(`/api/tickets/${ticketId}`);
  //console.log('Ticket:', ticket);
  //const currentUser = res.data.currentUser;
  //console.log({ currentUser: currentUser, ticket: ticket.data });
  //} catch {
  //  return { props: {} };
  //}
  if (ticket.data.orderId == null) {
    ticket.data.status = 'Available';
    return {
      props: { currentUser: res.data.currentUser, ticket: ticket.data },
    };
  } else {
    ticket.data.status = 'Booked';
    const order = await client.get(`/api/orders/${ticket.data.orderId}`);
    return {
      props: {
        currentUser: res.data.currentUser,
        ticket: ticket.data,
        order: order.data,
      },
    };
  }

  console.log({ currentUser: res.data.currentUser, ticket: ticket.data });
  //return { props: {} };
};
