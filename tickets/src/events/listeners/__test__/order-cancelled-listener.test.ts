import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderStatus } from '@bandziortickets/common';
import { OrderCancelledEvent } from '@bandziortickets/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const juzer = new mongoose.Types.ObjectId().toHexString();
  const orderAjDi = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'concert',
    price: 99,
    userId: juzer,
  });
  ticket.set({ orderId: orderAjDi });
  await ticket.save();

  const data: OrderCancelledEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 1,
    status: OrderStatus.Cancelled,
    ticket: {
      id: ticket.id,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg, orderAjDi };
};

it('supdates ticketm publishes message, ack message', async () => {
  const { listener, ticket, data, msg, orderAjDi } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
