import {ethers} from "ethers";
import {Validator, Operator, Account, Cluster, Event} from "./model";
import {events} from "./abi/ssvabi";
import {Log} from "./processor";
import {In} from 'typeorm';
import {KeyShares} from 'ssv-keys';
import bls from 'bls-eth-wasm';




type EventHandlerMap = Partial<Record<keyof typeof events, (log: Log, ctx: any) => Promise<void>>>
const keyShares = new KeyShares();


export const eventHandlerMap: EventHandlerMap = {
    OperatorAdded: handleOperatorAdded,
    OperatorFeeDeclared: handleOperatorFeeDeclared,
    OperatorFeeExecuted: handleOperatorFeeExecuted,
    OperatorRemoved: handleOperatorRemoved,
    ValidatorAdded: handleValidatorAdded,
    ValidatorRemoved: handleValidatorRemoved,
};

async function handleOperatorAdded(log: Log, ctx: any): Promise<void>  {
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
        blockNumber: BigInt(log.block.height),
        isValid: true,
        isDeleted: false,
        createdAt: BigInt(Date.now()),
        updatedAt: BigInt(Date.now()),
        whitelistAddresses: [],
        isPrivate: false,
        whitelistingContract: '',
    });

    // console.log('Operator instance:', operator);
    try {
        await ctx.store.upsert([operator]);
        ctx.log.info(`Operator ${operatorId} successfully added!`);
    } catch (error) {
        ctx.log.error(`Error adding operator ${operatorId}: ${(error as Error).message}`);
        throw error;
    }

}

async function handleOperatorRemoved(log: Log, ctx: any): Promise<void> {
    let { operatorId } = events.OperatorRemoved.decode(log);
    const id = `${operatorId}-${process.env.NETWORK}`

    const existingOperator = await ctx.store.get(Operator, {
        where: { id: id },
    });

    if (!existingOperator) {
        ctx.log.info(`Operator ${operatorId} does not exists in db.`);
        return;
    }

    existingOperator.isDeleted = true;
    existingOperator.updatedAt = BigInt(Date.now());
    await ctx.store.upsert([existingOperator]);
    ctx.log.info(`operator ${operatorId} successfully removed!`);
}

async function handleOperatorFeeDeclared(log: Log, ctx: any): Promise<void> {
    let { owner, operatorId, blockNumber,  fee } = events.OperatorFeeDeclared.decode(log);
    const id = `${operatorId}-${process.env.NETWORK}`
    const existingOperator = await ctx.store.get(Operator, {
        where: { id: id },
    });

    if (!existingOperator) {
        ctx.log.error(`Declaring fees for Operator ${operatorId}, but the operator does not exist on the database`, [])
        return;
    }
    existingOperator.declaredFee = fee;
    existingOperator.updatedAt = BigInt(Date.now());
    await ctx.store.upsert([existingOperator]);

}

async function handleOperatorFeeExecuted(log: Log, ctx: any): Promise<void> {
    let { owner, operatorId, blockNumber,  fee } = events.OperatorFeeExecuted.decode(log);
    const id = `${operatorId}-${process.env.NETWORK}`

    const existingOperator = await ctx.store.get(Operator, {
        where: { id: id },
    });

    if (!existingOperator) {
        ctx.log.error(`Fee execution for Operator ${operatorId}, but the operator does not exist in the database`, []);
        return;
    }
    existingOperator.previousFee = existingOperator.fee;
    existingOperator.fee = fee;
    existingOperator.declaredFee = BigInt(0);
    existingOperator.updatedAt = BigInt(Date.now());
    await ctx.store.upsert([existingOperator]);
}

