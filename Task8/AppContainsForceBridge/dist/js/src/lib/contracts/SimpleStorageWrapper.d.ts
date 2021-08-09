import Web3 from 'web3';
import { BaseContract } from '../../types/types';
export declare class SimpleStorageWrapper {
    web3: Web3;
    anothercontract: BaseContract;
    contract: BaseContract;
    address: string;
    constructor(web3: Web3);
    get isDeployed(): boolean;
    totalnumberofVotes(fromAddress: string): Promise<number>;
    getckethbalance(polyjuiceAddress: string, fromAddress: string): Promise<any>;
    vote(value: number, fromAddress: string): Promise<any>;
    deploy(fromAddress: string): Promise<void>;
    useDeployed(contractAddress: string): void;
}
