# RetailTrace MultiChain Development Network

## Overview

RetailTrace uses MultiChain Community 2.3.3 as its blockchain
network during development.

- Chain name: `retailtrace`
- Protocol: `multichain`
- Network type: Development
- Target block time: 15 seconds

## Node Configuration

| Component | Configuration |
|---|---|
| MultiChain version | 2.3.3 Community |
| Chain | `retailtrace` |
| P2P port | `9567` |
| RPC port | `9566` |
| RPC interface | `127.0.0.1` |
| P2P interface | All interfaces |
| Mining requires peers | `true` |
| Setup blocks | `60` |

## RPC Configuration

The MultiChain JSON-RPC interface is available locally at:

`http://127.0.0.1:9566`

The RPC interface is intentionally bound to localhost during
single-node development so it is not exposed directly to the LAN.

The RetailTrace backend communicates with MultiChain through
JSON-RPC rather than accessing MultiChain internals directly.

## P2P Configuration

The MultiChain peer-to-peer interface uses TCP port `9567`.

The development node currently advertises the local LAN address:

`192.168.0.109:9567`

This address is machine/network dependent and may change if the
machine receives a different DHCP address.

P2P connectivity between multiple nodes will be configured as
part of the multi-node network setup.

## Verification

The node was verified using:

```bash
multichain-cli retailtrace getblockchainparams
multichain-cli retailtrace getnetworkinfo
ss -ltnp | grep -E '9566|9567'
```
The verification confirmed:

- The retailtrace chain is initialized.
 
- P2P port 9567 is listening
- RPC port 9566 is listening on localhost
- IPv4 and IPv6 networking are available
- The node is operational.
