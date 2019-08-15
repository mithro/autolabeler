const yaml = require('js-yaml');
const determineLabels = require('./src/determine-labels');

module.exports = robot => {
  robot.on('pull_request.opened', sizelabel);
  robot.on('pull_request.reopened', sizelabel);
  robot.on('pull_request.synchronize', sizelabel);

  async function sizelabel (context) {
    const content = await context.github.repos.getContents(context.repo({
      path: '.github/sizelabeler.yml'
    }));
    const config = yaml.safeLoad(
      Buffer.from(content.data.content, 'base64').toString()
    );

    const {
      additions,
      deletions,
      number: issue_number,
      labels: prLabels,
    } = context.payload.pull_request;

    const existingLabels = new Set(prLabels.map(({ name }) => name));

    const { labelsToAdd, labelsToRemove } = determineLabels({
      config,
      additions,
      deletions,
      existingLabels,
      logger: (...args) => robot.log(...args),
    });

    if (labelsToRemove.length > 0) {
      robot.log('Removing labels', labelsToRemove);
      await context.github.issues.removeLabels(context.repo({
        issue_number,
        labels: labelsToRemove,
      }));
    }
    if (labelsToAdd.length > 0) {
      robot.log('Adding labels', labelsToAdd);
      await context.github.issues.addLabels(context.repo({
        issue_number,
        labels: labelsToAdd,
      }));
    }
  }
}
