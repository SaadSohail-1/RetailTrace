# RetailTrace — Remaining Multi-Node Network Work

**Status:** LAN testing successful; remote connectivity pending
**Blockchain:** `retailtrace`
**MultiChain Version:** 2.3.3 Community
**ngrok Version:** 3.39.11

## 1. Current State

The following work has already been completed and tested.

| Task                                               | Status   |
| -------------------------------------------------- | -------- |
| MultiChain installed on Fedora (Node A)            | Complete |
| MultiChain installed on Windows (Node B)           | Complete |
| Both nodes joined the same `retailtrace` chain     | Complete |
| Peer connectivity verified using `getpeerinfo`     | Complete |
| Both nodes reached block height 114 during testing | Complete |
| `records` stream accessible on both nodes          | Complete |
| Windows subscribed to `records`                    | Complete |
| JSON test record published from Fedora             | Complete |
| Test record appeared on Windows                    | Complete |

### Verified test record

The following record was published from Fedora:

```bash
multichain-cli retailtrace publish records 'record:TEST-NODE-001' '{"json":{"recordId":"TEST-NODE-001","businessId":"B1001","schemaId":"SCHEMA001","data":{"message":"hello from Fedora"}}}'
```

The record was subsequently visible on both nodes through `liststreamitems records`.

**Conclusion:** Two-node connectivity, chain synchronization, and stream data propagation have been verified on the local network.

## 2. Remaining Work

### Task A — Test remote connectivity using ngrok

**Objective:** Allow Windows to connect to Fedora's MultiChain P2P endpoint when the machines are on different networks.

#### Existing configuration

- Node A: Fedora
- Node A LAN address: `192.168.0.109`
- MultiChain P2P port: `9567`
- MultiChain RPC port: `9566`
- Node B: Windows
- ngrok installed and authenticated on Fedora

The ngrok configuration has been validated successfully.

#### Start the TCP tunnel

On Fedora:

```bash
ngrok tcp 9567
```

Keep the terminal running. Record the actual public hostname and port displayed by ngrok, for example:

```text
tcp://HOSTNAME:PUBLIC_PORT
```

The hostname and port above are placeholders. Use the actual values from the running tunnel.

#### Test from a different network

For a meaningful remote-connectivity test, connect Windows to a different network, such as a mobile hotspot. Do not assume a test from the same Wi-Fi proves internet connectivity.

1. Start the ngrok TCP tunnel on Fedora.
2. Move Windows to a different network.
3. Ensure Node A's MultiChain daemon remains running.
4. Stop the Windows MultiChain daemon cleanly before restarting it with a different connection address.
5. Use the public hostname and port assigned by ngrok to connect Windows to the existing chain.
6. If MultiChain reports a permission error, verify the Windows node address and its `connect` permission on Fedora.
7. Verify the peer connection and block synchronization.

Do not create a new chain on Windows.

**Important:** The exact reconnect command must use the actual ngrok hostname and public port. Keep the existing chain data directory intact.

#### Verification commands

On Fedora:

```bash
multichain-cli retailtrace getinfo
multichain-cli retailtrace getpeerinfo
```

On Windows:

```bat
multichain-cli.exe retailtrace getinfo
multichain-cli.exe retailtrace getpeerinfo
```

Verify that:

- The nodes establish a peer connection through the public endpoint.
- Block heights converge.
- The `records` stream remains accessible.
- A new test record published on Fedora becomes visible on Windows.

Record the result, including any errors and the final block heights.

### Task B — Document network configuration

Update this document with:

- The successful ngrok connection result.
- The date of testing.
- Peer connectivity evidence.
- Block synchronization evidence.
- Stream propagation evidence.

Do not record the ngrok authtoken or other secrets in the repository.

The public endpoint may change when the tunnel restarts.

### Task C — Security checks

- Expose only MultiChain P2P port `9567`.
- Never expose the RPC port `9566` through ngrok.
- Grant only the permissions required by each node.
- Do not grant `admin`, `mine`, or stream-write permissions unnecessarily.
- Stop the tunnel when the test is finished.
- Keep ngrok credentials out of source control.

A TCP tunnel makes the P2P service reachable through a public endpoint. It is suitable for a controlled development test, not a substitute for a production security review.

### Task D — Third-node testing

A third laptop is currently unavailable.

Therefore, three-node testing is **pending due to hardware availability**, not completed. If a third device becomes available later, repeat the joining, synchronization, and stream propagation tests with Node C.

Do not claim three-node verification in the report until it has actually been performed.

## 3. Final Definition of Done

Issue #38 can be considered complete for the available two-node scope when:

- [x] Fedora and Windows connect on the LAN.
- [x] Both nodes synchronize to the same blockchain.
- [x] A new record propagates between the nodes.
- [ ] Windows connects to Fedora through the ngrok endpoint from a different network.
- [ ] Remote peer connectivity and synchronization are verified.
- [ ] The final results and limitations are documented.

Three-node verification remains a limitation unless another laptop becomes available.

## 4. Useful References

- MultiChain documentation: [https://www.multichain.com/developers/creating-connecting/](https://www.multichain.com/developers/creating-connecting/)
- MultiChain permissions: [https://www.multichain.com/developers/permissions-management/](https://www.multichain.com/developers/permissions-management/)
- ngrok TCP tunnels: [https://ngrok.com/docs/](https://ngrok.com/docs/)
- ngrok security: [https://ngrok.com/security](https://ngrok.com/security)

## Final Project Note

RetailTrace's two-node blockchain network is operational on the LAN. The remaining network milestone is to prove that the existing nodes can communicate over the internet through ngrok, then document the evidence and the limitation that a third laptop was unavailable.
