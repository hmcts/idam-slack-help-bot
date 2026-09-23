const {createComment, mapFieldsToDescription} = require('../../src/service/jiraMessages')

function documentText(document) {
    if (Array.isArray(document)) {
        return document.map(documentText).join(' ')
    }
    if (!document || typeof document !== 'object') {
        return ''
    }
    return [document.text, documentText(document.content)].filter(Boolean).join(' ')
}

describe('Jira v3 messages', () => {
    it('creates an ADF issue description before a Slack permalink is available', () => {
        const description = mapFieldsToDescription({description: 'Login failed'})

        expect(description.content[0].content).toEqual([
            expect.objectContaining({
                text: 'This is an automatically generated ticket created from Slack, do not reply or update in here'
            })
        ])
        expect(description.content).toEqual(expect.arrayContaining([
            expect.objectContaining({
                type: 'paragraph',
                content: [expect.objectContaining({text: 'Login failed'})]
            })
        ]))
    })

    it('creates an ADF issue description containing the Slack link and supplied fields', () => {
        const description = mapFieldsToDescription({
            slackLink: 'https://example.slack.com/archives/channel/message',
            environment: 'Production',
            description: 'First line\nSecond line'
        })

        expect(description).toMatchObject({type: 'doc', version: 1})
        expect(description.content[0]).toMatchObject({type: 'heading', attrs: {level: 6}})
        expect(description.content[0].content[1].marks).toContainEqual({
            type: 'link',
            attrs: {href: 'https://example.slack.com/archives/channel/message'}
        })
        expect(description.content).toEqual(expect.arrayContaining([
            expect.objectContaining({
                type: 'paragraph',
                content: expect.arrayContaining([expect.objectContaining({text: ' Production'})])
            }),
            expect.objectContaining({
                type: 'paragraph',
                content: [expect.objectContaining({text: 'Second line'})]
            })
        ]))
    })

    it('includes every support and bug input in the Jira description', () => {
        const description = mapFieldsToDescription({
            environment: 'AAT',
            service: 'IDAM',
            userAffected: 'Case worker',
            date: '21 September 2026',
            time: '10:30',
            impact: 'Users cannot sign in',
            roles: 'caseworker, admin',
            description: 'Authentication fails after redirect',
            analysis: 'OIDC logs checked',
            steps: 'Open the login page and submit credentials',
            expected: 'The user reaches the dashboard',
            actual: 'The user sees an access denied page'
        })

        const text = documentText(description)
        const expectedText = [
            'Environment:', 'AAT',
            'Service affected:', 'IDAM',
            'User affected:', 'Case worker',
            'Date issue Occurred:', '21 September 2026',
            'Time issue Occurred:', '10:30',
            'Impact to user and/or service:', 'Users cannot sign in',
            'Affected roles:', 'caseworker, admin',
            'Issue description', 'Authentication fails after redirect',
            'Analysis done so far', 'OIDC logs checked',
            'Steps to reproduce', 'Open the login page and submit credentials',
            'Expected behaviour', 'The user reaches the dashboard',
            'Actual behaviour', 'The user sees an access denied page'
        ]

        expectedText.forEach(value => expect(text).toContain(value))
    })

    it('creates an ADF comment', () => {
        const comment = createComment({
            slackLink: 'https://example.slack.com/archives/channel/message',
            displayName: 'Alice',
            message: 'Can anyone help?'
        })

        expect(comment).toMatchObject({type: 'doc', version: 1})
        expect(comment.content).toEqual(expect.arrayContaining([
            expect.objectContaining({
                type: 'heading',
                content: [expect.objectContaining({text: 'Alice:'})]
            }),
            expect.objectContaining({
                type: 'paragraph',
                content: [expect.objectContaining({text: 'Can anyone help?'})]
            })
        ]))
    })
})
