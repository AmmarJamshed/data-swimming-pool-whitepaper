# 21. Alert Generation

---

## 21.1 Alert Fatigue Is a Correlation Failure

[Chapter 5](../part-1/05-current-challenges.md) argued that alert fatigue is not a threshold-tuning problem but a correlation failure expressed as a volume problem. This chapter specifies the alerting architecture that follows from that diagnosis.

The conventional model generates one alert per detector per triggering condition. Four independent detectors observing four facets of a single underlying event produce four alerts, each individually low-severity, none conveying the conjunction that makes them collectively critical. The analyst is asked to perform the correlation — which is the expensive, error-prone, human-latency operation the platform was supposed to eliminate.

{% hint style="success" %}
### Design Principle — Alert on Correlations, Not on Events

An alert MUST be generated from a correlation or an Insight Object, never directly from a single raw event or single-signal threshold breach. Single-signal detection remains valuable as *input* to correlation; it MUST NOT be an output to a human.
{% endhint %}

The consequence is a substantial reduction in volume with an increase in precision — the two moving together rather than trading against each other, which is the specific improvement threshold tuning cannot deliver.

## 21.2 Alert Pipeline

```mermaid
flowchart TB
    IN1[("Correlations<br/>confidence-scored")]
    IN2[("Insight Objects<br/>with recommended action")]

    subgraph GEN["1. Generation"]
        direction TB
        G1["Alert-worthy determination<br/><i>severity model + rules</i>"]
        G2["Severity assignment<br/><i>impact × confidence × urgency</i>"]
        G3["Compose alert with<br/>evidence chain attached"]
    end

    subgraph DEDUP["2. Deduplication"]
        direction TB
        D1["Fingerprint<br/><i>entity + type + window</i>"]
        D2{"Seen<br/>before?"}
        D3["Increment occurrence count<br/>update existing alert"]
        D4["New alert"]
        D1 --> D2
        D2 -->|yes| D3
        D2 -->|no| D4
    end

    subgraph CLUSTER["3. Clustering"]
        direction TB
        CL1["Group by shared entity"]
        CL2["Group by correlation chain"]
        CL3["Group by root-cause hypothesis"]
        CL4["<b>Emit ONE incident</b><br/>containing N alerts"]
        CL1 & CL2 & CL3 --> CL4
    end

    subgraph SUPP["4. Suppression"]
        direction TB
        S1["Maintenance window active"]
        S2["Known-issue matcher"]
        S3["Downstream of a<br/>declared upstream incident"]
        S4["Source degraded<br/><i>absence-confound guard</i>"]
        S5["Below dynamic volume budget"]
    end

    subgraph ENRICH["5. Enrichment"]
        direction TB
        E1["Attach evidence subgraph"]
        E2["Attach historical precedent<br/><i>similar past alerts + outcomes</i>"]
        E3["Attach recommended action<br/>+ autonomy level"]
        E4["Attach competing hypothesis<br/><i>if any</i>"]
    end

    subgraph ROUTE["6. Routing"]
        direction TB
        R1["Ownership resolution<br/><i>via knowledge graph</i>"]
        R2["Skill + capacity matching"]
        R3["Escalation ladder<br/>with timers"]
        R4["Channel selection<br/><i>severity-appropriate</i>"]
    end

    subgraph FB["7. Feedback"]
        direction TB
        F1["Disposition capture<br/><i>true positive / false / duplicate /<br/>not actionable</i>"]
        F2["Time-to-acknowledge<br/>+ time-to-resolve"]
        F3["→ Correlation calibration"]
        F4["→ Severity model retraining"]
        F5["→ Suppression rule proposal"]
    end

    IN1 & IN2 --> GEN --> DEDUP --> CLUSTER --> SUPP --> ENRICH --> ROUTE --> OUT["Recipient"]
    OUT --> FB
    F3 -.-> IN1
    F5 -.-> SUPP

    classDef gen fill:#0a5570,stroke:#3fd0f0,stroke-width:2px,color:#ffffff
    classDef proc fill:#14415c,stroke:#4fb8d8,color:#eaf6fb
    classDef supp fill:#3a2540,stroke:#a878c0,color:#f6eaff
    classDef fb fill:#183028,stroke:#4caf7d,stroke-width:2px,color:#e6fff2
    class GEN,G1,G2,G3 gen
    class DEDUP,D1,D2,D3,D4,CLUSTER,CL1,CL2,CL3,CL4,ENRICH,E1,E2,E3,E4,ROUTE,R1,R2,R3,R4 proc
    class SUPP,S1,S2,S3,S4,S5 supp
    class FB,F1,F2,F3,F4,F5 fb
```

**Figure 33.** *Alert generation and suppression pipeline. Seven stages transform correlations into routed, enriched incidents. Stage 3 (clustering) produces the largest volume reduction by emitting one incident containing many alerts rather than many independent alerts. Stage 7 (feedback) closes the loop, using disposition data to recalibrate correlation confidence, retrain severity, and propose new suppression rules.*

## 21.3 Severity Assignment

Severity is computed rather than declared, as a function of three factors:

**Impact** — the magnitude of consequence if the correlation is correct, derived from the entities involved (a critical asset, a high-value customer, a regulated process), the estimated financial or safety exposure, and blast radius via graph traversal.

**Confidence** — the calibrated correlation confidence. A high-impact correlation at 0.55 confidence is not a critical alert; it is an investigation request.

**Urgency** — the remaining window of actionability. A correlation whose actionable window closes in four minutes outranks a higher-impact correlation whose window is three weeks.

{% hint style="info" %}
**Urgency is the factor conventional alerting omits.** Most severity models consider impact and sometimes confidence, but treat all alerts as equally time-sensitive. Incorporating remaining actionability window means the queue is ordered by *what will be lost by waiting* rather than by *what is largest*, which is a materially different and generally better ordering for operational response.
{% endhint %}

