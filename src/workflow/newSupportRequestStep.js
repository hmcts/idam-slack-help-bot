const {WorkflowStep} = require("@slack/bolt");
const config = require("config");
const {createSupportRequestAnnouncement} = require("../messages");
const reportChannelId = config.get('slack.report_channel_id');

function createNewSupportRequestWorkflowStep() {
    return new WorkflowStep('new_support_request_step', {
        edit: async ({ ack, step, configure, client }) => {
            await ack();

            const blocks = workflowStepBlocks(step.inputs);
            await configure({ blocks });
        },
        save: async ({ ack, step, view, update, client }) => {
            await ack();

            const { values } = view.state;
            const inputs = workflowStepView(values);
            const outputs = [];
            await update({ inputs, outputs });
        },
        execute: async ({ step, complete, fail, client }) => {
            try {
                await client.chat.postEphemeral({
                    channel: reportChannelId,
                    user: step.inputs.user.value,
                    username: 'IDAM Support',
                    blocks: createSupportRequestAnnouncement()
                });
            } catch (error) {
                console.error(error);
            }
        }
    });
}

function workflowStepBlocks(inputs) {
    return [
        {
            "type": "input",
            "block_id": "user",
            "label": {
                "type": "plain_text",
                "text": "Ticket raiser"
            },
            "element": {
                "type": "users_select",
                "action_id": "user",
                "initial_user": inputs?.user?.value ?? " ",
            }
        }
    ];
}

function workflowStepView(values) {
    return {
        user: {
            value: values.user.user.selected_user
        }
    }
}

module.exports.createNewSupportRequestWorkflowStep = createNewSupportRequestWorkflowStep