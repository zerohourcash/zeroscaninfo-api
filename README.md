# zeroscaninfo API Documentation

* [Pagination Parameters](#pagination-parameters)
* [Block / Timestamp Filter Parameters](#block--timestamp-filter-parameters)
* [Blockchain](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/blockchain.md)
  * [Blockchain Information](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/blockchain.md#Blockchain-Information)
  * [Supply](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/blockchain.md#Supply)
  * [Total Max Supply](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/blockchain.md#Total-Max-Supply)
* [Block](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/block.md)
  * [Block Information](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/block.md#Block-Information)
  * [Blocks of Date](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/block.md#Blocks-of-Date)
  * [Recent Blocks](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/block.md#Recent-Blocks)
* [Transaction](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/transaction.md)
  * [Transaction Information](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/transaction.md#Transaction-Information)
  * [Raw Transaction](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/transaction.md#Raw-Transaction)
  * [Send Raw Transaction](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/transaction.md#Send-Raw-Transaction)
* [Address](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/address.md)
  * [Address Information](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/address.md#Address-Information)
  * [Address Balance](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/address.md#Address-Balance)
  * [Address Transactions](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/address.md#Address-Transactions)
  * [Address Basic Transactions](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/address.md#Address-Basic-Transactions)
  * [Address Contract Transactions](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/address.md#Address-Contract-Transactions)
  * [Address ZRC20 Token Transactions](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/address.md#Address-ZRC20-Token-Transactions)
  * [Address UTXO List](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/address.md#Address-UTXO-List)
  * [Address Balance History](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/address.md#Address-Balance-History)
  * [Address ZRC20 Balance History](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/address.md#Address-ZRC20-Balance-History)
* [Contract](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/contract.md)
  * [Contract Information](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/contract.md#Contract-Information)
  * [Contract Transactions](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/contract.md#Contract-Transactions)
  * [Contract Basic Transactions](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/contract.md#Contract-Basic-Transactions)
  * [Call Contract](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/contract.md#Call-Contract)
  * [Search Logs](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/contract.md#Search-Logs)
* [ZRC20](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/zrc20.md)
  * [ZRC20 list](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/zrc20.md#ZRC20-list)
  * [ZRC20 Transaction list](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/zrc20.md#ZRC20-Transaction-list)
* [ZRC721](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/zrc721.md)
  * [ZRC721 list](https://github.com/zerohourcash/zeroscaninfo-api/blob/master/doc/zrc721.md#ZRC721-list)


## API Endpoint
* `https://ws.zeroscan.st/` for mainnet
* `https://ws.zeroscan.io/` for testnet

`/info` and `/supply` use the ZHCASH node `getblockchaininfo.moneysupply` value as the source of truth. The value is cached by the API and refreshed once per day to avoid unnecessary node load.


## Verified ZHCASH Examples

These examples use live ZHCASH data from zeroscan and are safe for API smoke checks:

* Example live ZHCASH address with ZRC20 balances and a ZRC721 NFT: `ZGqDPGCds5CBRHLZZCnYWsYWYPF3i9NCvi`
* OK token contract: `e66c1aeba394ccda63c7644d68b4c771ef6548d9`
* OK token page: `https://zeroscan.st/contract/e66c1aeba394ccda63c7644d68b4c771ef6548d9`

Useful requests:

```text
GET /address/ZGqDPGCds5CBRHLZZCnYWsYWYPF3i9NCvi
```
<https://ws.zeroscan.st/address/ZGqDPGCds5CBRHLZZCnYWsYWYPF3i9NCvi>

```text
GET /address/ZGqDPGCds5CBRHLZZCnYWsYWYPF3i9NCvi/balance
```
<https://ws.zeroscan.st/address/ZGqDPGCds5CBRHLZZCnYWsYWYPF3i9NCvi/balance>

```text
GET /address/ZGqDPGCds5CBRHLZZCnYWsYWYPF3i9NCvi/zrc20-balance/e66c1aeba394ccda63c7644d68b4c771ef6548d9
```
<https://ws.zeroscan.st/address/ZGqDPGCds5CBRHLZZCnYWsYWYPF3i9NCvi/zrc20-balance/e66c1aeba394ccda63c7644d68b4c771ef6548d9>

```text
GET /zrc20/e66c1aeba394ccda63c7644d68b4c771ef6548d9/txs?limit=5&offset=0
```
<https://ws.zeroscan.st/zrc20/e66c1aeba394ccda63c7644d68b4c771ef6548d9/txs?limit=5&offset=0>


## Pagination Parameters

You may use one of 3 forms below, all indices count from 0, maximum 100 records per page:
* `limit=20&offset=40`
* `from=40&to=59`
* `pageSize=20&page=2`


## Block / Timestamp Filter Parameters

These params are available in some transaction list queries,
records are picked only when `fromBlock <= blockHeight <= toBlock`, `fromTime <= blockTimestamp <= toTime`.

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>fromBlock</code></td>
            <td>Number (optional)</td>
            <td>Search blocks from height</td>
        </tr>
        <tr>
            <td><code>toBlock</code></td>
            <td>Number (optional)</td>
            <td>Search blocks until height</td>
        </tr>
        <tr>
            <td><code>fromTime</code></td>
            <td>ISO 8601 Date String (optional)</td>
            <td>Search blocks from timestamp</td>
        </tr>
        <tr>
            <td><code>toTime</code></td>
            <td>ISO 8601 Date String (optional)</td>
            <td>Search blocks until timestamp</td>
        </tr>
    </tbody>
</table>
