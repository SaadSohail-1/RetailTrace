# RetailTrace Multi-Node Network Setup

## Objective
Connect multiple MultiChain nodes to the same `retailtrace` blockchain and verify peer connectivity, block synchronization, and stream data propagation.

## Current Test Environment

| Node | Operating System | Role |
|---|---|---|
| Node A | Fedora Linux | Existing chain node and initial publisher |
| Node B | Windows | Connected peer and stream reader |
| Node C | Pending | Additional network test node |

- MultiChain version: 2.3.3 Community
- Blockchain: `retailtrace`
- P2P port: `9567`
- Stream: `records`
- Test network: Local Wi-Fi/LAN

## Node A — Fedora

Existing node address:

`retailtrace@192.168.0.109:9567`

Useful commands:

```bash
multichain-cli retailtrace getinfo
multichain-cli retailtrace getpeerinfo
multichain-cli retailtrace liststreamitems records
```

Check that MultiChain listens on the P2P port:

```bash
ss -ltnp | grep 9567
```

## Node B — Windows

MultiChain was extracted to `C:\multichain`.

Join the existing chain using Node A's reachable address:

```bat
multichaind.exe retailtrace@192.168.0.109:9567
```

Grant the generated Windows address `connect` permission from Node A, then start the Windows node:

```bat
multichaind.exe retailtrace -daemon
```

Useful commands:

```bat
multichain-cli.exe retailtrace getinfo
multichain-cli.exe retailtrace getpeerinfo
multichain-cli.exe retailtrace liststreams
multichain-cli.exe retailtrace subscribe records
multichain-cli.exe retailtrace liststreamitems records
```

## Stream Propagation Test

A test record was published on Fedora:

```bash
multichain-cli retailtrace publish records 'record:TEST-NODE-001' '{"json":{"recordId":"TEST-NODE-001","businessId":"B1001","schemaId":"SCHEMA001","data":{"message":"hello from Fedora"}}}'
```

**Observed result:** The published item appeared in `liststreamitems records` on both Fedora and Windows.

This verifies cross-node propagation of the test stream item.

## Security Notes

- Expose only the P2P port when remote peer connectivity is required.
- Keep the JSON-RPC port private.
- Grant only the permissions required by each node.
- Do not grant mining or administrative permissions merely to join the network.
- The LAN address `192.168.0.109` is specific to the current network and may change.

## Remaining Work

- Add a third laptop as Node C.
- Repeat peer, block-height, and stream propagation checks.
- Test remote connectivity across separate networks.
- Update this document with final test results and limitations.
