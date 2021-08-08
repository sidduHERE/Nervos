import Web3 from 'web3';
import { BaseContract } from '../../types/types';
export declare class SimpleStorageWrapper {
    web3: Web3;
    contract: BaseContract;
    address: string;
    constructor(web3: Web3);
    get isDeployed(): boolean;
    totalnumberofVotes(fromAddress: string): Promise<number>;
    vote(value: number, fromAddress: string): Promise<any>;
    deploy(fromAddress: string): Promise<void>;
    useDeployed(contractAddress: string): void;
}
