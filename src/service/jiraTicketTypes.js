class JiraType {
    static ISSUE = new JiraType('Task', 3, 'Support request');
    static BUG = new JiraType('Bug', 10900, 'Bug');
    static SERVICE = new JiraType('Open ID Connect Service', 17701, 'OpenID Connect Service');
    static ROLE = new JiraType('User Role', 17702, 'User Role');

    constructor(name, id, requestType) {
        this.name = name
        this.id = id
        this.requestType = requestType
    }
}

module.exports.JiraType = JiraType
