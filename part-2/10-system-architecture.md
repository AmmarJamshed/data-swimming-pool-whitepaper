# 10. System Architecture

---

This chapter specifies the reference architecture. It defines seven layers and two cross-cutting planes, states each layer's responsibility and interface contract, identifies candidate technologies, and describes the principal data flows. Subsequent chapters ([11](11-streaming-layer.md)–[21](21-alert-generation.md)) elaborate individual layers.

## 10.1 Layered Reference Architecture

```mermaid
flowchart TB
    subgraph L0["LAYER 0 — SOURCE PLANE"]
        direction LR
        SA["Transactional<br/>OLTP · CDC"]
        SB["Operational<br/>ERP · CRM · ITSM"]
        SC["Telemetry<br/>IoT · Logs · Metrics"]
        SD["Digital<br/>Web · Mobile · API"]
        SE["External<br/>Market · Partner · Registry"]
        SF["Unstructured<br/>Docs · Voice · Image"]
    end

    subgraph L1["LAYER 1 — INGESTION LAYER"]
        direction LR
        I1["Connectors<br/>CDC · batch · stream · pull"]
        I2["Contract<br/>Validation"]
        I3["Canonicalization<br/>+ Entity Resolution"]
        I4["Classification<br/>+ Quarantine"]
    end

    subgraph L2["LAYER 2 — CIRCULATION LAYER"]
        direction LR
        C1["Streaming Substrate<br/>partitioned log · replay"]
        C2["Batch Substrate<br/>lakehouse · medallion"]
        C3["Reconciliation<br/>Protocol"]
    end

    subgraph L3["LAYER 3 — CORRELATION ENGINE"]
        direction LR
        R1["Temporal"]
        R2["Entity"]
        R3["Causal"]
        R4["Semantic"]
        R5["Behavioural"]
        R6["Confidence<br/>Scoring"]
        R7["Scope<br/>Governor"]
    end

    subgraph L4["LAYER 4 — INTELLIGENCE TIER"]
        direction LR
        T1["Rules Engine<br/>deterministic"]
        T2["AI Insight Engine<br/>ML · CEP · GenAI"]
        T3["Knowledge Graph<br/>living semantic layer"]
    end

    subgraph L5["LAYER 5 — DECISION & ACTION LAYER"]
        direction LR
        D1["Insight<br/>Objects"]
        D2["Alert<br/>Pipeline"]
        D3["Recommendation<br/>Service"]
        D4["Autonomy<br/>Controller"]
    end

    subgraph L6["LAYER 6 — CONSUMPTION PLANE"]
        direction LR
        U1["Human<br/>UI · BI · Copilot"]
        U2["System<br/>API · Webhook · Workflow"]
        U3["Agent<br/>MCP · Tool-use"]
    end

    subgraph PM["METADATA PLANE"]
        direction TB
        M1["Catalog · Schema Registry"]
        M2["Lineage Graph"]
        M3["Semantic Ontology"]
        M4["Provenance Ledger"]
    end

    subgraph PG["GOVERNANCE PLANE"]
        direction TB
        G1["Policy Decision Point"]
        G2["Identity · AuthZ"]
        G3["Privacy · Purpose Binding"]
        G4["Audit · Observability"]
    end

    L0 --> L1 --> L2 --> L3 --> L4 --> L5 --> L6
    L5 -.outcome feedback.-> L3
    L4 -.enrichment.-> L2
    PM -.describes.- L1
    PM -.describes.- L2
    PM -.describes.- L3
    PM -.describes.- L4
    PM -.describes.- L5
    PG -.enforces.- L1
    PG -.enforces.- L3
    PG -.enforces.- L4
    PG -.enforces.- L5
    PG -.enforces.- L6

    classDef src fill:#1b2f3d,stroke:#5b8fb0,stroke-width:1.5px,color:#e6f2fa
    classDef ing fill:#123a4d,stroke:#3d9dc4,stroke-width:1.5px,color:#e8f6fc
    classDef cir fill:#0d4159,stroke:#22b3d6,stroke-width:2px,color:#eaf9ff
    classDef cor fill:#0a5570,stroke:#3fd0f0,stroke-width:2.5px,color:#ffffff
    classDef intl fill:#14415c,stroke:#4fb8d8,stroke-width:1.5px,color:#eaf6fb
    classDef dec fill:#3d3313,stroke:#d4a636,stroke-width:1.5px,color:#fff8e6
    classDef con fill:#233240,stroke:#7f9db5,stroke-width:1.5px,color:#e8f0f7
    classDef meta fill:#183028,stroke:#4caf7d,stroke-width:1.5px,color:#e6fff2
    classDef gov fill:#3a2540,stroke:#a878c0,stroke-width:1.5px,color:#f6eaff
    class L0,SA,SB,SC,SD,SE,SF src
    class L1,I1,I2,I3,I4 ing
    class L2,C1,C2,C3 cir
    class L3,R1,R2,R3,R4,R5,R6,R7 cor
    class L4,T1,T2,T3 intl
    class L5,D1,D2,D3,D4 dec
    class L6,U1,U2,U3 con
    class PM,M1,M2,M3,M4 meta
    class PG,G1,G2,G3,G4 gov
```

