const {slackRequestText} = require("../util/helpers");
const {JiraType} = require("./jiraTicketTypes");

const {createHelpRequest, updateHelpRequestDescription} = require("./persistence");
const {supportRequestRaised, supportRequestDetails, bugRaised, bugDetails, newRoleRequestRaised} = require("../messages");
const {supportRequestSuggestions} = require("./suggestions");

const config = require('@hmcts/properties-volume').addTo(require('config'))
const reportChannel = config.get('slack.report_channel');

async function handleSupportRequest(client, user, helpRequest) {
    const userEmail = await getUserEmail(client, user)
    const jiraId = await createHelpRequest(helpRequest, userEmail);
    console.log(`Support request ${jiraId} created in Jira from ${reportChannel}`)

    const permaLink = await postSlackMessages(client,
        supportRequestRaised({
            ...helpRequest,
            jiraId
        }),
        supportRequestDetails(helpRequest),
        supportRequestSuggestions(helpRequest)
    )

    await updateHelpRequestDescription(jiraId, {
        ...helpRequest,
        slackLink: permaLink
    })
}

async function handleBugReport(client, user, helpRequest) {
    const userEmail = await getUserEmail(client, user)
    const jiraId = await createHelpRequest(helpRequest, userEmail, JiraType.BUG.id)
    console.log(`Bug ${jiraId} created in Jira from ${reportChannel}`)

    const permaLink = await postSlackMessages(client,
        bugRaised({
            ...helpRequest,
            jiraId
        }),
        bugDetails(helpRequest)
    )

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

async function postSlackMessages(client, requestInfoBlocks, requestDetailsBlocks, requestSuggestionBlocks) {
    const result = await client.chat.postMessage({
        channel: reportChannel,
        text: slackRequestText,
        blocks: requestInfoBlocks
    })

    if (requestDetailsBlocks !== undefined) {
        await client.chat.postMessage({
            channel: reportChannel,
            thread_ts: result.message.ts,
            text: slackRequestText,
            blocks: requestDetailsBlocks
        })
    }

    if (requestSuggestionBlocks.length) {
        await client.chat.postMessage({
            channel: reportChannel,
            thread_ts: result.message.ts,
            text: slackRequestText,
            blocks: requestSuggestionBlocks
        })
    }

    return getPermaLink(client, result)
}

module.exports = {
    handleSupportRequest,
    handleBugReport,
}