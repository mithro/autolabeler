# Autolabeler

> a GitHub App built with [probot](https://github.com/probot/probot) that automatically labels pull requests.

Automatic labelling of pull requests based on the path of the files modified. (frontend, backend, legal)

## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this plugin.

## Example YAML file


```
frontend: ["*.js", "*.css", "*.html"]
backend: ["/app", "*.rb"]
legal: ["LICENSE*", "NOTICES*"]
config: .github
```
