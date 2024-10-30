import {assertNotNull} from '@subsquid/util-internal'
import {
    BlockHeader,
    DataHandlerContext,
    EvmBatchProcessor,
    EvmBatchProcessorFields,
    Log as _Log,
    Transaction as _Transaction,
} from '@subsquid/evm-processor'
import { events } from './abi/ssvabi'

const CONTRACT_ADDRESS = (process.env.CONTRACT_ADDRESS || "").toLocaleLowerCase()
const STARTING_BLOCK = parseInt(process.env.STARTING_BLOCK || "")
const GATEWAY = process.env.GATEWAY || ''

export const processor = new EvmBatchProcessor()
    .setGateway(GATEWAY)
    .setRpcEndpoint({
        url: assertNotNull(process.env.RPC_ETH_HTTP, 'No RPC endpoint supplied'),
        rateLimit: 10000
    })
    .setFinalityConfirmation(75)
    .setFields({
        transaction: {
            from: true,
            value: true,
            hash: true,
        },
    })
    .setBlockRange({
        from: STARTING_BLOCK,
    })
    .addLog({
        address: [CONTRACT_ADDRESS],
        topic0: [
            events.ValidatorAdded.topic,
            events.ValidatorRemoved.topic,
            events.OperatorAdded.topic,
            events.OperatorFeeDeclared.topic,
            events.OperatorFeeExecuted.topic,
            events.OperatorRemoved.topic,
        ],
    });

export type Fields = EvmBatchProcessorFields<typeof processor>
export type Block = BlockHeader<Fields>
export type Log = _Log<Fields>
export type Transaction = _Transaction<Fields>
export type ProcessorContext<Store> = DataHandlerContext<Store, Fields>
