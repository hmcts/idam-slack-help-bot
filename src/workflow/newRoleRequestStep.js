const config = require("config");
const {createRoleAnnouncementInfo} = require("../messages");
const {createEphemeralAnnouncementFunction} = require("./customFunction");

const newUserRoleRequestFunction = createEphemeralAnnouncementFunction(
    'new_user_role_service_step',
    'IDAM Support',
    createRoleAnnouncementInfo,
    config.get('slack.report_channel_id')
);

module.exports.newUserRoleRequestFunction = newUserRoleRequestFunction;
