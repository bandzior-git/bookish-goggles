import request from 'supertest';
import { app } from '../../app';

it('responds with details of current user', async () => {
  const cockie = await global.signup();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cockie)
    .send()
    .expect(200);

  console.log(response.body);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('responds with null if not authenticated', async () => {
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
