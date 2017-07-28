const yaml = require('js-yaml');
const ignore = require('ignore');

module.exports = robot => {
  robot.on('pull_request.opened', initialCheck);
  robot.on('issues.pull_request', prComments);

  async function prComments(context) {
      robot.log("context.issue(): "+context.issue());
      var pr = await context.github.pullRequests.get(context.issue());
      robot.log(pr.data.body);
  }
  // robot.on('pull_request.synchronize', autolabel);
  //robot.on('pull_request', general);
  //robot.on('issues', issueHandle);

  async function issueHandle(context) {
      console.log('issue handled');
      robot.log("test");
      robot.log(context);
  }

  async function simpleFlag(context) {
      var pr = await context.github.pullRequests.get(context.issue());
      robot.log(pr.data.body);
      var responseLabel = await context.github.issues.addLabels(context.issue({
          labels: ["Needs: Author Checklist"]
      }))
      robot.log(responseLabel);
  }

  //automatically labels prs based on files contained
  async function autolabel(context) {
    const config = context.config('autolabeler.yml');
    const files = await context.github.pullRequests.getFiles(context.issue());
    const changedFiles = files.data.map(file => file.filename);

    const labels = new Set();

    // eslint-disable-next-line guard-for-in
    for (const label in config) {
      robot.log('looking for changes', label, config[label]);
      const matcher = ignore().add(config[label]);

      if (changedFiles.find(file => matcher.ignores(file))) {
        labels.add(label);
      }
    }

    const labelsToAdd = Array.from(labels);

    robot.log('Adding labels', labelsToAdd);
    if (labelsToAdd.length > 0) {
      return context.github.issues.addLabels(context.issue({
        labels: labelsToAdd
      }));
    }
  }

  //automatically labels a pr for its current state to allow progress tracking
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

  async function general(context) {
      robot.log('general has been called')
      robot.log(context.issue());
      console.log(context.issue());
  }
};
