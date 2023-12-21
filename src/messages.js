const {JiraType} = require("./service/jiraTicketTypes");
const {action, jiraView, title, textField} = require("./util/helpers");
const {convertIso8601ToEpochSeconds, extractSlackLinkFromText, convertJiraKeyToUrl} = require('./util/helpers');

function supportRequestRaised({
                                  user,
                                  summary,
                                  environment,
                                  service,
                                  userAffected,
                                  jiraId
                           }) {
    return [
        title(summary),
        {
            "type": "divider"
        },
        {
            "type": "section",
            "fields": [
                textField(`*Issue type* \n ${JiraType.ISSUE.requestType}`),
                textField("*Status* \n Open"),
                textField(`*Reporter* \n <@${user}>`),
                textField(`*Environment* \n ${environment}`),
                textField(`*Service affected* \n ${service}`),
                textField(`*User affected* \n ${userAffected}`)
            ]
        },
        jiraView(jiraId),
        {
            "type": "divider"
        },
        action(),
        {
            "type": "divider"
        }
    ]
}

function supportRequestDetails({
                                   description,
                                   analysis,
                                   date,
                                   time
    }) {
    return [
        {
            "type": "section",
            "text": textField(`*Issue description* \n ${description}`)
        },
        {
            "type": "section",
            "text": textField(`*Analysis done so far* \n ${analysis}`)
        },
        {
            "type": "section",
            "text": textField(`*Date issue occurred* \n ${date}`)
        },
        {
            "type": "section",
            "text": textField(`*Time issue occurred* \n ${time}`)
        }
    ]
}

function bugRaised({
                       user,
                       summary,
                       environment,
                       service,
                       impact,
                       roles,
                       jiraId
}) {
    return [
        title(summary),
        {
            "type": "divider"
        },
        {
            "type": "section",
            "fields": [
                textField(`*Issue type* \n ${JiraType.BUG.requestType}`),
                textField("*Status* \n Open"),
                textField(`*Reporter* \n <@${user}>`),
                textField(`*Environment* \n ${environment}`),
                textField(`*Service affected* \n ${service}`),
                textField(`*Impact to user and/or service* \n ${impact}`),
                textField(`*Affected roles* \n ${roles}`),
            ]
        },
        jiraView(jiraId),
        {
            "type": "divider"
        },
        action(),
        {
            "type": "divider"
        }
    ]
}

function bugDetails({
                        description,
                        analysis,
                        steps,
                        expected,
                        actual
    }) {
    return [
        {
            "type": "section",
            "text": textField(`*Issue description* \n ${description}`)
        },
        {
            "type": "section",
            "text": textField(`*Analysis done so far* \n ${analysis}`)
        },
        {
            "type": "section",
            "text": textField(`*Steps to reproduce* \n ${steps}`)
        },
        {
            "type": "section",
            "text": textField(`*Expected behaviour* \n ${expected}`)
        },
        {
            "type": "section",
            "text": textField(`*Actual behaviour* \n ${actual}`)
        }
    ]
}

function newRoleRequestRaised({
                                  user,
                                  summary,
                                  team,
                                  role,
                                  description,
                                  ccd_admin,
                                  prd_admin,
                                  jiraId
}) {
    return [
        title(summary),
        {
            "type": "divider"
        },
        {
            "type": "section",
            "fields": [
                textField(`*Issue type* \n ${JiraType.ROLE.requestType}`),
                textField("*Status* \n Open"),
                textField(`*Reporter* \n <@${user}>`),
                textField(`*Reporter team* \n ${team}`),
                textField(`*Role name* \n ${role}`),
                textField(`*Role description* \n ${description}`),
                textField(`*Can CCD admin users manage this role?* \n ${ccd_admin}`),
                textField(`*Can PRD admin users manage this role?* \n ${prd_admin}`)
            ]
        },
        jiraView(jiraId),
        {
            "type": "divider"
        },
        action(),
        {
            "type": "divider"
        }
    ]
}

function unassignedOpenIssue({
                                 summary,
                                 slackLink,
                                 jiraId,
                                 created,
                                 updated
                             }) {
    const link = slackLink ? slackLink : convertJiraKeyToUrl(jiraId)

    return [
        {
            "type": "divider"
        },
        {
            "type": "section",
            "block_id": `${jiraId}_link`,
            "text": textField(`*<${link}|${summary}>*`)
        },
        {
            "type": "actions",
            "block_id": `${jiraId}_actions`,
            "elements": [
                {
                    "type": "users_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Assign to",
                        "emoji": true
                    },
                    "action_id": "app_home_unassigned_user_select"
                },
                {
                    "type": "button",
                    "action_id": "app_home_take_unassigned_issue",
                    "text": {
                        "type": "plain_text",
                        "text": ":raising_hand: Take it"
                    },
                    "style": "primary"
                }
            ]
        },
        {
            "type": "section",
            "block_id": `${jiraId}_fields`,
            "fields": [
                textField(`*:alarm_clock: Opened:*\n <!date^${convertIso8601ToEpochSeconds(created)}^{date_pretty} ({time})|${created}>`),
                textField(`*:hourglass: Last Updated:*\n <!date^${convertIso8601ToEpochSeconds(updated)}^{date_pretty} ({time})|${updated}>`),
                textField(`*View on Jira*:\n <${convertJiraKeyToUrl(jiraId)}|${jiraId}>`)
            ]
        },
        ]
}

