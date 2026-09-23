const mockAddAttachmentToHelpRequest = jest.fn()
const mockAddCommentToHelpRequest = jest.fn()
const mockDownloadSlackFile = jest.fn()

jest.mock('../../src/service/persistence', () => ({
    addAttachmentToHelpRequest: mockAddAttachmentToHelpRequest,
    addCommentToHelpRequest: mockAddCommentToHelpRequest
}))

jest.mock('../../src/service/slackFiles', () => ({
    downloadSlackFile: mockDownloadSlackFile
}))

const {syncSlackAttachments} = require('../../src/service/slackAttachments')

describe('syncSlackAttachments', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        console.error.mockRestore()
    })

    it('uploads every downloaded Slack attachment without adding a failure comment', async () => {
        const screenshotStream = {path: 'screenshot.png'}
        const logStream = {path: 'application.log'}
        mockDownloadSlackFile
            .mockResolvedValueOnce(screenshotStream)
            .mockResolvedValueOnce(logStream)
        mockAddAttachmentToHelpRequest.mockResolvedValue(undefined)

        await expect(syncSlackAttachments('SBOX-123', [
            {id: 'F1', name: 'screenshot.png'},
            {id: 'F2', name: 'application.log'}
        ], 'xoxb-token', 'https://example.slack.com/message')).resolves.toEqual([])

        expect(mockAddAttachmentToHelpRequest).toHaveBeenCalledWith('SBOX-123', screenshotStream)
        expect(mockAddAttachmentToHelpRequest).toHaveBeenCalledWith('SBOX-123', logStream)
        expect(mockAddCommentToHelpRequest).not.toHaveBeenCalled()
    })

    it('does nothing when the Slack message has no files', async () => {
        await expect(syncSlackAttachments(
            'SBOX-123',
            undefined,
            'xoxb-token',
            'https://example.slack.com/message'
        )).resolves.toEqual([])

        expect(mockDownloadSlackFile).not.toHaveBeenCalled()
        expect(mockAddAttachmentToHelpRequest).not.toHaveBeenCalled()
        expect(mockAddCommentToHelpRequest).not.toHaveBeenCalled()
    })

    it('adds a Jira comment for download and upload failures while processing every file', async () => {
        const uploadFailureStream = {path: 'upload-failure.png'}
        mockDownloadSlackFile
            .mockRejectedValueOnce(new Error('Slack returned 403'))
            .mockResolvedValueOnce(uploadFailureStream)
        mockAddAttachmentToHelpRequest.mockRejectedValueOnce(new Error('Jira rejected the attachment'))

        await expect(syncSlackAttachments('SBOX-123', [
            {id: 'F1', name: 'download-failure.png'},
            {id: 'F2', name: 'upload-failure.png'}
        ], 'xoxb-token', 'https://example.slack.com/message')).resolves.toEqual([
            'Failed to download attachment "download-failure.png" from Slack. Use the Slack link above to view it.',
            'Downloaded attachment "upload-failure.png" from Slack but failed to attach it to Jira. Use the Slack link above to view it.'
        ])

        expect(mockAddAttachmentToHelpRequest).toHaveBeenCalledWith('SBOX-123', uploadFailureStream)
        expect(mockAddCommentToHelpRequest).toHaveBeenCalledWith('SBOX-123', {
            slackLink: 'https://example.slack.com/message',
            displayName: 'IDAM Support Bot',
            message: [
                'Failed to download attachment "download-failure.png" from Slack. Use the Slack link above to view it.',
                'Downloaded attachment "upload-failure.png" from Slack but failed to attach it to Jira. Use the Slack link above to view it.'
            ].join('\n')
        })
    })

    it.each([
        [{id: 'F123'}, 'F123'],
        [{}, 'unknown file']
    ])('identifies an unnamed failed attachment as %s', async (file, expectedName) => {
        mockDownloadSlackFile.mockRejectedValue(new Error('Slack download failed'))

        await syncSlackAttachments(
            'SBOX-123',
            [file],
            'xoxb-token',
            'https://example.slack.com/message'
        )

        expect(mockAddCommentToHelpRequest).toHaveBeenCalledWith('SBOX-123', expect.objectContaining({
            message: `Failed to download attachment "${expectedName}" from Slack. Use the Slack link above to view it.`
        }))
    })
})
