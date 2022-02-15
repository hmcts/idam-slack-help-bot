const JiraApi = require('jira-client');
const config = require('config')
const {getContextElement} = require("../util/blockHelper");
const {createComment, mapFieldsToDescription} = require("./jiraMessages");
const {JiraType} = require('./jiraTicketTypes');

const systemUser = config.get('secrets.cftptl-intsvc.jira-username')
const jiraProject = config.get('jira.project')
const extractProjectRegex = new RegExp(`(${jiraProject}-[\\d]+)`)

const jira = new JiraApi({
    protocol: 'https',
    host: 'tools.hmcts.net/jira',
    bearer: config.get('secrets.cftptl-intsvc.jira-api-token'),
    apiVersion: '2',
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
        return await jira.searchJira(
            jqlQuery,
            {
                // TODO if we moved the slack link out to another field we wouldn't need to request the whole description
                // which would probably be better for performance
                fields: ['created', 'description', 'summary', 'updated']
            }
        )
    } catch (err) {
        console.log("Error searching for issues in jira", err)
        return {
            issues: []
        }
    }
}

async function assignHelpRequest(issueId, email) {
    const user = convertEmail(email)

    try {
        await jira.updateAssignee(issueId, user)
    } catch(err) {
        console.log("Error assigning help request in jira", err)
    }
}

/**
 * Extracts a jira ID
 *
 * expected format: 'View on Jira: <https://tools.hmcts.net/jira/browse/SBOX-61|SBOX-61>'
 * @param blocks
 */
function extractJiraIdFromBlocks(blocks) {
    const viewOnJiraText = getContextElement(blocks, 'View on Jira').text
    return extractJiraId(viewOnJiraText)
}

function extractJiraId(text) {
    return extractProjectRegex.exec(text)[1]
}

function convertEmail(email) {
    if (!email) {
        return systemUser
    }

    return email.split('@')[0]
}

async function createHelpRequestInJira(helpRequest, project, user, issueType = JiraType.ISSUE.id) {
    return await jira.addNewIssue(constructJiraIssue(helpRequest, project, user, issueType));
}

async function createHelpRequest(helpRequest, userEmail, issueType = JiraType.ISSUE.id) {
    const user = convertEmail(userEmail)
    const project = await jira.getProject(jiraProject)

    // https://developer.atlassian.com/cloud/jira/platform/rest/v2/api-group-issues/#api-rest-api-2-issue-post
    // note: fields don't match 100%, our Jira version is a bit old (still a supported LTS though)
    let result
    try {
        result = await createHelpRequestInJira(helpRequest, project, user, issueType);
    } catch (err) {
        // in case the user doesn't exist in Jira use the system user
        result = await createHelpRequestInJira(helpRequest, project, systemUser, issueType);
    }

    return result.key
}

async function updateHelpRequestDescription(issueId, fields) {
    const jiraDescription = mapFieldsToDescription(fields);
    try {
        await jira.updateIssue(issueId, {
            update: {
                description: [{
                    set: jiraDescription
                }]
            }
        })
    } catch(err) {
        console.log("Error updating help request description in jira", err)
    }
}

async function addCommentToHelpRequest(externalSystemId, fields) {
    try {
        console.log("###Going to add comment in Jira")
        await jira.addComment(externalSystemId, createComment(fields))
        console.log("###Comment added to Jira")
    } catch (err) {
        console.log("Error creating comment in jira", err)
    }
}

function constructJiraIssue(helpRequest, project, user, issueType) {
    const defaultFields = defaultJiraIssueFields(helpRequest.summary, project, user, issueType);
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

function defaultJiraIssueFields(summary, project, user, issueType) {
    return {
        summary: summary,
        issuetype: {
            id: issueType
        },
        project: {
            id: project.id
        },
        labels: ['created-from-slack'],
        description: undefined,
        reporter: {
            name: user // API docs say ID, but our jira version doesn't have that field yet, may need to change in future
        },
        customfield_10008: 'SIDM-6950'
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
module.exports.convertEmail = convertEmail
module.exports.extractJiraId = extractJiraId
module.exports.extractJiraIdFromBlocks = extractJiraIdFromBlocks
module.exports.searchForUnassignedOpenIssues = searchForUnassignedOpenIssues
