# Appendix C — Canonical Event and Correlation Schemas

---

{% hint style="info" %}
Schemas are expressed in JSON Schema draft form for readability. Production deployment would use Avro or Protobuf with a schema registry. Field requirements follow RFC 2119 conventions. All example values are fictitious.
{% endhint %}

## C.1 Canonical Event

The unit of ingestion. Every event entering the pool conforms to this envelope regardless of source.

```json
{
  "$id": "https://dsp.example/schemas/canonical-event/v1.json",
  "title": "CanonicalEvent",
  "type": "object",
  "required": [
    "event_id", "event_type", "event_time", "ingest_time",
    "source", "entities", "classification", "payload"
  ],
  "properties": {
    "event_id":    { "type": "string", "format": "uuid" },
    "event_type":  { "type": "string", "pattern": "^[a-z0-9]+(\\.[a-z0-9_]+){2,}$",
                     "description": "domain.subdomain.action e.g. banking.card.authorization_declined" },
    "schema_version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },

    "event_time":  { "type": "string", "format": "date-time",
                     "description": "Occurrence time in the source domain. MUST be source-asserted." },
    "ingest_time": { "type": "string", "format": "date-time" },
    "event_time_confidence": { "type": "string", "enum": ["exact", "approximate", "inferred"] },

    "source": {
      "type": "object",
      "required": ["system_id", "domain", "contract_id", "contract_version"],
      "properties": {
        "system_id":        { "type": "string" },
        "domain":           { "type": "string" },
        "contract_id":      { "type": "string" },
        "contract_version": { "type": "string" },
        "capture_method":   { "type": "string", "enum": ["cdc", "api", "stream", "file", "webhook"] }
      }
    },

    "entities": {
      "type": "array",
      "minItems": 1,
      "description": "Resolved entity references. At least one MUST be present.",
      "items": {
        "type": "object",
        "required": ["role", "entity_type", "entity_key", "resolution"],
        "properties": {
          "role":        { "type": "string", "examples": ["subject", "counterparty", "operator", "asset"] },
          "entity_type": { "type": "string", "examples": ["customer", "patient", "device", "account"] },
          "entity_key":  { "type": "string", "description": "Platform-canonical key, not a source identifier" },
          "resolution": {
            "type": "object",
            "required": ["tier", "confidence"],
            "properties": {
              "tier":       { "type": "string", "enum": ["deterministic", "probabilistic", "graph", "unresolved"] },
              "confidence": { "type": "number", "minimum": 0, "maximum": 1 },
              "method_id":  { "type": "string" }
            }
          }
        }
      }
    },

    "classification": {
      "type": "object",
      "required": ["sensitivity", "permitted_purposes", "jurisdiction"],
      "properties": {
        "sensitivity":        { "type": "string",
                                "enum": ["public", "internal", "confidential", "restricted", "special_category"] },
        "special_categories": { "type": "array", "items": { "type": "string" } },
        "permitted_purposes": { "type": "array", "minItems": 1, "items": { "type": "string" },
                                "description": "Correlation purpose is the INTERSECTION across constituent events" },
        "jurisdiction":       { "type": "array", "items": { "type": "string" } },
        "retention_class":    { "type": "string" },
        "erasure_key":        { "type": "string", "description": "Enables erasure propagation" }
      }
    },

    "quality": {
      "type": "object",
      "properties": {
        "completeness":   { "type": "number", "minimum": 0, "maximum": 1 },
        "late_arrival":   { "type": "boolean" },
        "lateness_ms":    { "type": "integer", "minimum": 0 },
        "contract_status":{ "type": "string", "enum": ["valid", "degraded", "quarantined"] }
      }
    },

    "payload":  { "type": "object", "description": "Domain-specific body, validated against contract" },
    "lineage_ref": { "type": "string", "description": "Pointer into the lineage plane" }
  }
}
```

**Listing C-1.** *Canonical event schema. Three fields do the framework's distinctive work: `entities` with resolution confidence makes correlation possible; `classification.permitted_purposes` makes purpose intersection enforceable; and `classification.erasure_key` makes erasure propagation through derived correlations tractable.*

