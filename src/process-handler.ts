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
    ClusterLiquidated: handleClusterLiquidated,
    ClusterReactivated: handleClusterReactivated,
    ClusterDeposited: handleClusterDeposited,
    ClusterWithdrawn: handleClusterWithdrawn,
    FeeRecipientAddressUpdated: handleFeeRecipientAddressUpdated,
    OperatorPrivacyStatusUpdated: handleOperatorPrivacyStatusUpdated,
    OperatorMultipleWhitelistUpdated: handleOperatorMultipleWhitelistUpdated,
    OperatorMultipleWhitelistRemoved: handleOperatorMultipleWhitelistRemoved,
    OperatorWhitelistUpdated: handleOperatorWhitelistUpdated,
    OperatorWhitelistingContractUpdated: handleOperatorWhitelistingContractUpdated

};

async function handleOperatorAdded(log: Log, ctx: any): Promise<void>  {
    let { operatorId, owner,publicKey, fee } = events.OperatorAdded.decode(log);
    const types = ["uint256", "address", "bool"]; // Parameter types
    const id = `${operatorId}-${process.env.NETWORK}`
    owner = ethers.utils.getAddress(owner);
    const decodedPublicKey = ethers.utils.defaultAbiCoder.decode(types, publicKey);
    ctx.log.info(`Adding operator ${operatorId} owned by ${owner} being registered with fee: ${fee}`);

    let operator = await ctx.store.get(Operator, { where: { id: id } });

    const isUpdating = !!operator;

    if (isUpdating) {
        ctx.log.info(`Operator ${operatorId} owned by ${owner} already exists. Updating attributes...`);
    } else {
        operator = new Operator();
        operator.id = id;
        operator.createdAt = BigInt(Date.now());
    }

    operator.operatorId = BigInt(operatorId);
    operator.network = process.env.NETWORK!;
    operator.version = process.env.VERSION;
    operator.ownerAddress = owner;
    operator.publicKey = decodedPublicKey;
    operator.fee = BigInt(fee);
    operator.previousFee = BigInt(fee);
    operator.declaredFee = BigInt(fee);
    operator.addressWhitelist = '';
    operator.memo = null;
    operator.blockNumber = BigInt(log.block.height);
    operator.isValid = true;
    operator.isDeleted = false;
    operator.updatedAt = BigInt(Date.now());
    operator.whitelistAddresses = [];
    operator.isPrivate = false;
    operator.whitelistingContract = '';

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
    owner = ethers.utils.getAddress(owner);
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
    ctx.log.info(`Declaring fees for Operator ${operatorId} owned by ${owner} with fee: ${fee}`);

}

async function handleOperatorFeeExecuted(log: Log, ctx: any): Promise<void> {
    let { owner, operatorId, blockNumber,  fee } = events.OperatorFeeExecuted.decode(log);
    owner = ethers.utils.getAddress(owner);
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
    ctx.log.info(`Fee execution for Operator ${operatorId} owned by ${owner} with fee: ${fee}`);
}

