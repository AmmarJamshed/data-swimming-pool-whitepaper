# 42. References

---

{% hint style="info" %}
References are organized by topic. Works are cited for the ideas this framework builds upon; inclusion does not imply that any author endorses the Data Swimming Pool framework. Where a work is foundational to a specific chapter, that chapter is noted.
{% endhint %}

## 42.1 Foundations of Data Management

1. Codd, E. F. (1970). *A Relational Model of Data for Large Shared Data Banks*. Communications of the ACM, 13(6), 377–387. — *Ch. 4, 6*
2. Codd, E. F. (1979). *Extending the Database Relational Model to Capture More Meaning*. ACM Transactions on Database Systems, 4(4), 397–434.
3. Chen, P. P. (1976). *The Entity-Relationship Model — Toward a Unified View of Data*. ACM TODS, 1(1), 9–36.
4. Gray, J., & Reuter, A. (1992). *Transaction Processing: Concepts and Techniques*. Morgan Kaufmann.
5. Stonebraker, M., & Çetintemel, U. (2005). *"One Size Fits All": An Idea Whose Time Has Come and Gone*. ICDE 2005.
6. Hellerstein, J. M., Stonebraker, M., & Hamilton, J. (2007). *Architecture of a Database System*. Foundations and Trends in Databases, 1(2), 141–259.

## 42.2 Data Warehousing and Dimensional Modelling

7. Inmon, W. H. (1992). *Building the Data Warehouse*. Wiley. — *Ch. 6*
8. Inmon, W. H., Zachman, J. A., & Geiger, J. G. (1997). *Data Stores, Data Warehousing, and the Zachman Framework*. McGraw-Hill.
9. Kimball, R., & Ross, M. (2013). *The Data Warehouse Toolkit: The Definitive Guide to Dimensional Modeling* (3rd ed.). Wiley. — *Ch. 6*
10. Chaudhuri, S., & Dayal, U. (1997). *An Overview of Data Warehousing and OLAP Technology*. ACM SIGMOD Record, 26(1), 65–74.
11. Kimball, R., & Caserta, J. (2004). *The Data Warehouse ETL Toolkit*. Wiley.

## 42.3 Data Lakes, Lakehouses, and Open Table Formats

12. Dean, J., & Ghemawat, S. (2004). *MapReduce: Simplified Data Processing on Large Clusters*. OSDI 2004. — *Ch. 6*
13. Ghemawat, S., Gobioff, H., & Leung, S.-T. (2003). *The Google File System*. SOSP 2003.
14. Shvachko, K., Kuang, H., Radia, S., & Chansler, R. (2010). *The Hadoop Distributed File System*. IEEE MSST 2010.
15. Zaharia, M., et al. (2012). *Resilient Distributed Datasets: A Fault-Tolerant Abstraction for In-Memory Cluster Computing*. NSDI 2012. — *Ch. 12*
16. Armbrust, M., et al. (2020). *Delta Lake: High-Performance ACID Table Storage over Cloud Object Stores*. VLDB, 13(12), 3411–3424. — *Ch. 12*
17. Armbrust, M., Ghodsi, A., Xin, R., & Zaharia, M. (2021). *Lakehouse: A New Generation of Open Platforms that Unify Data Warehousing and Advanced Analytics*. CIDR 2021. — *Ch. 6, 12*
18. Apache Software Foundation. *Apache Iceberg Specification*. https://iceberg.apache.org/spec/
19. Apache Software Foundation. *Apache Hudi Documentation*. https://hudi.apache.org/
20. Zaharia, M., et al. (2016). *Apache Spark: A Unified Engine for Big Data Processing*. Communications of the ACM, 59(11), 56–65. — *Ch. 12*

## 42.4 Distributed Systems Theory

