jest.mock('../../src/service/serviceStatus', () => ({
    getAllServiceStatus: jest.fn(() => ({}))
}));

const config = require('config');
const {App, WorkflowStep} = require('@slack/bolt');
const {createSupportRequestStep} = require('../../src/workflow/supportRequestStep');
const {reportBugWorkflowStep} = require('../../src/workflow/bugReportStep');
const {createNewServiceRequestWorkflowStep} = require('../../src/workflow/newOidcServiceStep');
const {createNewReportIdamBugWorkflowStep} = require('../../src/workflow/newBugReportStep');
const {createNewSupportRequestWorkflowStep} = require('../../src/workflow/newSupportRequestStep');
const {getServiceStatusWorkflowStep} = require('../../src/workflow/getServiceStatusStep');
const {createNewUserRoleRequestWorkflowStep} = require('../../src/workflow/newRoleRequestStep');

const workflowStepFactories = [
    createSupportRequestStep,
    reportBugWorkflowStep,
    createNewServiceRequestWorkflowStep,
    createNewReportIdamBugWorkflowStep,
    createNewSupportRequestWorkflowStep,
    getServiceStatusWorkflowStep,
    createNewUserRoleRequestWorkflowStep
];

test('loads application configuration', () => {
    expect(config.get('jira.project')).toBeDefined();
});

test('supports the legacy workflow step API used by the application', () => {
    expect(typeof App.prototype.step).toBe('function');
    expect(typeof WorkflowStep).toBe('function');

    workflowStepFactories.forEach(factory => {
        expect(factory()).toBeInstanceOf(WorkflowStep);
    });
});
