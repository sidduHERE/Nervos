"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
const react_1 = __importStar(require("react"));
const web3_1 = __importDefault(require("web3"));
const react_toastify_1 = require("react-toastify");
require("./app.scss");
require("react-toastify/dist/ReactToastify.css");
const web3_2 = require("@polyjuice-provider/web3");
const nervos_godwoken_integration_1 = require("nervos-godwoken-integration");
const SimpleStorageWrapper_1 = require("../lib/contracts/SimpleStorageWrapper");
const config_1 = require("../config");
async function createWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
        const godwokenRpcUrl = config_1.CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: config_1.CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: config_1.CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };
        const provider = new web3_2.PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new web3_1.default(provider || web3_1.default.givenProvider);
        try {
            // Request account access if needed
            await window.ethereum.enable();
        }
        catch (error) {
            // User denied account access...
        }
        return web3;
    }
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}
function App() {
    const [web3, setWeb3] = react_1.useState(null);
    const [contract, setContract] = react_1.useState();
    const [accounts, setAccounts] = react_1.useState();
    const [l2Balance, setL2Balance] = react_1.useState();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = react_1.useState();
    const [storedValue, setStoredValue] = react_1.useState();
    const [deployTxHash, setDeployTxHash] = react_1.useState();
    const [polyjuiceAddress, setPolyjuiceAddress] = react_1.useState();
    const [Layer2DepositAddress, setLayer2DepositValue] = react_1.useState();
    const [L2ethBalance, setL2ethBalance] = react_1.useState();
    //var Layer2DepositAddress:string;
    const [transactionInProgress, setTransactionInProgress] = react_1.useState(false);
    const toastId = react_1.default.useRef(null);
    const [newStoredNumberInputValue, setNewStoredNumberInputValue] = react_1.useState();
    react_1.useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new nervos_godwoken_integration_1.AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
        }
        else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);
    react_1.useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = react_toastify_1.toast.info('Transaction in progress. Confirm MetaMask signing dialog and please wait...', {
                position: 'top-right',
                autoClose: false,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                closeButton: false
            });
        }
        else if (!transactionInProgress && toastId.current) {
            react_toastify_1.toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);
    const account = accounts?.[0];
    async function deployContract() {
        const _contract = new SimpleStorageWrapper_1.SimpleStorageWrapper(web3);
        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);
            const transactionHash = await _contract.deploy(account);
            //setDeployTxHash(transactionHash);
            setExistingContractAddress(_contract.address);
            react_toastify_1.toast('Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.', { type: 'success' });
        }
        catch (error) {
            console.error(error);
            react_toastify_1.toast.error('There was an error sending your transaction. Please check developer console.');
        }
        finally {
            setTransactionInProgress(false);
        }
    }
    async function getStoredValue() {
        const value = await contract.totalnumberofVotes(account);
        react_toastify_1.toast('Successfully read latest stored value.', { type: 'success' });
        setStoredValue(value);
    }
    async function getckethbalance() {
        const value = await contract.getckethbalance(polyjuiceAddress, account);
        react_toastify_1.toast('Successfully read latest stored value.', { type: 'success' });
        setL2ethBalance(value);
    }
    async function getDepositAddress() {
        const addressTranslator = new nervos_godwoken_integration_1.AddressTranslator();
        const Layer2DepositAddress1 = await addressTranslator.getLayer2DepositAddress(web3, "0x5646e4F49D33414FB76E6dd48eA19913ffE1A5f3");
        setLayer2DepositValue(Layer2DepositAddress1.addressString);
    }
    async function setExistingContractAddress(contractAddress) {
        const _contract = new SimpleStorageWrapper_1.SimpleStorageWrapper(web3);
        _contract.useDeployed(contractAddress.trim());
        setContract(_contract);
        setStoredValue(undefined);
    }
    async function setNewStoredValue() {
        try {
            setTransactionInProgress(true);
            await contract.vote(newStoredNumberInputValue, account);
            react_toastify_1.toast('Successfully set latest stored value. You can refresh the read value now manually.', { type: 'success' });
        }
        catch (error) {
            console.error(error);
            react_toastify_1.toast.error('There was an error sending your transaction. Please check developer console.');
        }
        finally {
            setTransactionInProgress(false);
        }
    }
    react_1.useEffect(() => {
        if (web3) {
            return;
        }
        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);
            const _accounts = [window.ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });
            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();
    });
    const LoadingIndicator = () => react_1.default.createElement("span", { className: "rotating-icon" }, "\u2699\uFE0F");
    return (react_1.default.createElement("div", null,
        "Your ETH address: ",
        react_1.default.createElement("b", null, accounts?.[0]),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Your Polyjuice address: ",
        react_1.default.createElement("b", null, polyjuiceAddress || ' - '),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Layer 2 Deposit Address on Layer 1: ",
        react_1.default.createElement("p", null, Layer2DepositAddress || ' - '),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("button", { onClick: getDepositAddress }),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Nervos Layer 2 balance:",
        ' ',
        react_1.default.createElement("b", null,
            l2Balance ? (l2Balance / 10n ** 8n).toString() : react_1.default.createElement(LoadingIndicator, null),
            " CKB"),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        "Current contract address you wish to vote: ",
        react_1.default.createElement("b", { className: "word" }, contract?.address || '-'),
        " ",
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("hr", null),
        react_1.default.createElement("p", null, "the below link will take you to nervos bridge where you can transfer your assets from L1 to L2 , submit your SUDT address in the below field so that we can verifiy your balance after your assets are transferred to Layer 2"),
        react_1.default.createElement("a", { href: "https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos", target: "_blank" }, "Eth - Nervos Bridge"),
        react_1.default.createElement("hr", null),
        react_1.default.createElement("button", { onClick: getckethbalance }, "get cketh Balance on L2"),
        L2ethBalance ? react_1.default.createElement(react_1.default.Fragment, null,
            "\u00A0\u00A0balance of cketh trasnferred to L2 from Eth blockchain: ",
            L2ethBalance.toString()) : null,
        react_1.default.createElement("p", null, "The button below will deploy a eth voting smart contract where any one can do a weighted vote to any existing contract. . After the contract is deployed you can either read number of votes from smart contract or do a weighted vote. You can do that using the interface below."),
        react_1.default.createElement("button", { onClick: deployContract, disabled: !l2Balance }, "Deploy contract"),
        "\u00A0or\u00A0",
        react_1.default.createElement("input", { placeholder: "Existing contract id", onChange: e => setExistingContractIdInputValue(e.target.value) }),
        react_1.default.createElement("button", { disabled: !existingContractIdInputValue || !l2Balance, onClick: () => setExistingContractAddress(existingContractIdInputValue) }, "Use existing contract"),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("button", { onClick: getStoredValue, disabled: !contract }, "Get total number of votes"),
        storedValue ? react_1.default.createElement(react_1.default.Fragment, null,
            "\u00A0\u00A0number of votes: ",
            storedValue.toString()) : null,
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("input", { type: "number", onChange: e => setNewStoredNumberInputValue(parseInt(e.target.value, 10)) }),
        react_1.default.createElement("button", { onClick: setNewStoredValue, disabled: !contract }, "Weighted Vote"),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("br", null),
        react_1.default.createElement("hr", null),
        "The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each transaction you might need to wait up to 120 seconds for the status to be reflected.",
        react_1.default.createElement(react_toastify_1.ToastContainer, null)));
}
exports.App = App;
//# sourceMappingURL=app.js.map