function createOIDCServiceAnnouncement() {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*UPDATE 23rd of May 2022*"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Service creation is now managed by the <https://github.com/hmcts/idam-access-config|idam-access-config> pipeline. Please refer to the <https://github.com/hmcts/idam-access-config/blob/master/README.md|README> or have a look at how other teams have implemented their services."
            }
        },
    ]
}

function createNewRoleAnnouncement() {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*UPDATE 6th December 2022*"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Role creation is now managed by the <https://github.com/hmcts/idam-access-config|idam-access-config> pipeline. Please refer to the <https://github.com/hmcts/idam-access-config/blob/master/README.md#roles-model|README> or have a look at how other teams have added their roles."
            }
        },
    ]
}

function appHomeUnassignedIssues(openIssueBlocks) {
    return [
        {
            "type": "section",
            "text": textField("*Open unassigned issues*")
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "Unassigned open issues",
                        "emoji": true
                    },
                    "value": "unassigned_open_issues",
                    "action_id": "unassigned_open_issues"
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": "My issues",
                        "emoji": true
                    },
                    "value": "my_issues",
                    "action_id": "my_issues"
                }
            ]
        },
        ...openIssueBlocks
    ]
}

function option(name, option) {
    return {
        text: {
            type: "plain_text",
            text: name,
            emoji: true
        },
        value: option ?? name.toLowerCase()
    }
}

function openHelpRequestBlocks() {
    return {
        "title": {
            "type": "plain_text",
            "text": "IDAM Support Request"
        },
        "submit": {
            "type": "plain_text",
            "text": "Submit"
        },
        "blocks": [
            {
                "type": "input",
                "block_id": "summary",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Short description of the issue"
                    }
                },
                "label": textField("Issue summary")
            },
            {
                "type": "input",
                "block_id": "description",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "description",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Give more detail"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Issue description",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "analysis",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "analysis"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Analysis done so far",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "environment",
                "optional": true,
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Choose an environment",
                        "emoji": true
                    },
                    "options": [
                        option('AAT / Staging', 'staging'),
                        option('Preview / Dev', 'dev'),
                        option('Production'),
                        option('Perftest / Test', 'test'),
                        option('ITHC'),
                        option('N/A', 'none'),
                    ],
                    "action_id": "environment"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Environment",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "service",
                "optional": true,
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Choose a service. Select other if missing",
                        "emoji": true
                    },
                    "options": [
                        option('Access Management', 'am'),
                        option('Architecture', 'architecture'),
                        option('Bulk scan', 'bulkscan'),
                        option('Bulk print', 'bulkprint'),
                        option('CCD', 'ccd'),
                        option('Civil Damages', 'civildamages'),
                        option('Civil Unspecified', 'CivilUnspec'),
                        option('CMC', 'cmc'),
                        option('Divorce', 'divorce'),
                        option('Domestic Abuse', "domesticabuse"),
                        option('No fault divorce', 'nfdivorce'),
                        option('Ethos', 'ethos'),
                        option('Evidence Management', 'evidence'),
                        option('Expert UI', 'xui'),
                        option('FaCT', 'fact'),
                        option('Financial Remedy', 'finrem'),
                        option('FPLA', 'fpla'),
                        option('Family Private Law', 'FPRL'),
                        option('Family Public Law', 'FPL'),
                        option('Heritage', 'heritage'),
                        option('HMI', 'hmi'),
                        option('Management Information', 'mi'),
                        option('Immigration and Asylum', 'iac'),
                        option('IDAM', 'idam'),
                        option('Other', 'other'),
                        option('Probate', 'probate'),
                        option('Reference Data', 'refdata'),
                        option('Reform Software Engineering', 'reform-software-engineering'),
                        option('Security Operations or Secure design', 'security'),
                        option('SSCS', 'sscs'),
                        option('PayBubble', 'paybubble'),
                        option('PET', 'pet'),
                        option('Work Allocation', 'workallocation'),
                    ],
                    "action_id": "service"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Service affected",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "user",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "user"
                },
                "label": {
                    "type": "plain_text",
                    "text": "User affected",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "date",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "date"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Date the issue occurred",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "time",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "time"
                },
                "label": {
                    "type": "plain_text",
                    "text": "Time the issue occurred",
                    "emoji": true
                }
            }
        ],
        "type": "modal",
        "callback_id": "create_help_request"
    }
}

module.exports = {
    appHomeUnassignedIssues,
    unassignedOpenIssue,
    supportRequestRaised,
    supportRequestDetails,
    bugRaised,
    bugDetails,
    newRoleRequestRaised,
    openHelpRequestBlocks,
    createOIDCServiceAnnouncement,
    createNewRoleAnnouncement,
    extractSlackLinkFromText
}