**Figure 10.** *Data Swimming Pool layered reference architecture. Seven horizontal layers carry data from source to consumption. Two vertical planes — metadata and governance — intersect every layer. Two feedback paths are architecturally significant: decision outcomes return to the Correlation Engine as supervision signal (P10), and intelligence-tier enrichments are written back into the circulation layer for reuse.*

## 10.2 Layer Responsibilities

| Layer | Responsibility | MUST NOT do | Candidate technologies |
| --- | --- | --- | --- |
| **L0 — Source** | Produce facts in native form; expose change feeds | Be modified to accommodate the pool | Existing enterprise systems |
| **L1 — Ingestion** | Connect, validate against contract, canonicalize, resolve entities, classify, quarantine | Apply business logic or transformation beyond canonicalization | Debezium, Kafka Connect, Airbyte, Fivetran, custom SDKs |
| **L2 — Circulation** | Durable, replayable, ordered transport; unified batch/stream persistence; reconciliation | Interpret domain semantics | Kafka, Pulsar, Kinesis; Iceberg, Delta Lake, Hudi |
| **L3 — Correlation** | Discover, score, persist, expire relationships within declared scopes | Exceed declared scope; assert causality; emit without confidence | Flink, Spark Structured Streaming, Esper, custom operators |
| **L4 — Intelligence** | Deterministic rules, ML inference, generative reasoning, graph maintenance | Bypass the correlation substrate to re-derive relationships | Drools, OPA; MLflow, feature stores; Neo4j, TigerGraph; vector DBs; LLM gateways |
| **L5 — Decision & Action** | Compose Insight Objects, correlate and suppress alerts, enforce Autonomy Ladder | Take action above its assigned autonomy level | Temporal, Camunda, custom controllers |
| **L6 — Consumption** | Deliver to humans, systems, and agents with permission enforcement | Cache correlations without honouring expiry | BI tools, APIs, MCP servers, notification services |
| **P-Meta — Metadata** | Catalog, lineage, semantics, provenance | Store instance-level correlations (that is L3/L4) | OpenLineage, DataHub, Collibra, OpenMetadata |
| **P-Gov — Governance** | Policy decisions at five boundaries, identity, purpose binding, audit | Be advisory rather than enforcing | OPA/Rego, Cedar, IAM, SIEM |

**Table 12.** *Layer responsibilities, prohibitions, and candidate technologies. The "MUST NOT do" column is as architecturally load-bearing as the responsibility column; most architectural erosion occurs when a layer quietly absorbs an adjacent layer's concerns.*

## 10.3 Component Interaction Topology

