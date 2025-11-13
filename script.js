document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const landingPageSection = document.getElementById('landing-page'); // New landing page container
    const packsContainer = document.getElementById('packs-container');
    const loadingPacks = document.getElementById('loading-packs');
    const intakeFormSection = document.getElementById('intake-form-section');
    const customerDashboardSection = document.getElementById('customer-dashboard-section');
    const customerLibrarySection = document.getElementById('customer-library-section'); // New library container
    const aboutSection = document.getElementById('about-section');
    const libraryTableBody = document.getElementById('library-table-body'); // New table body
    const activeIntakeForm = document.getElementById('active-intake-form');
    const intakeTitle = document.getElementById('intake-title');
    const navTop = document.querySelector('#intake-form-section .top-nav');
    const navBottom = document.querySelector('#intake-form-section .bottom-nav');
    const controlFamilyContainer = document.getElementById('control-family-intakes-container');
    const otherDocumentsContainer = document.getElementById('other-documents-container');
    
    // Dashboard Elements
    const dashboardCustomerName = document.getElementById('dashboard-customer-name');
    const dashboardPackName = document.getElementById('dashboard-pack-name');
	const dashboardAssuranceLevel = document.getElementById('dashboard-assurance-level'); 

    // Persistent Header Buttons
    const btnHome = document.getElementById('btn-home');
    const btnHeaderFolder = document.getElementById('btn-header-folder');
    const btnHeaderLibrary = document.getElementById('btn-header-library');
    const btnHeaderAbout = document.getElementById('btn-header-about');
    
    // FIX: CODE FOR THE "Open Customer Folder" BUTTON (Removed redundant DOMContentLoaded wrapper)
    const openFolderButton = document.getElementById('btn-open-folder');

    if (openFolderButton) {
        openFolderButton.addEventListener('click', async (event) => {
            // Prevent default action (like form submission)
            event.preventDefault(); 
            
            // ELECTRON: Open customers folder
            await window.electronAPI.openCustomersFolder();
        });
    }
	
    // --- Application State ---
    let currentCustomer = { 
        name: null, 
        packFolder: null,
        packName: null,
        intakeData: {} // Stores all saved intake data (general + control families)
    };
    let activeIntakeKey = null; // Key for the currently open intake (e.g., 'general', 'ac', 'at')
    
    // Library sorting state
    let librarySortColumn = 'name'; // Default sort by name
    let librarySortAscending = true; // Default ascending order

    // --- Utility Functions ---
    function formatPackName(folderName) {
        return folderName.replace(/_/g, ' ').toUpperCase();
    }
    
    function formatIntakeKey(fileName) {
        // Converts 'ac-intake-aws.json' to 'ac'
        return fileName.split('-intake')[0];
    }

    function nowFormatted() {
        return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    
    function nowFullDateFormatted() {
        return new Date().toLocaleString();
    }
    
    function formatDateOnly(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function showSuccessDialogue(message) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        // Create dialogue box
        const dialogue = document.createElement('div');
        dialogue.style.cssText = `
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            text-align: center;
        `;
        
        // Add message
        const messageP = document.createElement('p');
        messageP.textContent = message;
        messageP.style.cssText = `
            margin-bottom: 20px;
            font-size: 16px;
            color: #333;
        `;
        
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 10px;
            justify-content: center;
        `;
        
        // Add "View Files" button
        const viewFilesBtn = document.createElement('button');
        viewFilesBtn.textContent = 'View Files';
        viewFilesBtn.className = 'primary';
        viewFilesBtn.onclick = async () => {
            await window.electronAPI.openCustomersFolder();
            document.body.removeChild(overlay);
        };
        
        // Add "OK" button
        const okBtn = document.createElement('button');
        okBtn.textContent = 'OK';
        okBtn.className = 'secondary';
        okBtn.onclick = () => {
            document.body.removeChild(overlay);
        };
        
        // Assemble the dialogue
        buttonContainer.appendChild(viewFilesBtn);
        buttonContainer.appendChild(okBtn);
        dialogue.appendChild(messageP);
        dialogue.appendChild(buttonContainer);
        overlay.appendChild(dialogue);
        document.body.appendChild(overlay);
    }

    function showView(viewId) {
    // Hide all main sections
    [landingPageSection, intakeFormSection, customerDashboardSection, customerLibrarySection, aboutSection].forEach(section => {
        section.style.display = 'none';
        // Remove grid class if it exists
        section.classList.remove('landing-page-grid');
    });
    // Show the desired section
    const targetSection = document.getElementById(viewId);
    targetSection.style.display = 'block';
    // Re-add grid class only to landing page
    if (viewId === 'landing-page') {
        targetSection.classList.add('landing-page-grid');
    }
}
    // --- Data Persistence (Simulating file storage using localStorage) ---

    // Function to get ALL saved customer keys from localStorage
    async function getAllCustomerKeys() {
        // ELECTRON: Replace localStorage with Electron storage
        const allKeys = await window.electronAPI.storageGetAllKeys();
        return allKeys.filter(key => key.startsWith('customer_'));
    }
    
    async function saveCustomerData(intakeKey, data, lastSavedTime = null) {
        const customerId = currentCustomer.name;
        if (!customerId) return;
        
        const timestamp = lastSavedTime || nowFullDateFormatted();
        
        // Update current customer state
        currentCustomer.intakeData[intakeKey] = {
            data: data,
            saved: timestamp
        };
        
        // Ensure metadata is updated on general intake save
        if (intakeKey === 'general') {
            currentCustomer.lastSaved = nowFullDateFormatted();
        }
        
        // Save to local storage
        // ELECTRON: Replace localStorage with Electron storage
        await window.electronAPI.storageSet(`customer_${customerId}`, JSON.stringify(currentCustomer));
    }
    
    async function loadCustomer(customerName) {
        // ELECTRON: Replace localStorage with Electron storage
        const data = await window.electronAPI.storageGet(`customer_${customerName}`);
        if (data) {
            currentCustomer = JSON.parse(data);
            return true;
        }
        return false;
    }
    
    async function saveAndClose(navigate) {
        // 1. Get data
        const formData = new FormData(activeIntakeForm);
        
        // Handle checkboxes specially - need to collect all checked values
        const data = {};
        const checkboxFields = new Set();
        
        // First pass: identify checkbox fields and collect their values
        activeIntakeForm.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkboxFields.add(checkbox.name);
        });
        
        // Second pass: collect all form data
        for (const [key, value] of formData.entries()) {
            if (checkboxFields.has(key)) {
                // For checkboxes, collect all values as an array
                if (!data[key]) {
                    data[key] = formData.getAll(key);
                }
            } else {
                // For other fields, just use the single value
                data[key] = value;
            }
        }
        
        // Validation check for mandatory fields (Customer Name only for general intake)
        if (activeIntakeKey === 'general') {
             const customerName = data.customerName ? data.customerName.trim() : '';
             if (!customerName) {
                alert('Customer Name is a mandatory field.');
                document.querySelector('input[name="customerName"]').focus();
                return false;
            }
            // If the customer name has changed, we treat it as a new customer (or a rename)
            if (currentCustomer.name && currentCustomer.name !== customerName) {
                // ELECTRON: Replace localStorage with Electron storage
                await window.electronAPI.storageRemove(`customer_${currentCustomer.name}`); // delete old entry
            }
            currentCustomer.name = customerName;
        }
        
        // 2. Save data
        const saveTime = nowFullDateFormatted();
        await saveCustomerData(activeIntakeKey, data, saveTime); // Pass the full date/time

        // 3. Navigate
        if (navigate === 'dashboard' || navigate === 'close') {
            await renderDashboard(); // 1d. Next saves and goes to dashboard. 3a. Close saves and goes to dashboard.
        } else if (navigate === 'stay' || navigate === 'none') {
            updateLastSavedTime(saveTime); 
            if (navigate === 'stay') {
                 alert(`Saved ${activeIntakeKey} intake. Remaining on page.`);
            }
        }
        return true;
    }

    // --- View Rendering ---

    /**
     * 1a. Loads and displays pack buttons and sets up the landing page.
     */
    async function loadLandingPage() {
        showView('landing-page');

        // Setup Customer Management button (4a)
        // This is now done in loadLandingPage as it is the landing page setup
        /* document.getElementById('btn-open-library').onclick = renderLibrary; */ 
        
        packsContainer.innerHTML = '';
        loadingPacks.style.display = 'block';
        try {
            // ELECTRON: Replace fetch with Electron API
            const packNames = await window.electronAPI.getPacks();
            loadingPacks.style.display = 'none';
            
            if (packNames.length === 0) {
                packsContainer.innerHTML = '<p>No document packs found in the /packs folder.</p>';
                return;
            }
            
            packNames.forEach(packFolder => {
                const button = document.createElement('button');
                button.textContent = formatPackName(packFolder); 
                button.className = 'pack-button';
                button.dataset.packFolder = packFolder; 
                button.addEventListener('click', () => {
                    handlePackClick(packFolder); // Start new customer flow
                });
                packsContainer.appendChild(button);
            });

        } catch (error) {
            console.error('Error loading packs:', error);
            loadingPacks.textContent = 'Error loading packs.';
            loadingPacks.style.color = 'red';
        }
    }
    
    /**
     * 4a. Renders the Customer Library page.
     */
    async function renderLibrary() {
        showView('customer-library-section'); //
        libraryTableBody.innerHTML = ''; //
               
        const customerKeys = await getAllCustomerKeys(); //
        
        if (customerKeys.length === 0) { //
            libraryTableBody.innerHTML = '<tr><td colspan="3">No customers saved yet.</td></tr>'; //
            return;
        }

        // Build array of customer objects for sorting
        const customers = [];
        for (const key of customerKeys) { //
            // ELECTRON: Replace localStorage with Electron storage
            const rawData = await window.electronAPI.storageGet(key); //
            const customer = JSON.parse(rawData); //
            
            // --- FIX: Add a data validation check to skip corrupted records ---
            if (!customer || !customer.name || !customer.packName) {
                console.warn(`Skipping corrupted customer record for key: ${key}. Data not displayed.`);
                continue; // Skips this iteration and moves to the next customer
            }
            
            customers.push(customer);
        }
        
        // Sort customers based on current sort column and direction
        customers.sort((a, b) => {
            let aVal, bVal;
            
            if (librarySortColumn === 'name') {
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
            } else if (librarySortColumn === 'pack') {
                aVal = a.packName.toLowerCase();
                bVal = b.packName.toLowerCase();
            } else if (librarySortColumn === 'date') {
                aVal = new Date(a.lastSaved || 0).getTime();
                bVal = new Date(b.lastSaved || 0).getTime();
            }
            
            if (aVal < bVal) return librarySortAscending ? -1 : 1;
            if (aVal > bVal) return librarySortAscending ? 1 : -1;
            return 0;
        });
        
        // Render sorted customers
        customers.forEach(customer => {
            const row = libraryTableBody.insertRow(); //
            
            // Customer Name (Clickable link to dashboard)
            const nameCell = row.insertCell(); //
            nameCell.innerHTML = `<span class="customer-name-link">${customer.name}</span>`; //
            nameCell.onclick = async () => { //
                await loadCustomer(customer.name); // Load customer state //
                await renderDashboard(); //
            };
            
            // Pack
            row.insertCell().textContent = customer.packName; //
            
            // Last Saved (using the metadata property)
            row.insertCell().textContent = customer.lastSaved || 'N/A'; //
        });
        
        // Update sort arrows in header
        updateSortArrows();
    }
    
    /**
     * Updates the sort arrow indicators in table headers
     */
    function updateSortArrows() {
        // Get all sortable headers
        const headers = document.querySelectorAll('#customer-library-table th.sortable');
        
        headers.forEach(header => {
            const column = header.getAttribute('data-column');
            const arrow = header.querySelector('.sort-arrow');
            
            if (column === librarySortColumn) {
                // This is the active sort column
                arrow.textContent = librarySortAscending ? '↑' : '↓';
                arrow.style.opacity = '1';
            } else {
                // Inactive columns show neutral arrow
                arrow.textContent = '⇅';
                arrow.style.opacity = '0.3';
            }
        });
    }
    
    /**
     * Sets up click handlers for sortable table headers
     */
    function setupLibrarySorting() {
        const headers = document.querySelectorAll('#customer-library-table th.sortable');
        
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.style.userSelect = 'none';
            
            header.addEventListener('click', () => {
                const column = header.getAttribute('data-column');
                
                // If clicking the same column, toggle direction
                if (librarySortColumn === column) {
                    librarySortAscending = !librarySortAscending;
                } else {
                    // New column, default to ascending
                    librarySortColumn = column;
                    librarySortAscending = true;
                }
                
                // Re-render with new sort
                renderLibrary();
            });
        });
    }

    /**
     * 1b. Handles pack click, initializes customer state, and loads general intake.
     */
    async function handlePackClick(packFolder) {
        const packName = formatPackName(packFolder);
        
        // Initialize state for a new customer
        currentCustomer = { 
            name: null, 
            packFolder: packFolder,
            packName: packName,
            intakeData: {}
        };
        
        // General intake path is standardized
        const intakeFileName = `${packFolder.toLowerCase().replace(/_/g, '-')}-general.json`;
        const intakePath = `/packs/${packFolder}/${intakeFileName}`;
        
        await loadIntake(intakePath, 'general');
    }
    
    /**
     * Loads the JSON, renders the form, and sets up buttons.
     */
    async function loadIntake(intakePath, intakeKey) {
        activeIntakeKey = intakeKey;
        
        try {
            // ELECTRON: Replace fetch with Electron API
            const intakeData = await window.electronAPI.readIntake(intakePath);
            
            // FIX: This check ensures the JSON root key is 'questions'
            if (!intakeData || !Array.isArray(intakeData.questions)) {
                throw new Error(`Intake data for ${intakeKey} is malformed. Missing 'questions' array. (Check for 'fields' root key)`);
            }

            // Render the form and load existing data
            renderIntakeForm(intakeData, intakeKey);
            
            // Set up navigation buttons based on intake type
            if (intakeKey === 'general') {
                setupGeneralIntakeNav(); // 1c, 1d
            } else {
                setupControlIntakeNav(intakeKey); // 3a, 3b
            }
            
            showView('intake-form-section');

        } catch (error) {
            console.error('Error loading intake form:', error);
            alert(`Could not load intake. Details: ${error.message}`);
            // Fallback to landing page on critical error
            showView('landing-page');
        }
    }

    function renderIntakeForm(intakeData, intakeKey) {
        // Set form title dynamically
        intakeTitle.textContent = `${intakeKey.toUpperCase()} Intake Form`;
        
        // Clear form
        activeIntakeForm.innerHTML = '';
        
        // Get existing data if any
        const savedIntake = currentCustomer.intakeData[intakeKey];
        const savedData = savedIntake ? savedIntake.data : {};
        
        // Populate form fields
        intakeData.questions.forEach(question => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = question.label;
            if (question.required) {
                label.classList.add('required-field');
            }
            formGroup.appendChild(label);

            // Handle radio buttons differently
            if (question.type === 'radio' && question.options) {
                const radioContainer = document.createElement('div');
                radioContainer.className = 'radio-group';
                
                question.options.forEach((option, index) => {
                    const radioWrapper = document.createElement('div');
                    radioWrapper.className = 'radio-option';
                    
                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.id = `${question.name}-${index}`;
                    input.name = question.name;
                    input.value = option.value;
                    input.required = question.mandatory || false;
                    
                    // Check if this option was previously saved
                    if (savedData[question.name] === option.value) {
                        input.checked = true;
                    }
                    
                    const optionLabel = document.createElement('label');
                    optionLabel.setAttribute('for', `${question.name}-${index}`);
                    optionLabel.textContent = option.label;
                    
                    radioWrapper.appendChild(input);
                    radioWrapper.appendChild(optionLabel);
                    radioContainer.appendChild(radioWrapper);
                });
                
                formGroup.appendChild(radioContainer);
            } else if (question.type === 'checkbox' && question.options) {
                // Handle checkboxes with multiple options
                const checkboxContainer = document.createElement('div');
                checkboxContainer.className = 'checkbox-group';
                
                // Saved data for checkboxes should be an array
                const savedValues = Array.isArray(savedData[question.name]) 
                    ? savedData[question.name] 
                    : (savedData[question.name] ? [savedData[question.name]] : []);
                
                question.options.forEach((option, index) => {
                    const checkboxWrapper = document.createElement('div');
                    checkboxWrapper.className = 'checkbox-option';
                    
                    const input = document.createElement('input');
                    input.type = 'checkbox';
                    input.id = `${question.name}-${index}`;
                    input.name = question.name;
                    input.value = option.value;
                    
                    // Check if this option was previously saved
                    if (savedValues.includes(option.value)) {
                        input.checked = true;
                    }
                    
                    const optionLabel = document.createElement('label');
                    optionLabel.setAttribute('for', `${question.name}-${index}`);
                    optionLabel.textContent = option.label;
                    
                    checkboxWrapper.appendChild(input);
                    checkboxWrapper.appendChild(optionLabel);
                    checkboxContainer.appendChild(checkboxWrapper);
                });
                
                formGroup.appendChild(checkboxContainer);
            } else {
                // Handle regular input fields
                label.setAttribute('for', question.name);
                
                const input = document.createElement('input');
                input.type = question.type || 'text';
                input.id = question.name;
                input.name = question.name;
                input.placeholder = question.placeholder || '';
                input.required = question.mandatory || false;
                
                // Populate with saved data
                if (savedData[question.name]) {
                    input.value = savedData[question.name];
                }
                
                formGroup.appendChild(input);
            }

            activeIntakeForm.appendChild(formGroup);
        });
    }
    
    // --- Navigation Setup ---

    function updateLastSavedTime(time) {
        let span = navBottom.querySelector('.last-saved-time');
        if (!span) {
            span = document.createElement('span');
            span.className = 'last-saved-time';
            navBottom.prepend(span);
        }
        span.textContent = `Last Saved: ${time}`;
    }

    function setupGeneralIntakeNav() {
        navTop.innerHTML = '';
        navBottom.innerHTML = '';
        
        // 1c, 1d.
        const saveBtn = `<button class="secondary" onclick="event.preventDefault(); window.saveAndNavigate('stay')">Save</button>`;
        const nextBtn = `<button class="primary" onclick="event.preventDefault(); window.saveAndNavigate('dashboard')">Next</button>`;
        
        navTop.innerHTML = saveBtn + nextBtn;
        navBottom.innerHTML = saveBtn + nextBtn;
    }

    function setupControlIntakeNav(intakeKey) {
        navTop.innerHTML = '';
        navBottom.innerHTML = '';

        const savedTime = currentCustomer.intakeData[intakeKey]?.saved || 'Never';
        
        // 3a, 3b.
	const generateBtn = `<button class="primary" onclick="event.preventDefault(); generateDocsForIntake('${intakeKey}')">Generate Documents</button>`;
	const saveCloseBtn = `<button class="secondary" onclick="event.preventDefault(); window.saveAndNavigate('close')">Save and Close</button>`;
        
        navTop.innerHTML = generateBtn;
        navBottom.innerHTML = generateBtn + saveCloseBtn;
    }
    
    // Global function for generate button
    window.generateDocsForIntake = async function(intakeKey) {
        await generateDocuments(intakeKey);
    };

    async function generateDocuments(intakeKey) {
       /*
	   if (!confirm('Generate policy and procedure documents?')) {
            return;
        }
		*/

        // Collect ALL intake data for template substitution
        const allData = {};
        
        // Merge general intake data
        if (currentCustomer.intakeData.general?.data) {
            Object.assign(allData, currentCustomer.intakeData.general.data);
        }
        
        // Merge current control family intake data if available
        if (currentCustomer.intakeData[intakeKey]?.data) {
            Object.assign(allData, currentCustomer.intakeData[intakeKey].data);
        }
        
        const systemAcronym = allData.customerSystemAcronym || 'SYS';
        const packShortName = currentCustomer.packFolder.toLowerCase().split('_')[0]; 
        
        // Path is corrected to use the format <control>-<type>-<pack>.md (e.g., ac-policy-aws.md)
        const policyPath = `/packs/${currentCustomer.packFolder}/templates/${intakeKey}-policy-${packShortName}.md`;
        const procedurePath = `/packs/${currentCustomer.packFolder}/templates/${intakeKey}-procedure-${packShortName}.md`;
        
        
        const generateAndDownload = async (templatePath, docType) => {
             try {
                 // Step 1: Try to load frontmatter template
                 const frontmatterPath = `/packs/${currentCustomer.packFolder}/templates/frontmatter.md`;
                 let frontmatterContent = '';
                 
                 try {
                     // ELECTRON: Replace fetch with Electron API
                     frontmatterContent = await window.electronAPI.readTemplate(frontmatterPath);
                     console.log(`Loaded frontmatter template for ${docType}`);
                 } catch (frontmatterError) {
                     // Frontmatter is optional, so we just log and continue
                     console.log(`No frontmatter.md found, using template only`);
                 }
                 
                 // Step 2: Load the control-specific template
                 // ELECTRON: Replace fetch with Electron API
                 let templateContent = await window.electronAPI.readTemplate(templatePath);
                 
                 // Step 3: Merge frontmatter with template
                 let content = '';
                 if (frontmatterContent) {
                     // Check if template has the merge marker
                     if (templateContent.includes('<!-- CONTROL_SPECIFIC_CONTENT -->')) {
                         // Replace the marker with template content
                         content = frontmatterContent.replace(
                             '<!-- CONTROL_SPECIFIC_CONTENT -->', 
                             templateContent
                         );
                     } else {
                         // No marker, just concatenate frontmatter + template
                         content = frontmatterContent + '\n\n' + templateContent;
                     }
                 } else {
                     // No frontmatter, use template as-is
                     content = templateContent;
                 }
                 
                 // Add control family metadata to allData for placeholder replacement
                 const controlFamilyMap = {
                     'ac': 'Access Control',
                     'at': 'Awareness and Training',
                     'au': 'Audit and Accountability',
                     'ca': 'Assessment, Authorization, and Monitoring',
                     'cm': 'Configuration Management',
                     'cp': 'Contingency Planning',
                     'ia': 'Identification and Authentication',
                     'ir': 'Incident Response',
                     'ma': 'Maintenance',
                     'mp': 'Media Protection',
                     'pe': 'Physical and Environmental Protection',
                     'pl': 'Planning',
                     'pm': 'Program Management',
                     'ps': 'Personnel Security',
                     'pt': 'PII Processing and Transparency',
                     'ra': 'Risk Assessment',
                     'sa': 'System and Services Acquisition',
                     'sc': 'System and Communications Protection',
                     'si': 'System and Information Integrity',
                     'sr': 'Supply Chain Risk Management'
                 };
                 
                 // Add computed fields for placeholders
                 allData.controlFamilyAcronym = intakeKey.toUpperCase();
                 allData.controlFamilyName = controlFamilyMap[intakeKey.toLowerCase()] || intakeKey.toUpperCase();
                 
                 // Step 5: Perform comprehensive template substitution
                 // Replace {{fieldName}} with actual values from intake data
                 Object.keys(allData).forEach(fieldName => {
                     const regex = new RegExp(`{{${fieldName}}}`, 'g');
                     const value = allData[fieldName] || '';
                     content = content.replace(regex, value);
                 });
                 
                 // Also handle legacy [[FIELD_NAME]] format if present
                 content = content.replace(/\[\[SYSTEM_ACRONYM\]\]/g, systemAcronym);

                 // ELECTRON: Save document instead of browser download
                 const finalFileName = `${systemAcronym}_${intakeKey.toUpperCase()}_${docType}.md`;
                 const result = await window.electronAPI.saveDocument(finalFileName, content, currentCustomer.name);
                 
                 if (result.success) {
                     console.log(`Generated ${docType} successfully`);
                     return true;
                 } else {
                     console.error(`Failed to save ${docType}`);
                     return false;
                 }
                 
             } catch (error) {
                 console.error(`Error generating ${intakeKey} ${docType}:`, error);
                 alert(`Failed to generate ${docType}. See console for details.`);
                 return false;
             }
        };
        
        let successCount = 0;
        const policySuccess = await generateAndDownload(policyPath, 'Policy');
        if (policySuccess) successCount++;
        
        const procedureSuccess = await generateAndDownload(procedurePath, 'Procedure');
        if (procedureSuccess) successCount++;
        
        if (successCount > 0) {
            showSuccessDialogue(`Successfully generated ${successCount} document(s)!`);
        }
    }

    /**
     * 1d. Renders the Customer Dashboard view after saving general intake.
     */
    async function renderDashboard() {
        showView('customer-dashboard-section');
        
        // Display customer name
        dashboardCustomerName.textContent = currentCustomer.name || 'N/A';
        dashboardPackName.textContent = currentCustomer.packName || 'N/A';
        
        // Display assurance level from general intake
        const generalData = currentCustomer.intakeData.general?.data || {};
        const assuranceLevel = generalData.assuranceLevel || 'N/A';
        dashboardAssuranceLevel.textContent = `Assurance Level: ${assuranceLevel}`;

        // Clear and load control family buttons
        controlFamilyContainer.innerHTML = '';
        await loadControlFamilyButtons();
        
        // Clear and load "Other Documents" buttons
        otherDocumentsContainer.innerHTML = '';
        await loadOtherDocumentButtons();
        
        // Setup dashboard button handlers
        document.getElementById('btn-return-to-general').onclick = async () => {
             const packFolder = currentCustomer.packFolder;
             const intakeFileName = `${packFolder.toLowerCase().replace(/_/g, '-')}-general.json`;
             const intakePath = `/packs/${packFolder}/${intakeFileName}`;
             await loadIntake(intakePath, 'general');
        };
        
        document.getElementById('btn-generate-all').onclick = async () => {
            if (!confirm('Generate all 36 documents (18 policies + 18 procedures)? This may take a moment.')) {
                return;
            }
            
            const controlFamilies = ['ac', 'at', 'au', 'ca', 'cm', 'cp', 'ia', 'ir', 'ma', 'mp', 'pe', 'pl', 'pm', 'ps', 'pt', 'ra', 'sa', 'sc'];
            let successCount = 0;
            let failCount = 0;
            
            for (const intakeKey of controlFamilies) {
                // Collect ALL intake data for template substitution
                const allData = {};
                
                // Merge general intake data
                if (currentCustomer.intakeData.general?.data) {
                    Object.assign(allData, currentCustomer.intakeData.general.data);
                }
                
                // Merge current control family intake data if available
                if (currentCustomer.intakeData[intakeKey]?.data) {
                    Object.assign(allData, currentCustomer.intakeData[intakeKey].data);
                }
                
                const systemAcronym = allData.customerSystemAcronym || 'SYS';
                const packShortName = currentCustomer.packFolder.toLowerCase().split('_')[0];
                
                const policyPath = `/packs/${currentCustomer.packFolder}/templates/${intakeKey}-policy-${packShortName}.md`;
                const procedurePath = `/packs/${currentCustomer.packFolder}/templates/${intakeKey}-procedure-${packShortName}.md`;
                
                const generateDoc = async (templatePath, docType) => {
                    try {
                        // Load frontmatter
                        const frontmatterPath = `/packs/${currentCustomer.packFolder}/templates/frontmatter.md`;
                        let frontmatterContent = '';
                        
                        try {
                            // ELECTRON: Replace fetch with Electron API
                            frontmatterContent = await window.electronAPI.readTemplate(frontmatterPath);
                        } catch (e) {}
                        
                        // Load template
                        // ELECTRON: Replace fetch with Electron API
                        let templateContent = await window.electronAPI.readTemplate(templatePath);
                        
                        // Merge
                        let content = '';
                        if (frontmatterContent) {
                            if (templateContent.includes('<!-- CONTROL_SPECIFIC_CONTENT -->')) {
                                content = frontmatterContent.replace('<!-- CONTROL_SPECIFIC_CONTENT -->', templateContent);
                            } else {
                                content = frontmatterContent + '\n\n' + templateContent;
                            }
                        } else {
                            content = templateContent;
                        }
                        
                        // Add control family metadata
                        const controlFamilyMap = {
                            'ac': 'Access Control',
                            'at': 'Awareness and Training',
                            'au': 'Audit and Accountability',
                            'ca': 'Assessment, Authorization, and Monitoring',
                            'cm': 'Configuration Management',
                            'cp': 'Contingency Planning',
                            'ia': 'Identification and Authentication',
                            'ir': 'Incident Response',
                            'ma': 'Maintenance',
                            'mp': 'Media Protection',
                            'pe': 'Physical and Environmental Protection',
                            'pl': 'Planning',
                            'pm': 'Program Management',
                            'ps': 'Personnel Security',
                            'pt': 'PII Processing and Transparency',
                            'ra': 'Risk Assessment',
                            'sa': 'System and Services Acquisition',
                            'sc': 'System and Communications Protection'
                        };
                        
                        allData.controlFamilyAcronym = intakeKey.toUpperCase();
                        allData.controlFamilyName = controlFamilyMap[intakeKey.toLowerCase()] || intakeKey.toUpperCase();
                        
                        // Replace placeholders
                        Object.keys(allData).forEach(fieldName => {
                            const regex = new RegExp(`{{${fieldName}}}`, 'g');
                            content = content.replace(regex, allData[fieldName] || '');
                        });
                        
                        content = content.replace(/\[\[SYSTEM_ACRONYM\]\]/g, systemAcronym);
                        
                        // ELECTRON: Save document instead of browser download
                        const filename = `${systemAcronym}_${intakeKey.toUpperCase()}_${docType}.md`;
                        const result = await window.electronAPI.saveDocument(filename, content, currentCustomer.name);
                        
                        return result.success;
                    } catch (error) {
                        console.error(`Error generating ${intakeKey} ${docType}:`, error);
                        return false;
                    }
                };
                
                const policySuccess = await generateDoc(policyPath, 'Policy');
                const procedureSuccess = await generateDoc(procedurePath, 'Procedure');
                
                if (policySuccess) successCount++;
                else failCount++;
                
                if (procedureSuccess) successCount++;
                else failCount++;
            }
            
            showSuccessDialogue(`Generation complete!\nSuccess: ${successCount}\nFailed: ${failCount}`);
        };
        
        document.getElementById('btn-delete-customer').onclick = async () => {
             // 2a. Delete Customer
             if(confirm(`Are you sure you want to delete all data for ${currentCustomer.name}?`)) {
                 // ELECTRON: Replace localStorage with Electron storage
                 await window.electronAPI.storageRemove(`customer_${currentCustomer.name}`);
                 currentCustomer = { name: null, packFolder: null, packName: null, intakeData: {} };
                 await renderLibrary(); // Go back to the library view
             }
        };
    }
    
    /**
     * 2a. Fetch intake file names from server and display buttons.
     */
    async function loadControlFamilyButtons() {
        const packFolder = currentCustomer.packFolder;

        if (!packFolder) {
            console.error('CRITICAL: Pack folder is undefined. Cannot load intakes.');
            controlFamilyContainer.innerHTML = '<p style="grid-column: 1 / span 6; color: red;">Error: Pack data missing. Please select a pack from the landing page.</p>';
            return;
        }
        
        try {
            // ELECTRON: Replace fetch with Electron API
            const intakeFiles = await window.electronAPI.getIntakes(packFolder);
            
            intakeFiles.forEach(fileName => {
                if (fileName.includes('-intake')) {
                    const intakeKey = formatIntakeKey(fileName);
                    const button = document.createElement('button');
                    button.className = 'intake-button';
                    
                    // Check if this intake has been saved
                    const savedData = currentCustomer.intakeData[intakeKey];
                    const lastSaved = savedData ? savedData.saved : null;
                    
                    // Create button content with title and optional date
                    const titleSpan = document.createElement('span');
                    titleSpan.textContent = intakeKey.toUpperCase();
                    titleSpan.style.display = 'block';
                    button.appendChild(titleSpan);
                    
                    if (lastSaved) {
                        const dateSpan = document.createElement('span');
                        dateSpan.textContent = formatDateOnly(lastSaved);
                        dateSpan.style.fontSize = '0.75em';
                        dateSpan.style.color = '#fff';
                        dateSpan.style.marginTop = '4px';
                        dateSpan.style.display = 'block';
                        button.appendChild(dateSpan);
                    }
                    
                    button.addEventListener('click', () => {
                        const intakePath = `/packs/${packFolder}/intakes/${fileName}`;
                        loadIntake(intakePath, intakeKey);
                    });
                    
                    controlFamilyContainer.appendChild(button);
                }
            });
            
            // Pad the grid to maintain 6-column layout
            const count = controlFamilyContainer.children.length;
            const remainder = count % 6;
            if (remainder !== 0) {
                const padding = 6 - remainder;
                for(let i = 0; i < padding; i++) {
                     const emptyDiv = document.createElement('div');
                     controlFamilyContainer.appendChild(emptyDiv);
                }
            }
            
        } catch (error) {
            console.error('Error loading control family buttons:', error);
            controlFamilyContainer.innerHTML = '<p style="grid-column: 1 / span 6; color: red;">Error loading control families. Please check server console for missing /intakes folder errors.</p>';
        }
    }
    
    async function loadOtherDocumentButtons() {
        const packFolder = currentCustomer.packFolder;

        if (!packFolder) {
            console.error('CRITICAL: Pack folder is undefined. Cannot load other intakes.');
            otherDocumentsContainer.innerHTML = '<p style="color: red;">Error: Pack data missing.</p>';
            return;
        }
        
        otherDocumentsContainer.innerHTML = '';
        
        try {
            // ELECTRON: Replace fetch with Electron API
            const otherintakeFiles = await window.electronAPI.getOtherIntakes(packFolder);
            
            if (otherintakeFiles.length === 0) {
                otherDocumentsContainer.innerHTML = '<p style="color: #666; font-style: italic;">No other documents available.</p>';
                return;
            }
            
            otherintakeFiles.forEach(fileName => {
                const intakeKey = fileName.replace('-intake.json', '').replace('.json', '');
                const displayName = intakeKey.toUpperCase().replace(/-/g, ' ');
                
                const button = document.createElement('button');
                button.textContent = displayName;
                button.className = 'secondary';
                
                button.addEventListener('click', () => {
                    const intakePath = `/packs/${packFolder}/otherintakes/${fileName}`;
                    loadIntake(intakePath, intakeKey);
                });
                
                otherDocumentsContainer.appendChild(button);
            });
            
        } catch (error) {
            console.error('Error loading other document buttons:', error);
            otherDocumentsContainer.innerHTML = '<p style="color: red;">Error loading other documents.</p>';
        }
    }
    
    // --- Global Save Handler (used by inline onclicks) ---
    // Renamed from saveAndClose to avoid conflict with the local one
    window.saveAndNavigate = async function(navigate) {
        // Ensure customer is saved before navigating to dashboard
        if (activeIntakeKey === 'general') {
            const customerNameInput = activeIntakeForm.querySelector('input[name="customerName"]');
            if (customerNameInput && !customerNameInput.value.trim()) {
                alert('Customer Name is a mandatory field.');
                customerNameInput.focus();
                return;
            }
        }
        
        // Load the current customer state from form before saving
        return await saveAndClose(navigate);
    };

    // --- About Page ---
    async function loadAboutPage() {
        showView('about-section');
        const aboutContent = document.getElementById('about-content');
        
        try {
            // Read README.md from root
            const readmeContent = await window.electronAPI.readTemplate('/README.md');
            // Convert markdown to simple HTML (basic conversion)
            const htmlContent = readmeContent
                .replace(/\n/g, '<br>')
                .replace(/### (.*?)<br>/g, '<h3>$1</h3>')
                .replace(/## (.*?)<br>/g, '<h2>$1</h2>')
                .replace(/# (.*?)<br>/g, '<h1>$1</h1>');
            aboutContent.innerHTML = htmlContent;
        } catch (error) {
            aboutContent.innerHTML = '<p>Could not load README.md file.</p>';
            console.error('Error loading README:', error);
        }
    }

    // Initialize the app
    loadLandingPage();
    
    // Setup library table sorting
    setupLibrarySorting();

    // Add event listeners for persistent header buttons
    if (btnHome) {
        btnHome.addEventListener('click', loadLandingPage);
    }
    
    if (btnHeaderFolder) {
        btnHeaderFolder.addEventListener('click', async () => {
            await window.electronAPI.openCustomersFolder();
        });
    }
    
    if (btnHeaderLibrary) {
        btnHeaderLibrary.addEventListener('click', renderLibrary);
    }
    
    if (btnHeaderAbout) {
        btnHeaderAbout.addEventListener('click', loadAboutPage);
    }
});
