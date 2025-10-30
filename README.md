### DocMachina. A desktop document engine.
##### Runs local. Saves local. Stays local.

---
### Purpose:  
- Reduce the time the compliance team spends on manual and repetative tasks associated with documentation.
- Reduce errors, and produce consistent documentation sets.
- See Section 3 below for more key benefits and use cases.

---
First Time Running Instructions:
1. Create a project folder, then download and extract to your project folder
2. Install Node.js from https://nodejs.org 
3. Open terminal/command prompt and cd to the project folder
4. Install dependencies (first time only): npm install
5. Run the app:  npm start

After that you only need to:
1. Open terminal/command prompt and cd to the project folder
2. Run the app:  npm start

### 1. Overview
DocMachina is a modular, locally-running desktop engine for document generation. It guides users through intake questionnaires and then generates completed documents in markdown, placing them directly in the app's customers/ folder. Functionality is based around customers, with each customer having their own dashboard.  

### 2. Core Philosophy: "Local-Always"
- DocMachina is designed to run locally on the user’s machine without reliance on cloud services, external libraries, or any other external dependencies.
- Users authenticate to their OS, which controls access to the application and its data files.
- The application has no internal auto-update functions. 
- Customer and application data are stored on the user's local machine, including customer data captured in intake forms.
- Generated documents are NOT saved.
- DocMachina is modular, and will only run utilizing locally installed and properly configured packs consisting of intake questionnaires and corresponding document templates.
- DocMachina can run on air-gapped machines.

### 3. Key Benefits and Use Cases
- Reduce time spent on documentation by eliminating redundant tasks.
- Easy to update / add more options. Installing a pack is as easy as dropping a new pack into your local packs/ folder.
- No online storage or connectivity supports speed, privacy, and security.
- Files in markdown are ready for easy conversion to other formats.
- Easy and intuitive user interface and file management.
- Consistent and professional results.
- Highly modular and adaptable to various environments and documentation needs with core functionality inherently built into the packs. See below for more information on pack structure and development.
  
### 4. Installation and Set Up

- Future installation instructions to be inserted here.

### 5. Technology, Tools, and Security
DocMachina was built with assistance from AI and is composed primarily of HTML, JavaScript, CSS, and JSON.

- Application Type: Offline desktop application (Electron-based)
- Data Storage: Local file system only
- Network: No external connections or dependencies
- User Model: Single user per machine 

#### Security Considerations
DocMachina has been designed with security best practices appropriate for an offline, local-first desktop application. This approach aligns with industry best practices for open-source desktop applications. The security model focuses on:

- Data integrity: Ensuring user data is stored and processed correctly
- Error prevention: Catching mistakes before they cause problems
- Graceful degradation: Handling unexpected input without crashing

- Key Security Principle: Since users control both the code and data on their own machines, the security focus is on preventing unintentional errors and ensuring data integrity rather than defending against malicious actors.

#### 5.1 The security model uses layers of protection:
- Input Layer: HTML maxlength attributes, type checking
- Processing Layer: Field name validation, safe DOM manipulation
- Output Layer: Markdown escaping, file name sanitization
- Browser Layer: Content Security Policy
- If one layer fails, others provide backup protection.

#### 5.2 Cross-Site Scripting (XSS) Prevention
	- Use textContent instead of innerHTML throughout the application
	- Created createSafeElement() utility function for safe DOM manipulation
	- Never use eval() or Function() constructor with user data

#### 5.3 Content Security Policy (CSP)
Allow 'unsafe-inline' for styles as this is standard for Electron apps and poses minimal risk in an offline context.

#### 5.4 Input Length Restrictions
- maxLength="500" attribute on all input fields
- validateInput() function with configurable length limits
- Prevents users from accidentally pasting huge amounts of data (like an entire document) into a single field, which could cause the application to slow down or the generated documents to be malformed.