```mermaid
flowchart LR
    subgraph WRITE["Write Path — continuous"]
        direction TB
        W1["Source event"] --> W2["Connector"]
        W2 --> W3{"Contract<br/>valid?"}
        W3 -->|no| WQ["Quarantine<br/>+ notify owner"]
        W3 -->|yes| W4["Canonicalize"]
        W4 --> W5["Resolve entities"]
        W5 --> W6["Classify + tag policy"]
        W6 --> W7[("Circulation log")]
        W7 --> W8["Correlation operators<br/>(per declared scope)"]
        W8 --> W9{"Policy<br/>permits?"}
        W9 -->|no| WD["Deny + audit"]
        W9 -->|yes| W10["Score confidence"]
        W10 --> W11{"Above<br/>threshold?"}
        W11 -->|no| WX["Discard<br/>+ count"]
        W11 -->|yes| W12[("Correlation store<br/>graph + lakehouse")]
        W12 --> W13["Rules + AI evaluation"]
        W13 --> W14["Insight Object"]
        W14 --> W15["Autonomy Controller"]
    end

    subgraph READ["Read Path — on demand"]
        direction TB
        Q1["Consumer query"] --> Q2["AuthZ + purpose check"]
        Q2 --> Q3["Graph traversal<br/>+ vector retrieval"]
        Q3 --> Q4["Evidence assembly"]
        Q4 --> Q5{"Evidence<br/>complete?"}
        Q5 -->|no| Q6["Suppress<br/>(P7)"]
        Q5 -->|yes| Q7["Return with lineage"]
    end

    W12 -.serves.-> Q3
    W15 -.outcome.-> W8

    classDef ok fill:#183028,stroke:#4caf7d,color:#e6fff2
    classDef bad fill:#4a2020,stroke:#d07070,color:#ffeaea
    classDef store fill:#0d4159,stroke:#22b3d6,color:#eaf9ff
    class WQ,WD,WX,Q6 bad
    class W7,W12 store
```

**Figure 11.** *Component interaction topology, separating the continuous write path from the on-demand read path. Three rejection points are architecturally mandatory: contract failure quarantines to the source owner, policy denial produces an audit record without forming the correlation (P8), and incomplete evidence suppresses the output rather than emitting it (P7).*

## 10.4 The Two Feedback Loops

The architecture contains two feedback paths that distinguish it from a conventional pipeline.

**Loop 1 — Outcome supervision (L5 → L3).** When an action is taken or an insight is acted upon, the resulting outcome is captured and returned to the Correlation Engine. Did the predicted failure occur? Was the flagged transaction genuinely fraudulent? Did the recommended intervention retain the customer? This is P10, and it is what converts a static correlation system into a learning one. Without it, confidence scores are assertions rather than measurements.

**Loop 2 — Enrichment writeback (L4 → L2).** Derived attributes — a computed risk score, a resolved entity cluster, a semantic classification — are written back into the circulation layer as canonical events in their own right. This means derived intelligence becomes available for further correlation, enabling multi-order reasoning: a correlation over correlations.

{% hint style="warning" %}
**Loop 2 requires care.** Writing derived events back into the circulation layer creates the possibility of feedback amplification, where a derived event triggers a correlation that produces another derived event, recursively. The architecture MUST enforce a **derivation depth limit** and MUST tag derived events with their derivation order so that correlation scopes can exclude them where appropriate. Failure to do so produces runaway event generation — a failure mode observed in poorly-designed event-driven systems generally.
{% endhint %}

## 10.5 Deployment Topology

The reference architecture is deployment-agnostic but assumes a specific set of operational properties.

```mermaid
flowchart TB
    subgraph REGION_A["Primary Region"]
        direction TB
        A1["Ingestion cluster<br/>autoscaled, stateless"]
        A2["Streaming cluster<br/>3+ brokers, RF=3"]
        A3["Correlation cluster<br/>stateful, checkpointed"]
        A4[("Graph cluster<br/>causal cluster, 3+ cores")]
        A5[("Lakehouse<br/>object storage")]
        A6["Serving tier<br/>stateless, autoscaled"]
    end

    subgraph REGION_B["Secondary Region"]
        direction TB
        B1["Ingestion — warm"]
        B2["Streaming — mirrored"]
        B3["Correlation — warm standby<br/>checkpoint-restorable"]
        B4[("Graph — async replica")]
        B5[("Lakehouse — cross-region replicated")]
        B6["Serving — warm"]
    end

    CTRL["Control Plane<br/>metadata · policy · scope registry · observability"]

    A2 ==>|"async mirror"| B2
    A4 ==>|"async replication"| B4
    A5 ==>|"storage replication"| B5
    CTRL -.-> REGION_A
    CTRL -.-> REGION_B

    classDef prim fill:#0d4159,stroke:#22b3d6,stroke-width:2px,color:#eaf9ff
    classDef sec fill:#243447,stroke:#7f96ad,stroke-width:1.5px,color:#e6edf3
    classDef ctrl fill:#3a2540,stroke:#a878c0,stroke-width:2px,color:#f6eaff
    class REGION_A,A1,A2,A3,A4,A5,A6 prim
    class REGION_B,B1,B2,B3,B4,B5,B6 sec
    class CTRL ctrl
```

