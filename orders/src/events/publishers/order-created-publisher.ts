import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@bandziortickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
