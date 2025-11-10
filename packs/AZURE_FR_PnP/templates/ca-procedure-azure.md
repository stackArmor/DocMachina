### 4.0 Assessment, Authorization, and Monitoring Controls

#### 4.1 CA-2 Security Assessments
The {{customerName}} Security Governance Team is responsible for identifying and selecting a FedRAMP-authorized Third-Party Assessment Organization (3PAO) to conduct the required assessment for the {{customerSystemAcronym}} information system.  {{customerName}} will select the 3PAO in accordance with the {{customerName}} vendor acquisition processes. The ISSM must ensure that the 3PAO is aged in a timely fashion to meet the initial as well as annual security assessment timelines established by {{customerName}} and/or the Authorizing Officials to meet initial and ongoing authorizations. Following authorization of the {{customerSystemAcronym}} information system, {{customerName}} will maintain a relationship with a 3PAO to ensure that subsequent independent assessments are included in the system lifecycle.

The 3PAO identified in CA-2.a will develop a control assessment plan (CAP) based on the {{systemAssuranceLevel}} baseline requirements. Additional controls may be assessed in accordance with the NIST SP 800-53 (current revision) selection of controls by a 3PAO. The CAP describes the scope of the assessment to be conducted including:
- Controls and control enhancements under assessment;
- Assessment procedures to be used to determine control effectiveness; and
- Assessment environment, assessment team, and assessment roles and responsibilities.

The {{customerName}} Security Governance Team reviews the CAP to ensure {{customerName}} concurs with the content before providing it to the Authorizing Official or designee for review and signature. The ISSM ensures that the Authorizing Official or designee signs the CAP prior to the commencement of every assessment. 

The 3PAO assesses the controls implemented in the {{customerSystemAcronym}} information system and its environment of operation at least annually to determine the extent to which the controls are implemented correctly, operating as intended, and producing the desired outcome with respect to meeting established security and privacy requirements. The assessment will be done in accordance with the approved Control Assessment Plan and will include the following components: 
- Penetration Testing
- Announced Vulnerability Scanning 
- Scans include Operating Systems, Database, Web Applications, and Containers when applicable.
- Manual Control Testing

The Assessment will consist of:
- Initial Assessment – the 3PAO will assess all security controls associated with the FedRAMP Baseline. The successful completion of the initial assessment will lead to an Authorization To Operate (ATO) once the authorizing official reviews the Control Assessment Reports and accepts any residual risks identified during the assessment.
- Annual Assessments – as part of {{customerName}}’s continuous monitoring strategy, the 3PAO assess a subset of the FedRAMP controls to ensure that the controls continue to be implemented correctly, operating as intended, and producing the desired outcome with respect to meeting established security and privacy requirements. 

Following the assessment, the 3PAO delivers a Control Assessment Report (CAR) to the Security Governance Team. The CAR contains results of the assessment and documents controls that were identified as not implemented or not operating as intended during the assessment. For remediation purposes, the Security Governance Team shares the CAR with the appropriate support teams. The Team also shares the CAR with the Authorizing Official or designee and FedRAMP PMO as part of the ATO package. The identified deficiencies are documented within the POA&M and remedial actions tracked until completion. 

#### 4.2 CA-2(1) Independent Assessors
The {{customerSystemAcronym}} Security Governance Team is responsible for identifying and selecting a FedRAMP-authorized Third-Party Assessment Organization (3PAO) to conduct the required assessment for the {{customerSystemAcronym}} information system. 

#### 4.3 CA-2(2) Specialized Assessments (H)
The 3PAO assesses the controls implemented in the {{customerSystemAcronym}} information system and its environment of operation at least annually to determine the extent to which the controls are implemented correctly, operating as intended, and producing the desired outcome with respect to meeting established security and privacy requirements. The assessment will be done in accordance with the approved Control Assessment Plan and will include the following components: 
- Penetration Testing
- Announced Vulnerability Scanning 
- Scans include Operating Systems, Database, Web Applications, and Containers when applicable.
- Manual Control Testing

#### 4.4 CA-2(3) Leveraging Results from External Organizations 
{{customerName}} has contracted with a FedRAMP- accredited 3PAO to perform independent assessment activities on the {{customerSystemAcronym}} environment. The Security Governance Team will accept the 3PAO assessment results when the assessment meets the conditions that have been compiled by the FedRAMP PMO. 

#### 4.5 CA-3 Information Exchange
The {{customerName}} {{connectionsApproveRole}} approves and manages the exchange of information between {{customerSystemAcronym}} information system and other systems using contracts in place between the provider of the external connection/service and {{customerName}}.

