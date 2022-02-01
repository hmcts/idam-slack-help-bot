const {JiraType} = require("./jiraTicketTypes");
const {newServiceRequestDetails} = require("../messages");

const {createHelpRequest, updateHelpRequestDescription} = require("./persistence");
const {supportRequestRaised, supportRequestDetails, bugRaised, bugDetails, newRoleRequestRaised, newServiceRequestRaised} = require("../messages");

const config = require('@hmcts/properties-volume').addTo(require('config'))
const reportChannel = config.get('slack.report_channel');

async function handleSupportRequest(client, user, helpRequest) {
    const userEmail = await getUserEmail(client, user)
    const jiraId = await createHelpRequest(helpRequest, userEmail);

    const permaLink = await postSlackMessages(client,
        supportRequestRaised({
            ...helpRequest,
            jiraId
        }),
        supportRequestDetails(helpRequest)
    )

    await updateHelpRequestDescription(jiraId, {
        ...helpRequest,
        slackLink: permaLink
    })
}

function checkConfigPresent(config, output) {
    if (config !== undefined || config !== null || config !== "" ) {
        console.log("*****" + output)
        return true
    }
    return false
}

async function handleBugReport(client, user, helpRequest) {
    console.log("*****TESTING INPUT PARAMETERS")
    if (client.token === undefined || client.token === null || !client.token.startsWith("xoxb")) {
        console.log("*****Invalid channel bot token in Client")
    } else {
        console.log("*****Channel token present in Client")
    }

    console.log("*****Slack user is: " + user)

    console.log("*****TESTING CONFIG SETTINGS")
    const channelPresent = checkConfigPresent(config.get('slack.report_channel'), "Slack channel config present")
    if (channelPresent) {
        console.log("*****Slack channel value: " + config.get('slack.report_channel'))
    }

    const channelIdPresent = checkConfigPresent(config.get('slack.report_channel_id'), "Slack channel id config present")
    if (channelIdPresent) {
        console.log("*****Slack channel id value: " + config.get('slack.report_channel_id'))
    }

    checkConfigPresent(config.get('secrets.cftptl-intsvc.jira-username'), "Jira username config present")
    checkConfigPresent(config.get('secrets.cftptl-intsvc.jira-api-token'), "Jira api token config present")
    checkConfigPresent(config.get('secrets.cftptl-intsvc.idam-slack-bot-token'), "Idam slack bot token config present")
    checkConfigPresent(config.get('secrets.cftptl-intsvc.idam-slack-app-token'), "Idam slack app token config present")

    const userEmail = await getUserEmail(client, user)
    const jiraId = await createHelpRequest(helpRequest, userEmail, JiraType.BUG.id)

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

async function handleNewServiceRequest(client, user, helpRequest) {
    const userEmail = await getUserEmail(client, user)
    const jiraId = await createHelpRequest(helpRequest, userEmail, JiraType.SERVICE.id)

    await postSlackMessages(client,
        newServiceRequestRaised({
            ...helpRequest,
            jiraId
        }),
        newServiceRequestDetails(helpRequest)
    )
}

async function handleNewRoleRequest(client, user, helpRequest) {
    const userEmail = await getUserEmail(client, user)
    const jiraId = await createHelpRequest(helpRequest, userEmail, JiraType.ROLE.id)

    await postSlackMessages(client,
        newRoleRequestRaised({
            ...helpRequest,
            jiraId
        }),
    )
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

async function postSlackMessages(client, requestInfoBlocks, requestDetailsBlocks) {
    const text = 'New request raised'
    const result = await client.chat.postMessage({
        channel: reportChannel,
        text: text,
        blocks: requestInfoBlocks
    })

    if (requestDetailsBlocks !== undefined) {
        await client.chat.postMessage({
            channel: reportChannel,
            thread_ts: result.message.ts,
            text: text,
            blocks: requestDetailsBlocks
        })
    }

    return getPermaLink(client, result)
}

module.exports = {
    handleSupportRequest,
    handleBugReport,
    handleNewServiceRequest,
    handleNewRoleRequest
}