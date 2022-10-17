const accessConfigPhrases = [
    'create a service',
    'create service',
    'new service',
    'add service',
    'create a role',
    'create role',
    'new role',
    'add role'
];
const accessConfigSuggestion = {
    "type": "section",
    "text": {
        "type": "mrkdwn",
        "text": "_Service creation, role creation and adding a role are now managed by the <https://github.com/hmcts/idam-access-config|idam-access-config> pipeline. Please refer to the <https://github.com/hmcts/idam-access-config/blob/master/README.md|README> or have a look at how other teams have implemented their services._"
    }
};

function supportRequestSuggestions({
                                summary,
                                description
}) {
    const suggestionBlocks = [];

    if (hasPhrase(accessConfigPhrases, summary, description)) {
        suggestionBlocks.push(accessConfigSuggestion);
    }

    return suggestionBlocks;
}

function hasPhrase(phrases, summary, description) {
    return phrases.some(phrase => summary.includes(phrase) || description.includes(phrase))
}

module.exports.supportRequestSuggestions = supportRequestSuggestions;