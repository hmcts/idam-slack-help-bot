const fetch = require('node-fetch-retry');
const {Service} = require("./Service");

const refreshDelay = 15;

const environmentUrls = {
    'AAT': buildNonProdUrl('aat'),
    'PERFTEST': buildNonProdUrl('perftest'),
    'ITHC': buildNonProdUrl('ithc'),
    'DEMO': buildNonProdUrl('demo'),
    'PROD': 'https://hmcts-access.service.gov.uk'
}

const services = {
    'AAT': {
        'idam-web-public': new Service('idam-web-public'),
        'idam-api': new Service('idam-api')
    },
    'PERFTEST': {
        'idam-web-public': new Service('idam-web-public'),
        'idam-api': new Service('idam-api')
    },
    'ITHC': {
        'idam-web-public': new Service('idam-web-public'),
        'idam-api': new Service('idam-api')
    },
    'DEMO': {
        'idam-web-public': new Service('idam-web-public'),
        'idam-api': new Service('idam-api')
    },
    'PROD': {
        'idam-web-public': new Service('idam-web-public'),
        'idam-api': new Service('idam-api')
    }
};

function buildNonProdUrl(env) {
    return `https://idam-web-public.${env}.platform.hmcts.net`;
}

function getAllServiceStatus() {
    return services;
}

(async function monitorStatus() {
    for (const [envName, envUrl] of Object.entries(environmentUrls)) {
        try {
            const response = await fetch(envUrl + '/health', { retry: 3, pause: 1500, silent: true });
            const json = await response.json();

            if(json.status === 'UP') {
                services[envName]['idam-web-public'].setLastSeen(Date.now());
            }

            if(json.components.api.status === 'UP') {
                services[envName]['idam-api'].setLastSeen(Date.now());
            }

        } catch (e) {
            console.log('Failed to connect to ' + envUrl + ' after 3 retries.');
        }
    }

    setTimeout(monitorStatus, refreshDelay * 1000);
})();


module.exports.getAllServiceStatus = getAllServiceStatus;