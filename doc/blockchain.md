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
  "height": 405961,
  "supply": 101603844,
  "circulatingSupply": 95853844,
  "netStakeWeight": 1095728543244388,
  "feeRate": 0.00401787,
  "dgpInfo": {
    "maxBlockSize": 2000000,
    "minGasPrice": 40,
    "blockGasLimit": 40000000
  }
}
```


## Supply

**Request**
```
GET /supply
```
<https://ws.zeroscan.st/supply>

**Response**
```json
101603852
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
