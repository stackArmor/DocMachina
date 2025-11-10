### 4.0 Audit and Accountability Controls

#### 4.1 AU-2 Event Logging
The types of events that the system is capable of logging in support of the audit function shall be identified. They are as follows: successful and unsuccessful account logon events, account management events, object
access, policy change, privilege functions, process tracking, and system events. For Web applications: all administrator activity, authentication checks, authorization checks, data deletions, data access, data changes, and permission changes. 

The event logging function shall be coordinated with other organizational entities requiring audit-related information to guide and inform the selection criteria for events to be logged. 

The following event types shall be specified for logging within the system: all events noted under AU-2a, continuously. 

A rationale for why the event types selected for logging are deemed to be adequate to support after-the-fact investigations of incidents shall be provided. 

The event types selected for logging shall be reviewed and updated annually or whenever changes in the threat environment are communicated to the service provider by the JAB/AO.

#### 4.2 AU-3 Content of Audit Records
It shall be ensured that audit records contain information
that establishes the following:
a. What type of event occurred;
b. When the event occurred;
c. Where the event occurred;
d. Source of the event;
e. Outcome of the event; and 
f. Identity of any individuals, subjects, or
objects/entities associated with the event.

#### 4.3 AU-3(1) Additional Audit Information
Audit records
containing the following additional information shall be generated: session,connection, transaction, or activity duration; for client-server transactions,the number of bytes received and bytes sent; additional informational messages to diagnose or identify the event; characteristics that describe or identify
the object or resource being acted upon; individual identities of group account users; full-text of privileged commands.

#### 4.4 AU-4 Audit Log Storage Capacity
Audit log storage capacity to accommodate the requirements of the AU-11: Audit Log Retention control shall be allocated.

#### 4.5 AU-5 Response to Audit Log Processing Failures
Security Technical Administrators and the ISSM shall be alerted within one (1) hour in the event of an audit logging process failure.  

The following additional actions shall be taken in the event of audit logging processing failure: overwrite oldest record.

#### 4.6 AU-5(1) Storage Capacity Warning (H)
A warning to ISSM and Security Technical Administrators shall be provided within five (5) minutes
when allocated audit log storage volume reaches 75%, or one month before expected negative impact of repository maximum audit log storage capacity.

#### 4.7 AU-5(2) Storage Capacity Warning (H)
A real-time alert shall be provided to service provider personnel with authority to address failed audit events: ISSM and Security Technical Administrators when the following audit failure events occur: audit failure events requiring real-time alerts, as defined by organization audit policy: Azure Sentinel Log forwarders
not responding and capacity alerts.

#### 4.8 AU-6 Audit Record Review, Analysis, and Reporting
System audit records shall be reviewed and analyzed at least weekly for indications of inappropriate or unusual activity related to account usage, as defined in the AC-2(12) control and its parameters and the potential
impact of the inappropriate or unusual activity. 

Findings shall be reported to Security Analysts and the ISSM.

The level of audit record review, analysis, and reporting within the system shall be adjusted when there is a change in risk based on law enforcement information, intelligence information, or other credible sources of
information.

#### 4.9 AU-6(1) Automated Process Integration
Audit record review, analysis, and reporting processes shall be integrated using Azure
Sentinel and TSP®.

#### 4.10 AU-6(3) Correlate Audit Record Repositories
Audit records across different repositories shall be correlated and analyzed to gain organization-wide situational awareness.

#### 4.11 AU-6(4) Central Review and Analysis (H)
The capability to centrally review and analyze audit records from multiple components within the system shall be provided and implemented.

#### 4.12 AU-6(5) Integrated Analysis of Audit Records (H)
Analysis of audit records shall be integrated with analysis of system monitoring information to further enhance the ability to identify inappropriate or unusual activity.

#### 4.13 AU-6(6) Correlation with Physical Monitoring (H)
Information from audit records shall be correlated with information obtained from monitoring physical access to further enhance the ability to identify suspicious,inappropriate, unusual, or malevolent activity.

#### 4.14 AU-6(7) Permitted Actions (H)
The permitted actions for each system process; role; user associated with the review, analysis, and reporting of audit record information shall be specified.

#### 4.15 AU-7 Audit Record Reduction and Report Generation
An audit record reduction and report generation capability shall be provided and implemented that:
Supports on-demand audit record review, analysis, and reporting requirements and after-the-fact investigations of incidents; and does not alter the original content or time ordering of audit records.

#### 4.16 AU-7(1) Automatic Processing
The capability to process, sort, and search audit records for events of interest based on the following content shall be provided and implemented: identities of individuals,event types, event locations, event times/dates, system resources involved, IP addresses involved, information objects accessed, network activity, and/or
resource usage.

#### 4.17 AU-8 Time Stamps
Internal system clocks to generate time stamps for audit records shall be used.

Time stamps for audit records shall be recorded that meet one second granularity of time measurement and that use Coordinated Universal Time,have a fixed local time offset from Coordinated Universal Time, or that include
the local time offset as of the time stamp.

#### 4.18 AU-9 Protection of Audit Information
Audit information and audit logging tools shall be protected from unauthorized access, modification, and deletion. 

ISSM and Security Technical Administrators shall be alerted upon detection of unauthorized access, modification, or deletion of audit information.

#### 4.19 AU-9(2) Store on Separate Physical Systems or Components (H)
Audit records shall be stored at least weekly in a repository that is part of a physically different system or system component than the system or component being audited.

#### 4.20 AU-9(3) Cryptographic Protection (H)
Cryptographic mechanisms shall be implemented to protect the integrity of audit information and audit tools.

#### 4.21 AU-9(4) Access by Subset of Privileged Users
Access to
management of audit logging functionality shall be authorized to only Security Technical Administrators and Security Analysts.

#### 4.22 AU-10 Non-Repudiation (H)
Irrefutable evidence that an individual (or process acting on behalf of an individual) has performed minimum actions including the addition, modification, deletion, approval, sending, or receiving of data shall be provided.

#### 4.23 AU-11 Audit Record Retention
Audit records shall be retained for a time period in compliance with M-21-31 to provide support fora fter-the-fact investigations of incidents and to meet regulatory and organizational information retention
requirements.

#### 4.24 AU-12 Audit Record Generation
Audit record generation capability shall be provided for the event types the system is capable of auditing as defined in AU-2a on all information system and network components where audit capability is deployed/available. 
The ISSM shall be allowed to select the event types that are to be logged by specific components of the system. 
Audit records for the event types defined in AU-2c that include the audit record content defined in AU-3 shall be generated.

#### 4.25 AU-12(1) System-wide and Time-correlated Audit Trail (H)
Audit records from all network, data storage, and computing devices shall be compiled into a system-wide (logical or physical) audit trail that is time-correlated to within the time tracking tolerance defined in AU-8.

#### 4.26 AU-12(3) Changes by Authorized Individuals (H)
The capability for Security Technical Administrators to change the logging to be performed on all network,
data storage, and computing devices based on event criteria defined in ITSM tickets within time thresholds defined in the associated ITSM ticket shall be provided and implemented.