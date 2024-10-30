import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, StringColumn as StringColumn_, BooleanColumn as BooleanColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Operator {
    constructor(props?: Partial<Operator>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @BigIntColumn_({nullable: false})
    operatorId!: bigint

    @StringColumn_({nullable: false})
    network!: string

    @StringColumn_({nullable: false})
    version!: string

    @StringColumn_({nullable: false})
    ownerAddress!: string

    @StringColumn_({nullable: false})
    publicKey!: string

    @BigIntColumn_({nullable: false})
    fee!: bigint

    @BigIntColumn_({nullable: false})
    previousFee!: bigint

    @BigIntColumn_({nullable: false})
    declaredFee!: bigint

    @StringColumn_({nullable: true})
    addressWhitelist!: string | undefined | null

    @StringColumn_({array: true, nullable: true})
    memo!: (string | undefined | null)[] | undefined | null

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint

    @BooleanColumn_({nullable: false})
    isValid!: boolean

    @BooleanColumn_({nullable: false})
    isDeleted!: boolean

    @BigIntColumn_({nullable: false})
    createdAt!: bigint

    @BigIntColumn_({nullable: false})
    updatedAt!: bigint

    @StringColumn_({array: true, nullable: false})
    whitelistAddresses!: (string)[]

    @BooleanColumn_({nullable: false})
    isPrivate!: boolean

    @StringColumn_({nullable: true})
    whitelistingContract!: string | undefined | null
}
