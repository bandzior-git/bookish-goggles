import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Ticket } from '../../models/ticket';

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

it('fetches order', async () => {
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
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', userOne)
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns an error if one user tries to fetch another users order', async () => {
  // Create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  const user = global.signup();
  // make a request to build an order with this ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signup())
    .send()
    .expect(401);
});
