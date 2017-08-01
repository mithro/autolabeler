const yaml = require('js-yaml');
const ignore = require('ignore');

module.exports = robot => {
  robot.on('pull_request.opened', initialCheck);
  robot.on('issue_comment', issueComment);

  async function issueComment(context) {
      robot.log('issue commment received');
      if (context.payload.issue.pull_request !== undefined) {
          console.log('THIS IS A PULL REQUEST COMMENT');
          var issueComments = await context.github.issues.getComments(context.issue());
      }
      else {
          console.log('THIS IS AN ISSUE COMMENT');
      }
  }

  async function initialCheck(context) {
      robot.log(initialCheck);

      var pr = await context.github.pullRequests.get(context.issue());

      var body = pr.data.body;

      if (!body.includes('Author Checklist')) {
          return context.github.issues.addLabels(
              context.issue({
                  labels: ['Needs: Author Checklist']
              })
          );
      }
      else if(body.includes('Author Checklist')) {
          return context.github.issues.addLabels(
              context.issue({
                  labels: ['Needs: Reviewer Checklist']
              })
          );
      }
  }
};
