# Probot Auto Labeler

[![Greenkeeper badge](https://badges.greenkeeper.io/probot/autolabeler.svg)](https://greenkeeper.io/)

> A GitHub App built with [probot](https://github.com/probot/probot) that adds labels to Pull Requests based on matched file patterns.

## Using

Configure by creating a `.github/autolabeler.yml` file with a [yaml file](https://en.wikipedia.org/wiki/YAML) in the format of `label: file/path`. Then add the [Probot Auto Labeler Bot](https://github.com/apps/probot-autolabeler) to your repository.

For example,

```yaml
frontend: ["*.js", "*.css", "*.html"]
backend: ["/app", "*.rb"]
legal: ["LICENSE*", "NOTICES*"]
config: .github
```

Then if a pull request is opened that has `scripts/widget.js` modified, then the frontend label will be added.

##### Issues with Bot

If you are having issues with the GitHub app not working, please contact [@mithro](mailto:me@mith.ro?subject=Issue%20with%20Probot%20Auto%20Labeler) who is running that.

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this plugin.
