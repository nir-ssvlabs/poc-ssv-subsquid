import {TypeormDatabase} from '@subsquid/typeorm-store'
import {processor} from './processor'
import { events } from './abi/ssvabi'
import { eventHandlerMap } from './process-handler';

processor.run(new TypeormDatabase({supportHotBlocks: true}), async (ctx) => {
    for (let block of ctx.blocks) {
        console.log(`Processing block: ${block.header.height}`);

        for (let log of block.logs) {
            const topic = log.topics[0] as keyof typeof events;
            const event = events[topic];

            if (event) {
                const handler = eventHandlerMap[topic];
                if (handler) {
                    console.log(`Handling event: ${topic}`);
                    await handler(log, block, ctx);
                }
            } else {
                console.log(`No handler for event with topic: ${topic}`);
            }
        }
    }
})