## C.2 Correlation

```json
{
  "$id": "https://dsp.example/schemas/correlation/v1.json",
  "title": "Correlation",
  "type": "object",
  "required": [
    "correlation_id", "scope_id", "correlation_type", "modality",
    "members", "confidence", "detected_at", "valid_until", "evidence"
  ],
  "properties": {
    "correlation_id":   { "type": "string", "format": "uuid" },
    "scope_id":         { "type": "string", "description": "The governed scope that authorized this correlation" },
    "scope_version":    { "type": "string" },

    "correlation_type": { "type": "string",
                          "enum": ["temporal_sequence", "temporal_coincidence",
                                   "shared_entity", "structural_path",
                                   "causal_hypothesis", "semantic_similarity",
                                   "behavioural_deviation", "negative_absence"] },
    "modality":         { "type": "array", "items": { "type": "string", "enum": ["M1","M2","M3","M4","M5","M6"] },
                          "description": "Multiple entries indicate multi-modal reinforcement" },
    "direction":        { "type": "string", "enum": ["directed", "undirected"] },

    "members": {
      "type": "array", "minItems": 1,
      "items": {
        "type": "object",
        "required": ["ref_type", "ref_id"],
        "properties": {
          "ref_type": { "type": "string", "enum": ["event", "entity", "correlation"] },
          "ref_id":   { "type": "string" },
          "role":     { "type": "string", "examples": ["antecedent", "consequent", "participant"] }
        }
      }
    },

    "confidence": {
      "type": "object",
      "required": ["value", "method", "calibrated"],
      "properties": {
        "value":       { "type": "number", "minimum": 0, "maximum": 1 },
        "ceiling":     { "type": "number", "description": "Type-specific cap, e.g. 0.70 for causal_hypothesis" },
        "method":      { "type": "string" },
        "calibrated":  { "type": "boolean" },
        "sample_size": { "type": "integer" },
        "decay_rate":  { "type": "number", "description": "Per-day confidence decay in absence of reinforcement" }
      }
    },

    "strength": { "type": "number", "description": "Effect size — distinct from confidence" },

    "temporal": {
      "type": "object",
      "properties": {
        "window_start": { "type": "string", "format": "date-time" },
        "window_end":   { "type": "string", "format": "date-time" },
        "lag_ms":       { "type": "integer" }
      }
    },

    "detected_at": { "type": "string", "format": "date-time" },
    "valid_until": { "type": "string", "format": "date-time",
                     "description": "Expiry is MANDATORY. Correlations do not persist indefinitely." },
    "status":      { "type": "string", "enum": ["candidate", "active", "decaying", "expired", "retracted"] },

    "derivation": {
      "type": "object",
      "properties": {
        "layer":         { "type": "string", "enum": ["streaming", "batch"] },
        "engine_version":{ "type": "string" },
        "superseded_by": { "type": "string", "description": "Set when batch reconciliation supersedes a streaming result" }
      }
    },

    "governance": {
      "type": "object",
      "required": ["permitted_purposes", "sensitivity"],
      "properties": {
        "permitted_purposes": { "type": "array", "items": { "type": "string" },
                                "description": "Intersection of member events' permitted purposes" },
        "sensitivity":        { "type": "string", "description": "MUST be >= max sensitivity of members" },
        "erasure_keys":       { "type": "array", "items": { "type": "string" } },
        "policy_decisions":   { "type": "array", "items": { "type": "string" } }
      }
    },

    "evidence": {
      "type": "object",
      "required": ["event_refs"],
      "properties": {
        "event_refs":       { "type": "array", "items": { "type": "string" } },
        "counter_evidence": { "type": "array", "items": { "type": "string" },
                              "description": "Observations inconsistent with the asserted relationship" },
        "alternatives":     { "type": "array", "items": { "type": "string" },
                              "description": "Competing correlations explaining the same observations" },
        "baseline_ref":     { "type": "string" }
      }
    }
  }
}
```

