# 36. Telecommunications Use Case

---

{% hint style="danger" %}
**Illustrative scenario.** Synthetic and constructed. All figures are reasoned estimates, not measurements.
{% endhint %}

## 36.1 Scenario Context

**"Lyrath Communications"** is a constructed converged operator: 8.4 million mobile subscribers, 2.1 million fixed broadband lines, a nationwide radio access network of 14,000 sites, a core network, and an enterprise services division.

**The problem it cannot solve.** Telecommunications generates more operational data than almost any other industry and correlates less of it than almost any other industry, because the domains are deeply siloed by engineering discipline. Radio, transport, core, IT, and customer experience are analysed by different teams using different tools with different data models.

The consequence: a network engineer sees a cell exhibiting elevated retransmission rates within acceptable bounds. A customer care manager sees a rise in complaints from one postcode area. A churn analyst sees three enterprise accounts in a region reducing spend. A field operations manager sees a scheduled fibre splice completed successfully. Nobody sees that these are one event.

## 36.2 Network-to-Experience Correlation

```mermaid
flowchart TB
    subgraph SRC["Sources"]
        direction LR
        S1["RAN telemetry<br/><i>per-cell KPIs, 15-min granularity</i>"]
        S2["Core network<br/><i>session records, QoS</i>"]
        S3["Transport<br/><i>link utilization, faults</i>"]
        S4["Device telemetry<br/><i>where consented</i>"]
        S5["Field operations<br/><i>work orders, changes</i>"]
        S6["Customer care<br/><i>contacts, sentiment, repeat calls</i>"]
        S7["Billing & usage<br/><i>consumption, plan changes</i>"]
        S8["Digital channels<br/><i>app sessions, self-service</i>"]
        S9["Churn & retention<br/><i>notice, port-out requests</i>"]
        S10["Weather & external<br/><i>storms, power outages</i>"]
    end

    subgraph SCOPES["Correlation Scopes"]
        direction TB
        SC1["<b>net.experience_impact.v4</b><br/>M1·M2·M3 · 7 d<br/>Which network degradations<br/>produce measurable customer<br/>experience impact — and which<br/>do not?"]
        SC2["<b>net.change_fallout.v3</b><br/>M1·M3 · 72 h<br/>Which planned changes<br/>correlate with subsequent<br/>degradation?"]
        SC3["<b>cust.silent_churn.v3</b><br/>M2·M5·negative · 90 d<br/>Which subscribers are<br/>disengaging without<br/>complaining?"]
        SC4["<b>ops.fault_precursor.v3</b><br/>M1·M5 · 30 d<br/>Which telemetry signatures<br/>precede site failure?"]
        SC5["<b>ent.sla_risk.v2</b><br/>M1·M2 · 30 d<br/>Which enterprise circuits are<br/>trending toward SLA breach?"]
    end

    subgraph FIND["Illustrative Correlation Chain"]
        direction TB
        F1["<b>C-91104</b> 0.87<br/>PLANNED_CHANGE_CAUSED_DEGRADATION<br/>fibre splice at site TX-4417 →<br/>elevated retransmission on<br/>3 downstream cells<br/><i>M3 causal: pre/post comparison</i>"]
        F2["<b>C-91131</b> 0.92<br/>DEGRADATION_IMPACTS_EXPERIENCE<br/>3 cells → 2,840 subscribers<br/>with measurable session quality<br/>reduction"]
        F3["<b>C-91148</b> 0.79<br/>EXPERIENCE_DRIVES_CONTACT<br/>412 of 2,840 contacted care;<br/>2,428 did not"]
        F4["<b>C-91166</b> 0.74<br/>SILENT_DISENGAGEMENT<br/>Of the 2,428 who did not contact,<br/>318 show usage decline consistent<br/>with churn precursor<br/><i>negative relationship</i>"]
        F1 --> F2 --> F3 --> F4
    end

    INS["<b>Insight I-2288</b><br/>'Splice at TX-4417 has an estimated<br/>commercial impact of 318 at-risk<br/>subscribers, of whom only 13% have<br/>contacted us. Remediation window<br/>before typical port-out: ~21 days.'<br/><br/><b>L3:</b> stage proactive outreach<br/><b>L4:</b> raise remediation priority<br/><b>L2:</b> recommend change-process review"]

    SRC --> SCOPES --> FIND --> INS

    classDef src fill:#1b2f3d,stroke:#5b8fb0,color:#e6f2fa
    classDef sc fill:#0a5570,stroke:#3fd0f0,stroke-width:2px,color:#ffffff
    classDef find fill:#14415c,stroke:#4fb8d8,color:#eaf6fb
    classDef ins fill:#3d3313,stroke:#d4a636,stroke-width:2px,color:#fff8e6
    class SRC,S1,S2,S3,S4,S5,S6,S7,S8,S9,S10 src
    class SCOPES,SC1,SC2,SC3,SC4,SC5 sc
    class FIND,F1,F2,F3,F4 find
    class INS ins
```

**Figure 50.** *Telecommunications network and experience correlation workflow (illustrative). A four-link correlation chain traces a field operation through network degradation, customer experience impact, contact behaviour, and silent disengagement. The chain — not any single link — is what converts an engineering event into a quantified commercial consequence.*

