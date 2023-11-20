import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('has a route handler listening to /api/tickets for POST requests', async () => {
  const response = await request(app).post('/api/tickets').send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if user is signed in', async () => {
  const response = await request(app).post('/api/tickets').send({}).expect(401);
});

it('returns status other than 401 if user is signed in', async () => {
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({});

  console.log(response.status);
  expect(response.status).not.toEqual(401);
});

it('returns an error if invalid title provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      price: 10,
    })
    .expect(400);
});

it('returns an error if invalid price provided', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      title: 'bober',
      price: -110,
    })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      title: 'bober',
    })
    .expect(400);
});

it('creates ticket with valid inputs', async () => {
  // add check to make sure ticket was saved
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      title: 'asijdf',
      price: 20,
    })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
});

it('publishes an event', async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signup())
    .send({
      title: 'asijdf',
      price: 20,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
