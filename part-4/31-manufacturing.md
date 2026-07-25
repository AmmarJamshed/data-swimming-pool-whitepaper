# 31. Manufacturing Use Case

---

{% hint style="danger" %}
**Illustrative scenario.** Synthetic and constructed. All figures are reasoned estimates, not measurements.
{% endhint %}

## 31.1 Scenario Context

**"Halden Precision Components"** is a constructed tier-one automotive supplier: four plants, 61 CNC and injection-moulding lines, 14,000 sensor points, and a supplier base of 230 material vendors. It runs a modern MES, a condition-monitoring platform, an SPC quality system, and an ERP.

**The problem it cannot solve.** Defects and failures are almost never single-cause. A batch of out-of-tolerance parts traces to a combination of a marginally different resin lot, an ambient humidity excursion, a tool approaching its wear limit, and an operator new to that line. Each factor alone is within tolerance. The condition-monitoring system watches the tool. The SPC system watches the output. The ERP records the lot. Nobody correlates them until a customer rejects a shipment three weeks later — by which point 40,000 parts have been produced.

## 31.2 Correlation Architecture and Flow

```mermaid
flowchart TB
    subgraph SRC["Sources"]
        direction LR
        S1["Machine telemetry<br/><i>vibration, spindle load,<br/>temperature — 50 Hz</i>"]
        S2["MES<br/><i>work orders, routings,<br/>operator assignment</i>"]
        S3["SPC / metrology<br/><i>dimensional measurements</i>"]
        S4["Tool management<br/><i>tool life, changes, regrinds</i>"]
        S5["Environmental<br/><i>temp, humidity, particulates</i>"]
        S6["ERP / supply<br/><i>material lots, COAs, suppliers</i>"]
        S7["Maintenance<br/><i>work orders, interventions</i>"]
        S8["Customer quality<br/><i>returns, complaints, 8Ds</i>"]
    end

    subgraph SCOPES["Correlation Scopes"]
        direction TB
        SC1["<b>qual.multifactor_defect.v4</b><br/>M1·M2·M3·M5 · 14 d<br/>Which combination of<br/>conditions precedes<br/>out-of-tolerance output?"]
        SC2["<b>maint.failure_precursor.v3</b><br/>M1·M2·M5 · 30 d<br/>Which telemetry signatures<br/>precede unplanned stops?"]
        SC3["<b>supply.lot_impact.v2</b><br/>M2·M3 · 90 d · batch<br/>Which material lots<br/>correlate with downstream<br/>quality deviation?"]
        SC4["<b>ops.changeover_risk.v2</b><br/>M1·M5 · 7 d<br/>Which changeover conditions<br/>correlate with startup scrap?"]
    end

    subgraph FIND["Illustrative Correlation"]
        direction TB
        F1["<b>C-22841</b> confidence 0.86<br/>MULTIFACTOR_DEFECT_PRECURSOR<br/><br/><b>Conjunction:</b><br/>• resin lot RL-8823 (viscosity at<br/>&nbsp;&nbsp;upper spec, within tolerance)<br/>• ambient humidity > 62% RH<br/>&nbsp;&nbsp;for > 4h<br/>• tool T-441 at 84% of rated life<br/>• operator with < 20h on this line<br/><br/><b>Predicted:</b> dimensional drift on<br/>feature D within 6–10 h<br/><b>Modality support:</b> M1 0.62 ·<br/>M2 0.94 · M3 0.58 · M5 0.79<br/><b>Historical precision:</b> 0.86 (n=41)"]
    end

    subgraph ACT["Actions by Autonomy Level"]
        direction TB
        A1["<b>L4</b> — increase metrology<br/>sampling on this line<br/><i>fully reversible</i>"]
        A2["<b>L3</b> — stage tool change<br/>ahead of schedule<br/><i>confirm with production</i>"]
        A3["<b>L3</b> — stage dehumidification<br/>setpoint change"]
        A4["<b>L2</b> — recommend operator<br/>pairing with experienced staff"]
        A5["<b>L2</b> — recommend supplier<br/>engagement on lot variance"]
        A6["<b>L1</b> — quarantine advisory<br/>for parts already produced"]
    end

    SRC --> SCOPES --> FIND --> ACT

    classDef src fill:#1b2f3d,stroke:#5b8fb0,color:#e6f2fa
    classDef sc fill:#0a5570,stroke:#3fd0f0,stroke-width:2px,color:#ffffff
    classDef find fill:#3d3313,stroke:#d4a636,stroke-width:2px,color:#fff8e6
    classDef act fill:#183028,stroke:#4caf7d,color:#e6fff2
    class SRC,S1,S2,S3,S4,S5,S6,S7,S8 src
    class SCOPES,SC1,SC2,SC3,SC4 sc
    class FIND,F1 find
    class ACT,A1,A2,A3,A4,A5,A6 act
```

**Figure 45.** *Manufacturing predictive quality and maintenance workflow (illustrative). A single correlation identifies a four-factor conjunction, none of whose components violates a tolerance individually. Six actions follow at four different autonomy levels — with increased metrology sampling at L4 because it is genuinely reversible and costs only measurement time.*

## 31.3 Why Manufacturing Suits This Architecture

Manufacturing is, in the author's assessment, among the strongest candidate domains for the framework, for four reasons:

