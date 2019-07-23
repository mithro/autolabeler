const yaml = require('js-yaml')
const ignore = require('ignore')

module.exports = robot => {
  robot.on('pull_request.opened', autolabel)
  robot.on('pull_request.synchronize', autolabel)

  async function autolabel (context) {
    const content = await context.github.repos.getContent(context.repo({
      path: '.github/autolabeler.yml'
    }))
    const config = yaml.safeLoad(Buffer.from(content.data.content, 'base64').toString())

    const githubResponse = await context.github.pullRequests.listCommits(context.issue())
    console.log(`github response:`, JSON.stringify(githubResponse))
    const messages = githubResponse.data.map(commit => commit.commit.message)

    const labels = new Set()

    // eslint-disable-next-line guard-for-in
    for (const label in config) {
      robot.log('looking for changes', label, config[label])
      const matcher = ignore().add(config[label])

      if (messages.find(message => message.match(matcher))) {
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
