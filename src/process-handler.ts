import {ethers} from "ethers";
import {Validator} from "./model";
import {events} from "./abi/ssvabi";

interface EventHandlerMap {
    [key: string]: (log: any, block: any, ctx: any) => Promise<void>;
}

export const eventHandlerMap: EventHandlerMap = {
    'ValidatorAdded': handleValidatorAdded,
    // 'ValidatorRemoved': handleValidatorRemoved,
};

async function handleValidatorAdded(log: any, block: any, ctx: any): Promise<void> {
    let { owner, operatorIds, publicKey, shares, cluster } = events.ValidatorAdded.decode(log)
    ctx.log.info(`Adding validator ${publicKey} owned by ${owner} being registered to cluster with operators: ${operatorIds}`)

    const validator = new Validator({
        id: `${publicKey}-${process.env.NETWORK}-${owner}`,
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
    ctx.log.info(`validator ${publicKey} with operators ${validator.operators} successfully added!`)
}

function generateClusterId(owner: string, operatorIds: bigint[]): string {
    return ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address', 'uint64[]'], [owner, operatorIds]));
}