const JiraApi = require('jira-client');
const config = require('config')
const {getContextElement} = require("../util/blockHelper");
const {createComment, mapFieldsToDescription} = require("./jiraMessages");
const {JiraType} = require('./jiraTicketTypes');

const jiraProject = config.get('jira.project')
const extractProjectRegex = new RegExp(`(${jiraProject}-[\\d]+)`)

const jiraCloudId = config.get('secrets.cftptl-intsvc.jira-cloud-id');
let systemAccountId;
let systemAccountIdPromise;

async function getSystemAccountId() {
    if (systemAccountId) return systemAccountId;

    if (!systemAccountIdPromise) {
        systemAccountIdPromise = jira.getCurrentUser()
            .then((user) => {
                if (!user?.accountId) {
                    throw new Error("Jira service account has no accountId");
                }

                systemAccountId = user.accountId;
                return systemAccountId;
            })
            .catch((err) => {
                systemAccountIdPromise = undefined;
                console.error("Unable to resolve Jira service account ID", err);
                throw err;
            });
    }

    return systemAccountIdPromise;
}

const jira = new JiraApi({
    protocol: 'https',
    host: 'api.atlassian.com',
    base: `/ex/jira/${jiraCloudId}`,
    username: config.get('secrets.cftptl-intsvc.jira-username'),
    password: config.get('secrets.cftptl-intsvc.jira-api-token'),
    apiVersion: '3',
    strictSSL: true
});

async function transitionHelpRequest(jiraId, transitionName) {
    try {
        const jiraTransitionId = await getTransitionId(transitionName, jiraId)
        await jira.transitionIssue(jiraId, {
            transition: {
                id: jiraTransitionId
            }
        })
    } catch (err) {
        console.log("Error updating help request transition in jira. ", err)
    }
}

async function getTransitionId(transitionName, jiraId) {
    const response = await jira.listTransitions(jiraId)
    for (let i = 0; i < response.transitions.length; i++) {
        const transition = response.transitions[i]
        if(transition.name === transitionName) {
            return transition.id;
        }
    }
    throw `Failed to get transition id for status '${transitionName}'`
}

async function searchForUnassignedOpenIssues() {
    const jqlQuery = `project = ${jiraProject} AND type = "${JiraType.ISSUE.name}" AND status = Open and assignee is EMPTY AND labels not in ("Heritage") ORDER BY created ASC`;
    try {
        return await jira.doRequest(
            jira.makeRequestHeader(
                jira.makeUri({pathname: '/search/jql'}),
                {
                    method: 'POST',
                    followAllRedirects: true,
                    body: {
                        jql: jqlQuery,
                        // TODO Moving the Slack link to its own field would avoid fetching the full description.
                        fields: ['created', 'description', 'summary', 'updated']
                    }
                }
            )
        )
    } catch (err) {
        console.log("Error searching for issues in jira", err)
        return {
            issues: []
        }
    }
}

async function assignHelpRequest(issueId, email) {
    const accountId = await convertEmail(email);

    try {
        await jira.updateAssigneeWithId(issueId, accountId);
    } catch (err) {
        console.log("Error assigning help request in Jira", err);
    }
}

/**
 * Extracts a jira ID
 *
 * expected format: 'View on Jira: <https://hmcts.atlassian.net/browse/SBOX-61|SBOX-61>'
 * @param blocks
 */
function extractJiraIdFromBlocks(blocks) {
    const viewOnJiraText = getContextElement(blocks, 'View on Jira').text
    return extractJiraId(viewOnJiraText)
}

function extractJiraId(text) {
    return extractProjectRegex.exec(text)[1]
}

async function convertEmail(email) {
    if (!email) {
        return getSystemAccountId();
    }

    try {
        const users = await jira.searchUsers({
            query: email,
            maxResults: 1
        });

        if (!users?.[0]?.accountId) {
            console.log('Jira user not found; using service account as reporter');
            return getSystemAccountId();
        }

        return users[0].accountId;
    } catch (err) {
        console.log('Jira user lookup failed; using service account as reporter', err);
        return getSystemAccountId();
    }
}

async function createHelpRequestInJira(helpRequest, project, user, issueType = JiraType.ISSUE.id) {
    return await jira.addNewIssue(constructJiraIssue(helpRequest, project, user, issueType));
}

