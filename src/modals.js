const { option, text } = require('./helpers');

module.exports.ticketTypePickerModal = () => {
    return {
        "type": "modal",
        "title": {
            "type": "plain_text",
            "text": "IDAM Support Request"
        },
        "blocks": [
            {
                "type": "actions",
                "block_id": "stage_one",
                "elements": [
                    {
                        "type": "static_select",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Please select the ticket type"
                        },
                        "action_id": "type_selector",
                        "options": [
                            option('Open ID Connect Service', 'openid'),
                            option('User Role', 'user'),
                            option('Support', 'support'),
                            option('Bug', 'bug')
                        ]
                    },
                    {
                        "type": "button",
                        "text": {
                            "type": "plain_text",
                            "text": "Next"
                        },
                        "value": "Next",
                        "style": "primary",
                        "action_id": "show_type_form"
                    }
                ]
            }
        ],
        "callback_id": "show_type_form"
    }
}

module.exports.openIDRequestModal = () => {
    return {
        "title": text('IDAM OIDC Request'),
        "submit": text('Submit'),
        "blocks": [
            {
                "type": "input",
                "block_id": "oidc_summary",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "oidc_summary",
                    "placeholder": text('Short description')
                },
                "label": text('Issue summary')
            },
            {
                "type": "input",
                "block_id": "oidc_name",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "oidc_name",
                    "placeholder": text('Human-friendly name of your service')
                },
                "label": text('Service name')
            },
            {
                "type": "input",
                "block_id": "oidc_desc",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "oidc_desc",
                    "placeholder": text('Describe in few words what your service does')
                },
                "label": text('Service description')
            },
            {
                "type": "input",
                "block_id": "oidc_client_id",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "oidc_client_id",
                    "placeholder": text('Unique identified for your IDAM application')
                },
                "label": text('Service client-id')
            },
            {
                "type": "input",
                "block_id": "oidc_client_secret_name",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "oidc_client_secret_name",
                    "placeholder": text('The name of a KeyVault secret where your client_secret is securely stored.')
                },
                "label": text('Service client-secret name')
            },
            {
                "type": "input",
                "block_id": "oidc_keyvault_name",
                "optional": true,
                "element": {
                    "type": "plain_text_input",
                    "action_id": "oidc_keyvault_name",
                    "placeholder": text('The name of the KeyVault instance your application is using')
                },
                "label": text('Service Azure KeyVault instance')
            },
            {
                "type": "input",
                "block_id": "oidc_redirect_uris",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "oidc_redirect_uris",
                    "placeholder": text('The redirect URI of your app, where authentication responses can be sent and received by your app')
                },
                "label": text('Service redirect URIs')
            },
            {
                "type": "section",
                "text": text('Self-registration enabled?'),
                "accessory": {
                    "type": "radio_buttons",
                    "options": [
                        option('Yes'),
                        option('No')
                    ],
                    "initial_option": option('No'),
                    "action_id": "oidc_self_registration"
                }
            },
            {
                "type": "section",
                "text": text('MFA enabled?'),
                "accessory": {
                    "type": "radio_buttons",
                    "options": [
                        option('Yes'),
                        option('No')
                    ],
                    "initial_option": option('No'),
                    "action_id": "oidc_mfa"
                }
            },
            {
                "type": "section",
                "text": text('Judicial SSO enabled?'),
                "accessory": {
                    "type": "radio_buttons",
                    "options": [
                        option('Yes'),
                        option('No')
                    ],
                    "initial_option": option('No'),
                    "action_id": "oidc_judicial_sso"
                }
            },
            {
                "type": "input",
                "block_id": "oidc_super_user_email",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "oidc_super_user_email",
                    "placeholder": text('ex. bruce.wayne@hmcts.net')
                },
                "label": text('Super-user/admin-user email (leave blank if admin-user for managing users not required)')
            },
            {
                "type": "section",
                "text": text('User search via API enabled?'),
                "accessory": {
                    "type": "radio_buttons",
                    "options": [
                        option('Yes'),
                        option('No')
                    ],
                    "initial_option": option('No'),
                    "action_id": "oidc_search_via_api"
                }
            },
            {
                "type": "section",
                "text": text('User registration via API enabled?'),
                "accessory": {
                    "type": "radio_buttons",
                    "options": [
                        option('Yes'),
                        option('No')
                    ],
                    "initial_option": option('No'),
                    "action_id": "oidc_register_via_api"
                }
            },
            {
                "type": "section",
                "text": text('User management via API enabled?'),
                "accessory": {
                    "type": "radio_buttons",
                    "options": [
                        option('Yes'),
                        option('No')
                    ],
                    "initial_option": option('No'),
                    "action_id": "oidc_manage_via_api"
                }
            }
        ],
        "type": "modal",
        "callback_id": "create_help_request"
    }
}

