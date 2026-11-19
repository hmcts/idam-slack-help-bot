const {Readable} = require('stream')

async function downloadSlackFile(file, botToken) {
    const downloadUrl = file.url_private_download || file.url_private

    if (!downloadUrl) {
        throw new Error(`Slack file ${file.id || file.name || 'unknown'} has no download URL`)
    }

    const response = await fetch(downloadUrl, {
        headers: {
            Authorization: `Bearer ${botToken}`
        }
    })

    if (!response.ok) {
        throw new Error(`Failed to download Slack file ${file.id || file.name || 'unknown'}: HTTP ${response.status}`)
    }

    if (!response.body) {
        throw new Error(`Slack file ${file.id || file.name || 'unknown'} returned an empty response`)
    }

    const stream = Readable.fromWeb(response.body)
    stream.path = file.name || file.id || 'slack-file'
    return stream
}

module.exports.downloadSlackFile = downloadSlackFile
