const {handleBugReport} = require("../service/helpRequestManager");
const {WorkflowStep} = require("@slack/bolt");

function reportBugWorkflowStep() {
    return new WorkflowStep('bug_report_step', {
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
                    description: inputs.description.value,
                    analysis: inputs.analysis.value,
                    environment: inputs.environment.value || "N/A",
                    service: inputs.service.value,
                    impact: inputs.impact.value || "N/A",
                    roles: inputs.roles.value || "N/A",
                    steps: inputs.steps.value || "N/A",
                    expected: inputs.expected.value || "N/A",
                    actual: inputs.actual.value || "N/A"
                }
                await handleBugReport(client, user, helpRequest)
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
                "text": "Issue summary"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "title",
                "initial_value": inputs?.summary?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "description",
            "label": {
                "type": "plain_text",
                "text": "Issue description"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "description",
                "initial_value": inputs?.description?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "analysis",
            "label": {
                "type": "plain_text",
                "text": "What analysis has already been done?"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "analysis",
                "initial_value": inputs?.analysis?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "environment",
            "label": {
                "type": "plain_text",
                "text": "Environment"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "environment",
                "initial_value": inputs?.environment?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "service",
            "label": {
                "type": "plain_text",
                "text": "Service affected"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "service",
                "initial_value": inputs?.service?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "impact",
            "label": {
                "type": "plain_text",
                "text": "Impact to user and/or service"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "impact",
                "initial_value": inputs?.impact?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "roles",
            "label": {
                "type": "plain_text",
                "text": "Affected roles"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "roles",
                "initial_value": inputs?.roles?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "steps",
            "label": {
                "type": "plain_text",
                "text": "Steps to reproduce"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "steps",
                "initial_value": inputs?.steps?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "expected",
            "label": {
                "type": "plain_text",
                "text": "Expected behaviour"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "expected",
                "initial_value": inputs?.expected?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "actual",
            "label": {
                "type": "plain_text",
                "text": "Actual behaviour"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "actual",
                "initial_value": inputs?.actual?.value ?? ""
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
        description: {
            value: values.description.description.value
        },
        analysis: {
            value: values.analysis.analysis.value
        },
        environment: {
            value: values.environment.environment.value
        },
        service: {
            value: values.service.service.value
        },
        impact: {
            value: values.impact.impact.value
        },
        roles: {
            value: values.roles.roles.value
        },
        steps: {
            value: values.steps.steps.value
        },
        expected: {
            value: values.expected.expected.value
        },
        actual: {
            value: values.actual.actual.value
        },
        user: {
            value: values.user.user.selected_user
        }
    };
}

module.exports.reportBugWorkflowStep = reportBugWorkflowStep