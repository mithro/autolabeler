module.exports = robot => {
  robot.on('pull_request.opened', initialCheck);
  robot.on('issue_comment', issueComment);

  async function issueComment(context) {
    //   console.log(context);
      if (context.payload.issue.pull_request !== undefined) {
          robot.log('THIS IS A PULL REQUEST COMMENT');
          var issueComments = await context.github.issues.getComments(context.issue());
          robot.log(issueComments);
      }
      else {
          robot.log('THIS IS AN ISSUE COMMENT');
      }

  }

  async function initialCheck(context) {
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
