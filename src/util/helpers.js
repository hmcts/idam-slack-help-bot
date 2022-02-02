function convertIso8601ToEpochSeconds(isoTime) {
    if (isoTime === undefined) {
        return undefined
    }

    return Date.parse(isoTime) / 1000
}

function extractSlackLinkFromText(text) {
    if (text === undefined) {
        return undefined
    }

    const slackLinkRegex = /view in Slack\|(https:\/\/.+slack\.com.+)]/
    const regexResult = slackLinkRegex.exec(text);
    if (regexResult === null) {
        return undefined
    }
    return regexResult[1]
}

function convertJiraKeyToUrl(jiraId) {
    return `https://tools.hmcts.net/jira/browse/${jiraId}`;
}

const title = (summary) => {
    return {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `*${summary}*`,
        }
    }
}

const jiraView = (jiraId) => {
    return  {
        "type": "context",
        "elements": [
            {
                "type": "mrkdwn",
                "text": `View on Jira: <${convertJiraKeyToUrl(jiraId)}|${jiraId}>`
            }
        ]
    }
}

const action = () => {
    return {
        "type": "actions",
        "block_id": "actions",
        "elements": [
            {
                "type": "users_select",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Unassigned",
                    "emoji": true
                },
                "action_id": "assign_help_request_to_user"
            },
            button(":raising_hand: Take it", "assign_help_request_to_me"),
            button(":female-firefighter: Start", "start_help_request"),
            button(":broom: Withdraw", "withdraw_help_request")
        ]
    }
}

const button = (text, action) => {
    return {
        "type": "button",
        "text": {
            "type": "plain_text",
            "text": text,
            "emoji": true
        },
        "style": "primary",
        "value": action,
        "action_id": action
    }
}

const textField = (text) => {
    return {
        "type": "mrkdwn",
        "text": text
    }
}

const slackRequestText = 'New request raised from Slack'

module.exports = {
    convertIso8601ToEpochSeconds,
    extractSlackLinkFromText,
    convertJiraKeyToUrl,
    title,
    jiraView,
    action,
    button,
    textField,
    slackRequestText
}

