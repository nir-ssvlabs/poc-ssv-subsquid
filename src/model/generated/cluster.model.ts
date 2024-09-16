import { Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_ } from "typeorm";
import * as marshal from "./marshal";

@Entity_()
export class Cluster {
    constructor(props?: Partial<Cluster>) {
        Object.assign(this, props);
    }

    @PrimaryColumn_()
    id!: string;

    @Column_("text", { nullable: false })
    clusterId!: string;

    @Column_("text", { nullable: false })
    network!: string;

    @Column_("text", { nullable: false })
    version!: string;

    @Column_("text", {nullable: false})
    ownerAddress!: string

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    validatorCount!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    networkFeeIndex!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    index!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    balance!: bigint;

    @Column_("boolean", { nullable: false })
    active!: boolean;

    @Column_("boolean", { nullable: false })
    isLiquidated!: boolean;

    @Column_("numeric", { array: true, transformer: marshal.bigintTransformer, nullable: false })
    operators!: bigint[];

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    blockNumber!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    createdAt!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    updatedAt!: bigint;
}
