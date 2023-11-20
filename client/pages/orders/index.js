import buildClient from '../../api/build-client';

const OrderIndex = (props) => {
  return (
    <ul>
      {props.orders.map((order) => {
        return (
          <li key={order.id}>
            {order.ticket.title} - {order.status}
          </li>
        );
      })}
    </ul>
  );
};

export default OrderIndex;

export const getServerSideProps = async (context) => {
  const req = context.req;
  const client = buildClient({ req });
  const res = await client.get('/api/users/currentuser');
  console.log(await client.get('/api/orders'));
  const { data } = await client.get('/api/orders');

  console.log({
    currentUser: res.data.currentUser,
    orders: data,
  });

  return {
    props: {
      currentUser: res.data.currentUser,
      orders: data,
    },
  };
};
