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

  describe('issue_comment.created event triggered', () => {
      it('ignores the \'non-pr\' issue comments', async () => {
          const event_issue_comment = require('./fixtures/issue_comment.issue.created');

          // Mock out the GitHub API
          github = {
            issues: {
              getComments: expect.createSpy().andReturn(
                 {"comment1": "luis"}
              )
            }
          };

          robot.log = expect.createSpy();

          // Mock out GitHub App authentication and return our mock client
          robot.auth = () => Promise.resolve(github);

          await robot.receive(event_issue_comment);

          expect(robot.log).toHaveBeenCalledWith(
              'THIS IS AN ISSUE COMMENT'
          );

      });
      it('removes \'Needs: Author Checklist\' and adds \'Needs: Reviewer Checklist\'if Author Checklist is in comment body',async () => {
          const event_NACL_to_NRCL = require('./fixtures/issue_comment.pr.created.NACL->NRCL');

          // Mock out the GitHub API
          github = {
            issues: {
              addLabels: expect.createSpy(),
              removeLabel: expect.createSpy()
            }
          };

          // Mock out GitHub App authentication and return our mock client
          robot.auth = () => Promise.resolve(github);


          await robot.receive(event_NACL_to_NRCL);
          expect(github.issues.removeLabel).toHaveBeenCalledWith({
              owner: 'luisschubert',
              repo: 'webhookTest',
              number: 26,
              name: 'Needs: Author Checklist'
          });
          expect(github.issues.addLabels).toHaveBeenCalledWith({
              owner: 'luisschubert',
              repo: 'webhookTest',
              number: 26,
              labels: ['Needs: Reviewer Checklist']
          });
      });
      it('removes \'Needs: Reviewer Checklist\' and adds \'Needs: Merge\' if Reviewer Checklist is comment body', async () => {
          const event_NRCL_to_NM = require('./fixtures/issue_comment.pr.created.NRCL->NM');

          // Mock out the GitHub API
          github = {
            issues: {
              addLabels: expect.createSpy(),
              removeLabel: expect.createSpy()
            }
          };

          // Mock out GitHub App authentication and return our mock client
          robot.auth = () => Promise.resolve(github);


          await robot.receive(event_NRCL_to_NM);
          expect(github.issues.removeLabel).toHaveBeenCalledWith({
              owner: 'luisschubert',
              repo: 'webhookTest',
              number: 26,
              name: 'Needs: Reviewer Checklist'
          });
          expect(github.issues.addLabels).toHaveBeenCalledWith({
              owner: 'luisschubert',
              repo: 'webhookTest',
              number: 26,
              labels: ['Needs: Merge']
          });
      });
  })
});
