const {handleNewServiceRequest} = require("../service/helpRequestManager");
const {WorkflowStep} = require("@slack/bolt");

function createNewServiceRequestWorkflowStep() {
    return new WorkflowStep('new_service_step', {
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
                    service: inputs.service.value,
                    description: inputs.description.value,
                    client_id: inputs.client_id.value,
                    client_secret: inputs.client_secret.value || "N/A",
                    key_vault: inputs.key_vault.value,
                    redirect_uri: inputs.redirect_uri.value || "N/A",
                    self_registration: inputs.self_registration.value || "N/A",
                    mfa: inputs.mfa.value || "N/A",
                    sso: inputs.sso.value,
                    admin_management: inputs.admin_management.value,
                    super_user: inputs.super_user.value,
                    user_search: inputs.user_search.value,
                    user_registration: inputs.user_registration.value,
                    user_management: inputs.user_management.value
                }
                await handleNewServiceRequest(client, user, helpRequest)
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
                "text": "Summary"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "title",
                "initial_value": inputs?.summary?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "service",
            "label": {
                "type": "plain_text",
                "text": "Service name"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "service",
                "initial_value": inputs?.service?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "description",
            "label": {
                "type": "plain_text",
                "text": "Service description"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "description",
                "initial_value": inputs?.description?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "id",
            "label": {
                "type": "plain_text",
                "text": "Service client ID"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "id",
                "initial_value": inputs?.client_id?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "secret",
            "label": {
                "type": "plain_text",
                "text": "Service client secret name"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "secret",
                "initial_value": inputs?.client_secret?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "key_vault",
            "label": {
                "type": "plain_text",
                "text": "Service Azure key vault instance"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "key_vault",
                "initial_value": inputs?.key_vault?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "redirect",
            "label": {
                "type": "plain_text",
                "text": "Service redirect URIs"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "uri",
                "initial_value": inputs?.redirect_uri?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "self_registration",
            "label": {
                "type": "plain_text",
                "text": "Self-registration enabled?"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "self_registration",
                "initial_value": inputs?.self_registration?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "mfa",
            "label": {
                "type": "plain_text",
                "text": "MFA enabled?"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "mfa",
                "initial_value": inputs?.mfa?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "sso",
            "label": {
                "type": "plain_text",
                "text": "Judicial SSO enabled?"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "sso",
                "initial_value": inputs?.sso?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "admin_management",
            "label": {
                "type": "plain_text",
                "text": "Super user or admin user access for managing users required?"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "admin_management",
                "initial_value": inputs?.admin_management?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "super_user",
            "label": {
                "type": "plain_text",
                "text": "Super user email address"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "email",
                "initial_value": inputs?.super_user?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "user_search",
            "label": {
                "type": "plain_text",
                "text": "User search via API enabled?"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "user_search",
                "initial_value": inputs?.user_search?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "user_registration",
            "label": {
                "type": "plain_text",
                "text": "User registration via API enabled?"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "user_registration",
                "initial_value": inputs?.user_registration?.value ?? ""
            }
        },
        {
            "type": "input",
            "block_id": "user_management",
            "label": {
                "type": "plain_text",
                "text": "User management via API enabled?"
            },
            "element": {
                "type": "plain_text_input",
                "action_id": "user_management",
                "initial_value": inputs?.user_management?.value ?? ""
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
        service: {
            value: values.service.service.value
        },
        description: {
            value: values.description.description.value
        },
        client_id: {
            value: values.id.id.value
        },
        client_secret: {
            value: values.secret.secret.value
        },
        key_vault: {
            value: values.key_vault.key_vault.value
        },
        redirect_uri: {
            value: values.redirect.uri.value
        },
        self_registration: {
            value: values.self_registration.self_registration.value
        },
        mfa: {
            value: values.mfa.mfa.value
        },
        sso: {
            value: values.sso.sso.value
        },
        admin_management: {
            value: values.admin_management.admin_management.value
        },
        super_user: {
            value: values.super_user.email.value
        },
        user_search: {
            value: values.user_search.user_search.value
        },
        user_registration: {
            value: values.user_registration.user_registration.value
        },
        user_management: {
            value: values.user_management.user_management.value
        },
        user: {
            value: values.user.user.selected_user
        }
    };
}

module.exports.createNewServiceRequestWorkflowStep = createNewServiceRequestWorkflowStep