const {updateActionsElement} = require("./blockHelper");
const {getSectionField} = require("./blockHelper");
const {getContextElement} = require("./blockHelper");
const {getActionsElement} = require("./blockHelper");


describe('blockHelper', () => {
    const contextElementText = 'View on Jira: <https://tools.hmcts.net/jira/browse/SBOX-123|SBOX-123>'
    const blocks = [
        {
            type: 'section',
            fields: [
                {
                    type: 'mrkdwn',
                    text: 'field_1'
                },
                {
                    type: 'mrkdwn',
                    text: 'field_2'
                }
            ]
        },
        {
            type: 'divider'
        },
        {
            type: 'context',
            elements: [
                {
                    text: `${contextElementText}`
                }
            ]
        },
        {
            type: 'actions',
            block_id: 'actions',
            elements: [
                {
                    type: 'users_select',
                    value: 'action_1',
                    action_id: 'action_1'
                },
                {
                    type: 'button',
                    value: 'action_2',
                    action_id: 'action_2'
                }
            ]
        }
    ]

    const originalElement = {
        type: 'button',
        value: 'action_2',
        action_id: 'action_2'
    }

    const updatedElement = {
            type: 'button',
            value: 'action_3',
            action_id: 'action_3'
    }

    it('Should get action element', () => {
        const element = getActionsElement(blocks, /action_2|action_3/)
        expect(element.value).toBe('action_2')
    })

    it('Should not get action element if element does not exist', () => {
        const element = getActionsElement(blocks, /action_3|action_4/)
        expect(element).toBeNull()
    })

    it('Should update action element', () => {
        updateActionsElement(blocks, /action_2|action_3/, updatedElement)
        expect(blocks[3].elements[1].value).toBe(updatedElement.value)

        updateActionsElement(blocks, /action_2|action_3/, originalElement)
        expect(blocks[3].elements[1].value).toBe(originalElement.value)
    })

    it('Should not update action element if element does not exist', () => {
        updateActionsElement(blocks, /action_10/, updatedElement)
        expect(blocks[3].elements[1].value).toBe(originalElement.value)
    })

    it('Should get context element', () => {
        const element = getContextElement(blocks, 'View on Jira')
        expect(element.text).toBe(`${contextElementText}`)
    })

    it('Should not get context element if element does not exist', () => {
        const element = getContextElement(blocks, 'Different text')
        expect(element).toBeNull()
    })

    it('Should get section field', () => {
        const field = getSectionField(blocks, 'field_2')
        expect(field.text).toBe('field_2')
    })

    it('Should not get section field if field does not exist', () => {
        const field = getSectionField(blocks, 'field_3')
        expect(field).toBeNull()
    })
})