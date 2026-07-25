# 30. Healthcare Use Case

---

{% hint style="danger" %}
**Illustrative scenario.** Synthetic and constructed. No real institution, patient, incident, or dataset is described. This chapter is **not** clinical guidance and must not be used to inform patient care. All figures are reasoned estimates.
{% endhint %}

## 30.1 Scenario Context

**"Northfield Health System"** is a constructed integrated provider: three acute hospitals, 900 beds, an ambulatory network, a community care service, and a shared electronic health record. It monitors vital signs continuously in critical care and at four-hourly intervals on general wards, runs a standard early warning score, and operates separate systems for laboratory results, pharmacy, bed management, staffing, and equipment.

**The problem it cannot solve.** Clinical deterioration is multi-factorial and frequently visible in weak signals across systems hours before it becomes visible in any single one. A patient's respiratory rate drifts upward within normal range. Their most recent lab shows a modest rise in inflammatory markers. A prescribed antibiotic was administered ninety minutes late. Their assigned nurse is covering an unusually high patient load. Their room is at the end of a corridor with lower observation frequency.

No single signal triggers an alert. Each is within tolerance. The conjunction is a recognizable risk profile that experienced clinicians identify intuitively — and that no system computes.

Simultaneously, the early warning score generates a high volume of alerts that clinicians have learned to discount, because single-parameter thresholds fire frequently on patients who are not deteriorating.

## 30.2 Correlation Architecture

```mermaid
flowchart TB
    subgraph SRC["Data Sources"]
        direction TB
        S1["Bedside monitors<br/><i>stream · HR, RR, SpO₂, BP, temp</i>"]
        S2["EHR<br/><i>CDC · orders, notes, diagnoses</i>"]
        S3["Laboratory<br/><i>stream · results as resulted</i>"]
        S4["Pharmacy / eMAR<br/><i>stream · prescribed vs. administered</i>"]
        S5["Bed & flow management<br/><i>stream · location, transfers</i>"]
        S6["Staffing / rostering<br/><i>batch + stream · ratios, skill mix</i>"]
        S7["Clinical documentation<br/><i>stream · nursing notes, NLP</i>"]
        S8["Biomedical devices<br/><i>stream · pumps, ventilators</i>"]
        S9["Imaging<br/><i>stream · study completion, reports</i>"]
    end

    subgraph POOL["Data Swimming Pool"]
        direction TB
        ING["Ingestion<br/><i>resolve to PATIENT + ENCOUNTER<br/>clock quality critical</i>"]
        subgraph SCOPES["Correlation Scopes"]
            direction LR
            SC1["<b>clin.deterioration.v5</b><br/>M1·M2·M5<br/>window 12 h"]
            SC2["<b>clin.sepsis.v3</b><br/>M1·M2·M5<br/>window 6 h"]
            SC3["<b>safety.med_admin.v2</b><br/>M1·M2·<b>negative</b><br/>window per drug"]
            SC4["<b>ops.capacity_risk.v2</b><br/>M1·M5<br/>window 24 h"]
            SC5["<b>qual.readmission.v3</b><br/>M2·M4·M5<br/>window 30 d · batch"]
        end
        KG[("Knowledge Graph<br/>patients · encounters · staff<br/>locations · devices · pathways")]
        AIE["AI Insight Engine"]
        AC["Autonomy Controller<br/><i>capped at L3</i>"]
    end

    subgraph CONS["Consumers"]
        direction TB
        C1["Bedside clinicians<br/><i>L2 — recommend</i>"]
        C2["Outreach / rapid response<br/><i>L2 — prioritized review</i>"]
        C3["Pharmacy<br/><i>L3 — staged intervention</i>"]
        C4["Bed management<br/><i>L3 — staged reallocation</i>"]
        C5["Quality & safety<br/><i>L1 — retrospective</i>"]
    end

    SRC --> ING --> SCOPES --> KG --> AIE --> AC --> CONS

    classDef src fill:#1b2f3d,stroke:#5b8fb0,color:#e6f2fa
    classDef pool fill:#0a5570,stroke:#3fd0f0,stroke-width:2px,color:#ffffff
    classDef cons fill:#3d3313,stroke:#d4a636,color:#fff8e6
    class SRC,S1,S2,S3,S4,S5,S6,S7,S8,S9 src
    class POOL,ING,SCOPES,SC1,SC2,SC3,SC4,SC5,KG,AIE,AC pool
    class CONS,C1,C2,C3,C4,C5 cons
```

**Figure 43.** *Healthcare correlation architecture (illustrative). Autonomy is capped at L3 across the entire deployment — no clinical action is taken without human confirmation, irrespective of confidence. This is a deliberate scenario-level constraint reflecting that clinical actions are rarely reversible in the sense [Chapter 20](../part-2/20-autonomous-decision-support.md) requires.*

## 30.3 Deterioration Correlation Flow

