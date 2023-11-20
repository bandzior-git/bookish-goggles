import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { OrderStatus } from '@bandziortickets/common';
import { natsWrapper } from '../../nats-wrapper';

// helper function to create tickets
const buildTicket = async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();
  return ticket;
};

it('marks order as cancelled', async () => {
  //Create ticket
  const ticketOne = await buildTicket();

  //Build order with ticket
  const userOne = global.signup();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  //request to fetch order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', userOne)
    .expect(204);

  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userOne)
    .expect(200);

  expect(fetchedOrder.status).toEqual(OrderStatus.Cancelled);
});

it('emits order:cancelled event', async () => {
  //Create ticket
  const ticketOne = await buildTicket();

  //Build order with ticket
  const userOne = global.signup();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  //request to fetch order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', userOne)
    .expect(204);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
