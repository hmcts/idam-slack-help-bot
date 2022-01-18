module.exports.text = (text) => {
    return {
        type: "plain_text",
        text: text,
        emoji: true
    }
}

module.exports.option = (name, option) => {
    return {
        text: {
            type: "plain_text",
            text: name,
            emoji: true
        },
        value: option ?? name.toLowerCase()
    }
}
