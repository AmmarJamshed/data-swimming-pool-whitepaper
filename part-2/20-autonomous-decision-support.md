# 20. Autonomous Decision Support

---

## 20.1 Autonomy as a Graduated Property

The prevailing framing of enterprise AI autonomy is binary: a system is either human-in-the-loop or automated. This framing is unhelpful, because it forces a single decision across a heterogeneous population of actions with radically different consequence profiles.

The same platform may reasonably suppress a duplicate alert without asking anyone — fully reversible, trivial consequence, thousands of times per day — and must not autonomously decline a credit application — materially irreversible, regulated, consequential to a person's life. A system-level autonomy setting forces a choice between paralysis and recklessness.

{% hint style="info" %}
### Definition — The Autonomy Ladder

The **Autonomy Ladder** is a six-level model in which machine decision authority is assigned **per action class**, with each level specifying its reversibility requirement, evidentiary standard, human control point, escalation path, and audit obligation. Autonomy level is runtime-adjustable, independently auditable, and automatically demoted on performance degradation.
{% endhint %}

## 20.2 The Six Levels

```mermaid
flowchart TB
    L0["<b>L0 — OBSERVE</b><br/>System detects and records.<br/>No output to any actor.<br/><i>Used for: shadow evaluation of new scopes</i>"]
    L1["<b>L1 — INFORM</b><br/>System surfaces information passively.<br/>Human seeks it out.<br/><i>Used for: dashboards, context panels</i>"]
    L2["<b>L2 — RECOMMEND</b><br/>System proactively proposes an action<br/>with evidence. Human decides and executes.<br/><i>Used for: next-best-action, triage suggestions</i>"]
    L3["<b>L3 — ACT WITH CONFIRMATION</b><br/>System prepares and stages the action.<br/>Human approves; system executes.<br/><i>Used for: transaction holds, ticket routing</i>"]
    L4["<b>L4 — ACT WITH OVERSIGHT</b><br/>System executes immediately.<br/>Human notified, can reverse within a<br/>defined window.<br/><i>Used for: reversible protective actions</i>"]
    L5["<b>L5 — ACT AUTONOMOUSLY</b><br/>System executes and reports.<br/>Human reviews in aggregate, periodically.<br/><i>Used for: high-volume reversible operations</i>"]

    L0 --> L1 --> L2 --> L3 --> L4 --> L5

    subgraph GATE["Promotion Requirements — cumulative"]
        direction TB
        G1["L1: scope declared + owned"]
        G2["L2: evidence chain complete (P7)"]
        G3["L3: calibrated confidence +<br/>precision ≥ declared threshold,<br/>measured ≥ 90 days"]
        G4["L4: <b>reversibility proven</b> +<br/>reversal window defined +<br/>precision ≥ 0.95 +<br/>independent validation"]
        G5["L5: L4 sustained ≥ 180 days +<br/>zero material incidents +<br/>risk function approval +<br/>documented rollback drill"]
    end

    subgraph LIMITS["Absolute Prohibitions"]
        direction TB
        X1["No L4+ for irreversible actions"]
        X2["No L4+ on provisional correlations"]
        X3["No L4+ on uncalibrated confidence"]
        X4["No L3+ for generative-model-originated<br/>actions of material consequence"]
        X5["No L3+ on stale or unreviewed scopes"]
        X6["No L4+ where regulation requires<br/>human determination"]
    end

    GATE -.gates.- L1 & L2 & L3 & L4 & L5
    LIMITS -.caps.- L3 & L4 & L5

    classDef low fill:#183028,stroke:#4caf7d,color:#e6fff2
    classDef mid fill:#3d3313,stroke:#d4a636,color:#fff8e6
    classDef high fill:#4a2020,stroke:#d07070,stroke-width:2px,color:#ffeaea
    classDef gate fill:#14415c,stroke:#4fb8d8,color:#eaf6fb
    classDef lim fill:#3a2540,stroke:#a878c0,stroke-width:2px,color:#f6eaff
    class L0,L1,L2 low
    class L3 mid
    class L4,L5 high
    class GATE,G1,G2,G3,G4,G5 gate
    class LIMITS,X1,X2,X3,X4,X5,X6 lim
```

**Figure 30.** *The Autonomy Ladder. Six levels with cumulative promotion requirements and six absolute prohibitions. Promotion above L3 requires proven reversibility and sustained measured precision; promotion to L5 requires 180 days at L4 without material incident plus a documented rollback drill. Colour indicates increasing risk posture, not increasing desirability.*

## 20.3 Level Specifications

