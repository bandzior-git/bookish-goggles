import request from 'supertest';
import { app } from '../../app';

it('clears a cockie after signout', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'test@test.com',
      password: 'password',
    })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
  console.log(response.get('Set-Cookie'));

  const response2 = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200);

  expect(response2.get('Set-Cookie')[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
  console.log(response2.get('Set-Cookie'));
});
