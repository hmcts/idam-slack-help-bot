const mockCreateHelpRequest = jest.fn()
const mockUpdateHelpRequestDescription = jest.fn()
const mockSupportRequestRaised = jest.fn()
const mockSupportRequestDetails = jest.fn()
const mockBugRaised = jest.fn()
const mockBugDetails = jest.fn()
const mockSupportRequestSuggestions = jest.fn()

jest.mock('../../src/service/persistence', () => ({
    createHelpRequest: mockCreateHelpRequest,
    updateHelpRequestDescription: mockUpdateHelpRequestDescription
}))

jest.mock('../../src/messages', () => ({
    supportRequestRaised: mockSupportRequestRaised,
    supportRequestDetails: mockSupportRequestDetails,
    bugRaised: mockBugRaised,
    bugDetails: mockBugDetails,
    newRoleRequestRaised: jest.fn()
}))

jest.mock('../../src/service/suggestions', () => ({
    supportRequestSuggestions: mockSupportRequestSuggestions
}))

jest.mock('@hmcts/properties-volume', () => ({
    addTo: config => config
}))

const {JiraType} = require('../../src/service/jiraTicketTypes')
const {handleBugReport, handleSupportRequest} = require('../../src/service/helpRequestManager')

function slackClient() {
    return {
        users: {
            profile: {
                get: jest.fn().mockResolvedValue({profile: {email: 'user@hmcts.net'}})
            }
        },
        chat: {
            postMessage: jest.fn()
                .mockResolvedValueOnce({channel: 'report-channel', message: {ts: '123.456'}})
                .mockResolvedValue({}),
            getPermalink: jest.fn().mockResolvedValue({permalink: 'https://example.slack.com/archives/C123/p123456'})
        }
    }
}

describe('helpRequestManager', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
        console.log.mockRestore()
    })

    it('creates a support request, posts its Slack thread and saves the permalink in Jira', async () => {
        const client = slackClient()
        const helpRequest = {summary: 'Unable to sign in', description: 'Login failed'}
        const infoBlocks = [{type: 'section'}]
        const detailBlocks = [{type: 'context'}]
        const suggestionBlocks = [{type: 'section'}]

        mockCreateHelpRequest.mockResolvedValue('SBOX-101')
        mockSupportRequestRaised.mockReturnValue(infoBlocks)
        mockSupportRequestDetails.mockReturnValue(detailBlocks)
        mockSupportRequestSuggestions.mockReturnValue(suggestionBlocks)

        await handleSupportRequest(client, 'U123', helpRequest)

        expect(client.users.profile.get).toHaveBeenCalledWith({user: 'U123'})
        expect(mockCreateHelpRequest).toHaveBeenCalledWith(helpRequest, 'user@hmcts.net')
        expect(client.chat.postMessage).toHaveBeenNthCalledWith(1, {
            channel: 'bot-test',
            text: 'New request raised from Slack',
            blocks: infoBlocks
        })
        expect(client.chat.postMessage).toHaveBeenNthCalledWith(2, {
            channel: 'bot-test',
            thread_ts: '123.456',
            text: 'New request raised from Slack',
            blocks: detailBlocks
        })
        expect(client.chat.postMessage).toHaveBeenNthCalledWith(3, {
            channel: 'bot-test',
            thread_ts: '123.456',
            text: 'New request raised from Slack',
            blocks: suggestionBlocks
        })
        expect(client.chat.getPermalink).toHaveBeenCalledWith({
            channel: 'report-channel',
            message_ts: '123.456'
        })
        expect(mockUpdateHelpRequestDescription).toHaveBeenCalledWith('SBOX-101', {
            ...helpRequest,
            slackLink: 'https://example.slack.com/archives/C123/p123456'
        })
    })

    it('creates a bug without requiring suggestion blocks', async () => {
        const client = slackClient()
        const helpRequest = {summary: 'Unexpected error', description: 'The page failed'}
        const infoBlocks = [{type: 'section'}]
        const detailBlocks = [{type: 'context'}]

        mockCreateHelpRequest.mockResolvedValue('SBOX-102')
        mockBugRaised.mockReturnValue(infoBlocks)
        mockBugDetails.mockReturnValue(detailBlocks)

        await handleBugReport(client, 'U456', helpRequest)

        expect(mockCreateHelpRequest).toHaveBeenCalledWith(
            helpRequest,
            'user@hmcts.net',
            JiraType.BUG.id
        )
        expect(client.chat.postMessage).toHaveBeenCalledTimes(2)
        expect(mockUpdateHelpRequestDescription).toHaveBeenCalledWith('SBOX-102', {
            ...helpRequest,
            slackLink: 'https://example.slack.com/archives/C123/p123456'
        })
    })
})
