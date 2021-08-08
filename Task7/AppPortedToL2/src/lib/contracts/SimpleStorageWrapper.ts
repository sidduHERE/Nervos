import Web3 from 'web3';
import * as SimpleStorageJSON from '../../../build/contracts/SimpleStorage.json';
import { BaseContract } from '../../types/types';
const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
    };
export class SimpleStorageWrapper {
    web3: Web3;

    contract: BaseContract;

    address: string;
    
    constructor(web3: Web3) {
        this.web3 = web3;
        this.contract = new web3.eth.Contract(SimpleStorageJSON.abi as any) as any;
    }

    get isDeployed() {
        return Boolean(this.address);
    }

    async totalnumberofVotes(fromAddress: string) {
        const data = await this.contract.methods.totalnumberofVotes().call({ from: fromAddress });

        return parseInt(data, 10);
    }

    async vote(value: number, fromAddress: string) {
        const tx = await this.contract.methods.vote(value).send({
            ...DEFAULT_SEND_OPTIONS,
            from: fromAddress,
            value
        });

        return tx;
    }

    async deploy(fromAddress: string) {
        const contract = await (this.contract
            .deploy({
                data: SimpleStorageJSON.bytecode,
                arguments: []
            })
            .send({
                ...DEFAULT_SEND_OPTIONS,
                from: fromAddress,
                to: '0x0000000000000000000000000000000000000000'
            } as any) as any);

        this.useDeployed(contract.contractAddress);
    }

    useDeployed(contractAddress: string) {
        this.address = contractAddress;
        this.contract.options.address = contractAddress;
    }
}