**Listing C-2.** *Correlation schema. Four elements distinguish it from a conventional join result: mandatory `valid_until`, a confidence `ceiling` that varies by type, `governance.permitted_purposes` computed as an intersection, and `evidence.counter_evidence` — the framework requires that disconfirming observations be recorded, not only supporting ones.*

## C.3 Insight Object

```json
{
  "$id": "https://dsp.example/schemas/insight/v1.json",
  "title": "InsightObject",
  "type": "object",
  "required": [
    "insight_id", "insight_type", "subject", "statement",
    "confidence", "evidence_chain", "autonomy", "generated_at", "expires_at"
  ],
  "properties": {
    "insight_id":   { "type": "string", "format": "uuid" },
    "insight_type": { "type": "string",
                      "enum": ["risk", "opportunity", "anomaly", "prediction",
                               "explanation", "recommendation", "absence"] },
    "subject": {
      "type": "object",
      "required": ["entity_type", "entity_key"],
      "properties": {
        "entity_type": { "type": "string" },
        "entity_key":  { "type": "string" },
        "scope":       { "type": "string", "enum": ["individual", "cohort", "aggregate"] }
      }
    },

    "statement":  { "type": "string", "description": "Natural-language finding. MUST be grounded in evidence_chain." },
    "rationale":  { "type": "string" },

    "confidence": {
      "type": "object",
      "required": ["value", "basis"],
      "properties": {
        "value":  { "type": "number", "minimum": 0, "maximum": 1 },
        "basis":  { "type": "string", "enum": ["calibrated", "heuristic", "model_output"] },
        "interval": { "type": "array", "items": { "type": "number" }, "minItems": 2, "maxItems": 2 }
      }
    },

    "evidence_chain": {
      "type": "object",
      "required": ["correlation_refs", "event_refs", "citation_status"],
      "properties": {
        "correlation_refs": { "type": "array", "items": { "type": "string" } },
        "event_refs":       { "type": "array", "items": { "type": "string" } },
        "model_refs":       { "type": "array", "items": { "type": "string" } },
        "rule_refs":        { "type": "array", "items": { "type": "string" } },
        "citation_status":  { "type": "string", "enum": ["validated", "partial", "failed"],
                              "description": "Insights with citation_status=failed MUST NOT be released" },
        "competing_hypotheses": { "type": "array", "items": { "type": "object" } }
      }
    },

    "recommended_action": {
      "type": "object",
      "properties": {
        "action_type":     { "type": "string" },
        "modifiable_factors": { "type": "array", "items": { "type": "string" },
                                "description": "Factors the recipient can actually change" },
        "reversibility":   { "type": "string", "enum": ["fully_reversible", "reversible_with_cost",
                                                        "partially_reversible", "irreversible"] },
        "blast_radius":    { "type": "integer" },
        "expected_effect": { "type": "string" }
      }
    },

    "autonomy": {
      "type": "object",
      "required": ["level", "authorized_by"],
      "properties": {
        "level":         { "type": "string", "enum": ["L0","L1","L2","L3","L4","L5"] },
        "authorized_by": { "type": "string" },
        "reversal_window_seconds": { "type": "integer" },
        "kill_switch_ref": { "type": "string" }
      }
    },

    "routing": {
      "type": "object",
      "properties": {
        "owner":     { "type": "string" },
        "incident_id": { "type": "string" },
        "severity":  { "type": "string", "enum": ["informational", "low", "medium", "high", "critical"] }
      }
    },

    "governance": {
      "type": "object",
      "properties": {
        "permitted_purposes": { "type": "array", "items": { "type": "string" } },
        "explanation_required": { "type": "boolean" },
        "adm_classification": { "type": "string",
                                "enum": ["not_adm", "adm_with_human_review", "adm_significant_effect"] }
      }
    },

    "generated_at": { "type": "string", "format": "date-time" },
    "expires_at":   { "type": "string", "format": "date-time" },
    "disposition": {
      "type": "object",
      "description": "Populated after human or system response. Feeds the calibration loop.",
      "properties": {
        "outcome":     { "type": "string", "enum": ["confirmed", "rejected", "inconclusive", "no_response"] },
        "actioned":    { "type": "boolean" },
        "responded_at":{ "type": "string", "format": "date-time" },
        "notes":       { "type": "string" }
      }
    }
  }
}
```

