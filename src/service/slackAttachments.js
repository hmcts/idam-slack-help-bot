const {addAttachmentToHelpRequest, addCommentToHelpRequest} = require('./persistence')
const {downloadSlackFile} = require('./slackFiles')

function fileName(file) {
    return file.name || file.id || 'unknown file'
}

async function syncSlackAttachments(jiraId, files, botToken, slackLink) {
    const failures = await Promise.all((files || []).map(async file => {
        let attachmentStream

        try {
            attachmentStream = await downloadSlackFile(file, botToken)
        } catch (error) {
            console.error(`Failed to download Slack attachment ${fileName(file)}`, error)
            return `Failed to download attachment "${fileName(file)}" from Slack. Use the Slack link above to view it.`
        }

        try {
            await addAttachmentToHelpRequest(jiraId, attachmentStream)
        } catch (error) {
            console.error(`Failed to add Slack attachment ${fileName(file)} to Jira issue ${jiraId}`, error)
            return `Downloaded attachment "${fileName(file)}" from Slack but failed to attach it to Jira. Use the Slack link above to view it.`
        }

        return undefined
    }))

    const failureMessages = failures.filter(Boolean)
    if (failureMessages.length) {
        await addCommentToHelpRequest(jiraId, {
            slackLink,
            displayName: 'IDAM Support Bot',
            message: failureMessages.join('\n')
        })
    }

    return failureMessages
}

module.exports.syncSlackAttachments = syncSlackAttachments
