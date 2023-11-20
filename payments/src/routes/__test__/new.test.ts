import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { OrderStatus } from '@bandziortickets/common';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

// jest.mock('../../stripe');

it('returns a 404 when order does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'fsdfsd',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('returns 401 when prcessing order not belonging to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup())
    .send({
      token: 'fsdfsd',
      orderId: order.id,
    })
    .expect(401);
});

it('returns 400 when purchasing cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({
      token: 'fsdfsd',
      orderId: order.id,
    })
    .expect(400);
});

it('returns 204 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();

  const price = Math.floor(Math.random() * 100000);
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId,
    version: 0,
    price,
    status: OrderStatus.Created,
  });
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signup(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  //const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  //expect(chargeOptions.source).toEqual('tok_visa');
  //expect(chargeOptions.amount).toEqual(20 * 100);
  //expect(chargeOptions.currency).toEqual('pln');

  const stripeCharges = await stripe.charges.list({ limit: 50 });

  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100;
  });
  console.log(stripeCharges);
  expect(stripeCharge).toBeDefined;

  const payment = Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  });

  expect(payment).not.toBeNull();
});
