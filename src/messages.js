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

function createSupportRequestAnnouncement() {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*UPDATE 5th of Feb 2024*"
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "Please raise IDAM Support Request using /help shortcut in any slack window. Please choose CFT IDAM Support shortcut from available options."
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
                "label": {
                    "type": "plain_text",
                    "text": "Issue summary",
                    "emoji": true
                }
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
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Choose an environment",
                        "emoji": true
                    },
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "AAT / Staging",
                                "emoji": true
                            },
                            "value": "staging"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Preview / Dev",
                                "emoji": true
                            },
                            "value": "dev"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Production",
                                "emoji": true
                            },
                            "value": "production"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Perftest / Test",
                                "emoji": true
                            },
                            "value": "test"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "ITHC",
                                "emoji": true
                            },
                            "value": "ithc"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "N/A",
                                "emoji": true
                            },
                            "value": "none"
                        }
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
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Choose a service. Select other if missing",
                        "emoji": true
                    },
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Access Management",
                                "emoji": true
                            },
                            "value": "am"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Architecture",
                                "emoji": true
                            },
                            "value": "architecture"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Bulk scan",
                                "emoji": true
                            },
                            "value": "bulkscan"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Bulk print",
                                "emoji": true
                            },
                            "value": "bulkprint"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "CCD",
                                "emoji": true
                            },
                            "value": "ccd"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Civil Damages",
                                "emoji": true
                            },
                            "value": "civildamages"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Civil Unspecified",
                                "emoji": true
                            },
                            "value": "CivilUnspec"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "CMC",
                                "emoji": true
                            },
                            "value": "cmc"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Divorce",
                                "emoji": true
                            },
                            "value": "divorce"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Domestic Abuse",
                                "emoji": true
                            },
                            "value": "domesticabuse"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "No fault divorce",
                                "emoji": true
                            },
                            "value": "nfdivorce"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Ethos",
                                "emoji": true
                            },
                            "value": "ethos"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Evidence Management",
                                "emoji": true
                            },
                            "value": "evidence"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Expert UI",
                                "emoji": true
                            },
                            "value": "xui"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "FaCT",
                                "emoji": true
                            },
                            "value": "fact"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Financial Remedy",
                                "emoji": true
                            },
                            "value": "finrem"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "FPLA",
                                "emoji": true
                            },
                            "value": "fpla"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Family Private Law",
                                "emoji": true
                            },
                            "value": "FPRL"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Family Public Law",
                                "emoji": true
                            },
                            "value": "FPL"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Heritage",
                                "emoji": true
                            },
                            "value": "heritage"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "HMI",
                                "emoji": true
                            },
                            "value": "hmi"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Management Information",
                                "emoji": true
                            },
                            "value": "mi"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Immigration and Asylum",
                                "emoji": true
                            },
                            "value": "iac"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "IDAM",
                                "emoji": true
                            },
                            "value": "idam"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Other",
                                "emoji": true
                            },
                            "value": "other"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Probate",
                                "emoji": true
                            },
                            "value": "probate"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Reference Data",
                                "emoji": true
                            },
                            "value": "refdata"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Reform Software Engineering",
                                "emoji": true
                            },
                            "value": "reform-software-engineering"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Security Operations or Secure design",
                                "emoji": true
                            },
                            "value": "security"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "SSCS",
                                "emoji": true
                            },
                            "value": "sscs"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "PayBubble",
                                "emoji": true
                            },
                            "value": "paybubble"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "PET",
                                "emoji": true
                            },
                            "value": "pet"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Work Allocation",
                                "emoji": true
                            },
                            "value": "workallocation"
                        }
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

