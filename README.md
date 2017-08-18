# OpenMCT CoSE  Bot
_(**Co**llaborative **S**oftware **E**ngineering)_

> **GitHub App built with [probot](https://github.com/probot/probot) to automatically label pull requests in the [OpenMCT](https://github.com/nasa/openmct) Repository.**

>Pull requests are automatically labelled according to where along in the merge process a pr is:  `Needs: Author Checklist`  , `Needs: Reviewer Checklist`, `Needs: Merge`.
Additionally CLA status is determined using information from `cla.json` and `Needs: CLA` label is added.

## Github App Setup

Every deployment will need an [App](https://developer.github.com/apps/).

1. [Create a new GitHub App](https://github.com/settings/apps/new) with:
    - **Homepage URL**: the URL to the GitHub repository for your plugin
    - **Webhook URL**: Use `https://example.com/` for now, we'll come back in a minute to update this with the URL of your deployed plugin.
    - **Webhook Secret**: Generate a unique secret with `openssl rand -base64 32` and save it because you'll need it in a minute to configure your deployed plugin.
    - **Permissions & events**: Set the permissions on the github app as follows:
    ![Issue Permissions](http://i.imgur.com/3Txz2sd.png)
    ![PR Permissions](http://i.imgur.com/07BTdVv.png)

1. Download the private key from the app.

1. Make sure that you click the green **Install** button on the top left of the app page. This gives you an option of installing the app on all or a subset of your repositories.



## CoSE Bot Deployment


To deploy a plugin to any cloud provider, you will need 3 environment variables:

- `APP_ID`: the ID of the app, which you can get from the [app settings page](https://github.com/settings/apps).
- `WEBHOOK_SECRET`: the **Webhook Secret** that you generated when you created the app.

And one of:

- `PRIVATE_KEY`: the contents of the private key you downloaded after creating the app, OR...
- `PRIVATE_KEY_PATH`: the path to a private key file.

`PRIVATE_KEY` takes precedence over `PRIVATE_KEY_PATH`.

### Heroku

Probot runs like [any other Node app](https://devcenter.heroku.com/articles/deploying-nodejs) on Heroku. After [creating the GitHub App](#create-the-github-app):

1. Make sure you have the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) client installed.

1. Clone the plugin that you want to deploy. e.g. `git clone https://github.com/probot/stale`

1. Create the Heroku app with the `heroku create` command:

        $ heroku create
        Creating arcane-lowlands-8408... done, stack is cedar
        http://arcane-lowlands-8408.herokuapp.com/ | git@heroku.com:arcane-lowlands-8408.git
        Git remote heroku added

1. Go back to your [app settings page](https://github.com/settings/apps) and update the **Webhook URL** to the URL of your deployment, e.g. `http://arcane-lowlands-8408.herokuapp.com/`.

1. Configure the Heroku app, replacing the `APP_ID` and `WEBHOOK_SECRET` with the values for those variables, and setting the path for the `PRIVATE_KEY`:

        $ heroku config:set APP_ID=aaa \
            WEBHOOK_SECRET=bbb \
            PRIVATE_KEY="$(cat ~/Downloads/*.private-key.pem)"

1. Deploy the plugin to heroku with `git push`:

        $ git push heroku master
        ...
        -----> Node.js app detected
        ...
        -----> Launching... done
              http://arcane-lowlands-8408.herokuapp.com deployed to Heroku

1. Your plugin should be up and running! To verify that your plugin
   is receiving webhook data, you can tail your app's logs:

        $ heroku config:set LOG_LEVEL=trace
        $ heroku logs --tail


## Bot Interface Setup:
### Create Access Token
run `node setPassword.js` and enter some text (a password) to generate a hash that is to be used as the token for the interface.
This token will be saved locally in `.hashPassword` and used on the heroku deployment provide secure access to the publically exposed route.

In `index.js` set the `repoOwner`, `repoName` and `installationId` for making github api requests that are independent of incoming webhook messages.

Installation ID can be found in a webhook payload.
`https://github.com/settings/apps/NAME_OF_YOUR_APP/advanced`

![installation ID](http://i.imgur.com/riJBBKd.png)


### Initialized Labels

To initialize the checking of open pull request you can make a POST curl request to the exposed route `https://BOTSERVER/autolabeler/check` and provide the token with the "token" key accordingly.
```
curl -d '{"token":"INSERT_TOKEN_HERE"}' -H "Content-Type: application/json" -X POST INSERT_HEROKU_URL_HERE/autolabeler/check
```
On success the bot will respond with:
```
{"message":"initializing labels on pull requests"}
```

#### References:

[Probot](https://github.com/probot/probot/) repository, which was used as a framework to handle webhook events and make requests to the github api.

[Probot Deployment Guide](https://github.com/probot/probot/blob/master/docs/deployment.md) to aide with deployment of bot and setup of Github App.

[Probot Autolabeler](https://github.com/probot/autolabeler/) repository was used as a starting point to building a new plugin, although the bot turned out to be its own standalone bot and not a plugin for probot.
