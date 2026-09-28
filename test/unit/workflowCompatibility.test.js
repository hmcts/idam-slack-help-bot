const mockHandleSupportRequest = jest.fn();
const mockHandleBugReport = jest.fn();
const mockSupportAnnouncement = [{type: 'section', block_id: 'support'}];

jest.mock('../../src/service/helpRequestManager', () => ({
    handleSupportRequest: mockHandleSupportRequest,
    handleBugReport: mockHandleBugReport
}));

jest.mock('../../src/service/serviceStatus', () => ({
    getAllServiceStatus: jest.fn(() => ({}))
}));

jest.mock('../../src/messages', () => ({
    createSupportRequestAnnouncement: jest.fn(() => mockSupportAnnouncement),
    createReportIdamBugAnnouncement: jest.fn(() => []),
    createOIDCServiceAnnouncement: jest.fn(() => []),
    createRoleAnnouncementInfo: jest.fn(() => [])
}));

const config = require('config');
const {App, WorkflowStep} = require('@slack/bolt');
const {supportRequestFunction} = require('../../src/workflow/supportRequestStep');
const {bugReportFunction} = require('../../src/workflow/bugReportStep');
const {newSupportRequestFunction} = require('../../src/workflow/newSupportRequestStep');
const {registerWorkflowFunctions, workflowFunctions} = require('../../src/workflow');
const functionManifest = require('../../slack-app-manifest.json');

describe('Bolt custom workflow functions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('loads application configuration', () => {
        expect(config.get('jira.project')).toBeDefined();
    });

    test('uses the Bolt 5 custom function API for every workflow step', () => {
        expect(typeof App.prototype.function).toBe('function');
        expect(WorkflowStep).toBeUndefined();
        expect(workflowFunctions).toHaveLength(7);
        const callbackIds = workflowFunctions.map(({callbackId}) => callbackId);
        expect(callbackIds).toEqual([
            'support_request_step',
            'bug_report_step',
            'new_service_step',
            'new_report_idam_bug_step',
            'new_support_request_step',
            'get_service_status_step',
            'new_user_role_service_step'
        ]);
        expect(Object.keys(functionManifest.functions)).toEqual(callbackIds);
        expect(functionManifest.settings.org_deploy_enabled).toBe(true);
        expect(functionManifest.settings.function_runtime).toBe('remote');
        expect(functionManifest.settings.event_subscriptions.bot_events).toContain('function_executed');
        expect(functionManifest.settings.event_subscriptions.bot_events).not.toContain('workflow_step_execute');
        expect(functionManifest.features.workflow_steps).toBeUndefined();
        expect(functionManifest.features.app_home.home_tab_enabled).toBe(true);
        expect(functionManifest.oauth_config.scopes.bot).not.toContain('workflow.steps:execute');
        Object.values(functionManifest.functions).forEach(({output_parameters: outputs}) => {
            expect(outputs).toEqual({});
        });
        workflowFunctions.forEach(({listener}) => expect(typeof listener).toBe('function'));
    });

    test('registers all functions with Bolt', () => {
        const app = {function: jest.fn()};

        registerWorkflowFunctions(app);

        expect(app.function).toHaveBeenCalledTimes(7);
        workflowFunctions.forEach(({callbackId, listener}, index) => {
            expect(app.function).toHaveBeenNthCalledWith(index + 1, callbackId, listener);
        });
    });

    test('maps support request inputs and completes the function', async () => {
        const client = {};
        const complete = jest.fn();
        const fail = jest.fn();
        const inputs = {
            user: 'U123',
            summary: 'Cannot sign in',
            description: 'Login failed',
            analysis: '',
            environment: 'prod',
            service: 'idam-web-admin',
            user_affected: 'caseworker',
            date: '2026-09-24',
            time: '10:30'
        };

        await supportRequestFunction.listener({inputs, client, complete, fail});

        expect(mockHandleSupportRequest).toHaveBeenCalledWith(client, 'U123', {
            user: 'U123',
            summary: 'Cannot sign in',
            description: 'Login failed',
            analysis: 'N/A',
            environment: 'prod',
            service: 'idam-web-admin',
            userAffected: 'caseworker',
            date: '2026-09-24',
            time: '10:30'
        });
        expect(complete).toHaveBeenCalledWith();
        expect(fail).not.toHaveBeenCalled();
    });

    test('maps bug report inputs and completes the function', async () => {
        const client = {};
        const complete = jest.fn();
        const fail = jest.fn();
        const inputs = {
            user: 'U456',
            summary: 'Unexpected error',
            description: 'The page failed',
            analysis: 'Checked logs',
            environment: 'aat',
            service: 'idam-api',
            impact: 'Users cannot proceed',
            roles: 'caseworker',
            steps: 'Open the page',
            expected: 'Page loads',
            actual: 'Error shown'
        };

        await bugReportFunction.listener({inputs, client, complete, fail});

        expect(mockHandleBugReport).toHaveBeenCalledWith(client, 'U456', inputs);
        expect(complete).toHaveBeenCalledWith();
        expect(fail).not.toHaveBeenCalled();
    });

    test('uses direct custom-function inputs for announcement steps', async () => {
        const complete = jest.fn();
        const fail = jest.fn();
        const client = {chat: {postEphemeral: jest.fn()}};

        await newSupportRequestFunction.listener({
            inputs: {user: 'U789'},
            client,
            complete,
            fail
        });

        expect(client.chat.postEphemeral).toHaveBeenCalledWith({
            channel: 'C01KHKNJUKE',
            user: 'U789',
            username: 'IDAM Support',
            blocks: mockSupportAnnouncement
        });
        expect(complete).toHaveBeenCalledWith();
        expect(fail).not.toHaveBeenCalled();
    });

    test('fails the function when its work throws', async () => {
        const error = new Error('Slack API failed');
        const complete = jest.fn();
        const fail = jest.fn();
        const client = {chat: {postEphemeral: jest.fn().mockRejectedValue(error)}};
        jest.spyOn(console, 'error').mockImplementation(() => {});

        await newSupportRequestFunction.listener({
            inputs: {user: 'U789'},
            client,
            complete,
            fail
        });

        expect(complete).not.toHaveBeenCalled();
        expect(fail).toHaveBeenCalledWith({error: 'Slack API failed'});
        expect(console.error).toHaveBeenCalledWith(error);
        console.error.mockRestore();
    });
});
