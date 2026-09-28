const {handleSupportRequest} = require("../service/helpRequestManager");
const {createCustomFunction} = require("./customFunction");

const supportRequestFunction = createCustomFunction('support_request_step', async ({inputs, client}) => {
    const user = inputs.user;
    const helpRequest = {
        user,
        summary: inputs.summary,
        description: inputs.description || "N/A",
        analysis: inputs.analysis || "N/A",
        environment: inputs.environment || "N/A",
        service: inputs.service || "N/A",
        userAffected: inputs.user_affected || "N/A",
        date: inputs.date || "N/A",
        time: inputs.time || "N/A"
    };

    await handleSupportRequest(client, user, helpRequest);
});

module.exports.supportRequestFunction = supportRequestFunction;
