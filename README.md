# Probot Auto Labeler

[![Greenkeeper badge](https://badges.greenkeeper.io/probot/autolabeler.svg)](https://greenkeeper.io/)

> a GitHub App built with [probot](https://github.com/probot/probot) that adds labels to Pull Requests based on matched file patterns.

## Using

Configure by creating a `.github/.github/autolabeler.yml` file with a yaml file in the format of `label: file/path`. 

For example,
```yaml
frontend: ["*.js", "*.css", "*.html"]
backend: ["/app", "*.rb"]
legal: ["LICENSE*", "NOTICES*"]
config: .github
```
Then if a pull request is opened that has `scripts/widget.js` modified, then the frontend label will be added.

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this plugin.
