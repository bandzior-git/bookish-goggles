import mongoose from 'mongoose';
import { TicketCreatedEvent } from '@bandziortickets/common';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  //create instance of listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  //create fake data event
  const data: TicketCreatedEvent['data'] = {
    version: 0,
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'counsert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };

  //create fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
  const { listener, data, msg } = await setup();

  //call onMessage with data obj + message object
  await listener.onMessage(data, msg);

  //write assertions to make sure ticket was created
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { data, listener, msg } = await setup();

  //call onMessage with data obj + message object
  await listener.onMessage(data, msg);

  //write assertions to check if ack was sent
  expect(msg.ack).toHaveBeenCalled();
});
