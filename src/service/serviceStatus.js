const fetch = require('node-fetch-retry');
const {Service} = require("./Service");

const refreshDelay = 15;
const services = {
    'AAT': getNonProdServices('aat'),
    'PERFTEST': getNonProdServices('perftest'),
    'ITHC': getNonProdServices('ithc'),
    'DEMO': getNonProdServices('demo'),
    'PROD': [
        new Service('idam-api', `https://idam-api.platform.hmcts.net`),
        new Service('idam-web-public', `https://hmcts-access.service.gov.uk`),
        new Service('idam-user-dashboard', `https://idam-user-dashboard.platform.hmcts.net`)
    ]
}

function getAllServiceStatus() {
    return services;
}

function getNonProdServices(env) {
    return [
        new Service('idam-api', `https://idam-api.${env}.platform.hmcts.net`),
        new Service('idam-web-public', `https://idam-web-public.${env}.platform.hmcts.net`),
        new Service('idam-user-dashboard', `https://idam-user-dashboard.${env}.platform.hmcts.net`)
    ]
}

function monitorStatus() {
    Object.entries(services).forEach(([env, services]) => {
        services.forEach(service => {
            const controller = new AbortController();
            const signal = controller.signal;

            new Promise((resolve, reject) => {
                fetch(service.url + '/health', { signal, retry: 3, pause: 1500, silent: true })
                    .then(response => resolve(response.json()))
                    .catch(() => reject);

                setTimeout(() => {
                    controller.abort();
                    reject();
                }, refreshDelay * 1000);
            })
                .then(data => {
                    if(data.status === 'UP') {
                        service.setLastSeen((Date.now()));
                    }
                })
                .catch(() => {
                    console.log('Failed to connect to ' + service.url + ' after 3 retries.');
                });
        })
    })
}

monitorStatus();
setInterval(monitorStatus, refreshDelay * 1000)

module.exports.getAllServiceStatus = getAllServiceStatus;