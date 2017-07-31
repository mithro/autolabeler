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
  beforeEach(() =>{
      // Create a new Robot to run our plugin
      robot = createRobot();

      // Load the plugin
      plugin(robot);
  })

  describe('pull_request.opened event triggered', () => {
    it('adds \'Needs: Author Checklist\' label if no Author Checklist exists in body of PR', async () => {
        const event_needsauthorcl = require('./fixtures/pull_request.opened.noauthorchecklist');

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

  describe('issue_comment event triggered', () => {
      it('ignores the \'non-pr\' issue comments', async () => {
          const event_issue_comment = require('./fixtures/issue_comment.issue.created');
          robot.log = expect.createSpy();
          expect(robot.log).toHaveBeenCalledWith(
              'not a pull_request'
          );
      });
      it('logs the body of pr comments', async () => {
          const event_pr_issue_comment = require('./fixtures/issue_comment.pr.created');
          robot.log = expect.createSpy();
          expect(robot.log).toHaveBeenCalledWith(
              {
                "url": "https://api.github.com/repos/luisschubert/webhookTest/pulls/27",
                "html_url": "https://github.com/luisschubert/webhookTest/pull/27",
                "diff_url": "https://github.com/luisschubert/webhookTest/pull/27.diff",
                "patch_url": "https://github.com/luisschubert/webhookTest/pull/27.patch"
              }
          );
      });
  })
});