**Figure 12.** *Reference deployment topology. Stateless tiers (ingestion, serving) scale horizontally and fail over trivially. Stateful tiers (correlation, graph) require checkpoint-based recovery and asynchronous replication. A single logical control plane holds the scope registry, policy definitions, and metadata, and is the component whose availability most constrains the system.*

**Operational assumptions:**

- **Stateless where possible.** Ingestion and serving tiers hold no durable state and are trivially replaceable.
- **Checkpointed where stateful.** The correlation tier holds substantial window state; it MUST checkpoint to durable storage at an interval bounded by the acceptable reprocessing window.
- **Replay as the recovery primitive.** Because the circulation layer retains an ordered log, recovery from correlation-tier failure is a replay operation rather than a restore operation. This is a significant operational advantage and is a direct benefit of the log-as-substrate decision.
- **The control plane is the critical dependency.** Correlation cannot proceed without the scope registry and the policy decision point. [Chapter 27](../part-3/27-high-availability.md) treats its availability requirements specifically.

## 10.6 Interface Contracts

Layers communicate through explicit contracts rather than shared state. The three most significant:

**L1 → L2: the Canonical Event contract.** Every event entering circulation conforms to the canonical event schema ([Appendix C](../appendix/c-schemas.md)), carrying identity, event time, ingestion time, clock quality, resolved entity references, original identifiers, source lineage pointer, policy classification, derivation order, and payload. Schema evolution is governed by the schema registry with backward compatibility enforced.

**L3 → L4: the Correlation contract.** Every correlation exposes type, modality, participant set, confidence, evidence set, temporal validity, provenance, policy classification, and supersession link. Consumers MUST honour temporal validity and MUST NOT cache correlations past their expiry.

**L5 → L6: the Insight Object contract.** Every insight exposes assertion, evidence chain, confidence, recommended action, autonomy level, permission set, lifecycle status, and version. Consumers MUST present confidence and MUST make the evidence chain accessible to the recipient.

{% hint style="success" %}
### Design Principle — Contracts Are Enforced, Not Documented

Interface contracts MUST be machine-validated at runtime, not described in documentation. A message failing its contract MUST be rejected at the boundary with an audit record and notification to the producing owner, never silently coerced or accepted.
{% endhint %}

## 10.7 What This Architecture Deliberately Omits

**No unified query engine.** The framework does not propose a single query language spanning graph, lakehouse, and vector stores. Federated query across heterogeneous engines has a long history of disappointing performance. Consumers use the appropriate engine per access pattern, mediated by the serving tier.

**No custom storage engine.** All persistence is delegated to mature systems. The framework contributes the *model*, not the storage.

**No mandated orchestration technology.** Workflow, scheduling, and orchestration are treated as implementation choices.

**No prescribed cloud or vendor.** Every layer names multiple viable candidates.

---

{% hint style="success" %}
## Key Takeaways

1. **Seven layers and two cross-cutting planes** constitute the reference architecture, with the Correlation Engine at L3 as the architectural centre of gravity.
2. **Each layer's prohibitions matter as much as its responsibilities.** Architectural erosion occurs when a layer quietly absorbs adjacent concerns — most commonly when applications re-derive correlations the platform already holds.
3. **Three rejection points are mandatory:** contract failure quarantines, policy denial prevents correlation formation, and incomplete evidence suppresses output.
4. **Two feedback loops distinguish the architecture from a pipeline:** outcome supervision returning to correlation, and enrichment writeback into circulation enabling multi-order reasoning.
5. **Enrichment writeback requires a derivation depth limit** to prevent runaway feedback amplification.
6. **Replay is the recovery primitive.** Because circulation retains an ordered log, correlation-tier recovery is replay rather than restore — a direct dividend of the log-as-substrate decision.
7. **The control plane is the critical availability dependency**, since correlation cannot proceed without the scope registry and policy decision point.
8. **The architecture deliberately omits a unified query engine and a custom storage engine.** It contributes a model, not infrastructure.
{% endhint %}

---

**Next:** [11. Streaming Layer →](11-streaming-layer.md)