#### 5.5 File Name Sanitization
- Critical protection: Prevents path traversal attacks (e.g., ../../sensitive-file.txt)
- Ensures cross-platform compatibility (different OS have different invalid characters)
- Prevents file system errors from special characters
- Limits length to avoid OS file name limits

#### 5.6 Output Encoding for Markdown
- Ensures generated markdown documents display correctly
- Prevents user input from breaking document formatting
- Blocks potential markdown injection that could create unintended links or formatting

#### 5.7 Template Field Name Validation
- Prevents special JavaScript property names (like __proto__ or constructor) from causing unexpected behavior
- Ensures template processing works reliably
- Documents what constitutes a valid field name

#### 5.8 Type Checking and Validation
- Type checks in validation functions (typeof value !== 'string')
- Structure validation for loaded JSON files
- Null/undefined handling throughout
- Prevents application crashes from malformed data and provides better error messages when something goes wrong.

#### 5.9 Browser Storage APIs (localStorage, sessionStorage)
Status: ❌ Not applicable
Reason: These APIs are not suitable for this Electron application. All data is stored via the main process to the file system for better control and security. This prevents any potential XSS attacks from accessing stored data.

#### 5.10. Server-Side Input Validation
Status: ❌ Not applicable
Reason: No server exists. All validation happens client-side, which is appropriate since users control both the code and the data. There's no untrusted network boundary to protect.

#### 5.11 SQL Injection Prevention
Status: ❌ Not applicable
Reason: No database is used. All data is stored as JSON files, which are not vulnerable to SQL injection attacks.

#### 5.12 Authentication/Authorization
Status: ❌ Not implemented
Reason: Single-user desktop application with no network access. Users authenticate to their OS, which controls access to the application and its data files.

#### 5.13 Strict JavaScript Validation Beyond Length
Status: ❌ Intentionally permissive
Validation function allows most characters because:
Users may legitimately need special characters (e.g., "O'Reilly & Associates")
Output encoding (escapeForMarkdown()) handles dangerous characters at the point of use
File name sanitization handles file system concerns
Users can only affect their own data

### 6. User Guide / Functionality
Upon launch, DocMachina is designed to dynamically scan the /packs folder to determine what buttons to display in the Main Menu on the landing page.  Clicking a pack's button from the main menu launches the general intake for that pack. Save/Next will then take the user to the customer's dashboard.  The app will then scan the the pack's own intakes/folder (future feature: and otherintakes/folder) to dynamically determine what to display in the dashboard sections. Each pack will be different depending on its purpose.

#### 6.1 Updating DocMachina.
To maintain DocMachina's key feature of local-always, the app and packs are not designed for auto-updates.   

### 7. Pack Development
To be compatible with DocMachina:

- Every pack must have at least one general intake (json) and at least one template (md).
- The general intake must be located in the pack's root folder (examples below).
##### Important: DocMachina uses the pack name to determine what to launch when clicking the pack's button from the Main Menu, so the pack's general intake must follow the proper file name and folder path convention.

Examples:

- PACK_NAME/	pack-name-general.json<br>
- AWS_Fedramp/	aws-fedramp-general.json<br> 
- ABC/			abc-general.json<br> 

DocMachina uses the customerName field for the file id so it is the minimun required field in every general intake.  
The following is an example of a standard pack design, ideal for document packages where multiple documents share common fields (e.g., `customerName`) but several documents also require document-specific inputs such as Policies and Procedures for FISMA/FedRAMP requirements. 

DocMachina/packs
--AWS_FedRAMP/
--aws-fedramp-general.json     
--intakes/
---- ac.json
---- at.json
---- etc.
-- otherintakes/
-- templates/
---- frontmatter.md
---- ac-policy.md
---- ac-procedure.md
GCP_FedRAMP/
					
### 8. Future Development Ideas
- Add-on module(s) to generate additional formats (e.g., OSCAL, DOCX).
- Add-on module(s) to interface with external systems (to upload to SharePoint, CSAM, TBD).
- Custom pack creator module
