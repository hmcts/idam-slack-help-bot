const mockJiraClient = {
    searchUsers: jest.fn(),
    getCurrentUser: jest.fn(),
    makeUri: jest.fn(),
    makeRequestHeader: jest.fn(),
    doRequest: jest.fn(),
    getProject: jest.fn(),
    addNewIssue: jest.fn(),
    updateIssue: jest.fn(),
    addComment: jest.fn(),
    listTransitions: jest.fn(),
    transitionIssue: jest.fn()
}

jest.mock('jira-client', () => jest.fn(() => mockJiraClient))

const jira = require('../../src/service/persistence')
const {JiraType} = require('../../src/service/jiraTicketTypes')

describe('convertEmail', () => {
    beforeAll(() => {
        mockJiraClient.getCurrentUser.mockResolvedValue({accountId: 'service-account-id'})
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns the matching Jira account ID', async () => {
        mockJiraClient.searchUsers.mockResolvedValue([{accountId: 'bob-account-id'}])

        await expect(jira.convertEmail('bobs.uncle@hmcts.net')).resolves.toBe('bob-account-id')
        expect(mockJiraClient.searchUsers).toHaveBeenCalledWith({
            query: 'bobs.uncle@hmcts.net',
            maxResults: 1
        })
    })

    it('returns the service account ID if no email is supplied', async () => {
        await expect(jira.convertEmail(null)).resolves.toBe('service-account-id')
    })

    it('returns the service account ID if no Jira user is found', async () => {
        mockJiraClient.searchUsers.mockResolvedValue([])

        await expect(jira.convertEmail('unknown@hmcts.net')).resolves.toBe('service-account-id')
    })
})

describe('extractJiraId', () => {
    it('extracts the key', () => {
        const actual = jira.extractJiraIdFromBlocks([
            {
                type: 'section'
            },
            {
                type: 'divider'
            },
            {
                type: 'section'
            },
            {
                type: 'context',
                elements: [
                    {
                        text: 'View on Jira: <https://hmcts.atlassian.net/browse/SBOX-61|SBOX-61>'
                    }
                ]
            }
        ])

        expect(actual).toBe('SBOX-61')
    })
})

describe('searchForUnassignedOpenIssues', () => {
    it('uses the Jira v3 enhanced JQL search endpoint', async () => {
        mockJiraClient.makeUri.mockReturnValue('jira-search-uri')
        mockJiraClient.makeRequestHeader.mockReturnValue({request: 'options'})
        mockJiraClient.doRequest.mockResolvedValue({issues: []})

        await expect(jira.searchForUnassignedOpenIssues()).resolves.toEqual({issues: []})
        expect(mockJiraClient.makeUri).toHaveBeenCalledWith({pathname: '/search/jql'})
        expect(mockJiraClient.makeRequestHeader).toHaveBeenCalledWith(
            'jira-search-uri',
            expect.objectContaining({
                method: 'POST',
                body: expect.objectContaining({
                    jql: expect.stringContaining('project = SBOX'),
                    fields: ['created', 'description', 'summary', 'updated']
                })
            })
        )
    })
})