21. Lamport, L. (1978). *Time, Clocks, and the Ordering of Events in a Distributed System*. Communications of the ACM, 21(7), 558–565. — *Ch. 4, 11, 19*
22. Brewer, E. (2000). *Towards Robust Distributed Systems*. PODC Keynote. — *Ch. 4, 27*
23. Gilbert, S., & Lynch, N. (2002). *Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services*. ACM SIGACT News, 33(2), 51–59. — *Ch. 27*
24. Abadi, D. (2012). *Consistency Tradeoffs in Modern Distributed Database System Design: CAP is Only Part of the Story*. IEEE Computer, 45(2), 37–42. — *Ch. 27*
25. Bailis, P., & Ghodsi, A. (2013). *Eventual Consistency Today: Limitations, Extensions, and Beyond*. ACM Queue, 11(3).
26. Ongaro, D., & Ousterhout, J. (2014). *In Search of an Understandable Consensus Algorithm (Raft)*. USENIX ATC 2014.
27. Burrows, M. (2006). *The Chubby Lock Service for Loosely-Coupled Distributed Systems*. OSDI 2006.
28. Helland, P. (2015). *Immutability Changes Everything*. ACM Queue, 13(9). — *Ch. 19*

## 42.5 Event Streaming and Stream Processing

29. Kreps, J. (2013). *The Log: What Every Software Engineer Should Know About Real-Time Data's Unifying Abstraction*. LinkedIn Engineering. — *Ch. 4, 11*
30. Kreps, J., Narkhede, N., & Rao, J. (2011). *Kafka: A Distributed Messaging System for Log Processing*. NetDB 2011. — *Ch. 11*
31. Kreps, J. (2014). *Questioning the Lambda Architecture*. O'Reilly Radar. — *Ch. 4, 12*
32. Marz, N., & Warren, J. (2015). *Big Data: Principles and Best Practices of Scalable Realtime Data Systems*. Manning. — *Ch. 4, 12*
33. Akidau, T., et al. (2015). *The Dataflow Model: A Practical Approach to Balancing Correctness, Latency, and Cost in Massive-Scale, Unbounded, Out-of-Order Data Processing*. VLDB, 8(12), 1792–1803. — *Ch. 11*
34. Akidau, T., Chernyak, S., & Lax, R. (2018). *Streaming Systems*. O'Reilly Media. — *Ch. 11*
35. Carbone, P., et al. (2015). *Apache Flink: Stream and Batch Processing in a Single Engine*. IEEE Data Engineering Bulletin, 38(4), 28–38. — *Ch. 11*
36. Carbone, P., et al. (2017). *State Management in Apache Flink: Consistent Stateful Distributed Stream Processing*. VLDB, 10(12), 1718–1729. — *Ch. 11*
37. Chandy, K. M., & Lamport, L. (1985). *Distributed Snapshots: Determining Global States of Distributed Systems*. ACM TOCS, 3(1), 63–75.
38. Apache Software Foundation. *Apache Kafka Documentation*. https://kafka.apache.org/documentation/
39. Apache Software Foundation. *Apache Flink Documentation*. https://flink.apache.org/

## 42.6 Complex Event Processing and Event Sourcing

40. Luckham, D. (2002). *The Power of Events: An Introduction to Complex Event Processing in Distributed Enterprise Systems*. Addison-Wesley. — *Ch. 4, 14*
41. Luckham, D. (2011). *Event Processing for Business: Organizing the Real-Time Enterprise*. Wiley.
42. Wu, E., Diao, Y., & Rizvi, S. (2006). *High-Performance Complex Event Processing over Streams (SASE)*. SIGMOD 2006. — *Ch. 14*
43. Demers, A., et al. (2007). *Cayuga: A General Purpose Event Monitoring System*. CIDR 2007. — *Ch. 14*
44. Cugola, G., & Margara, A. (2012). *Processing Flows of Information: From Data Stream to Complex Event Processing*. ACM Computing Surveys, 44(3), 1–62. — *Ch. 14*
45. Etzion, O., & Niblett, P. (2010). *Event Processing in Action*. Manning.
46. Fowler, M. (2005). *Event Sourcing*. martinfowler.com. — *Ch. 4, 19*
47. Young, G. (2010). *CQRS Documents*. — *Ch. 4*
48. Vernon, V. (2013). *Implementing Domain-Driven Design*. Addison-Wesley.

## 42.7 Knowledge Graphs, Semantics, and Graph Databases

