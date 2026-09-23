function selectedOptionText(input) {
    return input.selected_option?.text.text || 'N/A'
}

function optionalText(input) {
    return input.value || 'N/A'
}

function supportRequestFromView(values, user) {
    return {
        user,
        summary: values.summary.title.value,
        description: values.description.description.value,
        analysis: values.analysis.analysis.value,
        environment: selectedOptionText(values.environment.environment),
        service: selectedOptionText(values.service.service),
        userAffected: optionalText(values.user.user),
        date: optionalText(values.date.date),
        time: optionalText(values.time.time)
    }
}

function bugReportFromView(values, user) {
    return {
        user,
        summary: values.summary.title.value,
        description: values.description.description.value,
        analysis: values.analysis.analysis.value,
        environment: selectedOptionText(values.environment.environment),
        service: selectedOptionText(values.service.service),
        impact: optionalText(values.impact.impact),
        roles: optionalText(values.roles.roles),
        steps: values.steps.steps.value,
        expected: values.expected.expected.value,
        actual: values.actual.actual.value,
        userAffected: optionalText(values.user.user)
    }
}

module.exports = {
    bugReportFromView,
    supportRequestFromView
}
