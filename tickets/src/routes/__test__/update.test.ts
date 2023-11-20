import request from 'supertest';
import { app } from '../../app';
import mongoose, { mongo } from 'mongoose';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns 404 if provided id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put('/api/tickets')
    .set('Cookie', global.signup())
    .send({ title: 'asdfgkl', price: 20 })
    .expect(404);
});

it('returns 401 if user not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: 'asdfgkl', price: 20 })
    .expect(401);
});

it('returns 401 if user does not own ticket', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({ title: 'asdfgkl', price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', global.signup())
    .send({ title: 'asdfgklu', price: 30 })
    .expect(401);
});

it('returns 400 if user provides invalid title / price', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'asdfgkl', price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: '', price: -20 })
    .expect(400);
});

it('returns updates the ticket assuming inputs are valid', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'asdfgkl', price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Nju tajtel', price: 20 })
    .expect(200);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Nju tajtel', price: 40 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual('Nju tajtel');
  expect(ticketResponse.body.price).toEqual(40);
});

it('publishes an event', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'asdfgkl', price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Nju tajtel', price: 20 })
    .expect(200);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'Nju tajtel', price: 40 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = global.signup();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'asdfgkl', price: 20 });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'nju', price: 100 })
    .expect(400);
});
