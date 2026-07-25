# Appendix A — Glossary

---

{% hint style="info" %}
Terms marked **[DSP]** are introduced or given specific meaning by this framework. All other terms carry their conventional industry meaning, with the framework's particular usage noted where it differs.
{% endhint %}

## A

**Absence–degradation guard** **[DSP]** — Control that suppresses negative-correlation alerts when the silence is attributable to an unhealthy source rather than a genuine non-occurrence. See [Chapter 21](../part-2/21-alert-generation.md).

**ACID** — Atomicity, Consistency, Isolation, Durability. Transactional guarantees provided by databases and, via open table formats, by lakehouse storage.

**Active metadata** — Metadata that triggers behaviour rather than merely describing assets: policy enforcement, quarantine, scope suspension. See [Chapter 18](../part-2/18-metadata-and-lineage.md).

**AI agent** — A software component that plans and executes multi-step tasks using models and tools. In this framework agents are constrained to read from governed interfaces and to act only within the Autonomy Ladder.

**Alert clustering** — Grouping of related alerts into a single incident by shared entity, causal chain, or root cause. See [Chapter 21](../part-2/21-alert-generation.md).

**ANN (Approximate Nearest Neighbour)** — Indexing technique enabling sub-linear similarity search over high-dimensional embeddings; the basis of semantic correlation (M4) and vector retrieval.

**Autonomy Controller** **[DSP]** — The component that evaluates whether a proposed action may execute at its requested autonomy level, based on confidence, reversibility, policy, and blast radius.

**Autonomy Ladder** **[DSP]** — Six-level model (L0–L5) of graduated machine decision authority, gated on action reversibility rather than model accuracy. See [Chapter 20](../part-2/20-autonomous-decision-support.md).

## B

**Backpressure** — Mechanism by which a slow downstream stage signals upstream producers to reduce rate, preventing unbounded queue growth.

**Batch layer** — The component performing wide-window, retrospective, and global-scope correlation work that streaming cannot economically perform. See [Chapter 12](../part-2/12-batch-layer.md).

**Blast radius** — The number of entities, systems, or people materially affected by an action. A primary input to autonomy gating.

## C

**Calibration** — The property that a stated confidence of 0.8 corresponds to an approximately 80% realized correctness rate. Assessed by reliability curves against outcome feedback.

**Canonical event** **[DSP]** — The framework's normalized event representation, carrying resolved entity keys, event time, provenance, classification, and payload. The unit of ingestion and correlation. See [Chapter 13](../part-2/13-ingestion-layer.md).

**CAP theorem** — Result stating that a distributed system cannot simultaneously guarantee consistency, availability, and partition tolerance.

**CEP (Complex Event Processing)** — Detection of declared patterns over event streams. In this framework CEP corresponds to correlation modality M1 and is one of five modalities rather than the whole capability.

**Confidence** **[DSP]** — A calibrated probability attached to a correlation, expressing the likelihood that the asserted relationship is genuine. Distinct from strength and from statistical significance.

**Confidence decay** **[DSP]** — Time-based reduction in a correlation's confidence in the absence of reinforcing evidence, causing edges to weaken and eventually expire.

**Correlation** **[DSP]** — A persisted, typed, scored, and time-bounded assertion that a relationship exists between two or more canonical events or entities. The framework's central object.

**Correlation Engine** **[DSP]** — The component that detects, scores, persists, and retires correlations across five modalities. See [Chapter 14](../part-2/14-correlation-engine.md).

**Correlation scope** **[DSP]** — A governed, declared unit specifying which event types may be correlated, over what window, for what purpose, under what policy, and with what retention. The framework's primary governance object.

**Correlation tax** **[DSP]** — The recurring, distributed cost incurred when every consuming team independently reconstructs entity resolution and cross-domain relationships. See [Chapter 5](../part-1/05-current-challenges.md).

**Cost per acted-upon insight** **[DSP]** — Primary economic metric: total platform cost attributable to a scope divided by the number of its insights that resulted in action.

**CQRS** — Command Query Responsibility Segregation; the separation of write and read models.

## D

**Data contract** — A versioned, enforceable agreement between a producing domain and the platform specifying schema, semantics, quality, and delivery guarantees.

**Data fabric** — Architecture providing unified metadata-driven access across distributed sources. Provides cross-domain *access*; the framework provides cross-domain *inference*.

**Data lake** — Low-cost store of raw data in open formats with schema-on-read.

**Data lakehouse** — Architecture combining lake storage economics with warehouse transactional guarantees via open table formats.

**Data mesh** — Sociotechnical architecture based on domain ownership, data-as-product, self-serve platform, and federated computational governance.

