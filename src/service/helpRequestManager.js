const types = require("./jiraTicketTypes");

const {createHelpRequest, updateHelpRequestDescription} = require("./persistence");
const {supportRequestRaised, supportRequestDetails, bugRaised, bugDetails} = require("../messages");

const config = require('@hmcts/properties-volume').addTo(require('config'))
const reportChannel = config.get('slack.report_channel');

async function handleSupportRequest(client, user, helpRequest) {
    const userEmail = await getUserEmail(client, user)
    const jiraId = await createHelpRequest({
        summary: helpRequest.summary,
        userEmail
    })

    const blocks = supportRequestRaised({
        ...helpRequest,
        jiraId
    })
    const result = await client.chat.postMessage({
        channel: reportChannel,
        text: 'New support request raised',
        blocks: blocks
    })

    await client.chat.postMessage({
        channel: reportChannel,
        thread_ts: result.message.ts,
        text: 'New support request raised',
        blocks: supportRequestDetails(helpRequest)
    })

    const permaLink = await getPermaLink(client, result)
    await updateHelpRequestDescription(jiraId, {
        ...helpRequest,
        slackLink: permaLink
    })
}

async function handleBugReport(client, user, helpRequest) {
    const userEmail = await getUserEmail(client, user)
    const jiraId = await createHelpRequest({
            summary: helpRequest.summary,
            userEmail
        },
        types.BUG.id
    )

    const result = await client.chat.postMessage({
        channel: reportChannel,
        text: 'New bug raised',
        blocks: bugRaised({
            ...helpRequest,
            jiraId
        })
    })

    await client.chat.postMessage({
        channel: reportChannel,
        thread_ts: result.message.ts,
        text: 'New bug raised',
        blocks: bugDetails(helpRequest)
    })

    const permaLink = await getPermaLink(client, result)
    await updateHelpRequestDescription(jiraId, {
        ...helpRequest,
        slackLink: permaLink
    })
}

async function getUserEmail(client, user) {
    return (await client.users.profile.get({
        user
    })).profile.email
}

async function getPermaLink(client, result) {
    return (await client.chat.getPermalink({
        channel: result.channel,
        'message_ts': result.message.ts
    })).permalink
}

module.exports = {
    handleSupportRequest,
    handleBugReport
}