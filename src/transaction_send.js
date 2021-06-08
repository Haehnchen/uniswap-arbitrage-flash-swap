const Web3 = require('web3');
const net = require('net');

module.exports.factory = (providers, websockets = [], already = []) => {
    const instances = [...already.map(a => [a, 'fixed'])];

    websockets.forEach(websocket => {
        let web3;
        let provider;

        if (websocket.endsWith('.ipc')) {
            provider = 'ipc';
            web3 = new Web3(new Web3.providers.IpcProvider(provider, net));
        } else {
            provider = new URL(websocket).hostname;
            web3 = new Web3(
                new Web3.providers.WebsocketProvider(websocket, {
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
                    }
                })
            );
        }

        web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY)

        instances.push([web3, provider]);
    });

    providers.forEach(provider => {
        let web3Provider;
        let providerName;

        if (provider.startsWith('ws')) {
            providerName = new URL(provider).hostname;
            web3Provider = new Web3.providers.WebsocketProvider(provider, {
                timeout: 30000,

                clientConfig: {
                    keepalive: true,
                    keepaliveInterval: 30000 // ms
                },
                reconnect: {
                    auto: true,
                    delay: 5000, // ms
                    maxAttempts: 15,
                    onTimeout: false
                }
            })
        } else if(provider.endsWith('.ipc')) {
            providerName = 'ipc';
            web3Provider = new Web3(new Web3.providers.IpcProvider(provider, net));
        } else {
            providerName = new URL(provider).hostname;
            web3Provider = new Web3(new Web3.providers.HttpProvider(provider, {
                keepAlive: true,
                timeout: 10000,
            }));
        }

        const web3 = new Web3(web3Provider);

        web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY)

        instances.push([web3, providerName]);
    });

    return {
        sendTransaction: async (txData) => {
            const calls = instances.map(async (instance) => {
                try {
                    const receipt = await instance[0].eth.sendTransaction(txData);
                    console.log(`[${new Date().toLocaleString()}] [${instance[1]}]: Transaction hash: ${receipt.transactionHash}`);
                } catch (e) {
                    console.error(`[${new Date().toLocaleString()}] [${instance[1]}]: `, JSON.stringify(e.message));
                }
            });

            await Promise.allSettled(calls);
        },
        keepAlive: async () => {
            const calls = instances.map(async (instance) => {
                await instance[0].eth.getBlockNumber();
            });

            await Promise.allSettled(calls);
        }
    }
}
