import {ethers} from "ethers";
import {Validator, Operator} from "./model";
import {events} from "./abi/ssvabi";
import {indexed} from "@subsquid/evm-abi";
import * as p from "@subsquid/evm-codec";

interface EventHandlerMap {
    [key: string]: (log: any, block: any, ctx: any) => Promise<void>;
}

export const eventHandlerMap: EventHandlerMap = {
    'OperatorAdded': handleOperatorAdded,
    'ValidatorAdded': handleValidatorAdded,
    // 'ValidatorRemoved': handleValidatorRemoved,
};

async function handleOperatorAdded(log: any, block: any, ctx: any): Promise<void>  {
    let { operatorId, owner,publicKey, fee } = events.OperatorAdded.decode(log);
    const id = `${operatorId}-${process.env.NETWORK}`
    ctx.log.info(`Adding operator ${operatorId} owned by ${owner} being registered with fee: ${fee}`);

    const existingOperator = await ctx.store.get(Operator, {
        where: { id: id },
    });

    if (existingOperator) {
        ctx.log.info(`Operator ${operatorId} owned by ${owner} already exists.`);
        return;
    }

    const operator = new Operator({
        id: id,
        operatorId: BigInt(operatorId),
        network: process.env.NETWORK!,
        version: process.env.VERSION,
        ownerAddress: owner,
        publicKey: publicKey,
        fee: BigInt(fee),
        previousFee: BigInt(fee),
        declaredFee: BigInt(fee),
        addressWhitelist: '',
        memo: null,
        blockNumber: BigInt(block.header.height),
        isValid: true,
        isDeleted: false,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
        whitelistAddresses: [],
        isPrivate: false,
        whitelistingContract: '',
    });

    // await ctx.store.upsert([operator]);
    ctx.log.info(`operator ${operatorId} successfully added!`);

}

async function handleValidatorAdded(log: any, block: any, ctx: any): Promise<void> {
    let { owner, operatorIds, publicKey, shares, cluster } = events.ValidatorAdded.decode(log);
    const id = `${publicKey}-${process.env.NETWORK}-${owner}`;
    ctx.log.info(`Adding validator ${publicKey} owned by ${owner} being registered to cluster with operators: ${operatorIds}`);

    // Check if the validator already exists in the database
    const existingValidator = await ctx.store.get(Validator, {
        where: { id: id },
    });

    if (existingValidator) {
        ctx.log.info(`Validator ${publicKey} owned by ${owner} already exists.`);
        return;
    }

    const validator = new Validator({
        id: id,
        network: process.env.NETWORK,
        version: process.env.VERSION,
        ownerAddress: owner,
        publicKey: publicKey,
        operators: operatorIds.map(id => BigInt(id)),
        shares: shares,
        cluster: generateClusterId(owner, operatorIds),
        blockNumber: BigInt(block.header.height),
        logIndex: BigInt(log.logIndex),
        transactionIndex: BigInt(log.transactionIndex),
        addedAtBlockNumber: BigInt(block.header.height),
        addedAtLogIndex: BigInt(log.logIndex),
        addedAtTransactionIndex: BigInt(log.transactionIndex),
        isValid: true,
        isDeleted: false,
        isLiquidated: false,
        ignoreOnSync: false,
        isDraft: false,
        isPublicKeyValid: true,
        isSharesValid: true,
        isOperatorsValid: true,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
    });


    // await ctx.store.upsert([validator]);
    ctx.log.info(`validator ${publicKey} with operators ${validator.operators} and cluster ${validator.cluster} successfully added!`);
}

function generateClusterId(owner: string, operatorIds: bigint[]): string {
    return ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address', 'uint64[]'], [owner, operatorIds]));
}