49. Hogan, A., et al. (2021). *Knowledge Graphs*. ACM Computing Surveys, 54(4), 1–37. — *Ch. 17*
50. Noy, N., et al. (2019). *Industry-Scale Knowledge Graphs: Lessons and Challenges*. ACM Queue, 17(2). — *Ch. 17*
51. Berners-Lee, T., Hendler, J., & Lassila, O. (2001). *The Semantic Web*. Scientific American, 284(5), 34–43.
52. W3C. (2014). *RDF 1.1 Concepts and Abstract Syntax*. https://www.w3.org/TR/rdf11-concepts/
53. W3C. (2013). *SPARQL 1.1 Query Language*. https://www.w3.org/TR/sparql11-query/
54. Angles, R., et al. (2017). *Foundations of Modern Query Languages for Graph Databases*. ACM Computing Surveys, 50(5), 1–40. — *Ch. 17*
55. Francis, N., et al. (2018). *Cypher: An Evolving Query Language for Property Graphs*. SIGMOD 2018.
56. ISO/IEC 39075:2024. *Information Technology — Database Languages — GQL*. — *Ch. 17*
57. Robinson, I., Webber, J., & Eifrem, E. (2015). *Graph Databases: New Opportunities for Connected Data* (2nd ed.). O'Reilly.
58. Newman, M. E. J. (2010). *Networks: An Introduction*. Oxford University Press. — *Ch. 17*
59. Blondel, V. D., et al. (2008). *Fast Unfolding of Communities in Large Networks (Louvain)*. Journal of Statistical Mechanics, P10008. — *Ch. 17, 29*

## 42.8 Machine Learning, Embeddings, and Retrieval

60. Mikolov, T., et al. (2013). *Distributed Representations of Words and Phrases and their Compositionality*. NeurIPS 2013.
61. Vaswani, A., et al. (2017). *Attention Is All You Need*. NeurIPS 2017.
62. Lewis, P., et al. (2020). *Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks*. NeurIPS 2020. — *Ch. 16*
63. Gao, Y., et al. (2024). *Retrieval-Augmented Generation for Large Language Models: A Survey*. arXiv:2312.10997. — *Ch. 16*
64. Edge, D., et al. (2024). *From Local to Global: A Graph RAG Approach to Query-Focused Summarization*. arXiv:2404.16130. — *Ch. 16, 17*
65. Malkov, Y. A., & Yashunin, D. A. (2018). *Efficient and Robust Approximate Nearest Neighbor Search Using Hierarchical Navigable Small World Graphs*. IEEE TPAMI, 42(4), 824–836. — *Ch. 17*
66. Johnson, J., Douze, M., & Jégou, H. (2019). *Billion-Scale Similarity Search with GPUs (FAISS)*. IEEE Transactions on Big Data.
67. Kipf, T. N., & Welling, M. (2017). *Semi-Supervised Classification with Graph Convolutional Networks*. ICLR 2017. — *Ch. 16*
68. Hamilton, W., Ying, Z., & Leskovec, J. (2017). *Inductive Representation Learning on Large Graphs (GraphSAGE)*. NeurIPS 2017. — *Ch. 16*
69. Sculley, D., et al. (2015). *Hidden Technical Debt in Machine Learning Systems*. NeurIPS 2015. — *Ch. 16*
70. Guo, C., et al. (2017). *On Calibration of Modern Neural Networks*. ICML 2017. — *Ch. 14, 16*
71. Niculescu-Mizil, A., & Caruana, R. (2005). *Predicting Good Probabilities with Supervised Learning*. ICML 2005. — *Ch. 14*
72. Gawlikowski, J., et al. (2023). *A Survey of Uncertainty in Deep Neural Networks*. Artificial Intelligence Review, 56, 1513–1589.

## 42.9 Causal Inference and Statistical Correctness

73. Pearl, J. (2009). *Causality: Models, Reasoning, and Inference* (2nd ed.). Cambridge University Press. — *Ch. 14, 19*
74. Pearl, J., & Mackenzie, D. (2018). *The Book of Why: The New Science of Cause and Effect*. Basic Books.
75. Granger, C. W. J. (1969). *Investigating Causal Relations by Econometric Models and Cross-Spectral Methods*. Econometrica, 37(3), 424–438. — *Ch. 14*
76. Imbens, G. W., & Rubin, D. B. (2015). *Causal Inference for Statistics, Social, and Biomedical Sciences*. Cambridge University Press.
77. Benjamini, Y., & Hochberg, Y. (1995). *Controlling the False Discovery Rate: A Practical and Powerful Approach to Multiple Testing*. JRSS-B, 57(1), 289–300. — *Ch. 14, 39*
78. Ioannidis, J. P. A. (2005). *Why Most Published Research Findings Are False*. PLoS Medicine, 2(8), e124. — *Ch. 39*
79. Simmons, J. P., Nelson, L. D., & Simonsohn, U. (2011). *False-Positive Psychology*. Psychological Science, 22(11), 1359–1366.
80. Calude, C. S., & Longo, G. (2017). *The Deluge of Spurious Correlations in Big Data*. Foundations of Science, 22, 595–612. — *Ch. 39*

