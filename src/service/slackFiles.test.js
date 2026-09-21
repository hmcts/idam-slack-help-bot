const {Readable} = require('stream')
const {downloadSlackFile} = require('./slackFiles')
const originalFetch = global.fetch

describe('downloadSlackFile', () => {
    beforeEach(() => {
        global.fetch = jest.fn()
    })

    afterEach(() => {
        global.fetch = originalFetch
    })

    it('downloads a private Slack file as a named stream', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            body: Readable.toWeb(Readable.from([Buffer.from('image data')]))
        })

        const stream = await downloadSlackFile({
            id: 'F123',
            name: 'screenshot.png',
            url_private_download: 'https://files.slack.com/files-pri/download/screenshot.png'
        }, 'xoxb-token')

        expect(global.fetch).toHaveBeenCalledWith(
            'https://files.slack.com/files-pri/download/screenshot.png',
            {headers: {Authorization: 'Bearer xoxb-token'}}
        )
        expect(stream.path).toBe('screenshot.png')

        const chunks = []
        for await (const chunk of stream) {
            chunks.push(chunk)
        }
        expect(Buffer.concat(chunks).toString()).toBe('image data')
    })

    it('falls back to the private URL and file ID when no download URL or name is supplied', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            body: Readable.toWeb(Readable.from([Buffer.from('file data')]))
        })

        const stream = await downloadSlackFile({
            id: 'F456',
            url_private: 'https://files.slack.com/files-pri/F456'
        }, 'xoxb-token')

        expect(global.fetch).toHaveBeenCalledWith(
            'https://files.slack.com/files-pri/F456',
            {headers: {Authorization: 'Bearer xoxb-token'}}
        )
        expect(stream.path).toBe('F456')
    })

    it('uses a generic filename when Slack supplies neither a name nor an ID', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            body: Readable.toWeb(Readable.from([Buffer.from('file data')]))
        })

        const stream = await downloadSlackFile({
            url_private: 'https://files.slack.com/files-pri/unknown'
        }, 'xoxb-token')

        expect(stream.path).toBe('slack-file')
    })

    it('fails before fetching when Slack supplies no download URL', async () => {
        await expect(downloadSlackFile({name: 'screenshot.png'}, 'xoxb-token'))
            .rejects.toThrow('Slack file screenshot.png has no download URL')

        expect(global.fetch).not.toHaveBeenCalled()
    })

    it('reports an unknown Slack file when no identifying metadata or URL is supplied', async () => {
        await expect(downloadSlackFile({}, 'xoxb-token'))
            .rejects.toThrow('Slack file unknown has no download URL')
    })

    it('fails with the Slack response status when a download is rejected', async () => {
        global.fetch.mockResolvedValue({ok: false, status: 403})

        await expect(downloadSlackFile({
            id: 'F123',
            url_private: 'https://files.slack.com/files-pri/image.png'
        }, 'xoxb-token')).rejects.toThrow('Failed to download Slack file F123: HTTP 403')
    })

    it.each([
        [{name: 'forbidden.png'}, 'forbidden.png'],
        [{}, 'unknown']
    ])('uses available file metadata in rejected download errors', async (file, expectedName) => {
        global.fetch.mockResolvedValue({ok: false, status: 403})

        await expect(downloadSlackFile({
            ...file,
            url_private: 'https://files.slack.com/files-pri/forbidden'
        }, 'xoxb-token')).rejects.toThrow(`Failed to download Slack file ${expectedName}: HTTP 403`)
    })

    it('fails when Slack returns no response body', async () => {
        global.fetch.mockResolvedValue({ok: true, status: 200, body: null})

        await expect(downloadSlackFile({
            name: 'empty.png',
            url_private_download: 'https://files.slack.com/files-pri/empty.png'
        }, 'xoxb-token')).rejects.toThrow('Slack file empty.png returned an empty response')
    })

    it('reports an unknown Slack file when an unidentified download has no response body', async () => {
        global.fetch.mockResolvedValue({ok: true, status: 200, body: null})

        await expect(downloadSlackFile({
            url_private: 'https://files.slack.com/files-pri/empty'
        }, 'xoxb-token')).rejects.toThrow('Slack file unknown returned an empty response')
    })
})
