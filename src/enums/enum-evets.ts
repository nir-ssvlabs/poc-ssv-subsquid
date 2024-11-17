export enum EnumEvents {
    EVENT_OPERATOR_ADDED = 'OperatorAdded',
    EVENT_OPERATOR_REMOVED = 'OperatorRemoved',
    EVENT_OPERATOR_FEE_EXECUTION = 'OperatorFeeExecuted',
    EVENT_OPERATOR_FEE_DECLARATION = 'OperatorFeeDeclared',
    EVENT_CLUSTER_LIQUIDATED = 'ClusterLiquidated',
    EVENT_CLUSTER_REACTIVATED = 'ClusterReactivated',
    EVENT_VALIDATOR_ADDED = 'ValidatorAdded',
    EVENT_VALIDATOR_REMOVED = 'ValidatorRemoved',
    EVENT_CLUSTER_DEPOSITED = 'ClusterDeposited',
    EVENT_CLUSTER_WITHDRAWN = 'ClusterWithdrawn',
    EVENT_ACCOUNT_FEE_RECIPIENT_ADD = 'FeeRecipientAddressUpdated',
    EVENT_OPERATOR_WHITELIST_UPDATED = 'OperatorWhitelistUpdated',
    EVENT_OPERATOR_MULTIPLE_WHITELIST_UPDATED = 'OperatorMultipleWhitelistUpdated',
    EVENT_OPERATOR_MULTIPLE_WHITELIST_REMOVED = 'OperatorMultipleWhitelistRemoved',
    EVENT_OPERATOR_STATUS_PRIVACY_STATUS_UPDATED = 'OperatorPrivacyStatusUpdated',
    EVENT_OPERATOR_WHITELISTING_CONTRACT_UPDATED = 'OperatorWhitelistingContractUpdated'
}