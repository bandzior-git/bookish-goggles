import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderStatus } from '@bandziortickets/common';
import { OrderCreatedEvent } from '@bandziortickets/common';
import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const juzer = new mongoose.Types.ObjectId().toHexString();

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: juzer,
    expiresAt: 'fejk walju',
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 30,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};

it('replicates order info', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled;
});
