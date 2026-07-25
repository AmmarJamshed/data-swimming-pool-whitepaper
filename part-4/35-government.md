# 35. Government Use Case

---

{% hint style="danger" %}
**Illustrative scenario.** Synthetic and constructed. All figures are reasoned estimates, not measurements. This chapter is not legal or policy advice.
{% endhint %}

## 35.1 Scenario Context

**"Department of Public Services"** is a constructed national government department administering benefits, employment support, and pension services, interacting with tax, health, housing, and local authorities, and serving 11 million citizens through digital, telephone, and in-person channels.

**The problem it cannot solve — stated carefully.** Citizens experience government as a single entity and are administered by many. A person who has recently become unemployed, has a housing arrears notice, has missed two healthcare appointments, and has a pending benefit claim held for verification is, from the citizen's perspective, having one crisis. From the state's perspective they are four unconnected cases in four systems, each progressing at its own pace, none aware of the others.

The correlation opportunity is real. So is the correlation danger, and this chapter treats them with equal weight.

## 35.2 The Two Faces of Government Correlation

{% hint style="danger" %}
**A framing this chapter insists upon.**

The same technical capability supports two profoundly different applications:

**Service integration** — identifying that a citizen is experiencing compound difficulty and proactively simplifying their interaction with the state. This is the correlation working *for* the citizen.

**Population monitoring** — identifying and scoring citizens across administrative datasets for risk, eligibility challenge, or enforcement targeting. This is the correlation working *on* the citizen.

They are technically near-identical and ethically opposite. An architecture that enables the first enables the second, and the only durable distinction is governance that is externally enforced, publicly transparent, and politically accountable — not internal policy.

The author's position is that government deployments of correlation architecture require **statutory authorization, independent oversight, published scope registers, and enforceable prohibition of secondary use** as preconditions, not as subsequent additions.
{% endhint %}

## 35.3 Constrained Correlation Architecture

```mermaid
flowchart TB
    subgraph SRC["Departmental Sources — separate legal bases"]
        direction LR
        S1["Benefits administration"]
        S2["Employment services"]
        S3["Pension records"]
        S4["Contact channels<br/><i>digital, phone, in-person</i>"]
        S5["Case management"]
        S6["Correspondence"]
    end

    subgraph EXT["Cross-Departmental — statutory gateways only"]
        direction LR
        E1["Tax authority<br/><i>gateway: income verification</i>"]
        E2["Local authority<br/><i>gateway: housing support</i>"]
        E3["Health liaison<br/><i>gateway: capability assessment</i>"]
    end

    subgraph CTRL["Statutory Control Layer"]
        direction TB
        G1["<b>Published scope register</b><br/>every correlation scope is<br/>publicly documented"]
        G2["<b>Statutory purpose gate</b><br/>correlation permitted only for<br/>purposes named in legislation"]
        G3["<b>Prohibited-purpose list</b><br/>enumerated purposes for which<br/>correlation MUST NOT occur"]
        G4["<b>Independent oversight</b><br/>external body reviews scopes,<br/>audits outcomes, publishes findings"]
        G5["<b>Citizen transparency</b><br/>subject may see which correlations<br/>concern them and contest them"]
    end

    subgraph SCOPES["Permitted Scopes — illustrative"]
        direction TB
        SC1["<b>svc.compound_need.v2</b> — L2<br/>M2·negative<br/>Identify citizens with multiple<br/>concurrent open interactions<br/><i>purpose: service simplification</i>"]
        SC2["<b>svc.process_failure.v2</b> — L3<br/>M1·negative<br/>Identify cases stalled by<br/>administrative failure, not<br/>citizen action<br/><i>purpose: service quality</i>"]
        SC3["<b>svc.access_barrier.v1</b> — L1<br/>M2·M5 · aggregate<br/>Which cohorts experience<br/>disproportionate friction?<br/><i>purpose: policy evaluation</i>"]
        SC4["<b>ops.demand_forecast.v3</b> — L3<br/>M1·M5 · aggregate<br/>Anticipate channel and<br/>caseload demand<br/><i>purpose: resource planning</i>"]
    end

    subgraph PROHIB["Explicitly Prohibited"]
        direction TB
        P1["✘ Correlation for enforcement<br/>targeting without judicial basis"]
        P2["✘ Automated benefit determination<br/>or sanction"]
        P3["✘ Correlation with commercial data"]
        P4["✘ Any purpose not in the<br/>published register"]
    end

    SRC --> CTRL
    EXT --> CTRL
    CTRL --> SCOPES
    PROHIB -.enforced by.-> G2 & G3

    classDef src fill:#1b2f3d,stroke:#5b8fb0,color:#e6f2fa
    classDef ctrl fill:#3a2540,stroke:#a878c0,stroke-width:2px,color:#f6eaff
    classDef sc fill:#0a5570,stroke:#3fd0f0,color:#ffffff
    classDef proh fill:#4a2020,stroke:#d07070,stroke-width:2px,color:#ffeaea
    class SRC,S1,S2,S3,S4,S5,S6,EXT,E1,E2,E3 src
    class CTRL,G1,G2,G3,G4,G5 ctrl
    class SCOPES,SC1,SC2,SC3,SC4 sc
    class PROHIB,P1,P2,P3,P4 proh
```

