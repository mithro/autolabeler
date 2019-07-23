const {createRobot} = require('probot')
const plugin = require('..')

const config = `
feature: ["feat", "ft"]
documentation: doc
`

describe('autolabeler', () => {
  let robot
  let github

  beforeEach(() => {
    // Create a new Robot to run our plugin
    robot = createRobot()

    // Load the plugin
    plugin(robot)

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
                  message: 'feat(feature): a commit message'
                }
              },
              {
                commit: {
                  message: 'doc(readme): a commit message'
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
    robot.auth = () => Promise.resolve(github)
  })

  describe('pull_request.opened event', () => {
    const event = require('./fixtures/pull_request.opened')

    test('adds label', async () => {
      await robot.receive(event)

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
