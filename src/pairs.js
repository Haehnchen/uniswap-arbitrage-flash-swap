const pancake = {
    router: "0x10ed43c718714eb63d5aa57b78b54704e256024e",
    factory: "0xca143ce32fe78f1f7019d7d551a6402fc5350c73",
    routerV1: "0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F",
    factoryV1: "0xBCfCcbde45cE874adCB698cC183deBcF17952812"
};
const panther = {
    router: "0xbe65b8f75b9f20f4c522e0067a3887fada714800",
    factory: "0x0eb58e5c8aa63314ff5547289185cc4583dfcbd5"
};

module.exports.getPairs = () => {

    const BNB_MAINNET = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';
    const BUSD_MAINNET = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';

    const pairs = [
        {
            name: 'BUSD/BNB pancake>panther',
            tokenBorrow: BUSD_MAINNET,
            amountTokenPay: 1000,
            tokenPay: BNB_MAINNET,
            sourceRouter: pancake.router,
            targetRouter: panther.router,
            sourceFactory: pancake.factory,
        },
        {
            name: 'BUSD/BNB panther>pancake',
            tokenBorrow: BUSD_MAINNET,
            amountTokenPay: 1000,
            tokenPay: BNB_MAINNET,
            sourceRouter: panther.router,
            targetRouter: pancake.router,
            sourceFactory: panther.factory,
        }
    ]

    return pairs
}