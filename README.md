### DocMachina. A desktop document engine.
##### Runs local. Saves local. Stays local.

---

### 1. Overview

DocMachina is a modular, locally-running desktop engine for document generation. It guides users through intake questionnaires and then generates completed documents in markdown, placing them directly in the user’s local downloads folder. Functionality is based around customers, with each customer having their own dashboard and separate file storage.  

### 2. Core Philosophy: "Local-Always"
- DocMachina is designed to run locally on the user’s machine without reliance on cloud services, external libraries, or any other external dependencies.
- The application does not auto-update. Please see the update section below for more details.
- Customer and application data are stored on the user's local machine within the app's file structure, including customer data captured in intake forms. Generated documents are NOT saved but are placed in the user's downloads fodler.
- DocMachina is modular, and will only run utilizing locally installed and properly configured packs consisting of intake questionnaires and corresponding document templates.
- DocMachina can run on air-gapped machines.

### 3. Key Benefits and use cases
- Reduce time spent on documentation by eliminating redundant tasks.
- No online storage or connectivity supports privacy and security.
- Files in markdown are ready for easy conversion to other formats.
- Easy and intuitive user interface and file management.
- Consistent and professional results.
- Highly modular and adaptable to various environments and documentation needs with core functionality inherently built into the packs. See below for more information on pack structure and development.
- Installing a pack is as easy as dropping a new pack into your local packs/ folder.
  
### 4. Installation and Set Up

- Installation instructions to be inserted here.

### 5. Technology and Tools

- DocMachina was built with assistance from AI and is composed primarily of HTML, JavaScript, CSS, and JSON. 

### 6. User Guide / Functionality
DocMachina is designed to dynamically scan the /packs folder to determine what buttons to display in the Main Menu on the landing page.  Clicking a pack's button from the main menu launches the general intake for that pack. Save/Next will then take the user to the customer's dashboard.  The app will then scan the the pack's own intakes/folder and otherintakes/folder to dynamically determine what to display in the dashboard sections. Each pack will be diffferent depending on its purpose.

#### 6.1 Updating DocMachina.
To maintain DocMachina's key feature of local-always, the app and packs are not designed for auto-updates.   

### 7. Pack Development

To be compatible with DocMachina:

- Every pack must have at least one general intake (json) and at least one template (md).
- The general intake must be located in the pack's root folder (examples below).
- DocMachina uses the pack name to determine what to launch when clicking the pack's button from the Main Menu, so general intakes must follow the proper file name and folder path convention.

Examples:

- PACK_NAME/	pack-name-general.json
- AWS_Fedramp/	aws-fedramp-general.json 
- ABC/			abc-general.json 

DocMachina uses the customerName field for the file id so it is the minimun required field in every general intake.  

DocMachina will scan the pack's own intakes/ folder to dynamically determine what buttons to display in the main section of the customer's dashboard.   If your pack has another "set" of intakes in the otherintakes/ folder the app will scan and display those in the secondary section of the dashboard.

The following is an example of a standard two-tier pack design, ideal for document packages where multiple documents share common fields (e.g., `customerName`) but several documents also require document-specific inputs such as Policies and Procedures for FISMA/FedRAMP requirements. 

DocMachina/packs<br>
--AWS_FedRAMP/<br>
--aws-fedramp-general.json <br>        
--intakes/<br>
---- ac.json<br>
---- at.json<br>
---- etc.<br>

-- otherintakes/<br>
---- app-s-sod.json<br>
---- app-r-roles.json<br>

-- templates/<br>
---- ac-policy.md<br>
---- ac-procedure.md<br>
---- app-s-sod.md<br>

GCP_FedRAMP/<br>
   
					
### 8. Future Development Ideas

- Add-on module(s) to generate additional formats (e.g., OSCAL, DOCX).
- Add-on module(s) to interface with external systems (to upload to SharePoint, CSAM, TBD).
- Custom pack creator module
