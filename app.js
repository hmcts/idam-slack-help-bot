const config = require('@hmcts/properties-volume').addTo(require('config'))

const {
    appHomeUnassignedIssues,
    extractSlackLinkFromText,
    helpRequestDetails,
    helpRequestRaised,
    openHelpRequestBlocks,
    unassignedOpenIssue,
} = require('./src/messages');
const {App, LogLevel, SocketModeReceiver} = require('@slack/bolt');
const crypto = require('crypto')
const {
    addCommentToHelpRequest,
    assignHelpRequest,
    createHelpRequest,
    extractJiraId,
    extractJiraIdFromBlocks,
    resolveHelpRequest,
    searchForUnassignedOpenIssues,
    startHelpRequest,
    updateHelpRequestDescription
} = require("./src/service/persistence");

const { ticketTypePickerModal, openIDRequestModal, userRequestModal, bugReportModal, supportRequestModal } = require('./src/modals');

const app = new App({
    token: config.get('secrets.cftptl-intsvc.slack-bot-token'), //disable this if enabling OAuth in socketModeReceiver
    // logLevel: LogLevel.DEBUG,
    appToken: config.get('secrets.cftptl-intsvc.slack-app-token'),
    socketMode: true,
});

const http = require('http');
const reportChannel = config.get('slack.report_channel');
const reportChannelId = config.get('slack.report_channel_id');
const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
    if (req.method !== 'GET') {
        res.end(`{"error": "${http.STATUS_CODES[405]}"}`)
    } else if (req.url === '/health') {
        res.end(`<h1>idam-slack-help-bot</h1>`)
    } else if (req.url === '/health/liveness') {
        if (app.receiver.client.badConnection) {
            res.statusCode = 500
            res.end('Internal Server Error');
            return;
        }

        res.end('OK');
    } else if (req.url === '/health/readiness') {
        res.end(`<h1>idam-slack-help-bot</h1>`)
    } else {
        res.end(`{"error": "${http.STATUS_CODES[404]}"}`)
    }
})

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

(async () => {
    await app.start();
    console.log('⚡️ Bolt app started');
})();

async function reopenAppHome(client, userId) {
    const results = await searchForUnassignedOpenIssues()

    const parsedResults = results.issues.flatMap(result => {
        return unassignedOpenIssue({
            summary: result.fields.summary,
            slackLink: extractSlackLinkFromText(result.fields.description),
            jiraId: result.key,
            created: result.fields.created,
            updated: result.fields.updated,
        })
    })

    await client.views.publish({
        user_id: userId,
        view: {
            type: "home",
            blocks: appHomeUnassignedIssues(parsedResults)
        },
    });
}

// Publish a App Home
app.event('app_home_opened', async ({event, client}) => {
    await reopenAppHome(client, event.user);
});

// Message Shortcut example
app.shortcut('launch_msg_shortcut', async ({shortcut, body, ack, context, client}) => {
    await ack();
});

// Global Shortcut example
// setup global shortcut in App config with `launch_shortcut` as callback id
// add `commands` scope
app.shortcut('launch_shortcut', async ({shortcut, body, ack, context, client}) => {
    try {
        // Acknowledge shortcut request
        await ack();

        // Un-comment if you want the JSON for block-kit builder (https://app.slack.com/block-kit-builder/T1L0WSW9F)
        // console.log(JSON.stringify(openHelpRequestBlocks().blocks))

        await client.views.open({
            trigger_id: shortcut.trigger_id,
            view: ticketTypePickerModal()
        });
    } catch (error) {
        console.error(error);
    }
});

function extractLabels(values) {
    const service = `team-${values.service.service.selected_option.value}`
    return [service];
}

