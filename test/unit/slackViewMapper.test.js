const {bugReportFromView, supportRequestFromView} = require('../../src/service/slackViewMapper')

function textInput(value) {
    return {value}
}

function selectedInput(value) {
    return {selected_option: {text: {text: value}}}
}

describe('supportRequestFromView', () => {
    it('captures every support-request popup input', () => {
        const values = {
            summary: {title: textInput('Cannot sign in')},
            description: {description: textInput('Login redirects to an error page')},
            analysis: {analysis: textInput('Checked the OIDC logs')},
            environment: {environment: selectedInput('AAT / Staging')},
            service: {service: selectedInput('IDAM')},
            user: {user: textInput('Case worker')},
            date: {date: textInput('21 September 2026')},
            time: {time: textInput('10:30')}
        }

        expect(supportRequestFromView(values, 'U123')).toEqual({
            user: 'U123',
            summary: 'Cannot sign in',
            description: 'Login redirects to an error page',
            analysis: 'Checked the OIDC logs',
            environment: 'AAT / Staging',
            service: 'IDAM',
            userAffected: 'Case worker',
            date: '21 September 2026',
            time: '10:30'
        })
    })

    it('records empty optional inputs as N/A', () => {
        const values = {
            summary: {title: textInput('Cannot sign in')},
            description: {description: textInput('Login failed')},
            analysis: {analysis: textInput('Logs checked')},
            environment: {environment: selectedInput('Production')},
            service: {service: selectedInput('IDAM')},
            user: {user: textInput(null)},
            date: {date: textInput('')},
            time: {time: textInput(undefined)}
        }

        expect(supportRequestFromView(values, 'U123')).toEqual(expect.objectContaining({
            userAffected: 'N/A',
            date: 'N/A',
            time: 'N/A'
        }))
    })

    it('records missing select values as N/A', () => {
        const values = {
            summary: {title: textInput('Cannot sign in')},
            description: {description: textInput('Login failed')},
            analysis: {analysis: textInput('Logs checked')},
            environment: {environment: {selected_option: null}},
            service: {service: {}},
            user: {user: textInput('Case worker')},
            date: {date: textInput('21 September 2026')},
            time: {time: textInput('10:30')}
        }

        expect(supportRequestFromView(values, 'U123')).toEqual(expect.objectContaining({
            environment: 'N/A',
            service: 'N/A'
        }))
    })
})

describe('bugReportFromView', () => {
    it('captures every bug-report popup input', () => {
        const values = {
            summary: {title: textInput('Access denied')},
            description: {description: textInput('Users cannot open cases')},
            analysis: {analysis: textInput('Permissions checked')},
            environment: {environment: selectedInput('Production')},
            service: {service: selectedInput('CCD')},
            impact: {impact: textInput('All case workers are blocked')},
            roles: {roles: textInput('caseworker, admin')},
            steps: {steps: textInput('Open a case')},
            expected: {expected: textInput('The case opens')},
            actual: {actual: textInput('An access denied page appears')},
            user: {user: textInput('Case workers')}
        }

        expect(bugReportFromView(values, 'U456')).toEqual({
            user: 'U456',
            summary: 'Access denied',
            description: 'Users cannot open cases',
            analysis: 'Permissions checked',
            environment: 'Production',
            service: 'CCD',
            impact: 'All case workers are blocked',
            roles: 'caseworker, admin',
            steps: 'Open a case',
            expected: 'The case opens',
            actual: 'An access denied page appears',
            userAffected: 'Case workers'
        })
    })

    it('records empty optional inputs as N/A', () => {
        const values = {
            summary: {title: textInput('Access denied')},
            description: {description: textInput('Users cannot open cases')},
            analysis: {analysis: textInput('Permissions checked')},
            environment: {environment: selectedInput('Production')},
            service: {service: selectedInput('CCD')},
            impact: {impact: textInput(null)},
            roles: {roles: textInput('')},
            steps: {steps: textInput('Open a case')},
            expected: {expected: textInput('The case opens')},
            actual: {actual: textInput('Access denied')},
            user: {user: textInput(undefined)}
        }

        expect(bugReportFromView(values, 'U456')).toEqual(expect.objectContaining({
            impact: 'N/A',
            roles: 'N/A',
            userAffected: 'N/A'
        }))
    })
})
