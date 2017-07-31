const expect = require('expect');
const {createRobot} = require('probot');
const plugin = require('..');

const config = `
test: test*
config: .github
frontend: ["*.js"]
`;

describe('autolabeler', () => {
  let robot;
  let github;

  describe('pull_request.opened event', () => {
    it('adds \'Needs: Author Checklist\' label if no Author Checklist exists in body of PR', async () => {
        const event_needsauthorcl = require('./fixtures/pull_request.opened.noauthorchecklist');

        // Create a new Robot to run our plugin
        robot = createRobot();

        // Load the plugin
        plugin(robot);

        // Mock out the GitHub API
        github = {
          pullRequests: {
            get: expect.createSpy().andReturn({
                data: event_needsauthorcl.payload.pull_request
            })
          },

          issues: {
            addLabels: expect.createSpy()
          }
        };

        // Mock out GitHub App authentication and return our mock client
        robot.auth = () => Promise.resolve(github);

        await robot.receive(event_needsauthorcl);

        // expect(github.repos.getContent).toHaveBeenCalledWith({
        //     owner: 'robotland',
        //     repo: 'test',
        //     path: '.github/autolabeler.yml'
        // });

        expect(github.issues.addLabels).toHaveBeenCalledWith({
            owner: 'robotland',
            repo: 'test',
            number: 98,
            labels: ['Needs: Author Checklist']
        });
    });

    it('adds \'Needs: Reviewer Checklist\' label if Author Checklist exists in body of PR', async () => {
        const event_needsreviewercl = require('./fixtures/pull_request.opened.hasauthorchecklist');

        // Create a new Robot to run our plugin
        robot = createRobot();

        // Load the plugin
        plugin(robot);

        // Mock out the GitHub API
        github = {
          pullRequests: {
            get: expect.createSpy().andReturn({
                data: event_needsreviewercl.payload.pull_request
            })
          },

          issues: {
            addLabels: expect.createSpy()
          }
        };

        // Mock out GitHub App authentication and return our mock client
        robot.auth = () => Promise.resolve(github);


        await robot.receive(event_needsreviewercl);

        expect(github.issues.addLabels).toHaveBeenCalledWith({
          owner: 'robotland',
          repo: 'test',
          number: 98,
          labels: ['Needs: Reviewer Checklist']
        });
    })
  });

  describe('issue event triggered', () => {
      it('does nothing', async () => {
          
      })
  })
});