app.action('show_type_form', async ({ack, body, client, logger}) => {
    await ack();

    try {
        let view;
        switch (body.view.state.values.stage_one.type_selector.selected_option.value) {
            case 'openid':
                view = openIDRequestModal;
                break;
            case 'user':
                view = userRequestModal;
                break;
            case 'bug':
                view = bugReportModal;
                break;
            case 'support':
                view = supportRequestModal;
                break;
        }

        const result = await client.views.update({
            view_id: body.view.id,
            hash: body.view.hash,
            view: view()
        });
        logger.info(result);
    }
    catch (error) {
        logger.error(error);
    }
})

app.view('create_help_request', async ({ack, body, view, client}) => {
    // Acknowledge the view_submission event
    await ack();

    const user = body.user.id;

    // Message the user
    try {
        const userEmail = (await client.users.profile.get({
            user
        })).profile.email

        const helpRequest = {
            user,
            summary: view.state.values.summary.title.value,
            description: view.state.values.description.description.value,
            analysis: view.state.values.analysis.analysis.value,
            environment: view.state.values.environment.environment.selected_option?.text.text || "N/A",
            service: view.state.values.service.service.selected_option?.text.text || "N/A",
            userAffected: view.state.values.user.user.value || "N/A",
            date: view.state.values.date.date.value || "N/A",
            time: view.state.values.time.time.value || "N/A",
        }

        const jiraId = await createHelpRequest({
            summary: helpRequest.summary,
            userEmail,
            labels: extractLabels(view.state.values)
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
    } catch (error) {
        console.error(error);
    }

});


// subscribe to 'app_mention' event in your App config
// need app_mentions:read and chat:write scopes
app.event('app_mention', async ({event, context, client, say}) => {
    try {
        await say({
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": `Thanks for the mention <@${event.user}>!`
                    },
                }
            ]
        });
    } catch (error) {
        console.error(error);
    }
});

app.action('assign_help_request_to_me', async ({body, action, ack, client, context}) => {
    try {
        await ack();

        const jiraId = extractJiraIdFromBlocks(body.message.blocks)
        const userEmail = (await client.users.profile.get({
            user: body.user.id
        })).profile.email

        await assignHelpRequest(jiraId, userEmail)

        const blocks = body.message.blocks
        const assignedToSection = blocks[6]
        assignedToSection.elements[0].initial_user = body.user.id
        // work around issue where 'initial_user' doesn't update if someone selected a user in dropdown
        // assignedToSection.block_id = `new_block_id_${randomString().substring(0, 8)}`;

        await client.chat.update({
            channel: body.channel.id,
            ts: body.message.ts,
            text: 'New support request raised',
            blocks: blocks
        });
    } catch (error) {
        console.error(error);
    }

})

app.action('resolve_help_request', async ({
                                              body, action, ack, client, context
                                          }) => {
    try {
        await ack();
        const jiraId = extractJiraIdFromBlocks(body.message.blocks)

        await resolveHelpRequest(jiraId) // TODO add optional resolution comment

        const blocks = body.message.blocks
        // TODO less fragile block updating
        blocks[6].elements[2] = {
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": ":snow_cloud: Re-open",
                "emoji": true
            },
            "style": "primary",
            "value": "start_help_request",
            "action_id": "start_help_request"
        }

        blocks[2].fields[0].text = "Status :snowflake:\n Done"

        await client.chat.update({
            channel: body.channel.id,
            ts: body.message.ts,
            text: 'New support request raised',
            blocks: blocks
        });
    } catch (error) {
        console.error(error);
    }
});


app.action('start_help_request', async ({body, action, ack, client, context}) => {
    try {
        await ack();
        const jiraId = extractJiraIdFromBlocks(body.message.blocks)

        await startHelpRequest(jiraId) // TODO add optional resolution comment

        const blocks = body.message.blocks
        // TODO less fragile block updating
        blocks[6].elements[2] = {
            "type": "button",
            "text": {
                "type": "plain_text",
                "text": ":snow_cloud: Resolve",
                "emoji": true
            },
            "style": "primary",
            "value": "resolve_help_request",
            "action_id": "resolve_help_request"
        }

        blocks[2].fields[0].text = "Status :fire_extinguisher:\n In progress"

        await client.chat.update({
            channel: body.channel.id,
            ts: body.message.ts,
            text: 'New support request raised',
            blocks: blocks
        });
    } catch (error) {
        console.error(error);
    }
});