async function handleValidatorAdded(log: Log, ctx: any): Promise<void> {
    let { owner, operatorIds, publicKey, shares, cluster } = events.ValidatorAdded.decode(log);
    const id = `${publicKey}-${process.env.NETWORK}-${owner}`;
    ctx.log.info(`Adding validator ${publicKey} owned by ${owner} being registered to cluster with operators: ${operatorIds}`);
    // console.log(`${shares} - shares`);
    const rawDataString = JSON.stringify(log, customReplaceHelper);
    let event = new Event({
        id: log.logIndex.toString(),
        network: process.env.NETWORK,
        version: process.env.VERSION,
        logIndex: BigInt(log.logIndex),
        transactionHash: log.block.hash,
        transactionIndex: BigInt(log.transactionIndex),
        event: 'ValidatorAdded',
        blockNumber: BigInt(log.block.height),
        ownerAddress: owner,
        rawData: rawDataString,
        createdAt: BigInt(Date.now()),
        processed: BigInt(Date.now())
    });
    await ctx.store.upsert([event]);
    ctx.log.info(`Save event ValidatorAdded with public key: ${publicKey}.`);
    // Check if the validator already exists in the database
    const existingValidator = await ctx.store.get(Validator, {
        where: { id: id },
    });

    if (existingValidator) {
        ctx.log.info(`Validator ${publicKey} owned by ${owner} already exists.`);
        return;
    }

    let validator = new Validator({
        id: id,
        network: process.env.NETWORK,
        version: process.env.VERSION,
        ownerAddress: owner,
        publicKey: publicKey,
        operators: operatorIds.map(id => BigInt(id)),
        shares: shares,
        cluster: generateClusterId(owner, operatorIds),
        blockNumber: BigInt(log.block.height),
        logIndex: BigInt(log.logIndex),
        transactionIndex: BigInt(log.transactionIndex),
        addedAtBlockNumber: BigInt(log.block.height),
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

    await validateOperators(validator, ctx);
    validator = await beforeValidatorProcess(validator, ctx, cluster.index);
    await processValidator(validator, ctx);

    // await ctx.store.upsert([validator]);
    ctx.log.info(`validator ${publicKey} with operators ${validator.operators} and cluster ${validator.cluster} successfully added!`);

}

function generateClusterId(owner: string, operatorIds: (number | bigint)[]): string {
    const sortedOperatorIds = operatorIds.map(BigInt).sort((a, b) => (a < b ? -1 : 1));
    const types = ['address', ...sortedOperatorIds.map(() => 'uint256')];
    const values = [owner, ...sortedOperatorIds];
    // Encode the data using solidityPack and hash the result
    return ethers.utils.keccak256(
        ethers.utils.solidityPack(types, values)
    );
}

async function validateOperators(item: Validator, ctx: any):Promise<void> {
    try {
        const foundOperators = await ctx.store.find(Operator, {
            where: {
                operatorId: In(item.operators),
                network: item.network,
            },
        });
        // Create a set for efficient lookup
        const foundOperatorIds = foundOperators.map((op: Operator) => BigInt(op.operatorId));
        // Identify missing operator IDs
        const missingIds = item.operators.filter((id: bigint) => !foundOperatorIds.includes(id));

        if (missingIds.length) {
            const missingIdsAsStrings = missingIds.map(id => id.toString());
            throw new Error(`Missing operator IDs: ${JSON.stringify(missingIdsAsStrings)}`);
        }

        ctx.log.info(`Found Operators: ${foundOperatorIds.map((id: bigint) => id.toString())}.`);
    } catch (e) {
        item.isValid = false;
        item.isOperatorsValid = false;
        const message = 'Not all operators synced. Missing operator IDs';
        item.memo = [
            ...(Array.isArray(item.memo) ? item.memo : []),
            JSON.stringify({
                message,
                error: (e as Error).stack || '',
                data: (e as Error).message,
                blockNumber: item.blockNumber.toString(),
            }),
        ];
        ctx.log.error(
            `${item.version} ${item.network}: Validator ${item.publicKey} operators validation failed: ${message}. IDs: ${(e as Error).message}`,
        );
    }
}

async function beforeValidatorProcess(item: Validator, ctx: any, clusterIndex :bigint): Promise<Validator> {
    await ensureAccount(item, ctx);
    await ensureValidatorCluster(item, ctx, clusterIndex);
    return item;
}

async function ensureAccount(item: Validator, ctx: any): Promise<void> {
    const account = new Account({
        id: `${item.ownerAddress}-${item.network}`,
        ownerAddress: item.ownerAddress,
        network: item.network,
        version: item.version,
    });
    ctx.log.info(`Account ${account.id}`);

    const existingAccount = await ctx.store.get(Account, { where: { id: account.id } });
    if (!existingAccount) {
        await ctx.store.upsert([account]);
        ctx.log.info(`Adding new account ${account.id}`);
    }
}

async function ensureValidatorCluster(item: Validator, ctx: any, clusterIndex: bigint): Promise<void> {
    const existingCluster = await ctx.store.get(Cluster, { where: { clusterId: item.cluster } });
    const operators: bigint[] = item.operators.map(op => BigInt(op));
    // ctx.log.info(`Operators before saving to Cluster: ${operators}`);

    if (!existingCluster) {
        const cluster = new Cluster({
            id: clusterIndex.toString(),
            clusterId: item.cluster,
            network: item.network,
            version: process.env.VERSION!,
            ownerAddress: item.ownerAddress,
            validatorCount: BigInt(0),
            networkFeeIndex: BigInt(0),
            index: BigInt(0),
            balance: BigInt(0),
            active: true,
            isLiquidated: false,
            operators: operators,
            blockNumber: item.blockNumber,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        });

        await ctx.store.upsert([cluster]);
        ctx.log.info(`Adding new cluster ${cluster.clusterId}`);
    }
}

async function processValidator(item: Validator, ctx: any): Promise<void> {
    ctx.log.info(`Process Validator ${item}`);
    // Extract and validate shares
    await extractShares(item, ctx);

    // Validate shares and public key
    validateSharesPublicKeys(item);
    validatePublicKey(item);

    const foundItem = await ctx.store.get(Validator, {
        where: {
            publicKey: item.publicKey,
            network: item.network,
            ownerAddress: item.ownerAddress,
        }
    });

    let isExistsAndValid = false;
    if (foundItem) {
        isExistsAndValid = item.blockNumber > foundItem.blockNumber ||
            (item.blockNumber === foundItem.blockNumber && item.transactionIndex > foundItem.transactionIndex) ||
            (item.blockNumber === foundItem.blockNumber && item.transactionIndex === foundItem.transactionIndex &&
                item.logIndex > foundItem.logIndex);
    }

    let message = '';
    if (isExistsAndValid) {
        item.ignoreOnSync = true;
        message = 'Public key already exists, valid and synced with EC.';
    } else {
        item.ignoreOnSync = false;
    }

    if (item.ignoreOnSync) {
        item.memo = [
            ...(Array.isArray(item.memo) ? item.memo : []),
            JSON.stringify({
                message,
                ownerAddress: {
                    inDatabase: foundItem.ownerAddress,
                    inEvent: item.ownerAddress,
                },
                blockNumber: {
                    inDatabase: foundItem.blockNumber.toString(),
                    inEvent: item.blockNumber.toString(),
                },
            })
        ];
    }

    item.updatedAt = BigInt(Date.now());
    item.isDraft = false;
    await ctx.store.upsert([item]);
}

async function extractShares(item: Validator, ctx: any): Promise<void> {
    let memo, error;
    let account: Account | null = null;
    let ownerNonce: number | null = null;

    try {
        ctx.log.info(`Got sharesPublicKeys ${item.shares}`);
        console.log('Type of item.shares:', typeof item.shares);
        console.log('Operator count:', item.operators.length);
        const shares = keyShares.buildSharesFromBytes(item.shares, item.operators.length);
        const { sharesPublicKeys, encryptedKeys } = shares;

        ctx.log.info(`Got sharesPublicKeys ${sharesPublicKeys}`);
        ctx.log.info(`Got encryptedKeys ${encryptedKeys}`);
        item.sharesPublicKeys = sharesPublicKeys;
        item.encryptedKeys = encryptedKeys;
    } catch (e) {
        error = e;
        memo = 'Cannot extract shares from bytes.';
    }

    if (!error && !memo) {
        let fromSignatureData;
        try {
            account = await ctx.store.get(Account, { where: { ownerAddress: item.ownerAddress } });
            ctx.log.info(`Got account - ${account?account.id:'dont have account'}`);
            ownerNonce = await calcNextValidatorOwnerNonce(
                ctx,
                item.network,
                item.ownerAddress,
                item.addedAtBlockNumber,
                item.addedAtTransactionIndex,
                item.addedAtLogIndex,
            );
            ctx.log.info(`Got ownerNonce ${ownerNonce}`);
            fromSignatureData = {
                ownerNonce: ownerNonce ?? 0, //need to fix it later
                publicKey: item.publicKey,
                ownerAddress: item.ownerAddress,
            };
            ctx.log.info(`created fromSignatureData`);
            await keyShares.validateSingleShares(item.shares, fromSignatureData);
            ctx.log.info(`Finished validateSingleShares`);
        } catch (e) {
            error = e;
            memo = 'Failed to validate single shares.';
            if (account) {
                memo += ` Account exists for owner address: ${item.ownerAddress}.`;
            } else {
                memo += ` Account is not synced for owner address: ${item.ownerAddress}.`;
            }
            if (ownerNonce) {
                memo += ` Used nonce: ${ownerNonce}.`;
            }
            memo += ` Signature Data: ${JSON.stringify(fromSignatureData,customReplaceHelper)}.`;
        }
    }

    if (memo && error) {
        item.isValid = false;
        item.isSharesValid = false;
        item.memo = [
            ...(Array.isArray(item.memo) ? item.memo : []),
            JSON.stringify({
                message: memo,
                error: (error as Error).stack || error,
                data: (error as Error).message,
                blockNumber: item.addedAtBlockNumber.toString(),
            })
        ];
        ctx.log.error(`${item.version} ${item.network}: Validator ${item.publicKey} shares validation failed: ${memo}: ${(error as Error).message}`);
    }
}


function validateSharesPublicKeys(item: Validator) {
    const cantDeserializeSharePublicKeys: string[] = [];

    try {
        for (const sharesPublicKey of item.sharesPublicKeys) {
            try {
                bls.deserializeHexStrToPublicKey(sharesPublicKey.replace('0x', ''));
            } catch (e) {
                cantDeserializeSharePublicKeys.push(sharesPublicKey);
            }
        }
        if (cantDeserializeSharePublicKeys.length || !item.sharesPublicKeys.length) {
            throw new Error(JSON.stringify(cantDeserializeSharePublicKeys));
        }
    } catch (e) {
        item.isValid = false;
        item.isSharesValid = false;
        const message = 'Failed to deserialize share public keys';
        item.memo = [
            ...(Array.isArray(item.memo) ? item.memo : []),
            JSON.stringify({
                message: message,
                error: (e as Error).stack || e,
                data: (e as Error).message,
                blockNumber: item.addedAtBlockNumber.toString(),
            })
        ];
        console.error(
            `${item.version} ${item.network}: Validator ${item.publicKey} shares public keys validation failed: ${message}. sharesPublicKeys: ${(e as Error).message}`
        );
    }
}

function validatePublicKey(item: Validator) {
    try {
        bls.deserializeHexStrToPublicKey(item.publicKey.replace('0x', ''));
    } catch (e) {
        item.isValid = false;
        item.isPublicKeyValid = false;
        const message = 'Failed to deserialize validator public key';
        item.memo = [
            ...(Array.isArray(item.memo) ? item.memo : []),
            JSON.stringify({
                message: message,
                error: (e as Error).stack || e,
                data: (e as Error).message,
                blockNumber: item.addedAtBlockNumber.toString(),
            })
        ];
        console.error(
            `${item.version} ${item.network}: Validator ${item.publicKey} public key validation failed: ${message}`
        );
    }}

async function calcNextValidatorOwnerNonce(
    ctx: any,
    network: string,
    ownerAddress: string,
    currentBlockNumber: bigint,
    currentTransactionIndex: bigint,
    currentLogIndex: bigint,
): Promise<number> {
    // Fetch all relevant events
    const events: Event[] = await ctx.store.find(Event, {
        where: {
            network: network,
            ownerAddress: ownerAddress.toLowerCase(),
            event: 'ValidatorAdded',
        },
    });

    // Filter events
    const count = events.filter((event: Event) => {
        const eventBlockNumber = BigInt(event.blockNumber);
        const eventTransactionIndex = BigInt(event.transactionIndex);
        const eventLogIndex = BigInt(event.logIndex);

        if (eventBlockNumber < currentBlockNumber) {
            return true;
        } else if (eventBlockNumber === currentBlockNumber) {
            if (eventTransactionIndex < currentTransactionIndex) {
                return true;
            } else if (eventTransactionIndex === currentTransactionIndex) {
                if (eventLogIndex < currentLogIndex) {
                    return true;
                }
            }
        }
        return false;
    }).length;

    return count;
}

async function handleValidatorRemoved(log: Log, ctx: any): Promise<void> {
    const { owner, operatorIds, publicKey, cluster } = events.ValidatorRemoved.decode(log);
    const id = `${publicKey}-${process.env.NETWORK}-${owner}`;
    ctx.log.info(`Removing validator ${publicKey} owned by ${owner} being registered to cluster with operators: ${operatorIds}`);

    const foundValidator = await ctx.store.get(Validator, {
        where: { publicKey: publicKey, network: process.env.NETWORK, ownerAddress: owner },
    });

    if (foundValidator) {
        foundValidator.isDeleted = true;
        foundValidator.updatedAt = BigInt(Date.now());

        await ctx.store.upsert([foundValidator]);
        ctx.log.info(`Validator ${publicKey} has been marked as deleted.`);
    } else {
        ctx.log.info(`Validator ${publicKey} not found for deletion.`);
    }
}


function customReplaceHelper(key: string, value: any) {
    if (typeof value === 'bigint') {
        return value.toString();
    }

    if (typeof value === 'function') {
        return undefined;
    }

    return value;
}