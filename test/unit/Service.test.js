const {Service} = require('../../src/service/Service')

describe('Service', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2026-09-18T12:00:00.000Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('is available when seen within the last 30 seconds', () => {
        const service = new Service('idam-api', 'https://idam-api.example')
        service.setLastSeen(Date.now() - 29_000)

        expect(service.isAvailable()).toBe(true)
    })

    it('is unavailable after 30 seconds', () => {
        const service = new Service('idam-api', 'https://idam-api.example')
        service.setLastSeen(Date.now() - 31_000)

        expect(service.isAvailable()).toBe(false)
    })

    it('formats an available service', () => {
        const service = new Service('idam-api', 'https://idam-api.example')
        service.setLastSeen(Date.now())

        expect(service.toString()).toBe(
            ':white_check_mark:   *idam-api* - Responded within the last few seconds.'
        )
    })

    it('formats a service last seen yesterday', () => {
        const service = new Service('idam-api', 'https://idam-api.example')
        service.setLastSeen(new Date('2026-09-17T10:15:30.000Z').getTime())

        expect(service.toString()).toBe(
            ':x:   *idam-api* - Last seen at 10:15:30 (UTC) yesterday.'
        )
    })

    it.each([
        ['2026-09-01T10:00:00.000Z', 'September 1st.'],
        ['2026-09-02T10:00:00.000Z', 'September 2nd.'],
        ['2026-09-03T10:00:00.000Z', 'September 3rd.'],
        ['2026-09-04T10:00:00.000Z', 'September 4th'],
        ['2026-09-11T10:00:00.000Z', 'September 11th']
    ])('formats the date ordinal for %s', (lastSeen, expectedEnding) => {
        const service = new Service('idam-api', 'https://idam-api.example')
        service.setLastSeen(new Date(lastSeen).getTime())

        expect(service.toString().endsWith(expectedEnding)).toBe(true)
    })
})