| Level | Human role | Reversibility requirement | Evidentiary standard | Escalation trigger | Audit obligation |
| --- | --- | --- | --- | --- | --- |
| **L0 Observe** | None | N/A — no action | None | N/A | Aggregate metrics only |
| **L1 Inform** | Seeks information | N/A — no action | Evidence chain available on request | N/A | Access log |
| **L2 Recommend** | Decides and executes | N/A — human acts | Evidence chain presented with recommendation | Human declines repeatedly → review scope | Recommendation + human decision recorded |
| **L3 Confirm** | Approves staged action | Action must be describable and its effects previewable | Calibrated confidence above declared threshold; complete evidence | Approval rate below 70% → automatic demotion | Full: staged action, evidence, approver, timestamp |
| **L4 Oversee** | Notified; may reverse | **Reversal must be technically demonstrated**, with a defined reversal window | Precision ≥ 0.95 sustained ≥ 90 days; independent validation | Any reversal → incident review; 3 reversals in window → demotion | Full: action, evidence, notification, reversal window, outcome |
| **L5 Autonomous** | Reviews in aggregate | Reversal demonstrated; rollback drill documented | L4 sustained ≥ 180 days, zero material incidents | Any material incident → immediate demotion to L2 | Full plus periodic aggregate review with named reviewer |

**Table 40.** *Autonomy Ladder level specifications. The L4 requirement that reversal be **technically demonstrated** rather than merely asserted is the most important control in the framework: an organization must show that it has actually reversed such an action successfully, in a test, before granting the level.*

## 20.4 Reversibility as the Governing Criterion

The framework's central claim about autonomy: **reversibility, not confidence, is the primary determinant of permissible autonomy level.**

A highly confident conclusion supporting an irreversible action warrants less autonomy than a moderately confident conclusion supporting a fully reversible one. This inverts the intuitive framing, and the inversion is deliberate.

```mermaid
quadrantChart
    title Autonomy Assignment by Reversibility and Confidence
    x-axis "Low Confidence" --> "High Confidence"
    y-axis "Irreversible" --> "Fully Reversible"
    quadrant-1 "L4–L5 permissible"
    quadrant-2 "L3–L4 permissible"
    quadrant-3 "L0–L1 only"
    quadrant-4 "L2–L3 maximum"
    "Suppress duplicate alert": [0.75, 0.95]
    "Route case to specialist team": [0.70, 0.88]
    "Enrich record with derived attribute": [0.80, 0.90]
    "Hold transaction pending review": [0.85, 0.72]
    "Trigger equipment inspection": [0.68, 0.80]
    "Adjust inventory reorder point": [0.62, 0.75]
    "Notify customer of suspected fraud": [0.80, 0.35]
    "Decline credit application": [0.88, 0.08]
    "Terminate service contract": [0.72, 0.10]
    "Escalate to law enforcement": [0.78, 0.05]
    "Propose causal explanation": [0.35, 0.60]
    "Flag entity for enhanced review": [0.45, 0.70]
```

**Figure 31.** *Autonomy assignment by reversibility and confidence. Actions in the upper region — reversible — may be granted high autonomy even at moderate confidence. Actions in the lower region — irreversible or materially consequential — are capped regardless of confidence. Positions are illustrative and organization-specific; the axes and the capping principle are the transferable content.*

{% hint style="warning" %}
**Reversibility is frequently overestimated.** An action is genuinely reversible only if reversing it restores the prior state *including all downstream effects*. Reversing a transaction hold restores the transaction, but does not un-notify the customer, un-trigger the partner system's risk flag, or un-record the event in a third party's file. Assessment of reversibility MUST consider the full effect graph, not only the primary action.

The framework's practical test: **an action is reversible if, after reversal, no external party retains a record of it having occurred, and no downstream process behaves differently than if it had not.** Very few actions genuinely pass this test, which is why L4 and L5 should be rare.
{% endhint %}

## 20.5 Decision Flow

```mermaid
sequenceDiagram
    autonumber
    participant I as Insight Object
    participant AC as Autonomy Controller
    participant RE as Rules Engine
    participant PE as Policy Engine
    participant RV as Reversibility Register
    participant EX as Execution
    participant H as Human
    participant OB as Outcome Capture

    I->>AC: insight, confidence 0.91,<br/>recommended action, proposed L4
    AC->>RE: evaluate guardrail + safety rules
    RE-->>AC: no prohibition
    AC->>PE: policy check — purpose, jurisdiction, subject rights
    PE-->>AC: permit
    AC->>RV: is this action class reversal-proven?
    RV-->>AC: yes — reversal window 30 min,<br/>last drill 2026-06-14
    AC->>AC: verify correlation status = CONFIRMED<br/>(not provisional)
    AC->>AC: verify scope precision ≥ 0.95<br/>over trailing 90d → 0.963 ✓
    AC->>AC: verify scope not stale → reviewed 2026-05-02 ✓

    alt all gates pass
        AC->>EX: execute at L4
        EX-->>AC: executed, reversal token issued
        AC->>H: notify — action taken,<br/>evidence, reverse-by 14:32
        AC->>OB: register outcome expectation
        alt human reverses within window
            H->>EX: reverse using token
            EX-->>OB: reversed
            OB->>AC: record reversal → incident review
            AC->>AC: 3rd reversal in window →<br/><b>demote action class to L3</b>
        else window elapses
            OB->>OB: await ground truth
            OB-->>AC: outcome confirmed correct
            AC->>AC: feed calibration (P10)
        end
    else any gate fails
        AC->>H: escalate at L2 — recommend only<br/>+ reason for downgrade
        AC->>OB: record downgrade event
    end
```

