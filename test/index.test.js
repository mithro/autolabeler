const { Application } = require('probot')
const plugin = require('..')

const config = `
feature: ["feat*", "feature*"]
bug: ["fix*", "bug*", "bugfix*"]
maintenance: ["chore*"]
documentation: ["doc*", "docs*"]
`

describe('autolabeler', () => {
  let app
  let github

  beforeEach(() => {
    // Create a new App to run our plugin
    app = new Application()

    // Load the plugin
    plugin(app)

    // Mock out the GitHub API
    github = {
      repos: {
        // Response for getting content from '.github/ISSUE_REPLY_TEMPLATE.md'
        getContent: jest.fn().mockImplementation(() => Promise.resolve({
          data: {
            content: Buffer.from(config).toString('base64')
          }
        }))
      },

      pullRequests: {
        listCommits: jest.fn().mockImplementation(() => (
          {
            data: [
              {
                commit: {
                  message: 'feat(feature): a feature commit message'
                }
              },
              {
                commit: {
                  message: 'doc(readme): a documentation commit message'
                }
              },
              {
                commit: {
                  message: 'something(random): a random commit message'
                }
              },
              {
                commit: {
                  message: 'feat(feature): another feature commit message'
                }
              }
            ]
          }
        ))
      },

      issues: {
        addLabels: jest.fn()
      }
    }

    // Mock out GitHub App authentication and return our mock client
    app.auth = () => Promise.resolve(github)
  })

  describe('pull_request.opened event', () => {
    const event = require('./fixtures/pull_request.opened')

    test('adds label', async () => {
      await app.receive(event)

      expect(github.repos.getContent).toHaveBeenCalledWith({
        owner: 'robotland',
        repo: 'test',
        path: '.github/autolabeler.yml'
      })

      expect(github.issues.addLabels).toHaveBeenCalledWith({
        owner: 'robotland',
        repo: 'test',
        number: 98,
        labels: ['feature', 'documentation']
      })
    })
  })
})
