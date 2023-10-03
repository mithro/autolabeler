const { Probot, ProbotOctokit } = require('probot')
const nock = require('nock')
const plugin = require('..')

const config = `
test: test*
config: .github
frontend: ["*.js"]
`

describe('autolabeler', () => {
  let probot

  beforeEach(() => {
    nock.disableNetConnect()
    probot = new Probot({
      appId: 1,
      githubToken: 'test',
      // Disable throttling & retrying requests for easier testing
      Octokit: ProbotOctokit.defaults({
        retry: { enabled: false },
        throttle: { enabled: false }
      })
    })
    probot.load(plugin)
  })

  afterEach(() => {
    nock.cleanAll()
    nock.enableNetConnect()
  })

  describe('pull_request.opened event', () => {
    const event = require('./fixtures/pull_request.opened')

    test('adds label', async () => {
      // Test that we correctly return a test token
      nock('https://api.github.com')
        .get('/repos/robotland/test/contents/.github%2Fautolabeler.yml')
        .reply(200, {
          content: Buffer.from(config, 'utf-8').toString('base64')
        })
        .get('/repos/robotland/test/pulls/98/files')
        .reply(200, [
          { filename: 'test.txt' },
          { filename: '.github/autolabeler.yml' }
        ])
        .post('/repos/robotland/test/issues/98/labels', (body) => {
          expect(body).toEqual(['test', 'config'])
          return true
        })
        .reply(200)

      await probot.receive(event)
    })
  })
})
