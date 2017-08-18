module.exports = robot => {
    const repoOwner = 'luisschubert';
    const repoName = 'webhookTest';
    const installationId = 42149
    const app = robot.route('/autolabeler');
    var bodyParser = require('body-parser');
    app.use(bodyParser.json());

    //curl -d '{"token":"INSERTTOKENHERE"}' -H "Content-Type: application/json" -X POST https://guarded-springs-55755.herokuapp.com/autolabeler/check
    app.post('/check', async (req, res) => {
        //get token from post parameter
        const reqToken = req.body.token;
        //get token from file
        const tokenToMatch = require('fs').readFileSync('.passwordHash');
        //check if token matches
        if (reqToken == tokenToMatch) {
            const github = await robot.auth(installationId);
            var PRs = await github.pullRequests.getAll({
                owner: repoOwner,
                repo: repoName
            });
            //for pr in PRS check what labels should be there.
            PRs.data.forEach(async function(PR){
                console.log("github is: "+github);
                var labels = await github.issues.getIssueLabels({
                    owner: repoOwner,
                    repo: repoName,
                    number: PR.number
                });
                //check if pr needs author checklist
                var ACL = await hasAuthorChecklist(github, PR);
                //check if pr needs reviewer checklist
                var RCL = await hasReviewerChecklist(github, PR);
                //check if the author has signed a CLA
                hasCLA(github, PR);

                // robot.log("PR #"+PR.number+" ACL: "+ACL+", RCL: "+RCL);
                //check if pr is ready for merge.
                if (ACL && RCL) {
                    //Needs: Merge
                    robot.log("I decided that #"+PR.number+" Needs: Merge");
                    await github.issues.addLabels({
                        owner: repoOwner,
                        repo: repoName,
                        number: PR.number,
                        labels: ['Needs: Merge']
                    })
                }
                else if (ACL && !RCL) {
                    //Needs: Reviewer Checklist
                    robot.log("I decided that #"+PR.number+" Needs: Reviewer Checklist");
                    await github.issues.addLabels({
                        owner: repoOwner,
                        repo: repoName,
                        number: PR.number,
                        labels: ['Needs: Reviewer Checklist']
                    })
                }
                else if (!ACL && !RCL) {
                    //Needs: Author Checklist
                    robot.log("I decided that #"+PR.number+" Needs: Author Checklist");
                    await github.issues.addLabels({
                        owner: repoOwner,
                        repo: repoName,
                        number: PR.number,
                        labels: ['Needs: Author Checklist']
                    })
                }
                else {
                    robot.log("#"+PR.number+"... how did we get here?")
                }

            });
            res.end(JSON.stringify({message: 'initializing labels on pull requests'}));
        }
        else {
            res.sendStatus(401);
        }

    });

    function hasCLA(github, PR) {
        // console.log(PR);
        var prAuthor = PR.user.login;
        var cla = JSON.parse(require('fs').readFileSync('cla.json'));
        //check if author is in claList
        if (!cla.contributors.includes(prAuthor)) {
            github.issues.addLabels({
                owner: repoOwner,
                repo: repoName,
                number: PR.number,
                labels: ['Needs: CLA']
            });
        }
    }

    //SHOULDN'T BE IN THIS FILE
    async function hasAuthorChecklist(github, PR) {
        var hasACL = false;
        //check the body of the PR
        //if 'Author Checklist' is include -> true
        if (PR.body.includes('Author Checklist')) {
            robot.log('I decided that PR #'+PR.number+' has an Author Checklist because Author Checklist was included in the body: '+PR.body);
            hasACL = true;
            //return true;
        }

        //check the comments
        //get all the comments
        var comments = await github.issues.getComments({
            owner: repoOwner,
            repo: repoName,
            number: PR.number
        });
        comments.data.forEach(function(comment) {
            if (comment.body.includes('Author Checklist')) {
                robot.log('I decided that PR #'+PR.number+' has an Author Checklist because Author Checklist was included in the comment: '+comment.body);
                hasACL = true;
                //return true;
            }
        });

        //return false if no Author Checklist is found
        if (!hasACL) {
            robot.log('I decided that PR #'+PR.number+' has no Author Checklist');
            return false;
        }
        else{
            robot.log('I decided that PR #'+PR.number+' has an Author Checklist');
            return true;
        }
    }

    async function hasReviewerChecklist(github, PR) {
        var hasRCL = false;
        var comments = await github.issues.getComments({
            owner: repoOwner,
            repo: repoName,
            number: PR.number
        });
        comments.data.forEach(function(comment) {
            if (comment.body.includes('Reviewer Checklist')) {
                robot.log('I decided that PR #'+PR.number+' has a Reviewer Checklist because Reviewer Checklist was included in the comment: '+ comment.body);
                hasRCL = true;
                // return true;
            }
        });

        //return false if no Reviewer Checklist is found
        if (!hasRCL) {
            robot.log('I decided that PR #'+PR.number+' has no Reviewer Checklist');
            return false;
        }
        else{
            robot.log('I decided that PR #'+PR.number+' has a Reviewer Checklist');
            return true;
        }
    }

    robot.on('pull_request.opened', pullRequestOpened);
    robot.on('issue_comment.created', issueCommentCreated);

    async function issueCommentCreated(context) {
        if (context.payload.issue.pull_request !== undefined) {
            var needsAuthorChecklistLabel = require(
                './test/fixtures/needsAuthorChecklistLabel.json'
            );
            var needsReviewerChecklistLabel = require(
                './test/fixtures/needsReviewerChecklistLabel.json'
            );
            var prAuthor = context.payload.issue.user.login;
            var labels = context.payload.issue.labels;
            var comment = context.payload.comment;
            var commentAuthor = comment.user.login;
            var authorChecklistInBody = comment.body.includes('Author Checklist');
            var reviewerChecklistInBody = comment.body.includes('Reviewer Checklist');

            var hasNeedsAuthorChecklistLabel;
            var tempAuthorChecklistArr = labels.filter(function(label){
                return label.name === 'Needs: Author Checklist'
            })
            if (tempAuthorChecklistArr.length > 0){
                hasNeedsAuthorChecklistLabel = true;
            }else{
                hasNeedsAuthorChecklistLabel = false;
            }

            var hasNeedsReviewerChecklistLabel;
            var tempReviewerChecklistArr = labels.filter(function(label){
                return label.name === 'Needs: Reviewer Checklist'
            })
            if (tempReviewerChecklistArr.length > 0){
                hasNeedsReviewerChecklistLabel = true;
            }else{
                hasNeedsReviewerChecklistLabel = false;
            }

            //DIAGNOSTIC LOG
            robot.log('labels:' + JSON.stringify(labels));
            robot.log('prAuthor: '+ prAuthor);
            robot.log('commentAuthor: '+ commentAuthor);
            robot.log('author checklist in body: '+ authorChecklistInBody);
            robot.log('hasNeedsAuthorChecklistLabel: ' + hasNeedsAuthorChecklistLabel);
            robot.log('hasNeedsReviewerChecklistLabel: ' + hasNeedsReviewerChecklistLabel);

            //REMOVING/ADDING LABELS
            if (hasNeedsAuthorChecklistLabel &&
                prAuthor === commentAuthor &&
                authorChecklistInBody) {
                    robot.log('removing needs author checklist');
                await context.github.issues.removeLabel(
                    context.issue({
                        name: 'Needs: Author Checklist'
                    })
                );
                await context.github.issues.addLabels(
                    context.issue({
                        labels:['Needs: Reviewer Checklist']
                    })
                )
            }
            if (hasNeedsReviewerChecklistLabel &&
                prAuthor !== commentAuthor &&
                reviewerChecklistInBody) {
                await context.github.issues.removeLabel(
                    context.issue({
                        name: 'Needs: Reviewer Checklist'
                    })
                )
                await context.github.issues.addLabels(
                    context.issue({
                        labels:['Needs: Merge']
                    })
                )
            }
        }
        else {
            robot.log('THIS IS AN ISSUE COMMENT');
        }
    }

    async function pullRequestOpened(context) {
        initialCLACheck(context);
        var pr = await context.github.pullRequests.get(context.issue());

        var body = pr.data.body;

        if (!body.includes('Author Checklist')) {
            return context.github.issues.addLabels(
                context.issue({
                    labels: ['Needs: Author Checklist']
                })
            );
        }
        else if(body.includes('Author Checklist')) {
            return context.github.issues.addLabels(
                context.issue({
                    labels: ['Needs: Reviewer Checklist']
                })
            );
        }
    }

    function initialCLACheck(context) {
        var prAuthor = context.payload.sender.login;
        var cla = JSON.parse(require('fs').readFileSync('cla.json'));
        //check if author is in claList
        if (!cla.contributors.includes(prAuthor)) {
            context.github.issues.addLabels(
                context.issue({
                    labels: ['Needs: CLA']
                })
            );
        }
    }
};
