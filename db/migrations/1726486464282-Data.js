module.exports = class Data1726486464282 {
    name = 'Data1726486464282'

    async up(db) {
        await db.query(`CREATE TABLE "validator" ("id" character varying NOT NULL, "network" text NOT NULL, "version" text NOT NULL, "owner_address" text NOT NULL, "public_key" text NOT NULL, "operators" bigint array NOT NULL, "cluster" text, "shares" text, "shares_public_keys" text array NOT NULL, "encrypted_keys" text array NOT NULL, "block_number" numeric NOT NULL, "log_index" numeric NOT NULL, "transaction_index" numeric NOT NULL, "added_at_block_number" numeric NOT NULL, "added_at_log_index" numeric NOT NULL, "added_at_transaction_index" numeric NOT NULL, "is_valid" boolean NOT NULL, "is_deleted" boolean NOT NULL, "is_liquidated" boolean NOT NULL, "ignore_on_sync" boolean NOT NULL, "created_at" numeric NOT NULL, "updated_at" numeric NOT NULL, "is_draft" boolean NOT NULL, "is_public_key_valid" boolean NOT NULL, "is_shares_valid" boolean NOT NULL, "is_operators_valid" boolean NOT NULL, CONSTRAINT "PK_ae0a943022c24bd60e7161e0fad" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "operator" ("id" character varying NOT NULL, "operator_id" numeric NOT NULL, "network" text NOT NULL, "version" text NOT NULL, "owner_address" text NOT NULL, "public_key" text NOT NULL, "fee" numeric NOT NULL, "previous_fee" numeric NOT NULL, "declared_fee" numeric NOT NULL, "address_whitelist" text, "memo" text, "block_number" numeric NOT NULL, "is_valid" boolean NOT NULL, "is_deleted" boolean NOT NULL, "created_at" numeric NOT NULL, "updated_at" numeric NOT NULL, "whitelist_addresses" text array NOT NULL, "is_private" boolean NOT NULL, "whitelisting_contract" text, CONSTRAINT "PK_8b950e1572745d9f69be7748ae8" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "cluster" ("id" character varying NOT NULL, "cluster_id" text NOT NULL, "network" text NOT NULL, "version" text NOT NULL, "owner_address" text NOT NULL, "validator_count" numeric NOT NULL, "network_fee_index" numeric NOT NULL, "index" numeric NOT NULL, "balance" numeric NOT NULL, "active" boolean NOT NULL, "is_liquidated" boolean NOT NULL, "operators" numeric array NOT NULL, "block_number" numeric NOT NULL, "created_at" numeric NOT NULL, "updated_at" numeric NOT NULL, CONSTRAINT "PK_b09d39b9491ce5cb1e8407761fd" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "account" ("id" character varying NOT NULL, "owner_address" text NOT NULL, "recipient_address" text, "network" text NOT NULL, "version" text NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`)
        await db.query(`CREATE TABLE "event" ("id" text NOT NULL, "network" text NOT NULL, "version" text NOT NULL, "log_index" numeric NOT NULL, "transaction_hash" text NOT NULL, "transaction_index" numeric NOT NULL, "event" text NOT NULL, "block_number" numeric NOT NULL, "owner_address" text, "raw_data" jsonb NOT NULL, "created_at" numeric NOT NULL, "processed" numeric, CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`)
    }

    async down(db) {
        await db.query(`DROP TABLE "validator"`)
        await db.query(`DROP TABLE "operator"`)
        await db.query(`DROP TABLE "cluster"`)
        await db.query(`DROP TABLE "account"`)
        await db.query(`DROP TABLE "event"`)
    }
}
