/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import { ToastContainer, toast } from 'react-toastify';
import './app.scss';
import 'react-toastify/dist/ReactToastify.css';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { AddressTranslator } from 'nervos-godwoken-integration';

import { SimpleStorageWrapper } from '../lib/contracts/SimpleStorageWrapper';
import { CONFIG } from '../config';
import { Address } from 'cluster';

async function createWeb3() {
    // Modern dapp browsers...
    if ((window as any).ethereum) {
        const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
        const providerConfig = {
            rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
            ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
            web3Url: godwokenRpcUrl
        };

        const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
        const web3 = new Web3(provider || Web3.givenProvider);

        try {
            // Request account access if needed
            await (window as any).ethereum.enable();
        } catch (error) {
            // User denied account access...
        }

        return web3;
    }

    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    return null;
}

export function App() {
    const [web3, setWeb3] = useState<Web3>(null);
    const [contract, setContract] = useState<SimpleStorageWrapper>();
    const [proxyContract, setProxyContract] = useState<SimpleStorageWrapper>();
    const [accounts, setAccounts] = useState<string[]>();
    const [l2Balance, setL2Balance] = useState<bigint>();
    const [existingContractIdInputValue, setExistingContractIdInputValue] = useState<string>();
    const [storedValue, setStoredValue] = useState<number | undefined>();
    const [deployTxHash, setDeployTxHash] = useState<string | undefined>();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState<string | undefined>();
    const [Layer2DepositAddress, setLayer2DepositValue] = useState<string | undefined>();
    const [L2ethBalance, setL2ethBalance] = useState<bigint>();
    //var Layer2DepositAddress:string;
      
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = React.useRef(null);
    const [newStoredNumberInputValue, setNewStoredNumberInputValue] = useState<
        number | undefined
    >();

    useEffect(() => {
        if (accounts?.[0]) {
            const addressTranslator = new AddressTranslator();
            setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
        } else {
            setPolyjuiceAddress(undefined);
        }
    }, [accounts?.[0]]);

    useEffect(() => {
        if (transactionInProgress && !toastId.current) {
            toastId.current = toast.info(
                'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
                {
                    position: 'top-right',
                    autoClose: false,
                    hideProgressBar: false,
                    closeOnClick: false,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    closeButton: false
                }
            );
        } else if (!transactionInProgress && toastId.current) {
            toast.dismiss(toastId.current);
            toastId.current = null;
        }
    }, [transactionInProgress, toastId.current]);

    const account = accounts?.[0];

    async function deployContract() {
        const _contract = new SimpleStorageWrapper(web3);

        try {
            setDeployTxHash(undefined);
            setTransactionInProgress(true);

            const transactionHash = await _contract.deploy(account);

            //setDeployTxHash(transactionHash);
            setExistingContractAddress(_contract.address);
            toast(
                'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    async function getStoredValue() {
        const value = await contract.totalnumberofVotes(account);
        toast('Successfully read latest stored value.', { type: 'success' });

        setStoredValue(value);
    }

    async function getckethbalance() {
        // const _proxyContract = new SimpleStorageWrapper(web3);
        // _proxyContract.useproxyContract("0x37383eBfa470e74718a9521Bb88c9034Ac2162Df");

        // setProxyContract(_proxyContract);
        const value = await contract.getckethbalance(polyjuiceAddress,account);
        toast('Successfully read latest stored value.', { type: 'success' });

        setL2ethBalance(value);
    }



    async function getDepositAddress() {
        const addressTranslator = new AddressTranslator();
        const Layer2DepositAddress1 = await addressTranslator.getLayer2DepositAddress(web3,accounts?.[0]);
        setLayer2DepositValue(Layer2DepositAddress1.addressString);
    }

    async function setExistingContractAddress(contractAddress: string) {
        const _contract = new SimpleStorageWrapper(web3);
        _contract.useDeployed(contractAddress.trim());

        setContract(_contract);
        setStoredValue(undefined);
    }

    async function setNewStoredValue() {
        try {
            setTransactionInProgress(true);
            await contract.vote(newStoredNumberInputValue, account);
            toast(
                'Successfully set latest stored value. You can refresh the read value now manually.',
                { type: 'success' }
            );
        } catch (error) {
            console.error(error);
            toast.error(
                'There was an error sending your transaction. Please check developer console.'
            );
        } finally {
            setTransactionInProgress(false);
        }
    }

    useEffect(() => {
        if (web3) {
            return;
        }

        (async () => {
            const _web3 = await createWeb3();
            setWeb3(_web3);

            const _accounts = [(window as any).ethereum.selectedAddress];
            setAccounts(_accounts);
            console.log({ _accounts });

            if (_accounts && _accounts[0]) {
                const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
                setL2Balance(_l2Balance);
            }
        })();
    });

    const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

    return (
        <div>
            Your ETH address: <b>{accounts?.[0]}</b>
            <br />
            <br />
            Your Polyjuice address: <b>{polyjuiceAddress || ' - '}</b>
            <br />
            <br />
            Layer 2 Deposit Address on Layer 1: <p>
                {Layer2DepositAddress || ' - '}
                </p>
            <button onClick={getDepositAddress}>Get L2 deposit Address</button>
            <br />
            <br />
            Nervos Layer 2 balance:{' '}
            <b>{l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
            <br />
            <br />
            Current contract address you wish to vote: <b className="word">{contract?.address || '-'}</b> <br />
            <br />
            <hr />
            <p>
            the below link will take you to nervos bridge where you can transfer your assets from L1 to L2 , submit your SUDT address in the below field so that we can verifiy your balance after your assets are transferred to Layer 2
            </p>
            <a href="https://force-bridge-test.ckbapp.dev/bridge/Ethereum/Nervos"  target="_blank">Eth - Nervos Bridge</a>
            <hr />
            <button onClick={getckethbalance}>
                get cketh Balance on L2 
            </button>
            {L2ethBalance ? <>&nbsp;&nbsp;balance of cketh trasnferred to L2 from Eth blockchain: {L2ethBalance.toString()}</> : null}
            <p>
            The button below will deploy a eth voting smart contract where any one can do a weighted vote to any existing contract.
				. After the contract is deployed you can either
                read number of votes from smart contract or do a weighted vote. You can do that using the
                interface below.
            </p>
            <button onClick={deployContract} disabled={!l2Balance}>
                Deploy contract
            </button>
            &nbsp;or&nbsp;
            <input
                placeholder="Existing contract id"
                onChange={e => setExistingContractIdInputValue(e.target.value)}
            />
            <button
                disabled={!existingContractIdInputValue || !l2Balance}
                onClick={() => setExistingContractAddress(existingContractIdInputValue)}
            >
                Use existing contract
            </button>
            <br />
            <br />
            <button onClick={getStoredValue} disabled={!contract}>
                Get total number of votes 
            </button>
            {storedValue ? <>&nbsp;&nbsp;number of votes: {storedValue.toString()}</> : null}
            <br />
            <br />
            <input
                type="number"
                onChange={e => setNewStoredNumberInputValue(parseInt(e.target.value, 10))}
            />
            <button onClick={setNewStoredValue} disabled={!contract}>
                Weighted Vote
            </button>
            <br />
            <br />
            <br />
            <br />
            <hr />
            The contract is deployed on Nervos Layer 2 - Godwoken + Polyjuice. After each
            transaction you might need to wait up to 120 seconds for the status to be reflected.
            <ToastContainer />
        </div>
    );
}