const { convertIso8601ToEpochSeconds, extractSlackLinkFromText, convertJiraKeyToUrl} = require('./util/helpers');

function helpRequestRaised({
                               user,
                               summary,
                               environment,
                               service,
                               userAffected,
                               jiraId
                           }) {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*${summary}*`,
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "fields": [
                {
                    "type": "mrkdwn",
                    "text": "*Status* :fire:  \n Open"
                },
                {
                    "type": "mrkdwn",
                    "text": `*Reporter* :man-surfing: \n <@${user}>`
                },
                {
                    "type": "mrkdwn",
                    "text": `*Environment* :house_with_garden: \n ${environment}`
                },
                {
                    "type": "mrkdwn",
                    "text": `*Service affected* :service_dog: \n ${service}`
                },
                {
                    "type": "mrkdwn",
                    "text": `*User affected* :person_with_probing_cane: \n ${userAffected}`
                }
            ]
        },
        {
            "type": "context",
            "elements": [
                {
                    "type": "mrkdwn",
                    "text": `View on Jira: <${convertJiraKeyToUrl(jiraId)}|${jiraId}>`
                }
            ]
        },
        {
            "type": "divider"
        },
        {
            "type": "actions",
            "block_id": "actions",
            "elements": [
                {
                    "type": "users_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Unassigned",
                        "emoji": true
                    },
                    "action_id": "assign_help_request_to_user"
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": ":raising_hand: Take it",
                        "emoji": true
                    },
                    "style": "primary",
                    "value": "assign_help_request_to_me",
                    "action_id": "assign_help_request_to_me"
                },
                {
                    "type": "button",
                    "text": {
                        "type": "plain_text",
                        "text": ":female-firefighter: Start",
                        "emoji": true
                    },
                    "style": "primary",
                    "value": "start_help_request",
                    "action_id": "start_help_request"
                }
            ]
        },
        {
            "type": "divider"
        }
    ]
}

function helpRequestDetails(
    {
        description,
        analysis,
        date,
        time
    }) {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*Description* :spiral_note_pad: \n ${description}`
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*Analysis* :thinking_face: \n ${analysis}`
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*Date issue occurred* :date: \n ${date}`
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*Time issue occurred* :hourglass: \n ${time}`
            }
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
            "text": {
                "type": "mrkdwn",
                "text": `*<${link}|${summary}>*`
            },
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
                {
                    "type": "mrkdwn",
                    "text": `*:alarm_clock: Opened:*\n <!date^${convertIso8601ToEpochSeconds(created)}^{date_pretty} ({time})|${created}>`
                },
                {
                    "type": "mrkdwn",
                    "text": `*:hourglass: Last Updated:*\n <!date^${convertIso8601ToEpochSeconds(updated)}^{date_pretty} ({time})|${updated}>`
                },
                {
                    "type": "mrkdwn",
                    "text": `*View on Jira*:\n <${convertJiraKeyToUrl(jiraId)}|${jiraId}>`
                }
            ]
        },
        ]
}

function appHomeUnassignedIssues(openIssueBlocks) {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Open unassigned issues*"
            }
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
                    "text": "Issue summary"
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
                "element": {
                    "type": "static_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Choose a service. Select other if missing",
                        "emoji": true
                    },
                    "options": [
                        option('Access Management', 'am'),
                        option('Architecture'),
                        option('Bulk scan', 'bulkscan'),
                        option('Bulk print', 'bulkprint'),
                        option('CCD'),
                        option('Civil Damages', 'civildamages'),
                        option('Civil Unspecified', 'CivilUnspec'),
                        option('CMC'),
                        option('Divorce'),
                        option('Domestic Abuse', "domesticabuse"),
                        option('No fault divorce', 'nfdivorce'),
                        option('Ethos'),
                        option('Evidence Management', 'evidence'),
                        option('Expert UI', 'xui'),
                        option('FaCT'),
                        option('Financial Remedy', 'finrem'),
                        option('FPLA'),
                        option('Family Private Law', 'FPRL'),
                        option('Family Public Law', 'FPL'),
                        option('Heritage'),
                        option('HMI'),
                        option('Management Information', 'mi'),
                        option('Immigration and Asylum', 'iac'),
                        option('IDAM'),
                        option('Other'),
                        option('Probate'),
                        option('Reference Data', 'refdata'),
                        option('Reform Software Engineering', 'reform-software-engineering'),
                        option('Security Operations or Secure design', 'security'),
                        option('SSCS'),
                        option('PayBubble'),
                        option('PET'),
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
    helpRequestRaised,
    helpRequestDetails,
    openHelpRequestBlocks,
    extractSlackLinkFromText
}