function openBugRequestBlocks() {
    return {
        "title": {
            "type": "plain_text",
            "text": "Report IDAM Bug"
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
                "label": {
                    "type": "plain_text",
                    "text": "Issue summary",
                    "emoji": true
                }
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
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Choose an environment",
                        "emoji": true
                    },
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "AAT / Staging",
                                "emoji": true
                            },
                            "value": "staging"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Preview / Dev",
                                "emoji": true
                            },
                            "value": "dev"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Production",
                                "emoji": true
                            },
                            "value": "production"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Perftest / Test",
                                "emoji": true
                            },
                            "value": "test"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "ITHC",
                                "emoji": true
                            },
                            "value": "ithc"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "N/A",
                                "emoji": true
                            },
                            "value": "none"
                        }
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
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Choose a service. Select other if missing",
                        "emoji": true
                    },
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Access Management",
                                "emoji": true
                            },
                            "value": "am"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Architecture",
                                "emoji": true
                            },
                            "value": "architecture"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Bulk scan",
                                "emoji": true
                            },
                            "value": "bulkscan"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Bulk print",
                                "emoji": true
                            },
                            "value": "bulkprint"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "CCD",
                                "emoji": true
                            },
                            "value": "ccd"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Civil Damages",
                                "emoji": true
                            },
                            "value": "civildamages"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Civil Unspecified",
                                "emoji": true
                            },
                            "value": "CivilUnspec"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "CMC",
                                "emoji": true
                            },
                            "value": "cmc"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Divorce",
                                "emoji": true
                            },
                            "value": "divorce"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Domestic Abuse",
                                "emoji": true
                            },
                            "value": "domesticabuse"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "No fault divorce",
                                "emoji": true
                            },
                            "value": "nfdivorce"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Ethos",
                                "emoji": true
                            },
                            "value": "ethos"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Evidence Management",
                                "emoji": true
                            },
                            "value": "evidence"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Expert UI",
                                "emoji": true
                            },
                            "value": "xui"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "FaCT",
                                "emoji": true
                            },
                            "value": "fact"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Financial Remedy",
                                "emoji": true
                            },
                            "value": "finrem"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "FPLA",
                                "emoji": true
                            },
                            "value": "fpla"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Family Private Law",
                                "emoji": true
                            },
                            "value": "FPRL"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Family Public Law",
                                "emoji": true
                            },
                            "value": "FPL"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Heritage",
                                "emoji": true
                            },
                            "value": "heritage"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "HMI",
                                "emoji": true
                            },
                            "value": "hmi"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Management Information",
                                "emoji": true
                            },
                            "value": "mi"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Immigration and Asylum",
                                "emoji": true
                            },
                            "value": "iac"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "IDAM",
                                "emoji": true
                            },
                            "value": "idam"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Other",
                                "emoji": true
                            },
                            "value": "other"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Probate",
                                "emoji": true
                            },
                            "value": "probate"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Reference Data",
                                "emoji": true
                            },
                            "value": "refdata"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Reform Software Engineering",
                                "emoji": true
                            },
                            "value": "reform-software-engineering"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Security Operations or Secure design",
                                "emoji": true
                            },
                            "value": "security"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "SSCS",
                                "emoji": true
                            },
                            "value": "sscs"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "PayBubble",
                                "emoji": true
                            },
                            "value": "paybubble"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "PET",
                                "emoji": true
                            },
                            "value": "pet"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "Work Allocation",
                                "emoji": true
                            },
                            "value": "workallocation"
                        }
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
                "block_id": "impact",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "impact",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Give impact details"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "What is the impact?",
                    "emoji": true
                }
            },
            {
                "type": "input",
                "block_id": "roles",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "roles",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Roles"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Provide roles",
                    "emoji": true
                }
            },        
            {
                "type": "input",
                "block_id": "steps",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "steps",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Steps"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Provide steps to reproduce the issue",
                    "emoji": true
                }
            },    
            {
                "type": "input",
                "block_id": "expected",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "expected",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Expected result"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Provide provide expected result",
                    "emoji": true
                }
            },     
            {
                "type": "input",
                "block_id": "actual",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "actual",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Actual result"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Provide provide actual result",
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
            }
        ],
        "type": "modal",
        "callback_id": "create_bug_request"
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
    extractSlackLinkFromText,
    createSupportRequestAnnouncement,
    openBugRequestBlocks
}