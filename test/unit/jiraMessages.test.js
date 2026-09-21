const {createComment, mapFieldsToDescription} = require('../../src/service/jiraMessages')

describe('Jira v3 messages', () => {
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
