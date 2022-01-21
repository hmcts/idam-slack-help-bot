function shortField(prefix, value) {
    if (value) {
        return `*${prefix}*: ${value}`
    }
    return ""
}

function longField(title, value) {
    if (value) {
        return `*${title}*\n\n${value}\n`
    }
    return ""
}

function mapFieldsToDescription(fields) {
    return `
h6. _This is an automatically generated ticket created from Slack, do not reply or update in here, [view in Slack|${fields.slackLink}]_

${shortField('Environment', fields.hasOwnProperty('environment') ? fields.environment : null)}

${shortField('Service affected', fields.hasOwnProperty('service') ? fields.service : null)}

${shortField('User affected', fields.hasOwnProperty('userAffected') ? fields.userAffected : null)}

${shortField('Date issue Occurred', fields.hasOwnProperty('date') ? fields.date : null)}

${shortField('Time issue Occurred', fields.hasOwnProperty('time') ? fields.time : null)}

${shortField('Impact to user and/or service', fields.hasOwnProperty('impact') ? fields.impact : null)}

${longField('Issue description', fields.hasOwnProperty('description') ? fields.description : null)}

${longField('Analysis done so far', fields.hasOwnProperty('analysis') ? fields.analysis : null)}

${longField('Steps to reproduce', fields.hasOwnProperty('steps') ? fields.steps : null)}

${longField('Expected behaviour', fields.hasOwnProperty('expected') ? fields.expected : null)}

${longField('Actual behaviour', fields.hasOwnProperty('actual') ? fields.actual : null)}
`
}

function createComment({slackLink, displayName, message}) {
return `
h6. _This is an automatically added comment created from Slack, do not reply or update in here, [view in Slack|${slackLink}]_

h6. ${displayName}:
${message}
`
}

module.exports.mapFieldsToDescription = mapFieldsToDescription
module.exports.createComment = createComment
