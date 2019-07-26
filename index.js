const yaml = require('js-yaml');

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
    const netSize = additions - deletions;
    robot.log(`Additions: ${additions}, Deletions: ${deletions}, Net Size: ${netSize}`);

    const allLabels = new Set(Object.keys(config));
    const existingLabels = new Set(prLabels.map(({ name }) => name));
    const labelsToAdd = new Set();
    const labelsToRemove = new Set();

    // eslint-disable-next-line guard-for-in
    for (const label in config) {
      robot.log('looking for size matches', label, config[label]);
      let passes = true;
      if ('min_additions' in config[label]) {
        passes = passes && additions >= config[label].min_additions;
      }
      if ('min_deletions' in config[label]) {
        passes = passes && deletions >= config[label].min_deletions;
      }
      if ('min' in config[label]) {
        passes = passes && netSize >= config[label].min;
      }
      if ('max_additions' in config[label]) {
        passes = passes && additions <= config[label].max_additions;
      }
      if ('max_deletions' in config[label]) {
        passes = passes && deletions <= config[label].max_deletions;
      }
      if ('max' in config[label]) {
        passes = passes && netSize <= config[label].max;
      }
      if (passes && !existingLabels.has(label)) {
        labelsToAdd.add(label);
      } else if (!passes && existingLabels.has(label)) {
        labelsToRemove.add(label);
      }
      if (passes && config[label].terminal) {
        robot.log('Skipping remaining rules.');
        break;
      }
    }

    if (labelsToRemove.size > 0) {
      robot.log('Removing labels', Array.from(labelsToRemove));
      await context.github.issues.removeLabels(context.repo({
        issue_number,
        labels: Array.from(labelsToRemove),
      }));
    }
    if (labelsToAdd.size > 0) {
      robot.log('Adding labels', Array.from(labelsToAdd));
      await context.github.issues.addLabels(context.repo({
        issue_number,
        labels: Array.from(labelsToAdd),
      }));
    }
  }
}
