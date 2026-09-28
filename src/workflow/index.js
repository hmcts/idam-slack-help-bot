const {supportRequestFunction} = require("./supportRequestStep");
const {bugReportFunction} = require("./bugReportStep");
const {newOidcServiceFunction} = require("./newOidcServiceStep");
const {newBugReportFunction} = require("./newBugReportStep");
const {newSupportRequestFunction} = require("./newSupportRequestStep");
const {getServiceStatusFunction} = require("./getServiceStatusStep");
const {newUserRoleRequestFunction} = require("./newRoleRequestStep");

const workflowFunctions = [
    supportRequestFunction,
    bugReportFunction,
    newOidcServiceFunction,
    newBugReportFunction,
    newSupportRequestFunction,
    getServiceStatusFunction,
    newUserRoleRequestFunction
];

function registerWorkflowFunctions(app) {
    workflowFunctions.forEach(({callbackId, listener}) => {
        app.function(callbackId, listener);
    });
}

module.exports = {
    registerWorkflowFunctions,
    workflowFunctions
};
