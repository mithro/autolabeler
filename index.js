const yaml = require('js-yaml');
const ignore = require('ignore');

module.exports = robot => {
  robot.on('pull_request.opened', initialCheck);
  robot.on('issue_comment', issueComment);

  async function issueComment(context) {
      robot.log('issue commment received');
      robot.log(context.issue());
      //var issue = await context.github.issue_comment.get(context.issue());
      var issue = await context.github.issues.get(context.issue());
      console.log(issue);
      if (issue.data.payload.issue.pull_request !== undefined) {
          console.log('THIS IS FROM A PR');
      }
      robot.log(issue);
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
