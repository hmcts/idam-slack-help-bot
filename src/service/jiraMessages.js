function textNode(text, marks) {
    const node = {
        type: 'text',
        text: String(text)
    }

    if (marks) {
        node.marks = marks
    }

    return node
}

function paragraph(content) {
    return {
        type: 'paragraph',
        content
    }
}

function textParagraphs(value) {
    return String(value).split('\n').map(line => paragraph([textNode(line || ' ')]))
}

function shortField(prefix, value) {
    if (!value) {
        return []
    }

    return [paragraph([
        textNode(`${prefix}:`, [{type: 'strong'}]),
        textNode(` ${value}`)
    ])]
}

function longField(title, value) {
    if (!value) {
        return []
    }

    return [
        paragraph([textNode(title, [{type: 'strong'}])]),
        ...textParagraphs(value)
    ]
}

function slackNotice(message, slackLink) {
    const content = [textNode(`${message}, `, [{type: 'em'}])]

    if (slackLink) {
        content.push(textNode('view in Slack', [
            {type: 'em'},
            {
                type: 'link',
                attrs: {href: slackLink}
            }
        ]))
    }

    return {
        type: 'heading',
        attrs: {level: 6},
        content
    }
}

function adfDocument(content) {
    return {
        type: 'doc',
        version: 1,
        content
    }
}

function mapFieldsToDescription(fields) {
    return adfDocument([
        slackNotice('This is an automatically generated ticket created from Slack, do not reply or update in here', fields.slackLink),
        ...shortField('Environment', fields.environment),
        ...shortField('Service affected', fields.service),
        ...shortField('User affected', fields.userAffected),
        ...shortField('Date issue Occurred', fields.date),
        ...shortField('Time issue Occurred', fields.time),
        ...shortField('Impact to user and/or service', fields.impact),
        ...shortField('Affected roles', fields.roles),
        ...longField('Issue description', fields.description),
        ...longField('Analysis done so far', fields.analysis),
        ...longField('Steps to reproduce', fields.steps),
        ...longField('Expected behaviour', fields.expected),
        ...longField('Actual behaviour', fields.actual)
    ])
}

function createComment({slackLink, displayName, message}) {
    return adfDocument([
        slackNotice('This is an automatically added comment created from Slack, do not reply or update in here', slackLink),
        {
            type: 'heading',
            attrs: {level: 6},
            content: [textNode(`${displayName}:`)]
        },
        ...textParagraphs(message)
    ])
}

module.exports.mapFieldsToDescription = mapFieldsToDescription
module.exports.createComment = createComment
