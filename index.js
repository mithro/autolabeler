const yaml = require('js-yaml')
const ignore = require('ignore')

module.exports = ({ app }) => {
  app.on('pull_request.opened', autolabel)
  app.on('pull_request.synchronize', autolabel)
  app.on('pull_request.reopened', autolabel)

  async function autolabel (context) {
    const content = await context.octokit.repos.getContent(
      context.repo({
        path: '.github/autolabeler.yml'
      })
    )
    const config = yaml.safeLoad(
      Buffer.from(content.data.content, 'base64').toString()
    )

    const files = await context.octokit.pulls.listFiles(context.issue())
    const changedFiles = files.data.map((file) => file.filename)

    const labels = new Set()

    // eslint-disable-next-line guard-for-in
    for (const label in config) {
      app.log('looking for changes', label, config[label])
      const matcher = ignore().add(config[label])

      if (changedFiles.find((file) => matcher.ignores(file))) {
        labels.add(label)
      }
    }

    const labelsToAdd = Array.from(labels)

    app.log('Adding labels', labelsToAdd)
    if (labelsToAdd.length > 0) {
      return context.octokit.issues.addLabels(
        context.issue({
          labels: labelsToAdd
        })
      )
    }
  }
}
