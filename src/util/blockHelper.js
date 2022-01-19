function getActionsElement(blocks, actionId) {
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].type === 'actions') {
            const elements = blocks[i].elements
            for (let j = 0; j < elements.length; j++) {
                const element = elements[j]
                if (actionId.indexOf(element.action_id) > -1) {
                    return element
                }
            }
        }
    }
    return null;
}

function updateActionsElement(blocks, actionId, value) {
    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].type === 'actions') {
            const elements = blocks[i].elements
            for (let j = 0; j < elements.length; j++) {
                if (actionId.indexOf(elements[j].action_id) > -1) {
                    blocks[i].elements[j] = value
                }
            }
        }
    }
}

function getContextElement(blocks, text) {
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]
        if (block.type === 'context') {
            const elements = blocks[i].elements
            for (let j = 0; j < elements.length; j++) {
                const element = elements[j]
                if (element.text.includes(text)) {
                    return element;
                }
            }
        }
    }
    return null;
}

function getSectionField(blocks, text) {
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i]
        if (block.type === 'section' && block.fields !== undefined) {
            const fields = blocks[i].fields
            for (let j = 0; j < fields.length; j++) {
                const field = fields[j]
                if (field.text.includes(text)) {
                    return field;
                }
            }
        }
    }
    return null;
}

module.exports = {
    getActionsElement,
    updateActionsElement,
    getContextElement,
    getSectionField
}
