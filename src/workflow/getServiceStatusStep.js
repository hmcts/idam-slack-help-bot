const config = require("config");
const {getAllServiceStatus} = require("../service/serviceStatus");
const {createCustomFunction} = require("./customFunction");

const getServiceStatusFunction = createCustomFunction('get_service_status_step', async ({inputs, client}) => {
    const blocks = [];

    Object.entries(getAllServiceStatus()).forEach(([envName, services]) => {
        blocks.push({
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "IDAM " + envName
            }
        });

        services.forEach(service => {
            blocks.push({
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": service.toString()
                }
            });
        });

        blocks.push({"type": "divider"});
    });

    blocks.push({
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": `\n>This information is up to date as of ${new Date().toLocaleString()} UTC \n`
        }
    });

    await client.chat.postEphemeral({
        channel: config.get('slack.report_channel_id'),
        user: inputs.user,
        username: 'IDAM Environment',
        blocks,
        text: 'Service status'
    });
});

module.exports.getServiceStatusFunction = getServiceStatusFunction;