## 42.10 Entity Resolution and Data Quality

81. Fellegi, I. P., & Sunter, A. B. (1969). *A Theory for Record Linkage*. Journal of the American Statistical Association, 64(328), 1183–1210. — *Ch. 13*
82. Christen, P. (2012). *Data Matching: Concepts and Techniques for Record Linkage, Entity Resolution, and Duplicate Detection*. Springer. — *Ch. 13*
83. Getoor, L., & Machanavajjhala, A. (2012). *Entity Resolution: Theory, Practice & Open Challenges*. VLDB, 5(12), 2018–2019. — *Ch. 13*
84. Papadakis, G., et al. (2020). *Blocking and Filtering Techniques for Entity Resolution: A Survey*. ACM Computing Surveys, 53(2), 1–42.
85. Redman, T. C. (1998). *The Impact of Poor Data Quality on the Typical Enterprise*. Communications of the ACM, 41(2), 79–82. — *Ch. 5*

## 42.11 Data Architecture Paradigms

86. Dehghani, Z. (2019). *How to Move Beyond a Monolithic Data Lake to a Distributed Data Mesh*. martinfowler.com. — *Ch. 6*
87. Dehghani, Z. (2022). *Data Mesh: Delivering Data-Driven Value at Scale*. O'Reilly Media. — *Ch. 6, 25*
88. Gartner. (2019–2024). *Data Fabric* research notes and Hype Cycle for Data Management. — *Ch. 6*
89. Forrester Research. (2016). *The Forrester Wave: Big Data Fabric*. — *Ch. 6*
90. Machado, I. A., Costa, C., & Santos, M. Y. (2022). *Data Mesh: Concepts and Principles of a Paradigm Shift in Data Architectures*. Procedia Computer Science, 196, 263–271.
91. Kleppmann, M. (2017). *Designing Data-Intensive Applications*. O'Reilly Media. — *Ch. 4, 10, 11*
92. Reis, J., & Housley, M. (2022). *Fundamentals of Data Engineering*. O'Reilly Media.

## 42.12 Metadata, Lineage, and Observability

93. Hellerstein, J. M., et al. (2017). *Ground: A Data Context Service*. CIDR 2017. — *Ch. 18*
94. Herschel, M., Diestelkämper, R., & Ben Lahmar, H. (2017). *A Survey on Provenance: What For? What Form? What From?* VLDB Journal, 26, 881–906. — *Ch. 18*
95. Cheney, J., Chiticariu, L., & Tan, W.-C. (2009). *Provenance in Databases: Why, How, and Where*. Foundations and Trends in Databases, 1(4), 379–474.
96. OpenLineage Project. *OpenLineage Specification*. https://openlineage.io/ — *Ch. 18*
97. Linux Foundation. *Marquez: Collect, Aggregate, and Visualize a Data Ecosystem's Metadata*. https://marquezproject.ai/
98. OpenTelemetry Project. *OpenTelemetry Specification*. https://opentelemetry.io/ — *Ch. 18*
99. W3C. (2013). *PROV-DM: The PROV Data Model*. https://www.w3.org/TR/prov-dm/ — *Ch. 18*

## 42.13 Governance, Privacy, and Regulation

