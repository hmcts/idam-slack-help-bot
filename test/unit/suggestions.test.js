const {supportRequestSuggestions} = require('../../src/service/suggestions')

describe('supportRequestSuggestions', () => {
    it.each([
        ['summary', {summary: 'create a service for my team', description: 'More detail'}],
        ['description', {summary: 'Access request', description: 'We need to add role configuration'}]
    ])('suggests idam-access-config when a matching phrase appears in the %s', (_field, request) => {
        const suggestions = supportRequestSuggestions(request)

        expect(suggestions).toHaveLength(1)
        expect(suggestions[0]).toMatchObject({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: expect.stringContaining('idam-access-config')
            }
        })
    })

    it('returns no suggestions for an unrelated request', () => {
        expect(supportRequestSuggestions({
            summary: 'Unable to sign in',
            description: 'The user receives an error'
        })).toEqual([])
    })

    it('adds the suggestion only once when several phrases match', () => {
        expect(supportRequestSuggestions({
            summary: 'create a service',
            description: 'also create a role'
        })).toHaveLength(1)
    })
})
