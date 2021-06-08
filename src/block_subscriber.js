const Web3 = require('web3');
const {performance} = require('perf_hooks');
const net = require('net');

module.exports.subscribe = (providers, callback) => {
    let currentBlock = [0, performance.now()]

    providers.forEach(provider => {
        let providerName;
        let web3;

        if (provider.endsWith('.ipc')) {
            providerName = 'ipc';
            web3 = new Web3(new Web3.providers.IpcProvider(provider, net));
        } else {
            providerName = new URL(provider).hostname;

            web3 = new Web3(new Web3.providers.WebsocketProvider(provider, {
                timeout: 30000,
                clientConfig: {
                    keepalive: true,
                    keepaliveInterval: 30000 // ms
                },
                reconnect: {
                    auto: true,
                    delay: 10000, // ms
                    maxAttempts: 1500,
                    onTimeout: false
                }})
            );
        }

        web3.eth.subscribe('newBlockHeaders', (error, result) => {
            if (!error) {
                return;
            }
            console.error('errorSubscription', error);
            process.exit();
        }).on("connected", subscriptionId => {
            console.log(`[${providerName}] You are connected on ${subscriptionId}`);
        }).on('data', async (block) => {
            const [lastBlock, lastBlockTime] = currentBlock;
            if (block.number <= lastBlock) {

                // recover window
                if (lastBlock === block.number && performance.now() - lastBlockTime < 500) {
                    callback(block, web3, providerName);
                }

                return;
            }

            currentBlock = [block.number, performance.now()];

            callback(block, web3, providerName);
        }).on('error', error => {
            console.error('error', providerName, error);
        }).on('close', e => {
            console.error('close', providerName, e)
        }).on('end', e => {
            console.error('end', providerName, e)
        });
    });
}
