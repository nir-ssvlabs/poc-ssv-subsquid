import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class Account {
    constructor(props?: Partial<Account>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    ownerAddress!: string

    @StringColumn_({nullable: true})
    recipientAddress!: string | undefined | null

    @StringColumn_({nullable: false})
    network!: string

    @StringColumn_({nullable: false})
    version!: string
}