**Data Swimming Pool (DSP)** **[DSP]** — The conceptual framework proposed in this whitepaper: an architecture in which relationships between events are first-class, persisted, scored, governed, and expiring platform assets.

## E

**Entity resolution (ER)** — Determination that records across systems refer to the same real-world entity. The binding constraint on correlation quality. See [Chapter 13](../part-2/13-ingestion-layer.md).

**Event sourcing** — Persisting state as an append-only sequence of events from which current state is derived.

**Event time** — The timestamp at which an event occurred in the source domain, as distinct from processing time. Mandatory in this framework.

**Evidence chain** **[DSP]** — The complete, addressable set of events, correlations, model versions, and policy decisions supporting an Insight Object. Required by Principle 7.

**Exactly-once semantics** — Processing guarantee that each event affects state precisely once despite failures and retries.

## H

**Hot key** — A partition key with disproportionate event volume, creating a scaling bottleneck. See [Chapter 26](../part-3/26-scalability.md).

## I

**Incident** **[DSP]** — A cluster of related alerts presented as a single unit of human attention.

**Inference-level lineage** **[DSP]** — Lineage extending beyond data movement to record why a conclusion was drawn and which correlations, models, and policies contributed. See [Chapter 18](../part-2/18-metadata-and-lineage.md).

**Insight Object** **[DSP]** — The framework's principal output: a structured artefact carrying a finding, its confidence, its evidence chain, its recommended action, its autonomy level, and its expiry. See [Chapter 16](../part-2/16-ai-insight-engine.md).

## K

**k-anonymity** — Property that any released record is indistinguishable from at least k−1 others. Used in this framework to gate aggregate cross-lane correlation.

**Kappa architecture** — Stream-only processing architecture; contrasted with Lambda. The framework is neither, using streaming and batch for distinct workload classes with an explicit reconciliation protocol.

**Knowledge graph, living** **[DSP]** — Instance-level graph whose edges are machine-derived correlations that carry confidence, decay over time, and expire. Distinguished from asset-level catalog graphs. See [Chapter 17](../part-2/17-knowledge-graph-layer.md).

## L

**Lambda architecture** — Parallel batch and speed layers producing a merged serving view.

**Lineage depth levels** **[DSP]** — Five levels of lineage granularity from asset through record, transformation, correlation, to decision.

## M

**Medallion architecture** — Bronze/silver/gold zone progression in lakehouse storage.

**Modality (correlation)** **[DSP]** — One of five detection mechanisms: M1 temporal/pattern, M2 entity/structural, M3 causal/statistical, M4 semantic/embedding, M5 behavioural/deviation. A sixth, negative correlation, detects expected-but-absent events.

**Multi-modal reinforcement** **[DSP]** — Elevation of confidence when independent modalities assert the same relationship.

## N

**Negative correlation** **[DSP]** — A relationship asserting that an expected event did not occur within its expected window. Gated by source health.

## P

**PACELC** — Extension of CAP addressing latency-versus-consistency trade-offs in the absence of partitions.

**Prohibited-inference registry** **[DSP]** — Enumerated set of conclusions the platform must not produce, enforced at correlation formation rather than at consumption. See [Chapter 24](../part-3/24-privacy.md).

**Purpose binding** **[DSP]** — Constraint that a correlation may be used only for purposes present in the intersection of all its constituent events' permitted purposes.

## R

**RAG (Retrieval-Augmented Generation)** — Grounding of generated output in retrieved source material. The framework's variant retrieves correlations and validates citations before release.

**Reconciliation protocol** **[DSP]** — Defined procedure by which batch results supersede streaming results, including divergence classification and correction propagation. See [Chapter 12](../part-2/12-batch-layer.md).

**Reversibility** — The degree to which an action's effects can be undone. The governing criterion for autonomy level in this framework.

**RPO / RTO** — Recovery Point Objective (acceptable data loss) and Recovery Time Objective (acceptable downtime).

## S

**Scope budget** **[DSP]** — Hard organizational limit on the number of concurrently active correlation scopes, the primary defence against combinatorial explosion.

**Shadow mode** — Operation in which outputs are recorded and evaluated but not surfaced or acted upon. Corresponds to autonomy level L1.

**Stateful stream processing** — Continuous computation maintaining durable state across events, enabling windowed joins, pattern detection, and aggregation.

## T

**Tiered retention** **[DSP]** — Retention strategy applying different durations to hot, warm, and cold log tiers based on correlation window requirements and replay needs.

## W

**Watermark** — Heuristic assertion that no further events earlier than a given event time are expected, used to trigger window completion.

**Window (correlation)** — The bounded time interval within which events may be considered for correlation under a given scope.

---

**Next:** [Appendix B — Reference Implementation Blueprint →](b-reference-implementation.md)