100. DAMA International. (2017). *DAMA-DMBOK: Data Management Body of Knowledge* (2nd ed.). Technics Publications. — *Ch. 25*
101. European Union. (2016). *Regulation (EU) 2016/679 — General Data Protection Regulation (GDPR)*. — *Ch. 24, 25*
102. European Union. (2024). *Regulation (EU) 2024/1689 — Artificial Intelligence Act*. — *Ch. 20, 25*
103. Article 29 Data Protection Working Party. (2018). *Guidelines on Automated Individual Decision-Making and Profiling (WP251rev.01)*. — *Ch. 24*
104. Wachter, S., & Mittelstadt, B. (2019). *A Right to Reasonable Inferences: Re-Thinking Data Protection Law in the Age of Big Data and AI*. Columbia Business Law Review, 2019(2), 494–620. — *Ch. 24*
105. Basel Committee on Banking Supervision. (2013). *BCBS 239: Principles for Effective Risk Data Aggregation and Risk Reporting*. — *Ch. 25, 29*
106. U.S. Department of Health and Human Services. *HIPAA Privacy Rule*, 45 CFR Parts 160 and 164. — *Ch. 24, 30*
107. Sweeney, L. (2002). *k-Anonymity: A Model for Protecting Privacy*. International Journal of Uncertainty, Fuzziness and Knowledge-Based Systems, 10(5), 557–570. — *Ch. 24, 33*
108. Machanavajjhala, A., et al. (2007). *ℓ-Diversity: Privacy Beyond k-Anonymity*. ACM TKDD, 1(1). — *Ch. 24*
109. Dwork, C., & Roth, A. (2014). *The Algorithmic Foundations of Differential Privacy*. Foundations and Trends in Theoretical Computer Science, 9(3–4), 211–407. — *Ch. 24*
110. Narayanan, A., & Shmatikov, V. (2008). *Robust De-anonymization of Large Sparse Datasets*. IEEE S&P 2008. — *Ch. 23, 24*
111. Bourtoule, L., et al. (2021). *Machine Unlearning*. IEEE S&P 2021. — *Ch. 24*
112. Kairouz, P., et al. (2021). *Advances and Open Problems in Federated Learning*. Foundations and Trends in Machine Learning, 14(1–2). — *Ch. 24, 40*
113. Open Policy Agent Project. *Rego Policy Language Documentation*. https://www.openpolicyagent.org/ — *Ch. 23, 25*

## 42.14 Security

114. Rose, S., et al. (2020). *NIST SP 800-207: Zero Trust Architecture*. National Institute of Standards and Technology. — *Ch. 23*
115. NIST. (2018). *Framework for Improving Critical Infrastructure Cybersecurity (CSF) v1.1*. — *Ch. 23*
116. MITRE. *ATT&CK Framework*. https://attack.mitre.org/ — *Ch. 34*
117. Hutchins, E. M., Cloppert, M. J., & Amin, R. M. (2011). *Intelligence-Driven Computer Network Defense Informed by Analysis of Adversary Campaigns and Intrusion Kill Chains*. Leading Issues in Information Warfare & Security Research, 1(1). — *Ch. 34*
118. Greshake, K., et al. (2023). *Not What You've Signed Up For: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection*. AISec 2023. — *Ch. 16, 23*
119. OWASP. (2025). *OWASP Top 10 for Large Language Model Applications*. — *Ch. 23*
120. Biggio, B., & Roli, F. (2018). *Wild Patterns: Ten Years After the Rise of Adversarial Machine Learning*. Pattern Recognition, 84, 317–331. — *Ch. 23, 34*

## 42.15 Human Factors, Automation, and Decision Support

121. Parasuraman, R., & Riley, V. (1997). *Humans and Automation: Use, Misuse, Disuse, Abuse*. Human Factors, 39(2), 230–253. — *Ch. 20*
122. Parasuraman, R., Sheridan, T. B., & Wickens, C. D. (2000). *A Model for Types and Levels of Human Interaction with Automation*. IEEE Transactions on Systems, Man, and Cybernetics, 30(3), 286–297. — *Ch. 20*
123. Bainbridge, L. (1983). *Ironies of Automation*. Automatica, 19(6), 775–779. — *Ch. 20*
124. Skitka, L. J., Mosier, K. L., & Burdick, M. (1999). *Does Automation Bias Decision-Making?* International Journal of Human-Computer Studies, 51(5), 991–1006. — *Ch. 20, 39*
125. SAE International. (2021). *J3016: Taxonomy and Definitions for Terms Related to Driving Automation Systems*. — *Ch. 20*
126. Cvach, M. (2012). *Monitor Alarm Fatigue: An Integrative Review*. Biomedical Instrumentation & Technology, 46(4), 268–277. — *Ch. 21, 30*
127. Sendelbach, S., & Funk, M. (2013). *Alarm Fatigue: A Patient Safety Concern*. AACN Advanced Critical Care, 24(4), 378–386. — *Ch. 21*
128. Beyer, B., Jones, C., Petoff, J., & Murphy, N. R. (2016). *Site Reliability Engineering*. O'Reilly Media. — *Ch. 21, 27, 28*
129. Woods, D. D., & Hollnagel, E. (2006). *Joint Cognitive Systems: Patterns in Cognitive Systems Engineering*. CRC Press.

