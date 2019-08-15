const nock = require('nock')
// Requiring our app implementation
const myProbotApp = require('..')
const { Probot } = require('probot')

nock.disableNetConnect();

// TODO: Fix this test, it seems to be passing when it shouldn't.

describe('sizelabeler', () => {
  let probot;

  beforeEach(() => {
    probot = new Probot({});
    // Load our app into probot
    const app = probot.load(myProbotApp);

    // just return a test token
    app.app = () => 'test';
  });

  describe('pull_request.opened event', () => {
    const event = require('./fixtures/pull_request.opened')

    test('adds label', async () => {
      nock('https://api.github.com')
            .post('/app/installations/2/access_tokens')
            .reply(200, { token: 'test' })

      nock('https://api.github.com')
       .post('/repos/robotland/test/issues/98/labels', (body) => {
         expect(body).toMatchObject({ labels: ['sm', 'foo'] });
         return true;
       })
       .reply(200);

      await probot.receive({ name: 'pull_request', payload: event });
    });
  });
});
