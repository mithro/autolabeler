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

    const files = await context.github.pullRequests.getFiles(context.issue())
    const currentLabelsResponse = await context.github.issues.getIssueLabels(context.issue())
    const currentLabels = new Set(currentLabelsResponse.data.map((label) => { return label.name }))
    const changedFiles = files.data.map(file => file.filename)
    const labels = new Set()

    // eslint-disable-next-line guard-for-in
    for (const label in config) {
      robot.log('looking for changes', label, config[label])
      const matcher = ignore().add(config[label])

      if (changedFiles.find(file => matcher.ignores(file))) {
        labels.add(label)
      }
    }
    let labelsToAdd = []
    labels.forEach((label) => {
      if (!currentLabels.has(label)) {
        labelsToAdd.push(label)
      }
    })

    robot.log('Adding labels', labelsToAdd)
    if (labelsToAdd.length > 0) {
      return context.github.issues.addLabels(context.issue({
        labels: labelsToAdd
      }))
    }
  }
}
