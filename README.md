# Probot Auto Labeler

[![Greenkeeper badge](https://badges.greenkeeper.io/probot/autolabeler.svg)](https://greenkeeper.io/)

> A GitHub App built with [probot](https://github.com/probot/probot) that adds labels to Pull Requests based on matched commit patterns.

## Using

Configure by creating a `.github/autolabeler.yml` file with a [YAML file](https://en.wikipedia.org/wiki/YAML) in the format of `label: commit-pattern`. Then add the [Probot Auto Labeler Bot](https://github.com/apps/probot-autolabeler) to your repository.

For example,

```yaml
feature: ["feat", "ft"]
documentation: doc
refactor: refactor
```

Then if a pull request is opened that has `scripts/widget.js` modified, then the frontend label will be added.

##### Issues with Bot

If you are having issues with [the GitHub app not working](https://github.com/apps/probot-autolabeler), please [open an issue](https://github.com/probot/autolabeler/issues).


## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this plugin.