## 42.16 Domain-Specific Sources

130. Churpek, M. M., et al. (2016). *Multicenter Comparison of Machine Learning Methods and Conventional Regression for Predicting Clinical Deterioration on the Wards*. Critical Care Medicine, 44(2), 368–374. — *Ch. 30*
131. Escobar, G. J., et al. (2020). *Automated Identification of Adults at Risk for In-Hospital Clinical Deterioration*. New England Journal of Medicine, 383, 1951–1960. — *Ch. 30*
132. Financial Action Task Force. (2012–2023). *International Standards on Combating Money Laundering and the Financing of Terrorism & Proliferation*. — *Ch. 29*
133. Financial Conduct Authority. (2021). *FG21/1: Guidance for Firms on the Fair Treatment of Vulnerable Customers*. — *Ch. 29*
134. Lee, J., Bagheri, B., & Kao, H.-A. (2015). *A Cyber-Physical Systems Architecture for Industry 4.0-Based Manufacturing Systems*. Manufacturing Letters, 3, 18–23. — *Ch. 31*
135. Lasi, H., et al. (2014). *Industry 4.0*. Business & Information Systems Engineering, 6, 239–242. — *Ch. 31*
136. International Civil Aviation Organization. (2018). *Doc 9859: Safety Management Manual* (4th ed.). — *Ch. 36A*
137. Reason, J. (1990). *Human Error*. Cambridge University Press. — *Ch. 36A*
138. Kitchin, R. (2014). *The Real-Time City? Big Data and Smart Urbanism*. GeoJournal, 79, 1–14. — *Ch. 33*
139. Zuboff, S. (2019). *The Age of Surveillance Capitalism*. PublicAffairs. — *Ch. 24, 33, 35*
140. Eubanks, V. (2018). *Automating Inequality: How High-Tech Tools Profile, Police, and Punish the Poor*. St. Martin's Press. — *Ch. 35*
141. O'Neil, C. (2016). *Weapons of Math Destruction*. Crown. — *Ch. 35*

## 42.17 Standards and Specifications

142. Bradner, S. (1997). *RFC 2119: Key Words for Use in RFCs to Indicate Requirement Levels*. IETF. — *Ch. 9*
143. Leiba, B. (2017). *RFC 8174: Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words*. IETF.
144. ISO/IEC 25012:2008. *Software Engineering — Software Product Quality Requirements and Evaluation — Data Quality Model*.
145. ISO/IEC 27001:2022. *Information Security, Cybersecurity and Privacy Protection — Information Security Management Systems*. — *Ch. 23*
146. ISO/IEC 42001:2023. *Information Technology — Artificial Intelligence — Management System*. — *Ch. 25*
147. NIST. (2023). *AI Risk Management Framework (AI RMF 1.0)*. — *Ch. 20, 25*
148. CloudEvents. *CloudEvents Specification v1.0.2*. CNCF. https://cloudevents.io/ — *Ch. 13*
149. Apache Software Foundation. *Apache Avro Specification*. https://avro.apache.org/docs/
150. The Open Group. (2022). *TOGAF Standard, 10th Edition*.

---

## 42.18 Citation of This Work

{% hint style="info" %}
**Suggested citation**

Jamshed, A. (2026). *Data Swimming Pool: An Intelligent Enterprise Data Ecosystem for Connected, Living Data*. Independent research whitepaper, Version 1.0.

**BibTeX**

```bibtex
@techreport{jamshed2026dsp,
  author      = {Jamshed, Ammar},
  title       = {Data Swimming Pool: An Intelligent Enterprise Data
                 Ecosystem for Connected, Living Data},
  type        = {Independent Research Whitepaper},
  institution = {Independent},
  year        = {2026},
  version     = {1.0},
  note        = {Original conceptual framework. Not an industry standard.}
}
```
{% endhint %}

---

**Next:** [Appendix A — Glossary →](../appendix/a-glossary.md)