## 36.3 The Silent Majority Problem

`cust.silent_churn.v3` addresses telecommunications' most expensive blind spot.

Operators respond to complaints. Complaint volume is the primary signal of customer dissatisfaction, and remediation is prioritized accordingly. But in the illustrative chain above, 2,428 of 2,840 affected subscribers — 85% — did not contact care. They experienced degradation, formed a judgement, and said nothing.

The complaint-driven model systematically under-prioritizes exactly the customers most likely to leave without warning, because willingness to complain correlates with engagement, and engagement correlates with retention. **The customers who complain are disproportionately the ones who will stay.**

Detecting the silent majority requires correlating network degradation with usage behaviour change and the *absence* of contact — a negative relationship. It is not available from any single source and is not visible in complaint-driven reporting by construction.

## 36.4 Distinguishing Impactful from Ignorable Degradation

`net.experience_impact.v4` addresses the inverse problem, and it is where operators most frequently misallocate effort.

Network operations centres monitor thousands of KPIs and generate large volumes of threshold alerts. Many degradations that breach engineering thresholds produce no measurable customer impact — a cell degrades at 03:00 with four active subscribers, or a metric deteriorates within a range where the application layer compensates transparently.

Correlating network events with actual session quality, usage behaviour, and contact patterns allows the operator to distinguish degradation that matters from degradation that merely breaches a threshold. This reprioritizes field effort toward impact rather than toward alarm — and it typically reduces network alert volume substantially while improving the experience outcome.

{% hint style="info" %}
**This is the alert fatigue argument in a different domain.** The network operations centre's problem is structurally identical to the security operations centre's: thousands of independent threshold alerts, no correlation to consequence, and human triage capacity as the binding constraint. The remedy is the same.
{% endhint %}

## 36.5 Illustrative Outcomes

| Measure | Plausible direction | Reasoning |
| --- | --- | --- |
| Network alerts requiring field response | Substantial reduction | Impact correlation distinguishes consequential degradation |
| Silent disengagement identified | New capability | Negative relationship across network, usage, and contact |
| Change-caused degradation attributed | Improvement | Causal pre/post correlation at change granularity |
| Enterprise SLA breaches pre-empted | Improvement | Trend correlation across circuit and service layers |
| Proactive outreach precision | New capability | Targeted at affected, non-complaining subscribers |
| Field effort allocated to customer impact | Improvement | Prioritization by correlated consequence rather than KPI breach |
| Repeat-contact rate | Reduction | Root cause identified at first contact via correlation |

**Table 72.** *Illustrative outcome directions for telecommunications.*

## 36.6 What Makes This Hard

**Telemetry volume is extreme.** RAN telemetry at per-cell, per-KPI, sub-minute granularity across 14,000 sites exceeds the comfortable bounds of [Table 55](../part-3/26-scalability.md) by a wide margin. As in manufacturing, aggregation before ingestion is mandatory, and the aggregation must preserve the features correlation requires — which means the aggregation design is itself a correlation design decision.

**Subscriber-to-network attribution is non-trivial.** Determining which subscribers were served by which cell during which interval requires session-level correlation that is itself expensive. Approximations introduce error that must be represented in confidence rather than hidden.

**Privacy constraints on network data are strict.** Communications metadata is specially protected in most jurisdictions. Correlating location-derived data with usage and commercial behaviour engages telecommunications-specific privacy law in addition to general data protection. Purpose binding must reflect these constraints, and several commercially attractive correlations will be prohibited.

**Organizational silos are engineering cultures, not just data silos.** Radio, transport, core, and IT are distinct engineering disciplines with distinct vocabularies, tools, and professional identities. Cross-domain correlation requires a shared semantic layer that no single discipline owns — which is an organizational challenge at least as significant as the technical one, and one the framework's governance model ([Chapter 25](../part-3/25-governance.md)) addresses only partially.

---

{% hint style="success" %}
## Key Takeaways

1. **Telecommunications generates more operational data than almost any industry and correlates less of it**, because domains are siloed by engineering discipline rather than merely by system.
2. **The four-link chain from field operation to silent disengagement is the scenario's central value** — it converts an engineering event into a quantified commercial consequence no single team could compute.
3. **The complaint-driven model systematically under-prioritizes the customers most likely to leave**, because willingness to complain correlates with engagement and engagement correlates with retention.
4. **Detecting silent disengagement requires a negative relationship** — degradation and usage change with an absence of contact — unavailable from any single source.
5. **Distinguishing impactful from ignorable degradation reprioritizes field effort toward consequence rather than alarm**, and is structurally the same problem as security alert fatigue.
6. **Telemetry aggregation design is a correlation design decision**, since aggregation must preserve exactly the features correlation requires.
7. **Communications metadata attracts sector-specific privacy protection** beyond general data protection, and several commercially attractive correlations will be prohibited.
8. **Engineering-discipline silos are an organizational challenge the framework addresses only partially**, and one that will determine adoption success more than the technology will.
{% endhint %}

---

**Next:** [36A. Insurance, Logistics, Energy and Aviation →](36a-additional-sectors.md)
