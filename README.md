# OpenMCT CoSE Bot

> a GitHub App built with [probot](https://github.com/probot/probot) that automatically labels  pull requests in the OpenMCT Repository.

Pull requests are automatically labelled according to where along in the merge process a pr is: `Needs: Author Checklist`, `Needs: Reviewer Checklist`, `Needs: Merge`.
Additionally CLA status is determined using information from cla.json

## Setup
>[Probot deploy instructions for reference](https://github.com/probot/probot/blob/master/docs/deployment.md)

The contents of this repository will be deployed to heroku.
The following environment variables need to be set:
- [ ] APP_ID
- [ ] PRIVATE_KEY
- [ ] WEBHOOK_SECRET

A Github app has to be created to communicate with the Heroku app.

## Bot Interface:
### Create Token
`node setPassword.js`
enter some text (password) to generate a hash used as the token for the interface.
this token will be saved locally and used on the heroku deployment.

### Initialized Labels & Re-run to check Labels
`curl -d '{"token":"INSERT_TOKEN_HERE"}' -H "Content-Type: application/json" -X POST INSERT_HEROKU_URL_HERE/openmct/check`
The bot should respond with `{"message":"initializing labels on pull requests"}`
