module.exports = robot => {
    robot.on('pull_request.opened', initialCheck);
    robot.on('issue_comment.created', issueComment);

    async function issueComment(context) {
        if (context.payload.issue.pull_request !== undefined) {
            robot.log('THIS IS A PR COMMENT');
            var needsAuthorChecklistLabel = {
                "id": 654876885,
                "url": "https://api.github.com/repos/luisschubert/webhookTest/labels/Needs:%20Author%20Checklist",
                "name": "Needs: Author Checklist",
                "color": "d93f0b",
                "default": false
            }
            var needsReviewerChecklistLabel = {
                "id": 654877075,
                "url": "https://api.github.com/repos/luisschubert/webhookTest/labels/Needs:%20Reviewer%20Checklist",
                "name": "Needs: Reviewer Checklist",
                "color": "1d76db",
                "default": false
            }
            var prAuthor = context.payload.issue.user.login;
            var labels = context.payload.issue.labels;
            var comment = context.payload.comment;
            var commentAuthor = comment.user.login;
            var authorChecklistInBody = comment.body.includes('Author Checklist');
            var hasNeedsAuthorChecklistLabel;
            var tempArr = labels.filter(function(label){
                return label.name === "Needs: Author Checklist"
            })
            if (tempArr.length > 0){
                hasNeedsAuthorChecklistLabel = true;
            }else{
                hasNeedsAuthorChecklistLabel = false;
            }
            robot.log('labels:' + JSON.stringify(labels));
            robot.log('prAuthor: '+ prAuthor);
            robot.log('commentAuthor: '+ commentAuthor);
            robot.log('author checklist in body: '+ authorChecklistInBody);
            robot.log('hasNeedsAuthorChecklistLabel: ' + hasNeedsAuthorChecklistLabel);
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
            if (labels.includes('Needs: Reviewer Checklist') &&
                prAuthor !== commentAuthor &&
                comment.body.includes('Reviewer Checklist')) {
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

    async function initialCheck(context) {
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
