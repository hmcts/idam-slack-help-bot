const config = require("config");
const refreshDelay = config.get('service-refresh-time');

function Service(name) {
    this.name = name;
    this.lastSeen = 0;
}

Service.prototype.isAvailable = function () {
    const now = Date.now()
    return (now - this.lastSeen) <= refreshDelay * 1000;
}

Service.prototype.setLastSeen = function (lastSeenTime) {
    this.lastSeen = lastSeenTime;
}

Service.prototype.toString = function () {
    if(this.isAvailable()) {
        return `:white_check_mark: *${this.name}* - Responded within the last ${refreshDelay} seconds.`;
    }

    const now = new Date();
    const lastSeen = new Date(this.lastSeen);
    let text = `:x: *${this.name}* - Last seen at ${lastSeen.toLocaleTimeString()} `;

    if (now.getDate() - 1 === lastSeen.getDate()) {
        return text + ' yesterday.'
    }

    text += `${lastSeen.toLocaleString('default', { month: 'long' })} ${lastSeen.getDate()}`;

    // Append date ordinal
    if (lastSeen.getDate() > 3 && lastSeen.getDate() < 21) return 'th';
    switch (lastSeen.getDate() % 10) {
        case 1:
            text += "st.";
            break;
        case 2:
            text += "nd.";
            break;
        case 3:
            text += "rd.";
            break;
        default:
            text += "th.";
    }

    return text;
}

module.exports.Service = Service;