module.exports = robot => {
    robot.on('pull_request.opened', initialCheck);
    robot.on('issue_comment', issueComment);

    async function issueComment(context) {
        if (context.payload.issue.pull_request !== undefined) {
            robot.log('THIS IS A PR COMMENT');
            var needsAuthorChecklistLabel = {
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
            var hasNeedsAuthorChecklistLabel = labels.includes(needsAuthorChecklistLabel);
            robot.log('lables:' + lables);
            robot.log('prAuthor: '+ prAuthor);
            robot.log('commentAuthor: '+ commentAuthor);
            robot.log('author checklist in body: '+ authorChecklistInBody);
            if (hasNeedsAuthorChecklistLabel &&
                prAuthor === commentAuthor &&
                authorChecklistInBody) {
                    robot.log('removing needs author checklist');
                return await context.github.issues.removeLabel(
                    context.issue({
                        name: 'Needs: Author Checklist'
                    })
                );
            }
            if (labels.includes('Needs: Reviewer Checklist') &&
                prAuthor !== commentAuthor &&
                comment.body.includes('Reviewer Checklist')) {
                return await context.github.issues.removeLabel(
                    context.issue({
                        name: 'Needs: Reviewer Checklist'
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