describe('createHelpRequest', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockJiraClient.searchUsers.mockResolvedValue([{accountId: 'reporter-account-id'}])
        mockJiraClient.getProject.mockResolvedValue({id: 'project-id'})
        mockJiraClient.addNewIssue.mockResolvedValue({key: 'SBOX-123'})
        mockJiraClient.listTransitions.mockResolvedValue({
            transitions: [{id: 'transition-id', name: 'Ready for Dev'}]
        })
        mockJiraClient.transitionIssue.mockResolvedValue(undefined)
    })

    it('creates Jira v3 issues with an account ID reporter', async () => {
        await expect(jira.createHelpRequest(
            {summary: 'Support request', description: 'Unable to sign in'},
            'reporter@hmcts.net'
        )).resolves.toBe('SBOX-123')

        const issue = mockJiraClient.addNewIssue.mock.calls[0][0]

        expect(issue).toEqual(expect.objectContaining({
            fields: expect.objectContaining({
                reporter: {accountId: 'reporter-account-id'},
                parent: {key: 'SIDM-6950'},
                description: expect.objectContaining({type: 'doc', version: 1})
            })
        }))
        expect(issue.fields).not.toHaveProperty('customfield_10008')
        expect(issue.fields.description.content).toEqual(expect.arrayContaining([
            expect.objectContaining({
                type: 'paragraph',
                content: [expect.objectContaining({text: 'Unable to sign in'})]
            })
        ]))
    })

    it('adds every OIDC service input to its Jira field', async () => {
        const helpRequest = {
            summary: 'Create an OIDC service',
            service: 'my-service',
            description: 'Service used for case access',
            client_id: 'my-client-id',
            client_secret: 'secret-reference',
            key_vault: 'my-key-vault',
            redirect_uri: 'https://example.com/oauth/callback',
            self_registration: 'Yes',
            mfa: 'No',
            sso: 'Yes',
            admin_management: 'No',
            super_user: 'super-user-role',
            user_search: 'Yes',
            user_registration: 'No',
            user_management: 'Yes'
        }

        await jira.createHelpRequest(helpRequest, 'reporter@hmcts.net', JiraType.SERVICE.id)

        expect(mockJiraClient.addNewIssue).toHaveBeenCalledWith({
            fields: expect.objectContaining({
                summary: helpRequest.summary,
                customfield_25615: helpRequest.service,
                customfield_25616: helpRequest.description,
                customfield_25617: helpRequest.client_id,
                customfield_25618: helpRequest.client_secret,
                customfield_25619: helpRequest.key_vault,
                customfield_25620: helpRequest.redirect_uri,
                customfield_25621: 'on',
                customfield_25622: 'N',
                customfield_25623: 'on',
                customfield_25624: 'N',
                customfield_25625: helpRequest.super_user,
                customfield_25626: 'on',
                customfield_25627: 'N',
                customfield_25628: 'on'
            })
        })
    })

    it('adds every user role input to its Jira field', async () => {
        const helpRequest = {
            summary: 'Create a user role',
            team: 'IDAM',
            role: 'caseworker-admin',
            description: 'Allows case administration',
            ccd_admin: 'Yes',
            prd_admin: 'No'
        }

        await jira.createHelpRequest(helpRequest, 'reporter@hmcts.net', JiraType.ROLE.id)

        expect(mockJiraClient.addNewIssue).toHaveBeenCalledWith({
            fields: expect.objectContaining({
                summary: helpRequest.summary,
                customfield_21529: helpRequest.team,
                customfield_25611: helpRequest.role,
                customfield_25612: helpRequest.description,
                customfield_25613: 'on',
                customfield_25614: 'N'
            })
        })
    })
})

describe('updateHelpRequestDescription', () => {
    it('updates the Jira description using ADF and the direct fields payload', async () => {
        mockJiraClient.updateIssue.mockResolvedValue(undefined)

        await jira.updateHelpRequestDescription('SBOX-123', {
            description: 'Unable to sign in',
            slackLink: 'https://example.slack.com/message'
        })

        expect(mockJiraClient.updateIssue).toHaveBeenCalledWith('SBOX-123', {
            fields: {
                description: expect.objectContaining({type: 'doc', version: 1})
            }
        })

        const description = mockJiraClient.updateIssue.mock.calls[0][1].fields.description
        expect(description.content[0].content[1].marks).toContainEqual({
            type: 'link',
            attrs: {href: 'https://example.slack.com/message'}
        })
        expect(description.content).toEqual(expect.arrayContaining([
            expect.objectContaining({
                type: 'paragraph',
                content: [expect.objectContaining({text: 'Unable to sign in'})]
            })
        ]))
    })
})
