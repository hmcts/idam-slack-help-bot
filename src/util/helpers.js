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

module.exports = {
    convertIso8601ToEpochSeconds,
    extractSlackLinkFromText,
    convertJiraKeyToUrl
}
