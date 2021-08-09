import Web3 from 'web3';
import * as SimpleStorageJSON from '../../../build/contracts/SimpleStorage.json';
import * as SudtERC20ProxyJSON from '../../../build/contracts/SudtERC20Proxy.json';
import { BaseContract } from '../../types/types';
const DEFAULT_SEND_OPTIONS = {
    gas: 6000000
    };
export class SimpleStorageWrapper {
    web3: Web3;
    anothercontract: BaseContract;
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

    async getckethbalance(polyjuiceAddress: string, fromAddress: string) {
        this.anothercontract = new this.web3.eth.Contract(SudtERC20ProxyJSON.abi as any) as any;
        this.useproxyContract("0x37383eBfa470e74718a9521Bb88c9034Ac2162Df");
        const data = await this.anothercontract.methods.balanceOf(polyjuiceAddress).call({ from: fromAddress });
        return data;
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

    useproxyContract(contractAddress: string) {
        this.anothercontract.options.address = contractAddress;
    }
}
