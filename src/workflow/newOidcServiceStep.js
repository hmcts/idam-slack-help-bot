const {WorkflowStep} = require("@slack/bolt");

function createNewServiceRequestWorkflowStep() {
    return new WorkflowStep('new_service_step', {
        edit: async ({ ack, step, configure, client }) => {
            await ack();
            const blocks = workflowStepBlocks();
            await configure({ blocks });
        },
        save: async ({ ack, step, view, update, client }) => {
            await ack();
            const inputs = [];
            const outputs = [];
            await update({ inputs, outputs });
        },
        execute: async ({ step, complete, fail, client }) => {
        }
    });
}

function workflowStepBlocks() {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*UPDATE 23rd of May 2022*\n\nService creation is now managed by the <https://github.com/hmcts/idam-access-config|idam-access-config> pipeline. Please refer to the <https://github.com/hmcts/idam-access-config/blob/master/README.md|README> or have a look at how other teams have implemented their services."
            }
        }
    ];
}

module.exports.createNewServiceRequestWorkflowStep = createNewServiceRequestWorkflowStep