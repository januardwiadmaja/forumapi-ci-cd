/* istanbul ignore file */
import request from 'supertest';
class ServerTestHelper {
  constructor(server) {
    this._server = server;
  }

  async getAccessTokenAndUserId(
    payload = {
      username: 'foobar',
      password: 'secret',
      fullname: 'Foo Bar',
    },
  ) {
    // add user
    const registerResponse = await request(this._server)
      .post('/users')
      .send(payload);

    // get access token
    const loginResponse = await request(this._server)
      .post('/authentications')
      .send({ username: payload.username, password: payload.password });

    return {
      userId: registerResponse.body.data.addedUser.id,
      accessToken: loginResponse.body.data.accessToken,
    };
  }
}

export default ServerTestHelper;