async function handleValidatorAdded(log: Log, ctx: any): Promise<void> {
    let { owner, operatorIds, publicKey, shares, cluster } = events.ValidatorAdded.decode(log);
    owner = ethers.utils.getAddress(owner);
    const id = `${publicKey}-${process.env.NETWORK}-${owner}`;
    ctx.log.info(`Adding validator ${publicKey} owned by ${owner} being registered to cluster with operators: ${operatorIds}`);

    const rawDataString = JSON.stringify(log, customReplaceHelper);
    const uniqueId = `${log.block.height}-${log.transactionIndex}-${log.logIndex}`;
    let event = new Event({
        id: uniqueId,
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
    let validator = await ctx.store.get(Validator, { where: { id: id } });

    const isUpdating = !!validator; //!!null or !!undefined becomes false

    if (isUpdating) {
        ctx.log.info(`Validator ${publicKey} owned by ${owner} already exists. Updating attributes`);
    } else {
        validator = new Validator();
        validator.id = id;
        validator.createdAt = BigInt(Date.now());  // Set createdAt only for new validators
    }

    validator.network = process.env.NETWORK;
    validator.version = process.env.VERSION;
    validator.ownerAddress = owner;
    validator.publicKey = publicKey;
    validator.operators = operatorIds.map(id => BigInt(id));
    validator.shares = shares;
    validator.cluster = generateClusterId(owner, operatorIds);
    validator.blockNumber = BigInt(log.block.height);
    validator.logIndex = BigInt(log.logIndex);
    validator.transactionIndex = BigInt(log.transactionIndex);
    validator.addedAtBlockNumber = BigInt(log.block.height);
    validator.addedAtLogIndex = BigInt(log.logIndex);
    validator.addedAtTransactionIndex = BigInt(log.transactionIndex);
    validator.isValid = true;
    validator.isDeleted = false;
    validator.isLiquidated = false;
    validator.ignoreOnSync = false;
    validator.isDraft = false;
    validator.isPublicKeyValid = true;
    validator.isSharesValid = true;
    validator.isOperatorsValid = true;
    validator.updatedAt = BigInt(Date.now());

    await validateOperators(validator, ctx);
    validator = await beforeValidatorProcess(validator, ctx, cluster);
    await processValidator(validator, ctx);

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
        const missingIds = item.operators.map(op => BigInt(op)).filter((id: bigint) => !foundOperatorIds.includes(id));

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

async function beforeValidatorProcess(item: Validator, ctx: any,cluster: {
    readonly validatorCount: number;
    readonly networkFeeIndex: bigint;
    readonly index: bigint;
    readonly active: boolean;
    readonly balance: bigint;
} ): Promise<Validator> {
    await ensureAccount(item, ctx);
    await ensureValidatorCluster(item, ctx, cluster);
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
        ctx.log.info(`Adding/updating Account ${account.id}`);
    }
}

async function ensureValidatorCluster(item: Validator, ctx: any,   clusterEvent: {
    readonly validatorCount: number;
    readonly networkFeeIndex: bigint;
    readonly index: bigint;
    readonly active: boolean;
    readonly balance: bigint;
}): Promise<void> {
    let cluster = await ctx.store.get(Cluster, { where: { clusterId: item.cluster } });
    const operators: string[] = item.operators.map(op => BigInt(op).toString()); // Convert to string

    const isUpdating = !!cluster; //!!null or !!undefined becomes false

    if (isUpdating) {
        ctx.log.info(`Cluster ${cluster.clusterId} already exists. Updating attributes`);
    } else {
        const uniqueId = `${item.cluster}-${process.env.NETWORK}`;
        cluster = new Cluster();
        cluster.id = uniqueId;
        cluster.clusterId = item.cluster;
        cluster.createdAt = BigInt(Date.now()).toString();
    }
    cluster.network = item.network;
    cluster.version = item.version;
    cluster.ownerAddress = item.ownerAddress;
    cluster.validatorCount = clusterEvent.validatorCount.toString();
    cluster.networkFeeIndex = clusterEvent.networkFeeIndex.toString();
    cluster.index = clusterEvent.index.toString();
    cluster.balance = clusterEvent.balance.toString();
    cluster.active = clusterEvent.active;
    cluster.isLiquidated = false;
    cluster.operators = operators;
    cluster.blockNumber = item.blockNumber.toString();
    cluster.updatedAt = BigInt(Date.now()).toString();

    await ctx.store.upsert([cluster]);
    ctx.log.info(`cluster ${cluster.clusterId} successfully added!`);
}

async function processValidator(item: Validator, ctx: any): Promise<void> {
    ctx.log.info(`Process Validator ${item.publicKey}`);
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
        const shares = keyShares.buildSharesFromBytes(item.shares, item.operators.length);
        const { sharesPublicKeys, encryptedKeys } = shares;

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
            ownerAddress: ownerAddress,
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
    let { owner, operatorIds, publicKey, cluster } = events.ValidatorRemoved.decode(log);
    owner = ethers.utils.getAddress(owner);
    const id = `${publicKey}-${process.env.NETWORK}-${owner}`;
    ctx.log.info(`Removing validator ${publicKey} owned by ${owner} being registered to cluster with operators: ${operatorIds}`);

    let foundValidator = await ctx.store.get(Validator, {
        where: { publicKey: publicKey, network: process.env.NETWORK, ownerAddress: owner },
    });

    if (foundValidator) {
        await ensureValidatorCluster(foundValidator, ctx, cluster);
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

async function handleClusterLiquidated(log: Log, ctx: any): Promise<void>{
    let { owner, operatorIds, cluster } = events.ClusterLiquidated.decode(log);
    owner = ethers.utils.getAddress(owner);
    let operators = operatorIds.map(id => BigInt(id));
    let clusterId = generateClusterId(owner, operatorIds);
    let clusterData = await ctx.store.get(Cluster, { where: { clusterId: clusterId} });
    const isUpdating = !!clusterData; //!!null or !!undefined becomes false

    if (isUpdating) {
        ctx.log.info(`Cluster ${clusterData.clusterId} already exists. Updating attributes`);
    } else {
        const uniqueId = `${clusterId}-${process.env.NETWORK}`;
        clusterData = new Cluster();
        clusterData.id = uniqueId;
        clusterData.clusterId = clusterId;
        clusterData.createdAt = BigInt(Date.now()).toString();
    }
    ctx.log.info(`Cluster${clusterData.clusterId} is Liquidated - Updating attributes`);
    clusterData.network = process.env.NETWORK;
    clusterData.version = process.env.VERSION;
    clusterData.ownerAddress = owner;
    clusterData.validatorCount = cluster.validatorCount.toString();
    clusterData.networkFeeIndex = cluster.networkFeeIndex.toString();
    clusterData.index = cluster.index.toString();
    clusterData.balance = cluster.balance.toString();
    clusterData.active = cluster.active;
    clusterData.isLiquidated = true;
    clusterData.operators = operators;
    clusterData.blockNumber = BigInt(log.block.height).toString();
    clusterData.updatedAt = BigInt(Date.now()).toString();
    await setIsLiquidatedValidators({ clusterId: clusterData.clusterId, network: clusterData.network, ownerAddress: clusterData.owner },
        true, ctx);
    await ctx.store.upsert([clusterData]);
    ctx.log.info(`cluster ${clusterData.clusterId} successfully added/updated`);

}

async function setIsLiquidatedValidators(
    where: { clusterId: string; network: string; ownerAddress: string },
    isLiquidated: boolean, ctx: any
): Promise<void> {
    ctx.log.info(`set Liquidated for Validators with clusterId ${where.clusterId}`);
    let validators = await ctx.store.find(Validator, {
        where: {
            network: where.network,
            ownerAddress: where.ownerAddress,
            cluster: where.clusterId
        }
    });
    if(validators){
        for (let validator of validators) {
            validator.isLiquidated = isLiquidated;
            validator.updatedAt = BigInt(Date.now()).toString();
            ctx.log.info(`Updated Validator ${validator.id} isLiquidated`);
        }
        await ctx.store.upsert(validators);
        ctx.log.info(`Successfully updated Validators in the isLiquidated function`);
    }else {
        ctx.log.error("Invalid validators response:", validators);
    }
}

async function handleClusterReactivated(log: Log, ctx: any): Promise<void>{
    let { owner, operatorIds, cluster } = events.ClusterReactivated.decode(log);
    owner = ethers.utils.getAddress(owner);
    let operators = operatorIds.map(id => BigInt(id));
    let clusterId = generateClusterId(owner, operatorIds);
    let clusterData = await ctx.store.get(Cluster, { where: { clusterId: clusterId} });
    const isUpdating = !!clusterData; //!!null or !!undefined becomes false

    if (isUpdating) {
        ctx.log.info(`Cluster ${clusterData.clusterId} already exists. Updating attributes`);
    } else {
        const uniqueId = `${clusterId}-${process.env.NETWORK}`;
        clusterData = new Cluster();
        clusterData.id = uniqueId;
        clusterData.clusterId = clusterId;
        clusterData.createdAt = BigInt(Date.now()).toString();
    }
    ctx.log.info(`Cluster${clusterData.clusterId} is reset Liquidation Status - Updating attributes`);
    clusterData.network = process.env.NETWORK;
    clusterData.version = process.env.VERSION;
    clusterData.ownerAddress = owner;
    clusterData.validatorCount = cluster.validatorCount.toString();
    clusterData.networkFeeIndex = cluster.networkFeeIndex.toString();
    clusterData.index = cluster.index.toString();
    clusterData.balance = cluster.balance.toString();
    clusterData.active = cluster.active;
    clusterData.isLiquidated = false;
    clusterData.operators = operators;
    clusterData.blockNumber = BigInt(log.block.height).toString();
    clusterData.updatedAt = BigInt(Date.now()).toString();
    await setIsLiquidatedValidators({ clusterId: clusterData.clusterId, network: clusterData.network, ownerAddress: clusterData.owner },
        false, ctx);
    await ctx.store.upsert([clusterData]);
    ctx.log.info(`cluster ${clusterData.clusterId} successfully added/updated`);
}

async function handleClusterDeposited(log: Log, ctx: any): Promise<void>{
    let { owner, operatorIds, cluster } = events.ClusterDeposited.decode(log);
    owner = ethers.utils.getAddress(owner);
    let operators = operatorIds.map(id => BigInt(id).toString());
    let clusterId = generateClusterId(owner, operatorIds);
    let clusterData = await ctx.store.get(Cluster, { where: { clusterId: clusterId} });
    ctx.log.info(`Cluster${clusterData.clusterId} is Deposited - Updating attributes`);
    clusterData.network = process.env.NETWORK;
    clusterData.version = process.env.VERSION;
    clusterData.ownerAddress = owner;
    clusterData.validatorCount = cluster.validatorCount.toString();
    clusterData.networkFeeIndex = cluster.networkFeeIndex.toString();
    clusterData.index = cluster.index.toString();
    clusterData.balance = cluster.balance.toString();
    clusterData.active = cluster.active;
    clusterData.operators = operators;
    clusterData.blockNumber = BigInt(log.block.height).toString();
    clusterData.updatedAt = BigInt(Date.now()).toString();
    await ctx.store.upsert([clusterData]);
    ctx.log.info(`cluster ${clusterData.clusterId} successfully added/updated`);
}

async function handleClusterWithdrawn(log: Log, ctx: any): Promise<void>{
    let { owner, operatorIds, cluster } = events.ClusterWithdrawn.decode(log);
    owner = ethers.utils.getAddress(owner);
    let operators = operatorIds.map(id => BigInt(id).toString());
    let clusterId = generateClusterId(owner, operatorIds);
    let clusterData = await ctx.store.get(Cluster, { where: { clusterId: clusterId} });
    ctx.log.info(`Cluster${clusterData.clusterId} is Withdrawn - Updating attributes`);
    clusterData.network = process.env.NETWORK;
    clusterData.version = process.env.VERSION;
    clusterData.ownerAddress = owner;
    clusterData.validatorCount = cluster.validatorCount.toString();
    clusterData.networkFeeIndex = cluster.networkFeeIndex.toString();
    clusterData.index = cluster.index.toString();
    clusterData.balance = cluster.balance.toString();
    clusterData.active = cluster.active;
    clusterData.isLiquidated = cluster.active;
    clusterData.operators = operators;
    clusterData.blockNumber = BigInt(log.block.height).toString();
    clusterData.updatedAt = BigInt(Date.now()).toString();
    await ctx.store.upsert([clusterData]);
    ctx.log.info(`cluster ${clusterData.clusterId} successfully added/updated`);
}

async function handleFeeRecipientAddressUpdated(log: Log, ctx: any): Promise<void>{
    let { owner,recipientAddress } = events.FeeRecipientAddressUpdated.decode(log);
    owner = ethers.utils.getAddress(owner);
    const id =  `${owner}-${process.env.NETWORK}`;
    let account = await ctx.store.get(Account, { where: { id: id } });
    const isUpdating = !!account; //!!null or !!undefined becomes false

    if (isUpdating) {
        ctx.log.info(`Account ${account.id} already exists. Updating attributes`);
    } else {
       account = new Account({
            id: id,
            ownerAddress: owner,
            network: process.env.NETWORK,
            version: process.env.VERSION,
        });
    }
    account.recipientAddress = recipientAddress;
    await ctx.store.upsert([account]);
    ctx.log.info(`Adding/updating Account ${account.id}`);
}

async function handleOperatorPrivacyStatusUpdated(log: Log, ctx: any): Promise<void> {
    let { operatorIds, toPrivate } = events.OperatorPrivacyStatusUpdated.decode(log);
    ctx.log.info(`Updating privacy status for operators: ${operatorIds}, setting isPrivate to ${toPrivate}`);
    const operatorIdsBigInt = operatorIds.map(id => BigInt(id));

    const operators = await ctx.store.find(Operator, {
        where: {
            operatorId: In(operatorIdsBigInt),
            network: process.env.NETWORK,
        },
    });

    operators.forEach((operator: Operator) => {
        operator.isPrivate = toPrivate;
    });

    await ctx.store.upsert(operators);

    ctx.log.info(`Privacy status updated for operators: ${operatorIds}`);
}

async function handleOperatorMultipleWhitelistUpdated(log: Log, ctx: any): Promise<void> {
    let { operatorIds, whitelistAddresses } = events.OperatorMultipleWhitelistUpdated.decode(log);
    ctx.log.info(`Adding Whitelist addresses for operators: ${operatorIds}`);
    const newAddresses = whitelistAddresses.map((address: string) => ethers.utils.getAddress(address));
    const operatorsToUpdate = [];
    for (const operatorId of operatorIds) {
        const id = `${operatorId}-${process.env.NETWORK}`
        const operator = await ctx.store.get(Operator, {
            where: { id: id, network: process.env.NETWORK },
        });

        if (operator) {
            newAddresses.forEach((address) => {
                if (!operator.whitelistAddresses.includes(address)) {
                    ctx.log.info(`Whitelist addresses updated for operator ${operator.operatorId}.`);
                    operator.whitelistAddresses.push(address);
                }
            });

            // Add the updated operator to the list to be saved later
            operatorsToUpdate.push(operator);
        } else {
            ctx.log.error(`Operator with ID ${id} not found.`);
        }
    }
    await ctx.store.upsert(operatorsToUpdate);
    ctx.log.info(`Whitelist addresses updated for ${operatorsToUpdate.length} operators.`);
}

async function handleOperatorMultipleWhitelistRemoved(log: Log, ctx: any): Promise<void>{
    let { operatorIds, whitelistAddresses } = events.OperatorMultipleWhitelistRemoved.decode(log);
    ctx.log.info(`Removing Whitelist addresses for operators: ${operatorIds}`);
    const addressesToRemove = whitelistAddresses.map((address: string) => ethers.utils.getAddress(address));
    const operatorsToUpdate = [];
    for (const operatorId of operatorIds) {
        const id = `${operatorId}-${process.env.NETWORK}`
        const operator = await ctx.store.get(Operator, {
            where: { id: id, network: process.env.NETWORK },
        });

        if (operator) {
            // Filter out addresses that need to be removed from whitelistAddresses
            operator.whitelistAddresses = operator.whitelistAddresses.filter((address: string) => !addressesToRemove.includes(address));
            ctx.log.info(`Whitelist addresses removed for operator ${operator.operatorId}.`);
            operatorsToUpdate.push(operator);
        } else {
            ctx.log.warn(`Operator with ID ${id} not found.`);
        }
    }
    await ctx.store.upsert(operatorsToUpdate);
    ctx.log.info(`Whitelist addresses removed for ${operatorsToUpdate.length} operators.`);
}


async function handleOperatorWhitelistUpdated(log: Log, ctx: any): Promise<void>{
    let { operatorId, whitelisted } = events.OperatorWhitelistUpdated.decode(log);
    ctx.log.info(`Adding Whitelist addresses for operator: ${operatorId}`);
    const isPrivate = whitelisted !== '0x0000000000000000000000000000000000000000';
    const whitelistAddresses: string[] = isPrivate ? [ethers.utils.getAddress(whitelisted)] : [];
    const id = `${operatorId}-${process.env.NETWORK}`
    const operator = await ctx.store.get(Operator, { where: { id: id, network: process.env.NETWORK } });
    if (operator) {
        operator.addressWhitelist = whitelisted;
        operator.whitelistAddresses = whitelistAddresses;
        operator.isPrivate = isPrivate;
        operator.blockNumber = BigInt(log.block.height).toString();

        // Save the updated operator
        await ctx.store.upsert([operator]);
        ctx.log.info(`Whitelist for operator ${operatorId} updated successfully.`);
    } else {
        ctx.log.warn(`Operator with ID ${operatorId} not found.`);
    }
}

async function handleOperatorWhitelistingContractUpdated(log: Log, ctx: any): Promise<void>{
    const { operatorIds, whitelistingContract } = events.OperatorWhitelistingContractUpdated.decode(log);
    ctx.log.info(`Updating whitelisting contract for operators ${operatorIds} on network ${process.env.NETWORK}.`);
    const operatorIdsBigInt = operatorIds.map(id => BigInt(id));
    const operators = await ctx.store.find(Operator, {   where: {operatorId: In(operatorIdsBigInt), network: process.env.NETWORK,}});
    if (operators.length > 0) {
        operators.forEach((operator: Operator) => {
            operator.whitelistingContract = whitelistingContract;
        });

        await ctx.store.upsert(operators);
        ctx.log.info(`Whitelisting contract updated for ${operators.length} operators.`);
    } else {
        ctx.log.warn(`No operators found for IDs: ${operatorIds}`);
    }
}