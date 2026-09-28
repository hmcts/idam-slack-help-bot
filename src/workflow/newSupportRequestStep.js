const config = require("config");
const {createSupportRequestAnnouncement} = require("../messages");
const {createEphemeralAnnouncementFunction} = require("./customFunction");

const newSupportRequestFunction = createEphemeralAnnouncementFunction(
    'new_support_request_step',
    'IDAM Support',
    createSupportRequestAnnouncement,
    config.get('slack.report_channel_id')
);

module.exports.newSupportRequestFunction = newSupportRequestFunction;
