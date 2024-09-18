import { Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_ } from "typeorm";
import * as marshal from "./marshal";

@Entity_()
export class Event {
    constructor(props?: Partial<Event>) {
        Object.assign(this, props);
    }

    @PrimaryColumn_("text", { nullable: false })
    id!: string;

    @Column_("text", { nullable: false })
    network!: string;

    @Column_("text", { nullable: false })
    version!: string;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    logIndex!: bigint;

    @Column_("text", { nullable: false })
    transactionHash!: string;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    transactionIndex!: bigint;

    @Column_("text", { nullable: false })
    event!: string;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    blockNumber!: bigint;

    @Column_("text", { nullable: true })
    ownerAddress!: string;

    @Column_("jsonb", { nullable: false })
    rawData!: string;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    createdAt!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: true })
    processed?: bigint | null;
}