**Listing C-3.** *Insight Object schema. The `disposition` block is what closes the calibration loop; without it confidence scores cannot be validated and the framework degrades into unfalsifiable assertion.*

## C.4 Correlation Scope Declaration

```yaml
scope_id: banking.distress-vs-takeover.v3
version: 3.1.0
status: active
owner:
  domain: retail-banking-risk
  steward: risk.data.steward@example
  approved_by: [data-governance-board, dpo, model-risk]
  approved_on: 2026-03-14

purpose:
  declared: customer_financial_distress_support
  legal_basis: legitimate_interest
  dpia_ref: DPIA-2026-0042
  regulatory_refs: [FCA-FG21-1, GDPR-Art22]

inputs:
  event_types:
    - banking.card.authorization_declined
    - banking.account.balance_threshold_breach
    - banking.payment.direct_debit_returned
    - banking.channel.session_anomaly
    - banking.contact.inbound_call
  max_sensitivity: confidential
  excluded_classifications: [special_category]

window:
  type: sliding
  width: P14D
  slide: PT5M
  allowed_lateness: PT30M

modalities: [M1, M2, M5]
# M3 causal excluded: insufficient interventional data
# M4 semantic excluded: free-text call notes out of purpose scope

confidence:
  minimum_persist: 0.35
  minimum_surface: 0.62
  type_ceiling:
    behavioural_deviation: 0.85
  decay_per_day: 0.03
  calibration:
    method: isotonic
    ground_truth_source: case_outcomes
    review_cadence: P30D

prohibited_inferences:
  - health_condition
  - pregnancy
  - religious_affiliation
  - trade_union_membership
  - immigration_status

outputs:
  insight_types: [risk, recommendation]
  max_autonomy: L2
  # L3 explicitly withheld: any account restriction is
  # not reversible from the customer's perspective
  routing:
    owner: vulnerable-customer-team
    severity_map: { high: "confidence>=0.80", medium: "confidence>=0.62" }

retention:
  correlation_ttl: P90D
  insight_ttl: P180D
  erasure_propagation: enabled

cost:
  monthly_budget_usd: 14000
  metric: cost_per_acted_upon_insight
  suspend_if_exceeded: true

lifecycle:
  review_due: 2026-09-14
  retire_if:
    - "action_rate < 0.05 over P90D"
    - "precision < 0.50 over P60D"
    - "cost_per_acted_upon_insight > 400 over P30D"
```

**Listing C-4.** *Correlation scope declaration. **The `retire_if` block is the most operationally significant element**: a scope that specifies the conditions under which it should cease to exist is far more likely to be retired than one that relies on periodic human review.*

## C.5 Type Reference

| Correlation type | Modality | Directed | Default ceiling | Default TTL |
| --- | --- | :-: | :-: | :-: |
| `temporal_sequence` | M1 | Yes | 0.95 | 30 d |
| `temporal_coincidence` | M1 | No | 0.90 | 30 d |
| `shared_entity` | M2 | No | 0.98 | 180 d |
| `structural_path` | M2 | Yes | 0.85 | 90 d |
| `causal_hypothesis` | M3 | Yes | **0.70** | 365 d |
| `semantic_similarity` | M4 | No | 0.80 | 60 d |
| `behavioural_deviation` | M5 | No | 0.85 | 45 d |
| `negative_absence` | M6 | Yes | 0.75 | 14 d |

**Table 92.** *Correlation type reference with confidence ceilings and default lifetimes. The causal ceiling of 0.70 is deliberately low and is a structural admission that observational data cannot establish causation.*

---

**Next:** [Appendix D — Adoption Maturity Assessment →](d-maturity-assessment.md)
