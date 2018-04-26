const {createRobot} = require('probot')
const plugin = require('..')

const config = `
test: test*
config: .github
frontend: ["*.js"]
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
        getFiles: jest.fn().mockImplementation(() => ({
          data: [
            {filename: 'test.txt'},
            {filename: '.github/autolabeler.yml'}
          ]
        }))
      },

      issues: {
        addLabels: jest.fn(),
        getIssueLabels: jest.fn().mockImplementation(() => Promise.resolve({
          data: [{name: 'config'}]
        }))
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
        labels: ['test']
      })
    })
  })
})
