const mockJiraClient = {
    searchUsers: jest.fn(),
    getCurrentUser: jest.fn(),
    makeUri: jest.fn(),
    makeRequestHeader: jest.fn(),
    doRequest: jest.fn(),
    getProject: jest.fn(),
    addNewIssue: jest.fn(),
    listTransitions: jest.fn(),
    transitionIssue: jest.fn()
}

jest.mock('jira-client', () => jest.fn(() => mockJiraClient))

const jira = require('./persistence')

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
    it('creates Jira v3 issues with an account ID reporter', async () => {
        mockJiraClient.searchUsers.mockResolvedValue([{accountId: 'reporter-account-id'}])
        mockJiraClient.getProject.mockResolvedValue({id: 'project-id'})
        mockJiraClient.addNewIssue.mockResolvedValue({key: 'SBOX-123'})
        mockJiraClient.listTransitions.mockResolvedValue({
            transitions: [{id: 'transition-id', name: 'Ready for Dev'}]
        })
        mockJiraClient.transitionIssue.mockResolvedValue(undefined)

        await expect(jira.createHelpRequest(
            {summary: 'Support request'},
            'reporter@hmcts.net'
        )).resolves.toBe('SBOX-123')

        expect(mockJiraClient.addNewIssue).toHaveBeenCalledWith(expect.objectContaining({
            fields: expect.objectContaining({
                reporter: {accountId: 'reporter-account-id'}
            })
        }))
    })
})
