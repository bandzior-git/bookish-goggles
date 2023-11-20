import buildClient from '../../api/build-client';
import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import useRequest from '../../hooks/use-request';
import Router from 'next/router';

const OrderShow = (props) => {
  const [timeLeft, setTimeLeft] = useState(0);

  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: props.order.id,
    },
    onSuccess: () => Router.push('/orders'),
  });

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(props.order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };
    findTimeLeft();

    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [props.order]);
  if (timeLeft < 0) {
    return <div>Order Expired</div>;
  }

  return (
    <div suppressHydrationWarning>
      {timeLeft} seconds until order expires.
      <br />
      {errors}
      <br />
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51OAtOvBwhRBntPf1pmpHvuC1jMmPMABBFfBt42dP90f5MfG4hfLCNOudOW6yPmfUfatYMxZplQBtjqsj67hRLVUZ004CbmertB"
        amount={props.order.ticket.price * 100}
        email={props.currentUser.email}
      />
    </div>
  );
};

export default OrderShow;

export const getServerSideProps = async (context) => {
  const req = context.req;
  const client = buildClient({ req });
  const res = await client.get('/api/users/currentuser');
  const { orderId } = context.query;
  const order = await client.get(`/api/orders/${orderId}`);

  console.log({
    currentUser: res.data.currentUser,
    order: order.data,
  });

  return {
    props: {
      currentUser: res.data.currentUser,
      order: order.data,
    },
  };
};
