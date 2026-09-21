function convertIso8601ToEpochSeconds(isoTime) {
    if (isoTime === undefined) {
        return undefined
    }

    return Date.parse(isoTime) / 1000
}

function extractSlackLinkFromText(text) {
    if (text === undefined || text === null) {
        return undefined
    }

    if (typeof text === 'object') {
        return extractSlackLinkFromAdf(text)
    }

    const slackLinkRegex = /view in Slack\|(https:\/\/.+slack\.com.+)]/
    const regexResult = slackLinkRegex.exec(text);
    if (regexResult === null) {
        return undefined
    }
    return regexResult[1]
}

function extractSlackLinkFromAdf(node) {
    if (Array.isArray(node)) {
        for (const child of node) {
            const link = extractSlackLinkFromAdf(child)
            if (link) return link
        }
        return undefined
    }

    if (!node || typeof node !== 'object') {
        return undefined
    }

    const linkMark = node.marks?.find(mark => mark.type === 'link')
    if (linkMark?.attrs?.href && isSlackLink(linkMark.attrs.href)) {
        return linkMark.attrs.href
    }

    return extractSlackLinkFromAdf(node.content)
}

function isSlackLink(value) {
    try {
        const url = new URL(value)
        return url.protocol === 'https:' && (url.hostname === 'slack.com' || url.hostname.endsWith('.slack.com'))
    } catch (err) {
        return false
    }
}

function convertJiraKeyToUrl(jiraId) {
    return `https://hmcts.atlassian.net/browse/${jiraId}`;
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