**Figure 32.** *Autonomy Controller decision flow for a proposed L4 action. Seven gates are evaluated before execution: safety rules, policy, reversal provenance, correlation confirmation status, scope precision, scope freshness, and reversibility register currency. Failure of any gate downgrades to L2 rather than blocking outright — the system still delivers value as a recommendation.*

The downgrade-rather-than-block behaviour is deliberate. A system that fails closed entirely when a gate fails delivers nothing; a system that degrades to recommendation still delivers the insight while withholding the authority.

## 20.6 Human Factors

Automation research consistently identifies failure modes that architecture must anticipate.

**Automation bias.** Humans approve machine recommendations at high rates, particularly under time pressure, and particularly when the machine is usually correct. An L3 "approval" gate degenerates into a rubber stamp unless designed against.

*Framework requirement:* L3 interfaces MUST present the evidence chain, not merely the recommendation, and MUST require the approver to interact with at least one evidence element before approving. Approval rate is monitored: a rate above 95% is treated as a signal that the gate is not functioning as a control and triggers review of whether L4 is more honest than a nominal L3.

**Skill degradation.** Operators who do not exercise a judgement lose the ability to exercise it. When the automation fails, the humans who must take over have atrophied.

*Framework requirement:* Periodic manual-mode operation for a sample of cases, and inclusion of deliberate hard cases in the human review queue rather than routing only ambiguous ones.

**Responsibility diffusion.** When a system recommends and a human approves, neither feels accountable for the outcome.

*Framework requirement:* Every action records a named accountable human, even at L4 and L5, where accountability attaches to the person who authorized the autonomy level for that action class rather than to an approver of the individual action.

**Alarm-driven tunnel vision.** Operators presented with a confident machine conclusion tend to stop looking for alternatives.

*Framework requirement:* Where the Correlation Engine identified competing explanations, the interface MUST present the top alternative alongside the primary conclusion, with its confidence. A single confident answer is more dangerous than two competing ones.

## 20.7 Failure Handling and Kill Switches

| Control | Scope | Activation | Effect |
| --- | --- | --- | --- |
| **Action-class kill switch** | One action class | Owner or on-call | All actions in class drop to L2 |
| **Scope kill switch** | One correlation scope | Scope owner, Governor, or on-call | Scope stops emitting; dependent actions drop to L0 |
| **Global autonomy freeze** | All action classes | Incident commander | Everything drops to L2; system remains informative |
| **Automatic demotion** | Per action class or scope | Precision breach, reversal threshold, staleness | One level down, owner notified |
| **Circuit breaker** | Per action class | Action failure rate above threshold | Suspend execution, continue recommending |

**Table 41.** *Autonomy failure controls. The global autonomy freeze deliberately drops to L2 rather than L0: during an incident, the organization still benefits from the system's analysis even while withdrawing its authority to act. Removing the analysis as well would degrade incident response at precisely the wrong moment.*

{% hint style="success" %}
### Design Principle — Degrade to Advisory, Not to Silence

When autonomy controls activate, the system MUST continue to inform and recommend. It MUST NOT go silent. Withdrawing decision authority and withdrawing decision support are different actions, and only the former is warranted by an autonomy failure.
{% endhint %}

---

{% hint style="success" %}
## Key Takeaways

1. **Autonomy is a per-action-class property, not a system setting.** A binary framing forces an unacceptable choice between paralysis and recklessness across a heterogeneous action population.
2. **Six levels run from Observe to Autonomous**, with cumulative promotion requirements and six absolute prohibitions that cap autonomy regardless of measured performance.
3. **Reversibility, not confidence, is the primary determinant of permissible autonomy.** A highly confident conclusion supporting an irreversible action warrants less autonomy than a moderate conclusion supporting a reversible one.
4. **Reversibility is frequently overestimated.** The practical test is that after reversal no external party retains a record and no downstream process behaves differently — a test very few actions pass, which is why L4 and L5 should be rare.
5. **L4 requires reversal to be technically demonstrated**, not asserted: the organization must show it has successfully reversed such an action in a drill.
6. **Seven gates precede an L4 action**, and gate failure downgrades to recommendation rather than blocking, preserving value while withholding authority.
7. **Automation bias is designed against**, requiring evidence interaction before approval and treating approval rates above 95% as evidence the gate is not functioning.
8. **Where competing explanations exist, the interface must show the alternative.** A single confident answer is more dangerous than two competing ones.
9. **Autonomy controls degrade to advisory, never to silence.** Withdrawing decision authority and withdrawing decision support are different actions.
{% endhint %}

---

**Next:** [21. Alert Generation →](21-alert-generation.md)
