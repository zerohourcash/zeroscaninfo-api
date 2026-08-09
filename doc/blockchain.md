# Blockchain API

- [Blockchain API](#Blockchain-API)
  - [Blockchain Information](#Blockchain-Information)
  - [Supply](#Supply)
  - [Total Max Supply](#Total-Max-Supply)


## Blockchain Information

**Request**
```
GET /info
```
<https://ws.zeroscan.st/info>

**Response**
```json
{
  "height": 1671685,
  "supply": 9317348000,
  "circulatingSupply": 9311598000,
  "netStakeWeight": 79698587350447620,
  "feeRate": 2.74041999,
  "dgpInfo": {
    "maxBlockSize": 2000000,
    "minGasPrice": 40,
    "blockGasLimit": 40000000
  }
}
```


## Supply

Returns the ZHCASH node `getblockchaininfo.moneysupply` value. The API caches this value and refreshes it once per day to avoid unnecessary node load.

**Request**
```
GET /supply
```
<https://ws.zeroscan.st/supply>

**Response**
```json
9317348000
```


## Total Max Supply

**Request**
```
GET /total-max-supply
```
<https://ws.zeroscan.st/total-max-supply>

**Response**
```json
107822406.25
```
