const {handleBugReport} = require("../service/helpRequestManager");
const {createCustomFunction} = require("./customFunction");

const bugReportFunction = createCustomFunction('bug_report_step', async ({inputs, client}) => {
    const user = inputs.user;
    const helpRequest = {
        user,
        summary: inputs.summary,
        description: inputs.description || "N/A",
        analysis: inputs.analysis || "N/A",
        environment: inputs.environment || "N/A",
        service: inputs.service || "N/A",
        impact: inputs.impact || "N/A",
        roles: inputs.roles || "N/A",
        steps: inputs.steps || "N/A",
        expected: inputs.expected || "N/A",
        actual: inputs.actual || "N/A"
    };

    await handleBugReport(client, user, helpRequest);
});

module.exports.bugReportFunction = bugReportFunction;
