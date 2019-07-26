const yaml = require('js-yaml');

module.exports = robot => {
  robot.on('pull_request.opened', sizelabel);
  robot.on('pull_request.synchronize', sizelabel);

  async function sizelabel (context) {
    const content = await context.github.repos.getContents(context.repo({
      path: '.github/sizelabeler.yml'
    }));
    const config = yaml.safeLoad(Buffer.from(content.data.content, 'base64').toString());

    const {additions, deletions} = await context.github.pullRequests.get(context.issue());
    const netSize = additions - deletions;

    const labels = new Set();

    // eslint-disable-next-line guard-for-in
    for (const label in config) {
      robot.log('looking for size matches', label, config[label]);
      let passes = false;
      if ('min' in config[label]) {
        passes = passes && netSize >= config[label].min;
      }
      if ('max' in config[label]) {
        passes = passes && netSize <= max;
      }
      if (passes) {
        labels.add(label)
      }
    }

    const labelsToAdd = Array.from(labels)

    robot.log('Adding labels', labelsToAdd)
    if (labelsToAdd.length > 0) {
      return context.github.issues.addLabels(context.issue({
        labels: labelsToAdd
      }))
    }
  }
}
