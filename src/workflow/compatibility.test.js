jest.mock('../service/serviceStatus', () => ({
    getAllServiceStatus: jest.fn(() => ({}))
}));

const config = require('config');
const {App, WorkflowStep} = require('@slack/bolt');
const {createSupportRequestStep} = require('./supportRequestStep');
const {reportBugWorkflowStep} = require('./bugReportStep');
const {createNewServiceRequestWorkflowStep} = require('./newOidcServiceStep');
const {createNewReportIdamBugWorkflowStep} = require('./newBugReportStep');
const {createNewSupportRequestWorkflowStep} = require('./newSupportRequestStep');
const {getServiceStatusWorkflowStep} = require('./getServiceStatusStep');
const {createNewUserRoleRequestWorkflowStep} = require('./newRoleRequestStep');

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
