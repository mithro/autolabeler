# OpenMCT CoSE Bot

> a GitHub App built with [probot](https://github.com/probot/probot) that automatically labels  pull requests in the OpenMCT Repository.

Pull requests are automatically labelled according to where along in the merge process a pr is: `Needs: Author Checklist`, `Needs: Reviewer Checklist`, `Needs: Merge`.
Additionally CLA status is determined using information from cla.json

## Setup
>[Probot deploy instructions for reference](https://github.com/probot/probot/blob/master/docs/deployment.md)

Follow the probot instructions to create a github app and deploy to heroku.
Set the permissions as follows:
![Issue Permissions](http://i.imgur.com/3Txz2sd.png)
![PR Permissions](http://i.imgur.com/07BTdVv.png)


in `index.js` set the repo and owner name as well as installation id.
Installation id can be found in a webhook message.
## Bot Interface:
### Create Token
`node setPassword.js`
enter some text (password) to generate a hash used as the token for the interface.
this token will be saved locally and used on the heroku deployment.

### Initialized Labels & Re-run to check Labels
`curl -d '{"token":"INSERT_TOKEN_HERE"}' -H "Content-Type: application/json" -X POST INSERT_HEROKU_URL_HERE/openmct/check`
The bot should respond with `{"message":"initializing labels on pull requests"}`