app.action('app_home_unassigned_user_select', async ({body, action, ack, client, context}) => {
    try {
        await ack();

        const user = action.selected_user
        const userEmail = (await client.users.profile.get({
            user
        })).profile.email

        const jiraId = extractJiraId(action.block_id)
        await assignHelpRequest(jiraId, userEmail)

        await reopenAppHome(client, user);
    } catch (error) {
        console.error(error);
    }
})

app.action('app_home_take_unassigned_issue', async ({body, action, ack, client, context}) => {
    try {
        await ack();

        const user = body.user.id
        const userEmail = (await client.users.profile.get({
            user
        })).profile.email

        const jiraId = extractJiraId(action.block_id)

        await assignHelpRequest(jiraId, userEmail)

        await reopenAppHome(client, user);
    } catch (error) {
        console.error(error);
    }
})

app.action('assign_help_request_to_user', async ({body, action, ack, client, context}) => {
    try {
        await ack();

        const user = action.selected_user

        const jiraId = extractJiraIdFromBlocks(body.message.blocks)
        const userEmail = (await client.users.profile.get({
            user
        })).profile.email

        await assignHelpRequest(jiraId, userEmail)

        const actor = body.user.id

        await client.chat.postMessage({
            channel: body.channel.id,
            thread_ts: body.message.ts,
            text: `Hi, <@${user}>, you've just been assigned to this help request by <@${actor}>`
        });
    } catch (error) {
        console.error(error);
    }
});

/**
 * The built in string replace function can't return a promise
 * This is an adapted version that is able to do that
 * Source: https://stackoverflow.com/a/48032528/4951015
 *
 * @param str source string
 * @param regex the regex to apply to the string
 * @param asyncFn function to transform the string with, arguments should include match and any capturing groups
 * @returns {Promise<*>} result of the replace
 */
async function replaceAsync(str, regex, asyncFn) {
    const promises = [];
    str.replace(regex, (match, ...args) => {
        const promise = asyncFn(match, ...args);
        promises.push(promise);
    });
    const data = await Promise.all(promises);
    return str.replace(regex, () => data.shift());
}

app.event('message', async ({event, context, client, say}) => {
    try {
        // filter unwanted channels in case someone invites the bot to it
        // and only look at threaded messages
        if (event.channel === reportChannelId && event.thread_ts) {
            const slackLink = (await client.chat.getPermalink({
                channel: event.channel,
                'message_ts': event.thread_ts
            })).permalink

            const user = (await client.users.profile.get({
                user: event.user
            }))

            const displayName = user.profile.display_name

            const helpRequestMessages = (await client.conversations.replies({
                channel: event.channel,
                ts: event.thread_ts,
                limit: 200, // after a thread is 200 long we'll break but good enough for now
            })).messages

            if (helpRequestMessages.length > 0 && helpRequestMessages[0].text === 'New support request raised') {
                const jiraId = extractJiraIdFromBlocks(helpRequestMessages[0].blocks)

                const groupRegex = /<!subteam\^.+\|([^>.]+)>/g
                const usernameRegex = /<@([^>.]+)>/g

                let possibleNewTargetText = event.text.replace(groupRegex, (match, $1) => $1)

                const newTargetText = await replaceAsync(possibleNewTargetText, usernameRegex, async (match, $1) => {
                    const user = (await client.users.profile.get({
                        user: $1
                    }))
                    return `@${user.profile.display_name}`
                });

                await addCommentToHelpRequest(jiraId, {
                    slackLink,
                    displayName,
                    message: newTargetText
                })
            } else {
                // either need to implement pagination or find a better way to get the first message in the thread
                console.warn("Could not find jira ID, possibly thread is longer than 200 messages, TODO implement pagination");
            }
        }
    } catch (error) {
        console.error(error);
    }
})
