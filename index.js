module.exports = robot => {
    const app = robot.route('/autolabeler');
    //app.use(require('express').static('public'));

    app.get('/controls', async (req, res) => {
        res.sendFile(require('path').join(__dirname +'/public/controls.html'));
    });

    app.get('/openPRs', async (req, res) => {
        var github = await robot.auth(42149);
        var PRs = await github.pullRequests.getAll({
            owner: 'luisschubert',
            repo: 'webhookTest'
        });
        console.log(PRs);
        res.end(JSON.stringify(PRs, null, "  "));
    });
    app.get('/check', async (req,res) => {
        var github = await robot.auth(42149);
        var PRs = await github.pullRequests.getAll({
            owner: 'luisschubert',
            repo: 'webhookTest'
        });
        //for pr in PRS check what labels should be there.
        PRs.forEach(async function(PR){
            console.log("github is: "+github);
            var labels = await github.issues.getIssueLabels({
                owner: 'luisschubert',
                name: 'webhookTest',
                number: PR.number
            });
            //check if pr needs author checklist
            var ACL = hasAuthorChecklist(github, PR);
            //check if pr needs reviewer checklist
            var RCL = hasReviewerChecklist(github, PR);

            //check if pr is ready for merge.
            if (ACL && RCL) {
                //Needs: Merge
                await github.issues.addLabels({
                    owner: 'luisschubert',
                    name: 'webhookTest',
                    number: PR.number,
                    labels: ['Needs: Merge']
                })
            }
            else if (ACL && !RCL) {
                //Needs: Reviewer Checklist
                await github.issues.addLabels({
                    owner: 'luisschubert',
                    name: 'webhookTest',
                    number: PR.number,
                    labels: ['Needs: Reviewer Checklist']
                })
            }
            else if (!ACL && !RCL) {
                //Needs: Author Checklist
                await github.issues.addLabels({
                    owner: 'luisschubert',
                    name: 'webhookTest',
                    number: PR.number,
                    labels: ['Needs: Author Checklist']
                })
            }

        });
        res.end('undetermined state');



    })

    //SHOULDN'T BE IN THIS FILE
    async function hasAuthorChecklist(github, PR) {
        //check the body of the PR
        //if 'Author Checklist' is include -> true
        if (PR.body.includes('Author Checklist')) return true;

        //check the comments
        //get all the comments
        var comments = await github.issues.getComments({
            owner:'luisschubert',
            repo: 'webhookTest'
            number: PR.number
        });
        comments.forEach(function(comment) {
            if (comment.body.includes('Author Checklist')) return true;
        });

        //return false if no Author Checklist is found
        return false;
    }
    async function hasReviewerChecklist(github, PR) {
        var comments = await github.issues.getComments({
            owner: 'luisschubert',
            repo: 'webhookTest',
            number: PR.number
        });
        comments.forEach(function(comment) {
            if (comment.body.includes('Reviewer Checklist')) return true;
        });

        //return false if no Reviewer Checklist is found
        return false;
    }

    robot.on('pull_request.opened', pullRequestOpened);
    robot.on('issue_comment.created', issueCommentCreated);
    robot.on('issue_comment.edited', async context => {
        // var nasaTeams = await context.github.orgs.getTeams({
        //     org: 'nasa'
        // });
        // console.log(nasaTeams);
        var openPRs = await context.github.pullRequests.getAll(
            context.issue({
                state: 'open'
            })
        );
        console.log(openPRs);

    });




    async function issueCommentCreated(context) {
        if (context.payload.issue.pull_request !== undefined) {
            robot.log('THIS IS A PR COMMENT');
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
};