## 21.4 The Absence–Degradation Guard

Suppression stage S4 in Figure 33 implements the guard described in [Chapter 19](19-event-relationships.md), and it deserves restatement because it prevents the framework's most damaging plausible failure.

If a source stops producing, every EXPECTED_ABSENT correlation dependent on it fires. In a hospital, this would generate an alert for every medication scheduled but not recorded as administered — thousands of critical alerts, all false, during a systems outage, at precisely the moment clinical staff are least able to absorb them.

**Required behaviour:** the alert pipeline consults source health before emitting any alert derived from a negative relationship. Where the relevant source is degraded, quarantining, or silent beyond its expected volume band, the pipeline MUST emit a **single infrastructure alert** stating that absence detection is unavailable for that source, and MUST suppress the individual absence alerts.

This converts a catastrophic alert storm into one accurate operational notification.

## 21.5 Clustering into Incidents

Clustering is where the volume reduction is realized. Three mechanisms operate together:

| Mechanism | Basis | Example |
| --- | --- | --- |
| **Entity clustering** | Alerts concerning the same resolved entity within a window | Twelve alerts about one customer's account become one customer incident |
| **Chain clustering** | Alerts whose underlying correlations form a connected chain | Authentication anomaly → payee addition → transfer attempt become one takeover incident |
| **Root-cause clustering** | Alerts sharing a common upstream cause identified by graph traversal | Forty service alerts across regions trace to one dependency and become one incident |

**Table 42.** *Alert clustering mechanisms. Root-cause clustering delivers the largest reduction in incident-driven environments, and it is only possible because the correlation substrate persists the dependency relationships that permit the traversal.*

Root-cause clustering illustrates the framework's value directly: in a conventional architecture, determining that forty alerts share one cause is the analyst's job, performed after the alerts arrive. Here it is performed before, and the analyst receives one incident with forty pieces of supporting evidence attached.

## 21.6 Alert Quality Metrics

| Metric | Definition | Target posture | Interpretation |
| --- | --- | --- | --- |
| **Precision** | True positives / all alerts | Improve continuously | The primary quality measure |
| **Recall** | Detected / all genuine occurrences | Improve continuously | Requires ground truth; frequently unmeasurable, and its absence should be stated honestly rather than assumed adequate |
| **Alerts per analyst-hour** | Volume normalized to capacity | Match capacity | Above capacity, additional precision is wasted because alerts go untriaged |
| **Compression ratio** | Raw correlations / emitted incidents | Higher is better | Direct measure of clustering effectiveness |
| **Time to acknowledge** | Emission to first human action | Within SLA by severity | Rising times indicate volume exceeds capacity |
| **Time to resolve** | Emission to disposition | Domain-specific | Long tails indicate insufficient enrichment |
| **Disposition distribution** | Share by true/false/duplicate/not-actionable | Monitor for shift | "Not actionable" share is the most informative signal |
| **Actioned-within-window rate** | Resolved before actionability window closed | Maximize | The metric that connects alerting to actual outcomes |
| **Suppression accuracy** | Suppressed alerts later found significant | Near zero | Suppression errors are silent and require deliberate audit |

**Table 43.** *Alert quality metrics. Two deserve emphasis: the "not actionable" disposition share indicates that the system is correctly detecting things nobody can do anything about — a scope design problem, not a precision problem — and suppression accuracy requires deliberate periodic audit because suppression failures are invisible by construction.*

{% hint style="warning" %}
**Auditing suppression is non-optional and frequently neglected.** Every suppressed alert is a decision the system made silently. If suppression is wrong, nobody finds out, because the alert never appeared. The framework requires a periodic sampled review of suppressed alerts against subsequently-known outcomes, with the review owned by a party independent of the team that authored the suppression rules.
{% endhint %}

## 21.7 Routing and Ownership

Routing uses the knowledge graph rather than a static routing table.

An alert concerning an entity traverses the graph to determine: who owns this entity, who owns the affected process, who owns the implicated asset, and which team currently has capacity and the relevant skill. This means routing remains correct as organizational structure changes, because the graph is updated by the same mechanisms that maintain the rest of the system — rather than requiring a routing table to be maintained separately and, inevitably, to drift.

**Escalation ladders** are attached to severity, with timers. Unacknowledged alerts escalate on a defined schedule. Escalation events are themselves recorded as events, which means escalation patterns become correlatable — persistent escalation for a particular alert type is a signal about either the alert type or the receiving team's capacity.

---

{% hint style="success" %}
## Key Takeaways

1. **Alerts are generated from correlations and Insight Objects, never from single events.** Single-signal detection remains valuable as correlation input but must not reach a human directly.
2. **Volume falls and precision rises together**, which is the specific improvement threshold tuning cannot deliver, because it can only trade false positives against false negatives.
3. **Severity incorporates remaining actionability window**, ordering the queue by what will be lost by waiting rather than by what is largest.
4. **The absence–degradation guard prevents the framework's most damaging plausible failure:** a source outage generating a mass false alert storm from negative relationships. One infrastructure alert replaces thousands of false ones.
5. **Root-cause clustering delivers the largest reduction** and is only possible because the correlation substrate persists the dependency relationships required for the traversal.
6. **The "not actionable" disposition share is the most informative quality signal**, indicating a scope design problem rather than a precision problem.
7. **Suppression must be deliberately audited** by an independent party, because suppression failures are silent by construction and will otherwise never be discovered.
8. **Routing traverses the knowledge graph rather than a static table**, remaining correct as organizational structure changes.
{% endhint %}

---

**Next:** [22. Enterprise Integration →](../part-3/22-enterprise-integration.md)