```mermaid
flowchart TB
    subgraph WEAK["Individually Sub-Threshold Signals — T-6h to T-0"]
        direction TB
        W1["Respiratory rate<br/>18 → 21 over 5h<br/><i>within normal range</i>"]
        W2["Heart rate<br/>+9 bpm trend<br/><i>within normal range</i>"]
        W3["Lactate 1.9 mmol/L<br/><i>upper normal</i>"]
        W4["WBC rising, still normal<br/><i>within range</i>"]
        W5["Antibiotic dose<br/>administered +94 min late<br/><i>no alert generated</i>"]
        W6["Nurse:patient ratio 1:8<br/><i>above target, not exceptional</i>"]
        W7["Nursing note: 'seems<br/>more tired than earlier'<br/><i>free text</i>"]
        W8["Two ward transfers<br/>in 18h<br/><i>routine</i>"]
    end

    subgraph CORR["Correlation Evaluation"]
        direction TB
        M1E["<b>M1 Temporal</b><br/>convergent trajectories<br/>across 4 parameters<br/>score 0.71"]
        M2E["<b>M2 Entity</b><br/>all concern PATIENT-4471<br/>ENCOUNTER-88213<br/>score 0.99"]
        M5E["<b>M5 Behavioural</b><br/>deviation from this patient's<br/>own 48h baseline AND<br/>from matched cohort<br/>score 0.78"]
        M4E["<b>M4 Semantic</b><br/>nursing note aligns with<br/>deterioration vocabulary<br/>score 0.64"]
        NEG["<b>Negative relationship</b><br/>EXPECTED_ABSENT:<br/>no escalation documented<br/>despite trend<br/>score 0.88"]
    end

    subgraph GUARD["Absence–Degradation Guard"]
        G1{"Are eMAR and<br/>monitoring sources<br/>healthy?"}
        G2["✓ Both healthy —<br/>absence is genuine"]
        G3["✗ Source degraded —<br/>suppress negative relationship,<br/>emit infrastructure alert"]
        G1 -->|yes| G2
        G1 -->|no| G3
    end

    FUSE["<b>Fused, calibrated: 0.82</b><br/>CLINICAL_DETERIORATION_TRAJECTORY<br/>predicted escalation window: 3–7 h"]

    INS["<b>Insight I-7712</b> — L2<br/>'Patient meets multi-factor<br/>deterioration profile'<br/>Evidence: 8 signals, 5 correlations<br/><b>Contributing modifiable factors:</b><br/>• delayed antibiotic administration<br/>• staffing ratio on this bay<br/><b>Alternative considered:</b><br/>post-operative normal variation (0.19)"]

    ACT["Outreach team receives<br/><b>prioritized</b> review request<br/>with evidence and<br/>suggested interventions"]

    WEAK --> CORR --> GUARD
    G2 --> FUSE --> INS --> ACT

    classDef weak fill:#2a3340,stroke:#6b7a8c,color:#dbe4ee
    classDef corr fill:#0a5570,stroke:#3fd0f0,stroke-width:2px,color:#ffffff
    classDef guard fill:#3a2540,stroke:#a878c0,stroke-width:2px,color:#f6eaff
    classDef ins fill:#3d3313,stroke:#d4a636,stroke-width:2px,color:#fff8e6
    class WEAK,W1,W2,W3,W4,W5,W6,W7,W8 weak
    class CORR,M1E,M2E,M5E,M4E,NEG corr
    class GUARD,G1,G2,G3 guard
    class FUSE,INS,ACT ins
```

**Figure 44.** *Healthcare deterioration correlation workflow (illustrative). Eight individually sub-threshold signals produce a correlation of 0.82. Two features are architecturally significant: the negative relationship (expected escalation absent) contributes substantially, and the absence–degradation guard prevents a monitoring outage from generating mass false deterioration alerts — the failure mode described in [Chapter 21](../part-2/21-alert-generation.md) that would be catastrophic in this setting.*

## 30.4 Why Modifiable Factors Matter

The Insight Object in Figure 44 distinguishes **contributing modifiable factors** from the deterioration signal itself. This is a design choice with substantial clinical consequence.

A conventional deterioration score tells a clinician *this patient is at risk*. That is useful but incomplete. The correlation substrate can also indicate *which contributing factors are within the organization's control*: the antibiotic was late, the staffing ratio on this bay is elevated, the patient was transferred twice.

These are actionable in a way the vital-sign trend is not. The trend is a consequence; the modifiable factors are levers. Surfacing them converts a prediction into an intervention plan — and it is only possible because the correlation spans clinical, pharmacy, and operational domains that conventional early warning systems do not connect.

## 30.5 Correlation Scopes

