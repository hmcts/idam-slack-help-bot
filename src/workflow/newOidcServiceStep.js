const config = require("config");
const {createOIDCServiceAnnouncement} = require("../messages");
const {createEphemeralAnnouncementFunction} = require("./customFunction");

const newOidcServiceFunction = createEphemeralAnnouncementFunction(
    'new_service_step',
    'IDAM Support',
    createOIDCServiceAnnouncement,
    config.get('slack.report_channel_id')
);

module.exports.newOidcServiceFunction = newOidcServiceFunction;
