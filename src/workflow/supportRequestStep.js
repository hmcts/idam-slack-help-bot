// const {handleSupportRequest} = require("../service/helpRequestManager");
// const {WorkflowStep} = require("@slack/bolt");

// function createSupportRequestWorkflowStep() {
//     return new WorkflowStep('support_request_step', {
//         edit: async ({ ack, step, configure, client }) => {
//             await ack();

//             console.log("createSupportRequestWorkflowStep:edit");
            
//             const blocks = workflowStepBlocks(step.inputs);
//             await configure({ blocks });
//         },
//         save: async ({ ack, step, view, update, client }) => {
//             await ack();

//             const { values } = view.state;
//             const inputs = workflowStepView(values);
//             const outputs = [];
//             await update({ inputs, outputs });
//         },
//         execute: async ({ step, complete, fail, client }) => {
//             const {inputs} = step;
//             const user = inputs.user.value;

//             try {
//                 const helpRequest = {
//                     user,
//                     summary: inputs.summary.value,
//                     description: inputs.description.value || "N/A",
//                     analysis: inputs.analysis.value || "N/A",
//                     environment: inputs.environment.value || "N/A",
//                     service: inputs.service.value || "N/A",
//                     userAffected: inputs.user_affected.value || "N/A",
//                     date: inputs.date.value || "N/A",
//                     time: inputs.time.value || "N/A"
//                 }
//                 await handleSupportRequest(client, user, helpRequest)
//             } catch (error) {
//                 console.error(error);
//             }
//         }
//     });
// }

// function workflowStepBlocks(inputs) {
//     console.log("workflowStepBlocks");
//     return [
//         {
//             "type": "input",
//             "block_id": "summary",
//             "label": {
//                 "type": "plain_text",
//                 "text": "Issue summary"
//             },
//             "element": {
//                 "type": "plain_text_input",
//                 "action_id": "title",
//                 "initial_value": inputs?.summary?.value ?? ""
//             }
//         },
//         {
//             "type": "input",
//             "block_id": "description",
//             "label": {
//                 "type": "plain_text",
//                 "text": "Issue description"
//             },
//             "element": {
//                 "type": "plain_text_input",
//                 "action_id": "description",
//                 "initial_value": inputs?.description?.value ?? ""
//             }
//         },
//         {
//             "type": "input",
//             "block_id": "analysis",
//             "label": {
//                 "type": "plain_text",
//                 "text": "What analysis has been done so far?"
//             },
//             "element": {
//                 "type": "plain_text_input",
//                 "action_id": "analysis",
//                 "initial_value": inputs?.analysis?.value ?? ""
//             }
//         },
//         {
//             "type": "input",
//             "block_id": "environment",
//             "label": {
//                 "type": "plain_text",
//                 "text": "Environment"
//             },
//             "element": {
//                 "type": "plain_text_input",
//                 "action_id": "environment",
//                 "initial_value": inputs?.environment?.value ?? ""
//             }
//         },
//         {
//             "type": "input",
//             "block_id": "service",
//             "label": {
//                 "type": "plain_text",
//                 "text": "Service affected"
//             },
//             "element": {
//                 "type": "plain_text_input",
//                 "action_id": "service",
//                 "initial_value": inputs?.service?.value ?? ""
//             }
//         },
//         {
//             "type": "input",
//             "block_id": "user_affected",
//             "label": {
//                 "type": "plain_text",
//                 "text": "User affected"
//             },
//             "element": {
//                 "type": "plain_text_input",
//                 "action_id": "user_affected",
//                 "initial_value": inputs?.user_affected?.value ?? ""
//             }
//         },
//         {
//             "type": "input",
//             "block_id": "date",
//             "label": {
//                 "type": "plain_text",
//                 "text": "Date the issue occurred"
//             },
//             "element": {
//                 "type": "plain_text_input",
//                 "action_id": "date",
//                 "initial_value": inputs?.date?.value ?? ""
//             }
//         },
//         {
//             "type": "input",
//             "block_id": "time",
//             "label": {
//                 "type": "plain_text",
//                 "text": "Time the issue occurred"
//             },
//             "element": {
//                 "type": "plain_text_input",
//                 "action_id": "time",
//                 "initial_value": inputs?.time?.value ?? ""
//             }
//         },
//         {
//             "type": "input",
//             "block_id": "user",
//             "label": {
//                 "type": "plain_text",
//                 "text": "Ticket raiser"
//             },
//             "element": {
//                 "type": "users_select",
//                 "action_id": "user",
//                 "initial_user": inputs?.user?.value ?? " ",
//             }
//         }
//     ];
// }

// function workflowStepView(values) {
//     return {
//         summary: {
//             value: values.summary.title.value
//         },
//         description: {
//             value: values.description.description.value
//         },
//         analysis: {
//             value: values.analysis.analysis.value
//         },
//         environment: {
//             value: values.environment.environment.value
//         },
//         service: {
//             value: values.service.service.value
//         },
//         user_affected: {
//             value: values.user_affected.user_affected.value
//         },
//         date: {
//             value: values.date.date.value
//         },
//         time: {
//             value: values.time.time.value
//         },
//         user: {
//             value: values.user.user.selected_user
//         }
//     };
// }

// module.exports.createSupportRequestStep = createSupportRequestWorkflowStep
