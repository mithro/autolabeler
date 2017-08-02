module.exports = robot => {
    robot.on('pull_request.opened', pullRequestOpened);
    robot.on('issue_comment.created', issueCommentCreated);
    robot.on('issue_comment.edited', async context => {
        var nasaTeams = await context.github.orgs.getTeams({
            org: 'nasa'
        });
        console.log(nasaTeams);

    })

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
