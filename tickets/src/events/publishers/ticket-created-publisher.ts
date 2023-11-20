import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@bandziortickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
