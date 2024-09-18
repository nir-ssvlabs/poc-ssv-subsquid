import {TypeormDatabase} from '@subsquid/typeorm-store'
import {processor} from './processor'
import { events } from './abi/ssvabi'
import { eventHandlerMap } from './process-handler';

// export type ProcessorRunnerParams = Parameters<typeof processor.run>[1];
// export type Context = Parameters<ProcessorRunnerParams>[0] & {
//     store: Store
// }

processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    for (let block of ctx.blocks) {
        console.log(`Processing block: ${block.header.height}`);

        for (let log of block.logs) {
            const topic = log.topics[0];
            const eventKey = Object.keys(events).find((key) => events[key as keyof typeof events].topic === topic) as keyof typeof events;
            if (eventKey) {
                const handler = eventHandlerMap[eventKey];
                if (handler) {
                    console.log(`Handling event: ${eventKey}`);
                    await handler(log, ctx);
                }
            } else {
                console.log(`No handler for event with topic: ${topic}`);
            }
        }
    }
})
