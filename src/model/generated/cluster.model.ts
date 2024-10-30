import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, BooleanColumn as BooleanColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Cluster {
    constructor(props?: Partial<Cluster>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    clusterId!: string

    @StringColumn_({nullable: false})
    network!: string

    @StringColumn_({nullable: false})
    version!: string

    @StringColumn_({nullable: false})
    ownerAddress!: string

    @BigIntColumn_({nullable: false})
    validatorCount!: bigint

    @BigIntColumn_({nullable: false})
    networkFeeIndex!: bigint

    @BigIntColumn_({nullable: false})
    index!: bigint

    @BigIntColumn_({nullable: false})
    balance!: bigint

    @BooleanColumn_({nullable: false})
    active!: boolean

    @BooleanColumn_({nullable: false})
    isLiquidated!: boolean

    @StringColumn_({array: true, nullable: false})
    operators!: (string)[]

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint

    @BigIntColumn_({nullable: false})
    createdAt!: bigint

    @BigIntColumn_({nullable: false})
    updatedAt!: bigint
}