**Ground truth is crisp and fast.** A part is in tolerance or it is not. Metrology provides objective, timely outcome labels, which makes confidence calibration (Principle 6) genuinely tractable — unlike domains where outcomes are ambiguous or delayed by months.

**Causality is more accessible than usual.** Physical processes obey physical laws. A causal hypothesis linking humidity to resin viscosity to dimensional drift can be tested experimentally, and frequently is. M3 causal correlation is more defensible here than in social or commercial domains.

**Actions are often genuinely reversible.** Increasing sampling frequency, adjusting a setpoint within a permitted range, or scheduling an early tool change are all reversible in the strict sense of [Chapter 20](../part-2/20-autonomous-decision-support.md) — no external party retains a record and no downstream process behaves differently.

**The window of actionability is favourable.** Hours to days, rather than the seconds of fraud or the minutes of clinical deterioration. This tolerates batch-substrate correlation for many scopes and reduces engineering demand substantially.

{% hint style="info" %}
**A recommendation.** Organizations seeking to validate the framework empirically should consider manufacturing as the pilot domain, precisely because crisp ground truth makes the central claim — that multi-modal correlation maintains useful precision across domains — directly measurable.
{% endhint %}

## 31.4 Supply Chain Correlation

`supply.lot_impact.v2` deserves specific attention because it crosses an organizational boundary.

The scope correlates incoming material lot characteristics — from certificates of analysis, supplier telemetry where shared, and inbound inspection — with downstream quality outcomes measured weeks later and frequently at a different plant. This is a wide-window, cross-facility, batch-substrate correlation, and it produces findings that are commercially significant: *this supplier's lots within this parameter band correlate with elevated defect rates in this process*.

**Two cautions:**

Findings of this kind have contractual and commercial consequence, and correlation is not causation. A supplier lot correlating with defects may reflect a genuine material issue, or a confound — perhaps that supplier's lots are preferentially routed to an older line. Before any commercial action, the M3 causal hypothesis requires confirmation through designed experiment, and the framework's role is to direct that experiment rather than to substitute for it.

Sharing correlation findings with suppliers requires care about what is disclosed. A finding may reveal the organization's own process capability, which is commercially sensitive in the opposite direction.

## 31.5 Illustrative Outcomes

| Measure | Plausible direction | Reasoning |
| --- | --- | --- |
| Multi-factor defect detection lead time | Hours rather than weeks | Continuous conjunction evaluation vs. customer return |
| Scrap volume from undetected drift | Reduction | Earlier detection bounds affected production |
| Unplanned downtime | Reduction | Precursor signatures detected across telemetry and maintenance history |
| Maintenance intervention precision | Improvement | Multi-modal support replaces single-parameter thresholds |
| Supplier quality issues attributed correctly | Improvement | Cross-facility lot correlation over long windows |
| Engineering investigation time per issue | Substantial reduction | Evidence pre-assembled; conjunctions identified |
| False alarm rate on condition monitoring | Reduction | Correlation replaces independent threshold alerts |

**Table 66.** *Illustrative outcome directions for manufacturing. All are directional estimates, not measurements.*

## 31.6 What Makes This Hard

**Sensor data volume.** Fourteen thousand points at 50 Hz is 700,000 events per second before any filtering — beyond the comfortable range in [Table 55](../part-3/26-scalability.md). Edge aggregation is mandatory: raw telemetry is summarized at the gateway into features (rolling statistics, spectral bands, threshold crossings) and only features enter the pool. This is a design requirement, not an optimization.

**Time synchronization on the plant floor.** Industrial controllers frequently lack reliable time synchronization. Correlating a vibration event with a metrology result requires both timestamps to be trustworthy to within the correlation window. Deploying PTP or equivalent is a prerequisite, and the clock quality indicator must reflect actual synchronization status.

**Operator attribution is sensitive.** Correlating operator assignment with defect rates is analytically valid and industrially fraught. The framework's position mirrors the healthcare staffing case: the correlation is legitimate as a *training and support* signal, must be purpose-bound to exclude individual performance management, and the exclusion must be enforced computationally.

**Confounded process changes.** Manufacturing processes change continuously — new tooling, revised parameters, different materials. A behavioural baseline established before a process change is invalid after it. Baselines must be versioned against process configuration, and process change must trigger baseline reset rather than being absorbed as drift.

---

{% hint style="success" %}
## Key Takeaways

1. **Manufacturing defects are conjunctions of individually in-tolerance conditions**, which is precisely the pattern no single monitoring system detects.
2. **Manufacturing is the strongest candidate pilot domain** because ground truth is crisp and fast, causality is experimentally testable, many actions are genuinely reversible, and actionability windows are favourable.
3. **Increased metrology sampling is a rare genuine L4 action** — fully reversible, low cost, and directly risk-reducing.
4. **Cross-facility supplier lot correlation produces commercially consequential findings** that must be confirmed by designed experiment before action, with the framework directing the experiment rather than substituting for it.
5. **Edge aggregation is mandatory, not optional**, at plant sensor volumes; only derived features should enter the pool.
6. **Plant-floor time synchronization is a prerequisite**, and clock quality metadata must reflect actual synchronization status.
7. **Operator attribution must be purpose-bound to training and support**, with exclusion from performance management enforced computationally.
8. **Baselines must be versioned against process configuration**, since process change invalidates them and must trigger reset rather than being absorbed as drift.
{% endhint %}

---

**Next:** [32. Retail Use Case →](32-retail.md)
