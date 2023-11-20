import mongoose from 'mongoose';
import { TicketUpdatedEvent } from '@bandziortickets/common';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  //create instance of listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  // create and save ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'coccert',
    price: 20,
  });
  await ticket.save();

  //create fake data object
  const data: TicketUpdatedEvent['data'] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: 'counsert',
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  //create fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('finds updates and saves ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  //call onMessage with data obj + message object
  await listener.onMessage(data, msg);

  //write assertions to check if ack was sent
  expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if version mismatch', async () => {
  const { listener, ticket, data, msg } = await setup();
  data.version = 10;
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  expect(msg.ack).not.toHaveBeenCalled();
});
