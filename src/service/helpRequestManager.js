const {createHelpRequest, updateHelpRequestDescription} = require("./persistence");
const {helpRequestRaised, helpRequestDetails} = require("../messages");

const config = require('@hmcts/properties-volume').addTo(require('config'))
const reportChannel = config.get('slack.report_channel');

async function handleSupportRequest(client, user, helpRequest) {
    const userEmail = (await client.users.profile.get({
        user
    })).profile.email

    const jiraId = await createHelpRequest({
        summary: helpRequest.summary,
        userEmail
    })

    const result = await client.chat.postMessage({
        channel: reportChannel,
        text: 'New support request raised',
        blocks: helpRequestRaised({
            ...helpRequest,
            jiraId
        })
    });

    await client.chat.postMessage({
        channel: reportChannel,
        thread_ts: result.message.ts,
        text: 'New support request raised',
        blocks: helpRequestDetails(helpRequest)
    });

    const permaLink = (await client.chat.getPermalink({
        channel: result.channel,
        'message_ts': result.message.ts
    })).permalink

    await updateHelpRequestDescription(jiraId, {
        ...helpRequest,
        slackLink: permaLink
    })
}

module.exports.handleSupportRequest = handleSupportRequest