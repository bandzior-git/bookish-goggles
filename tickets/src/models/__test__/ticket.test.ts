import { Ticket } from '../ticket';

it('implements optimistic Concurrency Control', async () => {
  // create ticket
  const ticket = Ticket.build({
    title: 'coccert',
    price: 5,
    userId: '123',
  });
  // save to db
  await ticket.save();

  // fetch ticket twice
  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);
  // two separate changes
  firstInstance!.set({ price: 10 });
  firstInstance!.set({ price: 15 });
  // save first fetched ticket

  await firstInstance!.save();

  // save second fetched ticket
  try {
    await secondInstance!.save();
  } catch (err) {
    return;
  }

  throw new Error('Not it');
});

it('increments version number on multiple saves', async () => {
  // create ticket
  const ticket = Ticket.build({
    title: 'coccert',
    price: 5,
    userId: '123',
  });
  // save to db
  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
