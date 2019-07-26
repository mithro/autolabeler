# Probot Size Labeler

> A GitHub App built with [probot](https://github.com/probot/probot) that adds labels to Pull Requests based on matched conditions on the size of the PR.

## Using

Configure by creating a `.github/sizelabeler.yml` file with a [YAML file](https://en.wikipedia.org/wiki/YAML) in the format of:

```yaml
label:
  min: 0
  max: 50
```
Then add the [Probot Size Labeler Bot](https://github.com/apps/probot-sizelabeler) to your repository.

For example,

```yaml
xs:
  min: 0
  max: 2
sm:
  min: 3
  max: 5
md:
  min: 6
  max: 10
lg:
  min: 11
rm_code:
  min_deletions: 1
  max_additions: 0
```

Then if a pull request is opened that has a net size (added lines minus deleted lines) of 5, then the `sm` label will be added.

### Supported conditions

For each label, the following properties are supported:

* `min`: (number) the minimum value for the net size (additions - deletions) of the PR.
* `max`: (number) the maximum value for the net size (additions - deletions) of the PR.
* `min_additions`: (number) the minimum value for the number of lines added in the PR.
* `max_additions`: (number) the maximum value for the number of lines added in the PR.
* `min_deletions`: (number) the minimum value for the number of lines removed in the PR.
* `max_deletions`: (number) the maximum value for the number of lines removed in the PR.
* `terminal`: (boolean) specify as `true` to prevent processing any further labels.

##### Issues with Bot

If you are having issues with [the GitHub app not working](https://github.com/apps/probot-sizelabeler), please [open an issue](https://github.com/greglockwood/sizelabeler/issues).


## Setup

```
# Install dependencies
npm install

# Run the bot
npm start
```

See [docs/deploy.md](docs/deploy.md) if you would like to run your own instance of this plugin.
