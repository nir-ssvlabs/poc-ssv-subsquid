import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, BooleanColumn as BooleanColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Validator {
    constructor(props?: Partial<Validator>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    network!: string

    @StringColumn_({nullable: false})
    version!: string

    @StringColumn_({nullable: false})
    ownerAddress!: string

    @StringColumn_({nullable: false})
    publicKey!: string

    @StringColumn_({array: true, nullable: false})
    operators!: (string)[]

    @StringColumn_({nullable: false})
    cluster!: string

    @StringColumn_({nullable: false})
    shares!: string

    @StringColumn_({array: true, nullable: false})
    sharesPublicKeys!: (string)[]

    @StringColumn_({array: true, nullable: false})
    encryptedKeys!: (string)[]

    @StringColumn_({array: true, nullable: true})
    memo!: (string | undefined | null)[] | undefined | null

    @BigIntColumn_({nullable: false})
    blockNumber!: bigint

    @BigIntColumn_({nullable: false})
    logIndex!: bigint

    @BigIntColumn_({nullable: false})
    transactionIndex!: bigint

    @BigIntColumn_({nullable: false})
    addedAtBlockNumber!: bigint

    @BigIntColumn_({nullable: false})
    addedAtLogIndex!: bigint

    @BigIntColumn_({nullable: false})
    addedAtTransactionIndex!: bigint

    @BooleanColumn_({nullable: false})
    isValid!: boolean

    @BooleanColumn_({nullable: false})
    isDeleted!: boolean

    @BooleanColumn_({nullable: false})
    isLiquidated!: boolean

    @BooleanColumn_({nullable: false})
    ignoreOnSync!: boolean

    @BigIntColumn_({nullable: false})
    createdAt!: bigint

    @BigIntColumn_({nullable: false})
    updatedAt!: bigint

    @BooleanColumn_({nullable: false})
    isDraft!: boolean

    @BooleanColumn_({nullable: false})
    isPublicKeyValid!: boolean

    @BooleanColumn_({nullable: false})
    isSharesValid!: boolean

    @BooleanColumn_({nullable: false})
    isOperatorsValid!: boolean
}
