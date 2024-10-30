import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Event {
    constructor(props?: Partial<Event>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    network!: string

    @StringColumn_({nullable: false})
    version!: string

    @BigIntColumn_({nullable: false})
    logIndex!: bigint

    @StringColumn_({nullable: false})
    transactionHash!: string

    @BigIntColumn_({nullable: false})
    transactionIndex!: bigint

    @StringColumn_({nullable: false})
    event!: string

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint

    @StringColumn_({nullable: true})
    ownerAddress!: string | undefined | null

    @StringColumn_({nullable: false})
    rawData!: string

    @BigIntColumn_({nullable: false})
    createdAt!: bigint

    @BigIntColumn_({nullable: true})
    processed!: bigint | undefined | null
}
