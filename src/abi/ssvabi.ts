import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    AdminChanged: event("0x7e644d79422f17c01e4894b5f4f588d331ebfa28653d42ae832dc59e38c9798f", "AdminChanged(address,address)", {"previousAdmin": p.address, "newAdmin": p.address}),
    BeaconUpgraded: event("0x1cf3b03a6cf19fa2baba4df148e9dcabedea7f8a5c07840e207e5c089be95d3e", "BeaconUpgraded(address)", {"beacon": indexed(p.address)}),
    ClusterDeposited: event("0x2bac1912f2481d12f0df08647c06bee174967c62d3a03cbc078eb215dc1bd9a2", "ClusterDeposited(address,uint64[],uint256,(uint32,uint64,uint64,bool,uint256))", {"owner": indexed(p.address), "operatorIds": p.array(p.uint64), "value": p.uint256, "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}),
    ClusterLiquidated: event("0x1fce24c373e07f89214e9187598635036111dbb363e99f4ce498488cdc66e688", "ClusterLiquidated(address,uint64[],(uint32,uint64,uint64,bool,uint256))", {"owner": indexed(p.address), "operatorIds": p.array(p.uint64), "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}),
    ClusterReactivated: event("0xc803f8c01343fcdaf32068f4c283951623ef2b3fa0c547551931356f456b6859", "ClusterReactivated(address,uint64[],(uint32,uint64,uint64,bool,uint256))", {"owner": indexed(p.address), "operatorIds": p.array(p.uint64), "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}),
    ClusterWithdrawn: event("0x39d1320bbda24947e77f3560661323384aa0a1cb9d5e040e617e5cbf50b6dbe0", "ClusterWithdrawn(address,uint64[],uint256,(uint32,uint64,uint64,bool,uint256))", {"owner": indexed(p.address), "operatorIds": p.array(p.uint64), "value": p.uint256, "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}),
    DeclareOperatorFeePeriodUpdated: event("0x5fbd75d987b37490f91aa1909db948e7ff14c6ffb495b2f8e0b2334da9b192f1", "DeclareOperatorFeePeriodUpdated(uint64)", {"value": p.uint64}),
    ExecuteOperatorFeePeriodUpdated: event("0xf6b8a2b45d0a60381de51a7b980c4660d9e5b82db6e07a4d342bfc17a6ff96bf", "ExecuteOperatorFeePeriodUpdated(uint64)", {"value": p.uint64}),
    FeeRecipientAddressUpdated: event("0x259235c230d57def1521657e7c7951d3b385e76193378bc87ef6b56bc2ec3548", "FeeRecipientAddressUpdated(address,address)", {"owner": indexed(p.address), "recipientAddress": p.address}),
    Initialized: event("0x7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb3847402498", "Initialized(uint8)", {"version": p.uint8}),
    LiquidationThresholdPeriodUpdated: event("0x42af14411036d7a50e5e92daf825781450fc8fac8fb65cbdb04720ff08efb84f", "LiquidationThresholdPeriodUpdated(uint64)", {"value": p.uint64}),
    MinimumLiquidationCollateralUpdated: event("0xd363ab4392efaf967a89d8616cba1ff0c6f05a04c2f214671be365f0fab05960", "MinimumLiquidationCollateralUpdated(uint256)", {"value": p.uint256}),
    ModuleUpgraded: event("0xfdf54bf052398eb41c923eb1bd596351c5e72b99959d1ca529a7f13c0a2503d7", "ModuleUpgraded(uint8,address)", {"moduleId": indexed(p.uint8), "moduleAddress": p.address}),
    NetworkEarningsWithdrawn: event("0x370342c3bb9245e20bffe6dced02ba2fceca979701f881d5adc72d838e83f1c5", "NetworkEarningsWithdrawn(uint256,address)", {"value": p.uint256, "recipient": p.address}),
    NetworkFeeUpdated: event("0x8f49a76c5d617bd72673d92d3a019ff8f04f204536aae7a3d10e7ca85603f3cc", "NetworkFeeUpdated(uint256,uint256)", {"oldFee": p.uint256, "newFee": p.uint256}),
    OperatorAdded: event("0xd839f31c14bd632f424e307b36abff63ca33684f77f28e35dc13718ef338f7f4", "OperatorAdded(uint64,address,bytes,uint256)", {"operatorId": indexed(p.uint64), "owner": indexed(p.address), "publicKey": p.bytes, "fee": p.uint256}),
    OperatorFeeDeclarationCancelled: event("0x5055fa347441172447637c015e80a3ee748b9382212ceb5dca5a3683298fd6f3", "OperatorFeeDeclarationCancelled(address,uint64)", {"owner": indexed(p.address), "operatorId": indexed(p.uint64)}),
    OperatorFeeDeclared: event("0x796204296f2eb56d7432fa85961e9750d0cb21741873ebf7077e28263e327358", "OperatorFeeDeclared(address,uint64,uint256,uint256)", {"owner": indexed(p.address), "operatorId": indexed(p.uint64), "blockNumber": p.uint256, "fee": p.uint256}),
    OperatorFeeExecuted: event("0x513e931ff778ed01e676d55880d8db185c29b0094546ff2b3e9f5b6920d16bef", "OperatorFeeExecuted(address,uint64,uint256,uint256)", {"owner": indexed(p.address), "operatorId": indexed(p.uint64), "blockNumber": p.uint256, "fee": p.uint256}),
    OperatorFeeIncreaseLimitUpdated: event("0x2fff7e5a48a4befc2c2be4d77e141f6d97907798977ce452429ec55c2658a342", "OperatorFeeIncreaseLimitUpdated(uint64)", {"value": p.uint64}),
    OperatorMaximumFeeUpdated: event("0x38552bed8df52ac76c5de6da688eafcda7d7b070f6c987f391a07dd69986d783", "OperatorMaximumFeeUpdated(uint64)", {"maxFee": p.uint64}),
    OperatorWhitelistUpdated: event("0x29f72634ccb172103f8c542da23de7f6cf9bce724c5bb91bd6f3a516b14c63fe", "OperatorWhitelistUpdated(uint64,address)", {"operatorId": indexed(p.uint64), "whitelisted": p.address}),
    OperatorMultipleWhitelistRemoved: event("0x589a71ef5bb37432c8ce279a4afc32783592f1764c6fcb07e3c437e80c80ab2e", "OperatorMultipleWhitelistRemoved(uint64[],address[])", {"operatorIds": p.array(p.uint64), "whitelistAddresses": p.array(p.address)}),
    OperatorMultipleWhitelistUpdated: event("0x3d5869fa1ed68d6b7b5e2a1f44df8e1e7edd8ea7a6cc240e45c72e2eb3523962", "OperatorMultipleWhitelistUpdated(uint64[],address[])", {"operatorIds": p.array(p.uint64), "whitelistAddresses": p.array(p.address)}),
    OperatorPrivacyStatusUpdated: event("0x7cae2703330c3f53308fb0fe3a9143f335997ba7e059b9ac8e4417ed8fbddbd3", "OperatorPrivacyStatusUpdated(uint64[],bool)", {"operatorIds": p.array(p.uint64), "toPrivate": p.bool}),
    OperatorRemoved: event("0x0e0ba6c2b04de36d6d509ec5bd155c43a9fe862f8052096dd54f3902a74cca3e", "OperatorRemoved(uint64)", {"operatorId": indexed(p.uint64)}),
    OperatorWhitelistingContractUpdated: event("0xf41d8ca981ff900f6db7f71d7e2ae866eae8e4327d23e5c692c13a6c43b39c3d", "OperatorWhitelistingContractUpdated(uint64[],address)", {"operatorIds": p.array(p.uint64), "whitelistingContract": p.address}),
    OperatorWithdrawn: event("0x178bf78bdd8914b8483d640b4a4f84e20943b5eb6b639b7474286364c7651d60", "OperatorWithdrawn(address,uint64,uint256)", {"owner": indexed(p.address), "operatorId": indexed(p.uint64), "value": p.uint256}),
    OwnershipTransferStarted: event("0x38d16b8cac22d99fc7c124b9cd0de2d3fa1faef420bfe791d8c362d765e22700", "OwnershipTransferStarted(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"previousOwner": indexed(p.address), "newOwner": indexed(p.address)}),
    Upgraded: event("0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b", "Upgraded(address)", {"implementation": indexed(p.address)}),
    ValidatorAdded: event("0x48a3ea0796746043948f6341d17ff8200937b99262a0b48c2663b951ed7114e5", "ValidatorAdded(address,uint64[],bytes,bytes,(uint32,uint64,uint64,bool,uint256))", {"owner": indexed(p.address), "operatorIds": p.array(p.uint64), "publicKey": p.bytes, "shares": p.bytes, "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}),
    ValidatorExited: event("0xb4b20ffb2eb1f020be3df600b2287914f50c07003526d3a9d89a9dd12351828c", "ValidatorExited(address,uint64[],bytes)", {"owner": indexed(p.address), "operatorIds": p.array(p.uint64), "publicKey": p.bytes}),
    ValidatorRemoved: event("0xccf4370403e5fbbde0cd3f13426479dcd8a5916b05db424b7a2c04978cf8ce6e", "ValidatorRemoved(address,uint64[],bytes,(uint32,uint64,uint64,bool,uint256))", {"owner": indexed(p.address), "operatorIds": p.array(p.uint64), "publicKey": p.bytes, "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}),
}

export const functions = {
    acceptOwnership: fun("0x79ba5097", "acceptOwnership()", {}, ),
    bulkExitValidator: fun("0x32afd02f", "bulkExitValidator(bytes[],uint64[])", {"publicKeys": p.array(p.bytes), "operatorIds": p.array(p.uint64)}, ),
    bulkRegisterValidator: fun("0x22f18bf5", "bulkRegisterValidator(bytes[],uint64[],bytes[],uint256,(uint32,uint64,uint64,bool,uint256))", {"publicKeys": p.array(p.bytes), "operatorIds": p.array(p.uint64), "sharesData": p.array(p.bytes), "amount": p.uint256, "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}, ),
    bulkRemoveValidator: fun("0x5aed1142", "bulkRemoveValidator(bytes[],uint64[],(uint32,uint64,uint64,bool,uint256))", {"publicKeys": p.array(p.bytes), "operatorIds": p.array(p.uint64), "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}, ),
    cancelDeclaredOperatorFee: fun("0x23d68a6d", "cancelDeclaredOperatorFee(uint64)", {"operatorId": p.uint64}, ),
    declareOperatorFee: fun("0xb317c35f", "declareOperatorFee(uint64,uint256)", {"operatorId": p.uint64, "fee": p.uint256}, ),
    deposit: fun("0xbc26e7e5", "deposit(address,uint64[],uint256,(uint32,uint64,uint64,bool,uint256))", {"clusterOwner": p.address, "operatorIds": p.array(p.uint64), "amount": p.uint256, "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}, ),
    executeOperatorFee: fun("0x8932cee0", "executeOperatorFee(uint64)", {"operatorId": p.uint64}, ),
    exitValidator: fun("0x3877322b", "exitValidator(bytes,uint64[])", {"publicKey": p.bytes, "operatorIds": p.array(p.uint64)}, ),
    getVersion: viewFun("0x0d8e6e2c", "getVersion()", {}, p.string),
    initialize: fun("0xc626c3c6", "initialize(address,address,address,address,address,uint64,uint256,uint32,uint64,uint64,uint64)", {"token_": p.address, "ssvOperators_": p.address, "ssvClusters_": p.address, "ssvDAO_": p.address, "ssvViews_": p.address, "minimumBlocksBeforeLiquidation_": p.uint64, "minimumLiquidationCollateral_": p.uint256, "validatorsPerOperatorLimit_": p.uint32, "declareOperatorFeePeriod_": p.uint64, "executeOperatorFeePeriod_": p.uint64, "operatorMaxFeeIncrease_": p.uint64}, ),
    liquidate: fun("0xbf0f2fb2", "liquidate(address,uint64[],(uint32,uint64,uint64,bool,uint256))", {"clusterOwner": p.address, "operatorIds": p.array(p.uint64), "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}, ),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    pendingOwner: viewFun("0xe30c3978", "pendingOwner()", {}, p.address),
    proxiableUUID: viewFun("0x52d1902d", "proxiableUUID()", {}, p.bytes32),
    reactivate: fun("0x5fec6dd0", "reactivate(uint64[],uint256,(uint32,uint64,uint64,bool,uint256))", {"operatorIds": p.array(p.uint64), "amount": p.uint256, "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}, ),
    reduceOperatorFee: fun("0x190d82e4", "reduceOperatorFee(uint64,uint256)", {"operatorId": p.uint64, "fee": p.uint256}, ),
    registerOperator: fun("0xff212c5c", "registerOperator(bytes,uint256)", {"publicKey": p.bytes, "fee": p.uint256}, p.uint64),
    registerValidator: fun("0x06e8fb9c", "registerValidator(bytes,uint64[],bytes,uint256,(uint32,uint64,uint64,bool,uint256))", {"publicKey": p.bytes, "operatorIds": p.array(p.uint64), "sharesData": p.bytes, "amount": p.uint256, "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}, ),
    removeOperator: fun("0x2e168e0e", "removeOperator(uint64)", {"operatorId": p.uint64}, ),
    removeOperatorMultipleWhitelists: fun("0x837b79eb", "removeOperatorMultipleWhitelists(uint64[],address[])", {"operatorIds": p.array(p.uint64), "whitelistAddresses": p.array(p.address)}, ),
    removeOperatorsWhitelistingContract: fun("0x6a31cf1d", "removeOperatorsWhitelistingContract(uint64[])", {"operatorIds": p.array(p.uint64)}, ),
    removeValidator: fun("0x12b3fc19", "removeValidator(bytes,uint64[],(uint32,uint64,uint64,bool,uint256))", {"publicKey": p.bytes, "operatorIds": p.array(p.uint64), "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}, ),
    renounceOwnership: fun("0x715018a6", "renounceOwnership()", {}, ),
    setFeeRecipientAddress: fun("0xdbcdc2cc", "setFeeRecipientAddress(address)", {"recipientAddress": p.address}, ),
    setOperatorMultipleWhitelists: fun("0x3d1ee607", "setOperatorMultipleWhitelists(uint64[],address[])", {"operatorIds": p.array(p.uint64), "whitelistAddresses": p.array(p.address)}, ),
    setOperatorsPrivateUnchecked: fun("0x822124c1", "setOperatorsPrivateUnchecked(uint64[])", {"operatorIds": p.array(p.uint64)}, ),
    setOperatorsPublicUnchecked: fun("0x4ad00e54", "setOperatorsPublicUnchecked(uint64[])", {"operatorIds": p.array(p.uint64)}, ),
    setOperatorsWhitelistingContract: fun("0x7dc24d52", "setOperatorsWhitelistingContract(uint64[],address)", {"operatorIds": p.array(p.uint64), "whitelistingContract": p.address}, ),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"newOwner": p.address}, ),
    updateDeclareOperatorFeePeriod: fun("0x79e3e4e4", "updateDeclareOperatorFeePeriod(uint64)", {"timeInSeconds": p.uint64}, ),
    updateExecuteOperatorFeePeriod: fun("0xeb608022", "updateExecuteOperatorFeePeriod(uint64)", {"timeInSeconds": p.uint64}, ),
    updateLiquidationThresholdPeriod: fun("0x6512447d", "updateLiquidationThresholdPeriod(uint64)", {"blocks": p.uint64}, ),
    updateMaximumOperatorFee: fun("0xe39c6744", "updateMaximumOperatorFee(uint64)", {"maxFee": p.uint64}, ),
    updateMinimumLiquidationCollateral: fun("0xb4c9c408", "updateMinimumLiquidationCollateral(uint256)", {"amount": p.uint256}, ),
    updateModule: fun("0xe3e324b0", "updateModule(uint8,address)", {"moduleId": p.uint8, "moduleAddress": p.address}, ),
    updateNetworkFee: fun("0x1f1f9fd5", "updateNetworkFee(uint256)", {"fee": p.uint256}, ),
    updateOperatorFeeIncreaseLimit: fun("0x3631983f", "updateOperatorFeeIncreaseLimit(uint64)", {"percentage": p.uint64}, ),
    upgradeTo: fun("0x3659cfe6", "upgradeTo(address)", {"newImplementation": p.address}, ),
    upgradeToAndCall: fun("0x4f1ef286", "upgradeToAndCall(address,bytes)", {"newImplementation": p.address, "data": p.bytes}, ),
    withdraw: fun("0x686e682c", "withdraw(uint64[],uint256,(uint32,uint64,uint64,bool,uint256))", {"operatorIds": p.array(p.uint64), "amount": p.uint256, "cluster": p.struct({"validatorCount": p.uint32, "networkFeeIndex": p.uint64, "index": p.uint64, "active": p.bool, "balance": p.uint256})}, ),
    withdrawAllOperatorEarnings: fun("0x4bc93b64", "withdrawAllOperatorEarnings(uint64)", {"operatorId": p.uint64}, ),
    withdrawNetworkEarnings: fun("0xd2231741", "withdrawNetworkEarnings(uint256)", {"amount": p.uint256}, ),
    withdrawOperatorEarnings: fun("0x35f63767", "withdrawOperatorEarnings(uint64,uint256)", {"operatorId": p.uint64, "amount": p.uint256}, ),
}

export class Contract extends ContractBase {

    getVersion() {
        return this.eth_call(functions.getVersion, {})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    pendingOwner() {
        return this.eth_call(functions.pendingOwner, {})
    }

    proxiableUUID() {
        return this.eth_call(functions.proxiableUUID, {})
    }
}

/// Event types
export type AdminChangedEventArgs = EParams<typeof events.AdminChanged>
export type BeaconUpgradedEventArgs = EParams<typeof events.BeaconUpgraded>
export type ClusterDepositedEventArgs = EParams<typeof events.ClusterDeposited>
export type ClusterLiquidatedEventArgs = EParams<typeof events.ClusterLiquidated>
export type ClusterReactivatedEventArgs = EParams<typeof events.ClusterReactivated>
export type ClusterWithdrawnEventArgs = EParams<typeof events.ClusterWithdrawn>
export type DeclareOperatorFeePeriodUpdatedEventArgs = EParams<typeof events.DeclareOperatorFeePeriodUpdated>
export type ExecuteOperatorFeePeriodUpdatedEventArgs = EParams<typeof events.ExecuteOperatorFeePeriodUpdated>
export type FeeRecipientAddressUpdatedEventArgs = EParams<typeof events.FeeRecipientAddressUpdated>
export type InitializedEventArgs = EParams<typeof events.Initialized>
export type LiquidationThresholdPeriodUpdatedEventArgs = EParams<typeof events.LiquidationThresholdPeriodUpdated>
export type MinimumLiquidationCollateralUpdatedEventArgs = EParams<typeof events.MinimumLiquidationCollateralUpdated>
export type ModuleUpgradedEventArgs = EParams<typeof events.ModuleUpgraded>
export type NetworkEarningsWithdrawnEventArgs = EParams<typeof events.NetworkEarningsWithdrawn>
export type NetworkFeeUpdatedEventArgs = EParams<typeof events.NetworkFeeUpdated>
export type OperatorAddedEventArgs = EParams<typeof events.OperatorAdded>
export type OperatorFeeDeclarationCancelledEventArgs = EParams<typeof events.OperatorFeeDeclarationCancelled>
export type OperatorFeeDeclaredEventArgs = EParams<typeof events.OperatorFeeDeclared>
export type OperatorFeeExecutedEventArgs = EParams<typeof events.OperatorFeeExecuted>
export type OperatorFeeIncreaseLimitUpdatedEventArgs = EParams<typeof events.OperatorFeeIncreaseLimitUpdated>
export type OperatorMaximumFeeUpdatedEventArgs = EParams<typeof events.OperatorMaximumFeeUpdated>
export type OperatorWhitelistUpdatedEventArgs = EParams<typeof events.OperatorWhitelistUpdated>
export type OperatorMultipleWhitelistRemovedEventArgs = EParams<typeof events.OperatorMultipleWhitelistRemoved>
export type OperatorMultipleWhitelistUpdatedEventArgs = EParams<typeof events.OperatorMultipleWhitelistUpdated>
export type OperatorPrivacyStatusUpdatedEventArgs = EParams<typeof events.OperatorPrivacyStatusUpdated>
export type OperatorRemovedEventArgs = EParams<typeof events.OperatorRemoved>
export type OperatorWhitelistingContractUpdatedEventArgs = EParams<typeof events.OperatorWhitelistingContractUpdated>
export type OperatorWithdrawnEventArgs = EParams<typeof events.OperatorWithdrawn>
export type OwnershipTransferStartedEventArgs = EParams<typeof events.OwnershipTransferStarted>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type UpgradedEventArgs = EParams<typeof events.Upgraded>
export type ValidatorAddedEventArgs = EParams<typeof events.ValidatorAdded>
export type ValidatorExitedEventArgs = EParams<typeof events.ValidatorExited>
export type ValidatorRemovedEventArgs = EParams<typeof events.ValidatorRemoved>

/// Function types
export type AcceptOwnershipParams = FunctionArguments<typeof functions.acceptOwnership>
export type AcceptOwnershipReturn = FunctionReturn<typeof functions.acceptOwnership>

export type BulkExitValidatorParams = FunctionArguments<typeof functions.bulkExitValidator>
export type BulkExitValidatorReturn = FunctionReturn<typeof functions.bulkExitValidator>

export type BulkRegisterValidatorParams = FunctionArguments<typeof functions.bulkRegisterValidator>
export type BulkRegisterValidatorReturn = FunctionReturn<typeof functions.bulkRegisterValidator>

export type BulkRemoveValidatorParams = FunctionArguments<typeof functions.bulkRemoveValidator>
export type BulkRemoveValidatorReturn = FunctionReturn<typeof functions.bulkRemoveValidator>

export type CancelDeclaredOperatorFeeParams = FunctionArguments<typeof functions.cancelDeclaredOperatorFee>
export type CancelDeclaredOperatorFeeReturn = FunctionReturn<typeof functions.cancelDeclaredOperatorFee>

export type DeclareOperatorFeeParams = FunctionArguments<typeof functions.declareOperatorFee>
export type DeclareOperatorFeeReturn = FunctionReturn<typeof functions.declareOperatorFee>

export type DepositParams = FunctionArguments<typeof functions.deposit>
export type DepositReturn = FunctionReturn<typeof functions.deposit>

export type ExecuteOperatorFeeParams = FunctionArguments<typeof functions.executeOperatorFee>
export type ExecuteOperatorFeeReturn = FunctionReturn<typeof functions.executeOperatorFee>

export type ExitValidatorParams = FunctionArguments<typeof functions.exitValidator>
export type ExitValidatorReturn = FunctionReturn<typeof functions.exitValidator>

export type GetVersionParams = FunctionArguments<typeof functions.getVersion>
export type GetVersionReturn = FunctionReturn<typeof functions.getVersion>

export type InitializeParams = FunctionArguments<typeof functions.initialize>
export type InitializeReturn = FunctionReturn<typeof functions.initialize>

export type LiquidateParams = FunctionArguments<typeof functions.liquidate>
export type LiquidateReturn = FunctionReturn<typeof functions.liquidate>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type PendingOwnerParams = FunctionArguments<typeof functions.pendingOwner>
export type PendingOwnerReturn = FunctionReturn<typeof functions.pendingOwner>

export type ProxiableUUIDParams = FunctionArguments<typeof functions.proxiableUUID>
export type ProxiableUUIDReturn = FunctionReturn<typeof functions.proxiableUUID>

export type ReactivateParams = FunctionArguments<typeof functions.reactivate>
export type ReactivateReturn = FunctionReturn<typeof functions.reactivate>

export type ReduceOperatorFeeParams = FunctionArguments<typeof functions.reduceOperatorFee>
export type ReduceOperatorFeeReturn = FunctionReturn<typeof functions.reduceOperatorFee>

export type RegisterOperatorParams = FunctionArguments<typeof functions.registerOperator>
export type RegisterOperatorReturn = FunctionReturn<typeof functions.registerOperator>

export type RegisterValidatorParams = FunctionArguments<typeof functions.registerValidator>
export type RegisterValidatorReturn = FunctionReturn<typeof functions.registerValidator>

export type RemoveOperatorParams = FunctionArguments<typeof functions.removeOperator>
export type RemoveOperatorReturn = FunctionReturn<typeof functions.removeOperator>

export type RemoveOperatorMultipleWhitelistsParams = FunctionArguments<typeof functions.removeOperatorMultipleWhitelists>
export type RemoveOperatorMultipleWhitelistsReturn = FunctionReturn<typeof functions.removeOperatorMultipleWhitelists>

export type RemoveOperatorsWhitelistingContractParams = FunctionArguments<typeof functions.removeOperatorsWhitelistingContract>
export type RemoveOperatorsWhitelistingContractReturn = FunctionReturn<typeof functions.removeOperatorsWhitelistingContract>

export type RemoveValidatorParams = FunctionArguments<typeof functions.removeValidator>
export type RemoveValidatorReturn = FunctionReturn<typeof functions.removeValidator>

export type RenounceOwnershipParams = FunctionArguments<typeof functions.renounceOwnership>
export type RenounceOwnershipReturn = FunctionReturn<typeof functions.renounceOwnership>

export type SetFeeRecipientAddressParams = FunctionArguments<typeof functions.setFeeRecipientAddress>
export type SetFeeRecipientAddressReturn = FunctionReturn<typeof functions.setFeeRecipientAddress>

export type SetOperatorMultipleWhitelistsParams = FunctionArguments<typeof functions.setOperatorMultipleWhitelists>
export type SetOperatorMultipleWhitelistsReturn = FunctionReturn<typeof functions.setOperatorMultipleWhitelists>

export type SetOperatorsPrivateUncheckedParams = FunctionArguments<typeof functions.setOperatorsPrivateUnchecked>
export type SetOperatorsPrivateUncheckedReturn = FunctionReturn<typeof functions.setOperatorsPrivateUnchecked>

export type SetOperatorsPublicUncheckedParams = FunctionArguments<typeof functions.setOperatorsPublicUnchecked>
export type SetOperatorsPublicUncheckedReturn = FunctionReturn<typeof functions.setOperatorsPublicUnchecked>

export type SetOperatorsWhitelistingContractParams = FunctionArguments<typeof functions.setOperatorsWhitelistingContract>
export type SetOperatorsWhitelistingContractReturn = FunctionReturn<typeof functions.setOperatorsWhitelistingContract>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type UpdateDeclareOperatorFeePeriodParams = FunctionArguments<typeof functions.updateDeclareOperatorFeePeriod>
export type UpdateDeclareOperatorFeePeriodReturn = FunctionReturn<typeof functions.updateDeclareOperatorFeePeriod>

export type UpdateExecuteOperatorFeePeriodParams = FunctionArguments<typeof functions.updateExecuteOperatorFeePeriod>
export type UpdateExecuteOperatorFeePeriodReturn = FunctionReturn<typeof functions.updateExecuteOperatorFeePeriod>

export type UpdateLiquidationThresholdPeriodParams = FunctionArguments<typeof functions.updateLiquidationThresholdPeriod>
export type UpdateLiquidationThresholdPeriodReturn = FunctionReturn<typeof functions.updateLiquidationThresholdPeriod>

export type UpdateMaximumOperatorFeeParams = FunctionArguments<typeof functions.updateMaximumOperatorFee>
export type UpdateMaximumOperatorFeeReturn = FunctionReturn<typeof functions.updateMaximumOperatorFee>

export type UpdateMinimumLiquidationCollateralParams = FunctionArguments<typeof functions.updateMinimumLiquidationCollateral>
export type UpdateMinimumLiquidationCollateralReturn = FunctionReturn<typeof functions.updateMinimumLiquidationCollateral>

export type UpdateModuleParams = FunctionArguments<typeof functions.updateModule>
export type UpdateModuleReturn = FunctionReturn<typeof functions.updateModule>

export type UpdateNetworkFeeParams = FunctionArguments<typeof functions.updateNetworkFee>
export type UpdateNetworkFeeReturn = FunctionReturn<typeof functions.updateNetworkFee>

export type UpdateOperatorFeeIncreaseLimitParams = FunctionArguments<typeof functions.updateOperatorFeeIncreaseLimit>
export type UpdateOperatorFeeIncreaseLimitReturn = FunctionReturn<typeof functions.updateOperatorFeeIncreaseLimit>

export type UpgradeToParams = FunctionArguments<typeof functions.upgradeTo>
export type UpgradeToReturn = FunctionReturn<typeof functions.upgradeTo>

export type UpgradeToAndCallParams = FunctionArguments<typeof functions.upgradeToAndCall>
export type UpgradeToAndCallReturn = FunctionReturn<typeof functions.upgradeToAndCall>

export type WithdrawParams = FunctionArguments<typeof functions.withdraw>
export type WithdrawReturn = FunctionReturn<typeof functions.withdraw>

export type WithdrawAllOperatorEarningsParams = FunctionArguments<typeof functions.withdrawAllOperatorEarnings>
export type WithdrawAllOperatorEarningsReturn = FunctionReturn<typeof functions.withdrawAllOperatorEarnings>

export type WithdrawNetworkEarningsParams = FunctionArguments<typeof functions.withdrawNetworkEarnings>
export type WithdrawNetworkEarningsReturn = FunctionReturn<typeof functions.withdrawNetworkEarnings>

export type WithdrawOperatorEarningsParams = FunctionArguments<typeof functions.withdrawOperatorEarnings>
export type WithdrawOperatorEarningsReturn = FunctionReturn<typeof functions.withdrawOperatorEarnings>