For needed information exchanges between {{customerSystemAcronym}} and other, external information systemswill only interconnect with other systems that are FedRAMP authorized at a level at or above the categorization of the {{customerSystemAcronym}} system. Documented agreements with the other systems will include: 
- the interface characteristics, 
- security and privacy control requirements, 
- responsibilities for each system,
- the impact level of the information communicated.

The {{connectionsApproveRole}} is responsible for reviewing and updating established connection agreements with other systems at least annually or on input from FedRAMP PMO or AO. 
{{customerName}} has identified interconnections with external information systems in both Section 6 “Leveraged FedRAMP-Authorized Services” and Section 7 “External Systems and Services Not Having FedRAMP Authorization” of the {{customerSystemAcronym}} SSP. 

The {{customerSystemAcronym}} information system verifies that individuals or systems transferring data between interconnecting systems have the requisite authorizations (i.e., write permissions or privileges) prior to accepting such data. Data from other systems are enforced via the use of security groups, routing rules, DNSSEC enforcement and access control lists (ACLs) as described in AC-3 (Access Enforcement) and AC-4 (Information Flow) security control implementation statements in the {{customerSystemAcronym}} information system SSP. 

#### 4.6 CA-3(6) Transfer Authorizations (H)
{{customerName}} and its customers verify that individuals or systems transferring data between interconnecting systems have the requisite authorizations (i.e., write permissions or privileges) prior to accepting such data. This is done via the policy, procedures and processes that are documented for the AC-2: Access Control and AC-3: Access Enforcement security controls. 

#### 4.7 CA-5 Plan of Actions and Milestones
{{customerName}} maintains a Plan of Actions and Milestones (POA&M) to document the {{customerSystemAcronym}} system’s remedial actions to correct deficiencies from known vulnerabilities, discovered during assessments or continuous monitoring. The POAM is completed with input from various team members supporting the {{customerSystemAcronym}} environment. 

The POA&M is reviewed and updated at least monthly by the {{customerName}} {{poamApprover}} in collaboration with the Technical System Personnel based on findings from control assessments and/or continuous monitoring activities. Updates to the POA&M may also be done when remediation is complete, and the testing of the implemented security control meets the acceptable criteria to support a control being in place and operating as intended. The ISSM provides the POA&M to the Authorizing Official or designee and the FedRAMP PMO for review on a monthly basis. 

#### 4.8 CA-6 Security Authorization
{{customerName}} has identified {{authorizingOfficial}} as the Authorizing Official for the  {{customerSystemAcronym}} information System. 

The {{authorizingOfficial}} is a Designated Approving Authority (DAA) and the acting authorizing official for accreditation of the information system. As part of the authorization, the {{authorizingOfficial}} validates the common controls available for inheritance by organizational systems and authorizes the use of those controls by organizational systems during the ATO process. 

The {{customerName}} Security Governance Team ensures that the {{authorizingOfficial}} issues the  {{customerSystemAcronym}} information system an Authority to Operate (ATO) prior to beginning operations. As a part of this process the {{authorizingOfficial}} accepts the use of common controls inherited by the system (i.e., inheritable Azure controls). 

The Security Governance Team ensures that the ATO for the {{customerSystemAcronym}} information system is updated least in accordance with OMB A-130 requirements or when a significant change occurs. 

#### 4.9 CA-7 Continuous Monitoring
{{customerName}} has a developed and implemented a Continuous Monitoring strategy for the  {{customerSystemAcronym}} information system to be used throughout the systems accreditation Lifecyle. This strategy is documented in the Security Assessment Authorization (CA) Policy, these procedures, and the {{customerSystemAcronym}} Continuous Monitoring Plan. 

{{customerName}} has established continuous monitoring metrics and frequencies in accordance with the Continuous Monitoring Activities and Deliveries documented in the FedRAMP Continuous Monitoring Strategy Guide. {{customerName}} contracts with a 3PAO post-ATO to conduct annual assessments to determine the effectiveness of the controls in place within the {{customerSystemAcronym}} information system. 

The following identified metrics help maintain visibility into the {{customerSystemAcronym}} information system security and privacy status:

Security Technical Administrators and Engineers can correlate and analyze information generated by control assessments and continuous monitoring activities. {{customerName}} leverages an Azure Sentinel Security Information and Event Management (SIEM) to ingest logs from continuous monitoring activities within the  the {{customerSystemAcronym}}  environment. When needed, {{customerName}} support personnel correlate and analyze information generated by control assessments and continuous monitoring activities leveraging Azure Sentinel. 
{{customerSystemAcronym}} system personnel respond to all anomalies that arise during the standard monitoring of the information system as well as results of security assessments. Continuous monitoring processes are in place to ensure that the system remains operational and compliant with FedRAMP requirements. If the analysis of security-related information shows a deviation from FedRAMP requirements or system standards, an appropriate response will be taken, to include system changes. 