async function createHelpRequest(helpRequest, userEmail, issueType = JiraType.ISSUE.id) {
    const userAccountId = await convertEmail(userEmail);
    const project = await jira.getProject(jiraProject);

    const result = await createHelpRequestInJira(
        helpRequest,
        project,
        userAccountId,
        issueType
    );

    await transitionHelpRequest(result.key, 'Ready for Dev');
    return result.key;
}

async function updateHelpRequestDescription(issueId, fields) {
    const jiraDescription = mapFieldsToDescription(fields);
    try {
        await jira.updateIssue(issueId, {
            fields: {
                description: jiraDescription
            }
        })
    } catch(err) {
        console.log("Error updating help request description in jira", err)
    }
}

async function addCommentToHelpRequest(externalSystemId, fields) {
    try {
        await jira.addComment(externalSystemId, createComment(fields))
    } catch (err) {
        console.log("Error creating comment in jira", err)
    }
}

async function addAttachmentToHelpRequest(externalSystemId, attachmentStream) {
    await jira.addAttachmentOnIssue(externalSystemId, attachmentStream)
}

function constructJiraIssue(helpRequest, project, user, issueType) {
    const defaultFields = defaultJiraIssueFields(helpRequest, project, user, issueType);
    switch(issueType) {
        case JiraType.SERVICE.id:
            return constructOidcServiceJiraIssue(helpRequest, defaultFields);
            break;
        case JiraType.ROLE.id:
            return constructUserRoleJiraIssue(helpRequest, defaultFields)
            break;
        case JiraType.ISSUE.id:
        case JiraType.BUG.id:
        default:
            return constructDefaultJiraIssue(defaultFields);
            break;
    }
}

function defaultJiraIssueFields(helpRequest, project, accountId, issueType) {
    return {
        summary: helpRequest.summary,
        issuetype: {
            id: issueType
        },
        project: {
            id: project.id
        },
        labels: ['created-from-slack'],
        description: mapFieldsToDescription(helpRequest),
        reporter: {
            accountId
        },
        parent: {
            key: 'SIDM-6950'
        }
    }
}

function constructDefaultJiraIssue(defaultFields) {
    return {
        fields: {
            ...defaultFields,
        }
    }
}

function constructOidcServiceJiraIssue(helpRequest, defaultFields) {
    return {
        fields: {
            ...defaultFields,
            customfield_25615: helpRequest.service,
            customfield_25616: helpRequest.description,
            customfield_25617: helpRequest.client_id,
            customfield_25618: helpRequest.client_secret,
            customfield_25619: helpRequest.key_vault,
            customfield_25620: helpRequest.redirect_uri,
            customfield_25621: checkboxValue(helpRequest.self_registration),
            customfield_25622: checkboxValue(helpRequest.mfa),
            customfield_25623: checkboxValue(helpRequest.sso),
            customfield_25624: checkboxValue(helpRequest.admin_management),
            customfield_25625: helpRequest.super_user,
            customfield_25626: checkboxValue(helpRequest.user_search),
            customfield_25627: checkboxValue(helpRequest.user_registration),
            customfield_25628: checkboxValue(helpRequest.user_management)
        }
    }
}

function constructUserRoleJiraIssue(helpRequest, defaultFields) {
    return {
        fields: {
            ...defaultFields,
            customfield_21529: helpRequest.team,
            customfield_25611: helpRequest.role,
            customfield_25612: helpRequest.description,
            customfield_25613: checkboxValue(helpRequest.ccd_admin),
            customfield_25614: checkboxValue(helpRequest.prd_admin)
        }
    }
}

function checkboxValue(value) {
    if (value === 'Yes') {
        return 'on'
    }
    return 'N'
}

module.exports.transitionHelpRequest = transitionHelpRequest
module.exports.assignHelpRequest = assignHelpRequest
module.exports.createHelpRequest = createHelpRequest
module.exports.updateHelpRequestDescription = updateHelpRequestDescription
module.exports.addCommentToHelpRequest = addCommentToHelpRequest
module.exports.addAttachmentToHelpRequest = addAttachmentToHelpRequest
module.exports.convertEmail = convertEmail
module.exports.extractJiraId = extractJiraId
module.exports.extractJiraIdFromBlocks = extractJiraIdFromBlocks
module.exports.searchForUnassignedOpenIssues = searchForUnassignedOpenIssues
