import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@bandziortickets/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // find ticket that order is reserving, no ticket throw error
    const ticket = await Ticket.findById(data.ticket.id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    // Mark the ticket as being reserved by setting orderId, save ticket
    ticket.set({ orderId: data.id });

    await ticket.save();
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });
    //ack the message
    msg.ack();
  }
}