**Figure 49.** *Government inter-agency service correlation workflow (illustrative). The statutory control layer sits between sources and scopes, enforcing a published register, a statutory purpose gate, an enumerated prohibited-purpose list, independent oversight, and citizen transparency. No scope exceeds L3, and no scope makes eligibility determinations.*

## 35.4 The Most Valuable Scope Is a Negative One

`svc.process_failure.v2` deserves emphasis because it inverts the usual direction of government analytics.

Conventional administrative analytics examines citizen behaviour: who claims, who complies, who appeals. This scope examines **administrative behaviour**: which cases are stalled because a verification request was never sent, a document was received but not processed, a referral was made but not acknowledged, or a decision deadline passed without action.

These are negative relationships — expected administrative events that did not occur. They identify failures of the state rather than failures of the citizen, and they are, in the author's view, the single most defensible and most valuable application of correlation in government.

They also carry no meaningful privacy risk in the direction that matters: the subject of the finding is the administrative process, not the person.

{% hint style="info" %}
**A recommendation for public sector adoption.** An organization introducing correlation architecture in government should begin with scopes that examine institutional performance rather than citizen behaviour. This establishes the capability, demonstrates value, builds public confidence, and — importantly — establishes the governance machinery before any scope that examines individuals is proposed.
{% endhint %}

## 35.5 Automated Decision-Making Constraints

The framework's position for government is more restrictive than for commercial contexts:

| Decision type | Maximum autonomy | Rationale |
| --- | --- | --- |
| Eligibility determination | **L0** — prohibited | Legal effect on the individual; requires human determination |
| Sanction or penalty | **L0** — prohibited | Punitive; requires human determination and appeal rights |
| Enforcement targeting | **L0** — prohibited absent judicial basis | Disproportionate risk of discriminatory targeting |
| Case prioritization for human review | L2 | Human decides; must not systematically deprioritize protected groups |
| Proactive service offer | L2 | Benefits the citizen; still requires human judgement on appropriateness |
| Administrative process correction | L3 | Fixes a state failure; low citizen risk |
| Resource and capacity planning | L3 | Aggregate; no individual effect |
| Aggregate policy evaluation | L1 | Published; no individual effect |

**Table 71.** *Autonomy constraints for government decision types. Three categories are prohibited outright rather than capped, reflecting that automated adverse determinations about citizens are, in the author's assessment, illegitimate regardless of accuracy.*

## 35.6 Equity Auditing as a First-Class Requirement

Any government correlation system must be able to answer: **does this system treat comparable people comparably?**

The framework's requirements for government deployment:

- Every scope's outputs are analysed for **disparate impact** across protected characteristics, using aggregate analysis that does not itself require individual-level protected-characteristic data where avoidable.
- **Disparate impact findings are published**, not merely reported internally.
- A scope demonstrating unexplained disparate impact is **suspended pending investigation**, not merely flagged.
- **Independent oversight has access** to the analysis and the underlying methodology.

This is more demanding than commercial practice and appropriately so: the state's obligation to treat citizens equally is qualitatively different from a company's obligation to its customers.

## 35.7 What Makes This Hard

**Legal basis and statutory gateways.** Cross-departmental data sharing in most jurisdictions requires specific statutory authority for a specific purpose. The purpose intersection rule will block most cross-departmental correlation, which is correct. Enabling legitimate correlation requires legislation, not engineering.

**Historical data quality in legacy administration.** Government administrative data is frequently decades old, migrated multiple times, with inconsistent identity practices. Entity resolution across such data is difficult and error-prone, and the consequence of over-merging two citizens is severe — one person's record affecting another's entitlement.

**Public legitimacy is not a communications problem.** Public concern about government data correlation is substantively well-founded given historical precedent. It is not addressed by better explanation; it is addressed by genuine, enforceable, externally-verified constraint.

**Scope creep is the predictable failure.** A system built for service integration will be asked to support enforcement. The published register, the statutory purpose gate, and the prohibited-purpose list exist specifically to make this transition visible and difficult rather than gradual and administrative.

---

{% hint style="success" %}
## Key Takeaways

1. **Citizens experience government as one entity and are administered by many**, so compound difficulty is invisible to every individual system.
2. **The same capability supports service integration and population monitoring** — technically near-identical, ethically opposite — and only externally enforced governance durably distinguishes them.
3. **Statutory authorization, independent oversight, published scope registers, and enforceable secondary-use prohibition are preconditions**, not subsequent additions.
4. **The most defensible and valuable government scope examines administrative failure, not citizen behaviour**, identifying where the state failed to act rather than where the citizen did.
5. **Public sector adoption should begin with institutional-performance scopes**, establishing capability and governance machinery before any scope examining individuals is proposed.
6. **Three decision categories are prohibited outright** — eligibility determination, sanction, and enforcement targeting — because automated adverse determinations about citizens are illegitimate regardless of accuracy.
7. **Equity auditing is a first-class requirement** with published disparate-impact findings and automatic suspension of scopes showing unexplained disparity.
8. **Scope creep toward enforcement is the predictable failure**, and the control architecture exists specifically to make that transition visible and difficult.
{% endhint %}

---

**Next:** [36. Telecommunications Use Case →](36-telecommunications.md)
