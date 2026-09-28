const config = require("config");
const {createReportIdamBugAnnouncement} = require("../messages");
const {createEphemeralAnnouncementFunction} = require("./customFunction");

const newBugReportFunction = createEphemeralAnnouncementFunction(
    'new_report_idam_bug_step',
    'IDAM Support',
    createReportIdamBugAnnouncement,
    config.get('slack.report_channel_id')
);

module.exports.newBugReportFunction = newBugReportFunction;