Any needed changes resulting from the continuous monitoring processes are incorporated into the {{customerName}} configuration/change management process and are managed and approved by the {{customerName}} Change Control Board (CCB). System configuration changes are tested in the development and test environments prior to changes being made in the production environment to assess the security impact of the intended changes. 

The ISSM works with the Technical Personnel to identify remedial actions needed to address the results of control assessments and continuous monitoring activities within the {{customerSystemAcronym}}  environment. Deficiencies identified in control assessments are documented within the POA&M. 

As part of the continuous monitoring process, the ISSM will report the state of security and privacy of the {{customerSystemAcronym}}  information system to the Authorizing Official and the FedRAMP PMO/JAB. The ISSM will upload the continuous monitoring reports to the OMB Max portal monthly. The continuous monitoring reports include at a minimum:
- Scan results from database, infrastructure, container images, and web applications
- Current Information system Component Inventory
- Completed Executive Summary Report
- Current POA&M
- Current Risk Deviation Form (if applicable) 

#### 4.10 CA-7(1) Independent Assessment
{{customerName}} employs FedRAMP Authorized 3PAOs to perform all assessments of the system as described in the Policy, Procedures, and implementation statements for the CA-2: Control Assessment and its supporting enhancements. 

#### 4.11 CA-7(4) Risk Monitoring 
As part of the continuous monitoring activities, the Security Governance Team ensures that risk monitoring is an integral part of the continuous monitoring strategy that includes the following:
Effectiveness monitoring determines the ongoing effectiveness of the implemented risk response measures.
Compliance monitoring verifies that required risk response measures are implemented. It also verifies that security and privacy requirements are satisfied.

Change monitoring identifies changes to the {{customerSystemAcronym}} information systems and environments of operation that may affect security and privacy risk. 
The use, processes and frequency of monitoring is defined and documented in the {{customerSystemAcronym}} Continuous Monitoring Plan.

#### 4.12 CA-8 Penetration Testing
As part of the continuous monitoring plan, {{customerName}} has contracts in place with an accredited FedRAMP 3PAO to perform annual assessment activities of the {{customerSystemAcronym}} information system, to include penetration testing of the {{customerSystemAcronym}} information system and its external facing components. The penetration testing will be done in accordance with the FedRAMP Penetration Test Guidance and the Rules of Engagement signed by both {{customerName}} and the 3PAO. 

#### 4.13 CA-8(1) Independent Penetration Testing Agent or Team
As part of the continuous monitoring plan, {{customerName}} has contracts in place with an accredited FedRAMP 3PAO to perform annual assessment activities of the {{customerSystemAcronym}} information system, to include penetration testing of the {{customerSystemAcronym}} information system and its external facing components.
 
#### 4.14 CA-8(2) Red Team Exercises
On an annual basis and for the initial assessment of the system, {{customerName}} contracts with an accredited 3PAO to perform an independent assessment of the system which includes penetration testing. The penetration testing is conducted by the 3PAO in accordance with the FedRAMP Penetration Testing Guidance. The rules of engagement are included by the 3PAO in the Security Assessment Plan (SAP) and are approved prior to the commencement of testing. 

#### 4.15 CA-9 Internal System Connections
{{customerName}} authorizes all {{customerSystemAcronym}} internal System Connection requests through the {{customerName}} change management process. Requests are created leveraging the {{customerSystemAcronym}} Information Technology Service Management (ITSM) solution and are routed to the {{customerName}} change control board (CCB) for review and approval. 

Internal connections are established via firewall rules, security groups, and network access lists (ACLs). The {{customerName}} ITSM issue ticket includes the security requirement and the nature of the connection. The {{customerName}} ISSM is responsible for ensuring the interface characteristics, security requirements and the nature of the communication is documented in the system SSP. 

{{customerName}} terminates internal system connections once it has been determined that the internal system connection is no longer needed for the {{customerSystemAcronym}} system to execute the functions for which it was designed. Unneeded internal connections may be identified:
- during the quarterly review of ports and protocols
- when a system is being decommissioned
- during continuous monitoring processes.

Once a connection is determined to no longer be necessary, the change management process is followed to ensure the connection is terminated, the appropriate architectural changes are made, and the necessary documentation is updated to reflect the change. 

The {{connectionsApproveRole}} reviews the continued need for internal connections, at least annually, during the annual review of the SSP. The {{connectionsApproveRole}} receives input from the Technical Personnel, as necessary, to make determinations regarding the continued need for internal connections. 
