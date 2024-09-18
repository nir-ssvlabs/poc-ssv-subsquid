import { Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_ } from "typeorm";
import * as marshal from "./marshal";

@Entity_()
export class Operator {
    constructor(props?: Partial<Operator>) {
        Object.assign(this, props);
    }

    @PrimaryColumn_()
    id!: string;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    operatorId!: bigint;

    @Column_("text", { nullable: false })
    network!: string;

    @Column_("text", { nullable: false })
    version!: string;

    @Column_("text", {nullable: false})
    ownerAddress!: string

    @Column_("text", {nullable: false})
    publicKey!: string

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    fee!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    previousFee!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    declaredFee!: bigint;

    @Column_("text", { nullable: true })
    addressWhitelist?: string | null;

    @Column_("text", { array: true, nullable: true })
    memo?: string[] | null;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    blockNumber!: bigint;

    @Column_("boolean", { nullable: false })
    isValid!: boolean;

    @Column_("boolean", { nullable: false })
    isDeleted!: boolean;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    createdAt!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    updatedAt!: bigint;

    @Column_("text", { array: true, nullable: false })
    whitelistAddresses!: string[];

    @Column_("boolean", { nullable: false })
    isPrivate!: boolean;

    @Column_("text", { nullable: true })
    whitelistingContract?: string | null;
}
