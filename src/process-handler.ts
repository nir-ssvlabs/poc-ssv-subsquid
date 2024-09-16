import {ethers} from "ethers";
import {Validator} from "./model";

interface EventHandlerMap {
    [key: string]: (log: any, block: any, ctx: any) => Promise<void>;
}

export const eventHandlerMap: EventHandlerMap = {
    'ValidatorAdded': handleValidatorAdded,
    // 'ValidatorRemoved': handleValidatorRemoved,
};

async function handleValidatorAdded(log: any, block: any, ctx: any): Promise<void> {
    const parsedLog = ethers.utils.defaultAbiCoder.decode(
        ['address', 'uint64[]', 'bytes', 'bytes', '(uint32,uint64,uint64,bool,uint256)'],
        log.data
    );

    const event = {
        params: {
            owner: parsedLog[0],
            operatorIds: parsedLog[1].map((id: ethers.BigNumber) => id.toBigInt()),
            publicKey: parsedLog[2],
            shares: parsedLog[3],
            cluster: {
                validatorCount: parsedLog[4][0],
                networkFeeIndex: parsedLog[4][1].toBigInt(),
                index: parsedLog[4][2].toBigInt(),
                active: parsedLog[4][3],
                balance: parsedLog[4][4].toBigInt(),
            },
        },
    };

    console.log(`Adding validator with public key: ${event.params.publicKey}`);  // Log the public key of the validator being added

    const validator = new Validator({
        id: `${event.params.publicKey}-${process.env.NETWORK}-${event.params.owner}`,
        ownerAddress: event.params.owner,
        publicKey: event.params.publicKey,
        operators: event.params.operatorIds,
        shares: event.params.shares,
        cluster: generateClusterId(event.params.owner, event.params.operatorIds),
        blockNumber: block.header.height,
        logIndex: log.index,
        transactionIndex: log.transaction.index,
        isValid: true,
        isDeleted: false,
        isLiquidated: false,
        ignoreOnSync: false,
        isDraft: false,
        isPublicKeyValid: true,
        isSharesValid: true,
        isOperatorsValid: true,
        createdAt: BigInt(Date.now()),  // Replace with actual event timestamp
        updatedAt: BigInt(Date.now()),
    });

    await ctx.store.upsert([validator]);
    console.log(`Validator with public key ${event.params.publicKey} successfully added!`);  // Confirm validator addition
}

function generateClusterId(owner: string, operatorIds: bigint[]): string {
    return ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address', 'uint64[]'], [owner, operatorIds]));
}