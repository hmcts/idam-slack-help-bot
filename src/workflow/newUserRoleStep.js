const {handleNewRoleRequest} = require("../service/helpRequestManager");
const {WorkflowStep} = require("@slack/bolt");

function createNewRoleRequestWorkflowStep() {
    return new WorkflowStep('new_role_step', {
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
            const {inputs} = step;
            const user = inputs.user.value;

            try {
                const helpRequest = {
                    user,
                    summary: inputs.summary.value,
                    team: inputs.team.value,
                    role: inputs.role.value,
                    description: inputs.description.value || "N/A",
                    ccd_admin: inputs.ccd_admin.value,
                    prd_admin: inputs.prd_admin.value,
                }
                await handleNewRoleRequest(client, user, helpRequest)
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
            "block_id": "summary",
            "label": {
                "type": "plain_text",
                "text": "summary"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "title",
                "initial_value": inputs?.summary?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "team",
            "label": {
                "type": "plain_text",
                "text": "Reporter team"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "team",
                "initial_value": inputs?.team?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "role",
            "label": {
                "type": "plain_text",
                "text": "Role name"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "role",
                "initial_value": inputs?.role?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "description",
            "label": {
                "type": "plain_text",
                "text": "Role description"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "description",
                "initial_value": inputs?.description?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "ccd",
            "label": {
                "type": "plain_text",
                "text": "Can CCD admin users manage this role?"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "admin",
                "initial_value": inputs?.ccd_admin?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "prd",
            "label": {
                "type": "plain_text",
                "text": "Can PRD admin users manage this role?"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "admin",
                "initial_value": inputs?.prd_admin?.value ?? ""
            }
        },
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
        summary: {
            value: values.summary.title.value
        },
        team: {
            value: values.team.team.value
        },
        role: {
            value: values.role.role.value
        },
        description: {
            value: values.description.description.value
        },
        ccd_admin: {
            value: values.ccd.admin.value
        },
        prd_admin: {
            value: values.prd.admin.value
        },
        user: {
            value: values.user.user.selected_user
        }
    };
}

module.exports.createNewRoleRequestWorkflowStep = createNewRoleRequestWorkflowStep