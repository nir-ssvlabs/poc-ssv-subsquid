import { Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_ } from "typeorm";

@Entity_()
export class Account {
    constructor(props?: Partial<Account>) {
        Object.assign(this, props);
    }

    @PrimaryColumn_()
    id!: string;

    @Column_("text", { nullable: false })
    ownerAddress!: string;

    @Column_("text", { nullable: true })
    recipientAddress?: string | null;

    @Column_("text", { nullable: false })
    network!: string;

    @Column_("text", { nullable: false })
    version!: string;
}
