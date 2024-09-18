import { Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_ } from "typeorm";
import * as marshal from "./marshal";

@Entity_()
export class Validator {
    constructor(props?: Partial<Validator>) {
        Object.assign(this, props);
    }

    @PrimaryColumn_()
    id!: string;

    @Column_("text", { nullable: false })
    network!: string;

    @Column_("text", { nullable: false })
    version!: string;

    @Column_("text", { nullable: false })
    ownerAddress!: string;

    @Column_("text", { nullable: false })
    publicKey!: string;

    @Column_('bigint', { array: true, transformer: marshal.bigintArrayTransformer })
    operators!: bigint[];

    @Column_("text", { nullable: false })
    cluster!: string;

    @Column_("text", { nullable: false })
    shares!: string;

    @Column_("text", { array: true, nullable: false })
    sharesPublicKeys!: string[];

    @Column_("text", { array: true, nullable: false })
    encryptedKeys!: string[];

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    blockNumber!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    logIndex!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    transactionIndex!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    addedAtBlockNumber!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    addedAtLogIndex!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    addedAtTransactionIndex!: bigint;

    @Column_("boolean", { nullable: false })
    isValid!: boolean;

    @Column_("boolean", { nullable: false })
    isDeleted!: boolean;

    @Column_("boolean", { nullable: false })
    isLiquidated!: boolean;

    @Column_("boolean", { nullable: false })
    ignoreOnSync!: boolean;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    createdAt!: bigint;

    @Column_("numeric", { transformer: marshal.bigintTransformer, nullable: false })
    updatedAt!: bigint;

    @Column_("boolean", { nullable: false })
    isDraft!: boolean;

    @Column_("boolean", { nullable: false })
    isPublicKeyValid!: boolean;

    @Column_("boolean", { nullable: false })
    isSharesValid!: boolean;

    @Column_("boolean", { nullable: false })
    isOperatorsValid!: boolean;

    @Column_("text", { array: true, nullable: true })
    memo?: string[] | null;
}