module.exports.userRequestModal = () => {
    return {
        "title": text('IDAM User Request'),
        "submit": text('Submit'),
        "blocks": [
            {
                "type": "input",
                "block_id": "user_role_summary",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "user_role_summary",
                    "placeholder": text('Short description of the issue')
                },
                "label": text('Issue summary')
            },
            {
                "type": "input",
                "block_id": "user_role_analysis",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "user_role_analysis",
                    "placeholder": text('Give us more detail')
                },
                "label": text('What analysis has already been done?')
            },
            {
                "type": "section",
                "block_id": "text",
                "text": text('Below are questions about your service"')
            },
            {
                "type": "input",
                "block_id": "user_role_reporter_team",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "user_role_reporter_team",
                    "placeholder": text('Tell us what team you are in')
                },
                "label": text('Reporter team')
            },
            {
                "type": "input",
                "block_id": "user_role_role_name",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "user_role_role_name",
                    "placeholder": text('Must be one word, can be dash separated')
                },
                "label": text('Role name')
            },
            {
                "type": "input",
                "block_id": "user_role_role_description",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "user_role_role_description",
                    "placeholder": text('Tell us in few words what this role does')
                },
                "label": text('Role description')
            },
            {
                "type": "section",
                "text": text('Can CCD admin users manage this role?'),
                "accessory": {
                    "type": "radio_buttons",
                    "options": [
                        option('Yes'),
                        option('No')
                    ],
                    "initial_option": option('No'),
                    "action_id": "user_role_ccd_managed"
                }
            },
            {
                "type": "section",
                "text": text('Can PRD admin users manage this role?'),
                "accessory": {
                    "type": "radio_buttons",
                    "options": [
                        option('Yes'),
                        option('No')
                    ],
                    "initial_option": option('No'),
                    "action_id": "user_role_prd_managed"
                }
            }
        ],
        "type": "modal",
        "callback_id": "create_help_request"
    }
}