| Scope | Purpose | Modalities | Window | Autonomy | Special considerations |
| --- | --- | --- | --- | --- | --- |
| `clin.deterioration.v5` | Multi-factor deterioration risk | M1, M2, M5, M4 | 12 h | L2 | Cohort baselines must be demographically stratified |
| `clin.sepsis.v3` | Sepsis pathway trigger | M1, M2, M5 | 6 h | L2 | High recall priority; precision trade-off accepted |
| `safety.med_admin.v2` | Prescribed-not-administered detection | M1, M2, negative | Per-drug therapeutic window | L3 | **Absolutely requires source health gating** |
| `ops.capacity_risk.v2` | Staffing and flow risk to patient safety | M1, M5 | 24 h | L3 | Correlating staffing with outcomes is industrially sensitive |
| `qual.readmission.v3` | Readmission risk with modifiable factors | M2, M4, M5 | 30 d, batch | L1 | Must not influence admission or discharge decisions |

**Table 65.** *Healthcare correlation scopes (illustrative). `safety.med_admin.v2` is the scope most dependent on the absence–degradation guard: an eMAR outage without gating would report that every scheduled medication in the hospital was not administered.*

{% hint style="danger" %}
**The scenario's most dangerous failure mode.** In a 900-bed hospital, an eMAR integration failure lasting one hour would, without source-health gating, generate an EXPECTED_ABSENT correlation for every medication scheduled in that hour — plausibly several thousand critical safety alerts, all false, delivered to clinical staff who cannot distinguish them from genuine ones.

This is not a hypothetical risk. It is the predictable consequence of implementing negative relationship detection without the guard specified in [Chapter 19](../part-2/19-event-relationships.md), and it would justifiably end a clinical deployment.
{% endhint %}

## 30.6 Governance and Privacy Constraints

**Autonomy is capped at L3 system-wide.** No clinical action executes without human confirmation. This reflects that clinical interventions are rarely reversible in the required sense: an administered drug cannot be un-administered, a transfer cannot be un-transferred, and a family conversation cannot be un-had.

**Purpose binding is strict.** Correlations derived for direct care are tagged `direct-care` only. Their use for resource allocation, insurance, employment, or research requires separate lawful basis and, in most jurisdictions, separate consent or ethical approval. The purpose intersection rule ([Chapter 24](../part-3/24-privacy.md)) enforces this.

**Staffing correlation is industrially sensitive.** `ops.capacity_risk.v2` correlates staffing levels with patient outcomes. This is clinically valuable and organizationally contentious. The framework's position: the scope should exist, its outputs should be governed as safety information rather than performance management data, and it should be explicitly excluded from individual staff evaluation — with that exclusion enforced by purpose binding rather than by policy statement.

**Explainability is a clinical requirement, not merely a regulatory one.** A clinician will not act on a score they cannot interrogate. The evidence chain is what makes the insight clinically usable, and its absence would render the system ignorable regardless of accuracy.

## 30.7 What Makes This Hard

**Clock quality across biomedical devices.** Device clocks drift, are set manually, and are frequently wrong by minutes to hours. Temporal correlation over device data without accurate clock quality metadata produces systematically false trajectories. The clock quality indicator specified in [Chapter 13](../part-2/13-ingestion-layer.md) is not optional here.

**Cohort baselines must be stratified carefully.** A behavioural baseline for deterioration must account for age, comorbidity, procedure type, and admission reason. An unstratified baseline will flag post-operative patients as deteriorating and miss deterioration in chronically unwell patients. Constructing appropriate cohorts is clinical work, not data science work.

**Alert precision requirements are severe.** Clinical alerting already suffers acute fatigue. A new system adding volume — even accurate volume — will be disabled. The framework's value here depends entirely on *replacing* single-parameter alerts rather than supplementing them, and on demonstrating a reduction in total alert volume from day one.

**Ground truth is delayed and ambiguous.** Confirming whether a deterioration prediction was correct requires clinical adjudication, which is slow and inter-rater variable. Calibration (Principle 6) is therefore harder here than in domains with crisp outcomes, and confidence scores should be presented with appropriate humility about their calibration quality.

---

{% hint style="success" %}
## Key Takeaways

1. **Clinical deterioration is visible in weak cross-domain signals hours before any single system detects it**, and the conjunction is what experienced clinicians recognize intuitively but no system computes.
2. **Surfacing contributing modifiable factors converts a prediction into an intervention plan**, and is only possible because correlation spans clinical, pharmacy, and operational domains.
3. **Negative relationships contribute substantially** — the escalation that should have been documented and was not is significant evidence.
4. **The absence–degradation guard is the scenario's most critical control.** An eMAR outage without it would generate thousands of false critical safety alerts and would justifiably end the deployment.
5. **Autonomy is capped at L3 system-wide** because clinical actions are rarely reversible in the required sense.
6. **Staffing–outcome correlation should exist but be purpose-bound to safety**, excluded from individual performance management by enforcement rather than by policy statement.
7. **Device clock quality is a first-order concern**, since biomedical device clocks drift substantially and temporal correlation over them is otherwise systematically wrong.
8. **The framework must reduce total alert volume from day one**, not supplement existing alerts, or clinical staff will disable it regardless of accuracy.
{% endhint %}

---

**Next:** [31. Manufacturing Use Case →](31-manufacturing.md)
