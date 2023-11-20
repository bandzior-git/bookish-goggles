import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderStatus } from '@bandziortickets/common';
import { OrderCancelledEvent } from '@bandziortickets/common';
import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);
  const orderId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: orderId,
    status: OrderStatus.Created,
    price: 30,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 1,
    status: OrderStatus.Cancelled,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, order };
};

it('cancels the order - updates the status', async () => {
  const { listener, data, msg, order } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