module.exports.bugReportModal = () => {
    return {
        "title": text('IDAM Bug Report'),
        "submit": text('Submit'),
        "blocks": [
            {
                "type": "input",
                "block_id": "bug_report_summary",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "bug_report_summary",
                    "placeholder": text('Short description of the issue')
                },
                "label": text('Issue summary')
            },
            {
                "type": "input",
                "block_id": "bug_report_desc",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "bug_report_desc",
                    "placeholder": text('Give us more detail')
                },
                "label": text('Issue description')
            },
            {
                "type": "input",
                "block_id": "bug_report_analysis",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "bug_report_analysis",
                    "placeholder": text('Write something')
                },
                "label": text('What analysis has already been done?')
            },
            {
                "type": "input",
                "block_id": "bug_report_environment",
                "optional": true,
                "element": {
                    "type": "static_select",
                    "placeholder": text('Choose an environment'),
                    "options": [
                        option('AAT / Staging', 'staging'),
                        option('Preview / Dev', 'dev'),
                        option('Production'),
                        option('Perftest / Test', 'test'),
                        option('ITHC'),
                        option('N/A', 'none'),
                    ],
                    "action_id": "bug_report_environment"
                },
                "label": text('Environment')
            },
            {
                "type": "input",
                "block_id": "bug_report_impact",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "bug_report_impact",
                    "placeholder": text('Write something')
                },
                "label": text('Impact to users and/or service')
            },
            {
                "type": "input",
                "block_id": "bug_report_service_affected",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "bug_report_service_affected",
                    "placeholder": text('Choose a service')
                },
                "label": text('Service affected')
            },
            {
                "type": "input",
                "block_id": "bug_report_roles_affected",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "bug_report_roles_affected",
                    "placeholder": text('Write something')
                },
                "label": text('Roles affected')
            },
            {
                "type": "input",
                "block_id": "bug_report_reproduce_steps",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "bug_report_reproduce_steps",
                    "placeholder": text('Detailed step by step of how this issue can be replicated by the IDAM team')
                },
                "label": text('Steps to reproduce')
            },
            {
                "type": "input",
                "block_id": "bug_report_behaviour_expected",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "bug_report_behaviour_expected",
                    "placeholder": text('Write something')
                },
                "label": text('Expected behaviour')
            },
            {
                "type": "input",
                "block_id": "bug_report_behaviour_actual",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "bug_report_behaviour_actual",
                    "placeholder": text('Write something')
                },
                "label": text('Actual behaviour')
            },
            {
                "type": "input",
                "block_id": "bug_report_service_rep",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "bug_report_service_rep",
                    "placeholder": text('Who is your technical liaison?')
                },
                "label": text('Service representative')
            }
        ],
        "type": "modal",
        "callback_id": "create_help_request"
    }
}

module.exports.supportRequestModal = () => {
    return {
        "title": text('IDAM Support Request'),
        "submit": text('Submit'),
        "blocks": [
            {
                "type": "input",
                "block_id": "support_request_summary",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "support_request_summary",
                    "placeholder": text('Short description of the issue')
                },
                "label": text('Issue summary')
            },
            {
                "type": "input",
                "block_id": "support_request_description",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "support_request_description",
                    "placeholder": text('Give us more detail')
                },
                "label": text('Issue description')
            },
            {
                "type": "input",
                "block_id": "support_request_analysis",
                "element": {
                    "type": "plain_text_input",
                    "multiline": true,
                    "action_id": "support_request_analysis",
                    "placeholder": text('Write something')
                },
                "label": text('What analysis has already been done?')
            },
            {
                "type": "input",
                "block_id": "support_request_environment",
                "optional": true,
                "element": {
                    "type": "static_select",
                    "placeholder": text('Choose an environment'),
                    "options": [
                        option('AAT / Staging', 'staging'),
                        option('Preview / Dev', 'dev'),
                        option('Production'),
                        option('Perftest / Test', 'test'),
                        option('ITHC'),
                        option('N/A', 'none'),
                    ],
                    "action_id": "support_request_environment"
                },
                "label": text('Environment')
            },
            {
                "type": "input",
                "block_id": "support_request_service_affected",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "support_request_service_affected",
                    "placeholder": text('Choose a service')
                },
                "label": text('Service affected')
            },
            {
                "type": "input",
                "block_id": "support_request_user_affected",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "support_request_user_affected",
                    "placeholder": text('Write something')
                },
                "label": text('User affected')
            },
            {
                "type": "section",
                "block_id": "support_request_date",
                "text": text('Date the issue occurred'),
                "accessory": {
                    "type": "datepicker",
                    "initial_date": "1990-04-28",
                    "placeholder": text('Select a date'),
                    "action_id": "support_request_date"
                }
            },
            {
                "type": "section",
                "block_id": "support_request_time",
                "text": text('Time the issue occurred'),
                "accessory": {
                    "type": "timepicker",
                    "action_id": "support_request_time",
                    "initial_time": "11:40",
                    "placeholder": text('Select a time')
                }
            },
        ],
        "type": "modal",
        "callback_id": "create_help_request"
    }
}