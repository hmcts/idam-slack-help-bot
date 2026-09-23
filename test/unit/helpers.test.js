const { convertIso8601ToEpochSeconds, extractSlackLinkFromText } = require('../../src/util/helpers');


describe('convertIso8601ToEpochSeconds', () => {
    it('returns undefined if undefined', () => {
        expect(convertIso8601ToEpochSeconds(undefined)).toBe(undefined)
    })
    it('converts iso time to epoch second', () => {
        expect(convertIso8601ToEpochSeconds('2021-01-26T12:00:20.000+0000'))
            .toBe(1611662420)
    })
})

describe('extractSlackLinkFromText', () => {
    it('returns undefined when undefined', () => {
        expect(extractSlackLinkFromText(undefined)).toBe(undefined)
    })
    it('returns undefined when no match', () => {
        expect(extractSlackLinkFromText("hello world")).toBe(undefined)
    })
    it('returns slack message link when found', () => {
        expect(extractSlackLinkFromText("h6. _This is an automatically generated ticket created from Slack, do not reply or update in here, [view in Slack|https://platformengin-tzf2541.slack.com/archives/C01KHKNJUKE/p1611568116006500]_"))
            .toBe('https://platformengin-tzf2541.slack.com/archives/C01KHKNJUKE/p1611568116006500')
    })
    it('returns a Slack message link from an ADF description', () => {
        const description = {
            type: 'doc',
            version: 1,
            content: [{
                type: 'paragraph',
                content: [{
                    type: 'text',
                    text: 'view in Slack',
                    marks: [{
                        type: 'link',
                        attrs: {href: 'https://platformengin-tzf2541.slack.com/archives/C01KHKNJUKE/p1611568116006500'}
                    }]
                }]
            }]
        }

        expect(extractSlackLinkFromText(description))
            .toBe('https://platformengin-tzf2541.slack.com/archives/C01KHKNJUKE/p1611568116006500')
    })
    it('ignores non-Slack links in an ADF description', () => {
        const description = {
            type: 'doc',
            version: 1,
            content: [{
                type: 'paragraph',
                content: [{
                    type: 'text',
                    text: 'view elsewhere',
                    marks: [{type: 'link', attrs: {href: 'https://example.com'}}]
                }]
            }]
        }

        expect(extractSlackLinkFromText(description)).toBe(undefined)
    })
})
