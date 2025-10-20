document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const landingPageSection = document.getElementById('landing-page'); // New landing page container
    const packsContainer = document.getElementById('packs-container');
    const loadingPacks = document.getElementById('loading-packs');
    const intakeFormSection = document.getElementById('intake-form-section');
    const customerDashboardSection = document.getElementById('customer-dashboard-section');
    const customerLibrarySection = document.getElementById('customer-library-section'); // New library container
    const libraryTableBody = document.getElementById('library-table-body'); // New table body
    const activeIntakeForm = document.getElementById('active-intake-form');
    const intakeTitle = document.getElementById('intake-title');
    const navTop = document.querySelector('#intake-form-section .top-nav');
    const navBottom = document.querySelector('#intake-form-section .bottom-nav');
    const controlFamilyContainer = document.getElementById('control-family-intakes-container');
    
    // Dashboard Elements
    const dashboardCustomerName = document.getElementById('dashboard-customer-name');
    const dashboardPackName = document.getElementById('dashboard-pack-name');
	const dashboardAssuranceLevel = document.getElementById('dashboard-assurance-level'); 

    // Persistent Header Button
    const btnHome = document.getElementById('btn-home'); 
    
    // FIX: CODE FOR THE "Open Customer Folder" BUTTON (Removed redundant DOMContentLoaded wrapper)
    const openFolderButton = document.getElementById('btn-open-folder');

    if (openFolderButton) {
        openFolderButton.addEventListener('click', (event) => {
            // Prevent default action (like form submission)
            event.preventDefault(); 
            
            // Temporary alert to confirm the button click is working
            alert('Button Click Registered! This confirms the JavaScript is running.');
            
            // NOTE: The actual code to open a local folder must be added here 
            // if using a desktop framework like Electron.
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

    function showView(viewId) {
    // Hide all main sections
    [landingPageSection, intakeFormSection, customerDashboardSection, customerLibrarySection].forEach(section => {
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
    function getAllCustomerKeys() {
        const customerKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('customer_')) {
                customerKeys.push(key);
            }
        }
        return customerKeys;
    }
    
    function saveCustomerData(intakeKey, data, lastSavedTime = null) {
        const customerId = currentCustomer.name;
        if (!customerId) return;
        
        const timestamp = lastSavedTime || nowFormatted();
        
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
        localStorage.setItem(`customer_${customerId}`, JSON.stringify(currentCustomer));
    }
    
    function loadCustomer(customerName) {
        const data = localStorage.getItem(`customer_${customerName}`);
        if (data) {
            currentCustomer = JSON.parse(data);
            return true;
        }
        return false;
    }
    
    function saveAndClose(navigate) {
        // 1. Get data
        const formData = new FormData(activeIntakeForm);
        const data = Object.fromEntries(formData.entries());
        
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
                localStorage.removeItem(`customer_${currentCustomer.name}`); // delete old entry
            }
            currentCustomer.name = customerName;
        }
        
        // 2. Save data
        const saveTime = nowFormatted();
        saveCustomerData(activeIntakeKey, data, saveTime); // Pass the detailed time

        // 3. Navigate
        if (navigate === 'dashboard' || navigate === 'close') {
            renderDashboard(); // 1d. Next saves and goes to dashboard. 3a. Close saves and goes to dashboard.
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
        document.getElementById('btn-open-library').onclick = renderLibrary;
        
        packsContainer.innerHTML = '';
        loadingPacks.style.display = 'block';
        try {
            const response = await fetch('/api/packs');
            if (!response.ok) throw new Error('Failed to fetch packs.');
            
            const packNames = await response.json();
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
    function renderLibrary() {
        showView('customer-library-section'); //
        libraryTableBody.innerHTML = ''; //
               
        const customerKeys = getAllCustomerKeys(); //
        
        if (customerKeys.length === 0) { //
            libraryTableBody.innerHTML = '<tr><td colspan="3">No customers saved yet.</td></tr>'; //
            return;
        }

        customerKeys.forEach(key => { //
            const rawData = localStorage.getItem(key); //
            const customer = JSON.parse(rawData); //
            
            // --- FIX: Add a data validation check to skip corrupted records ---
            if (!customer || !customer.name || !customer.packName) {
                console.warn(`Skipping corrupted customer record for key: ${key}. Data not displayed.`);
                return; // Skips this iteration and moves to the next customer
            }
            
            const row = libraryTableBody.insertRow(); //
            
            // Customer Name (Clickable link to dashboard)
            const nameCell = row.insertCell(); //
            nameCell.innerHTML = `<span class="customer-name-link">${customer.name}</span>`; //
            nameCell.onclick = () => { //
                loadCustomer(customer.name); // Load customer state //
                renderDashboard(); //
            };
            
            // Pack
            row.insertCell().textContent = customer.packName; //
            
            // Last Saved (using the metadata property)
            row.insertCell().textContent = customer.lastSaved || 'N/A'; //
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
            const response = await fetch(intakePath);
            if (!response.ok) {
                throw new Error(`Failed to fetch intake: ${intakePath}`);
            }
            
            const intakeData = await response.json();
            
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
        activeIntakeForm.innerHTML = '';
        intakeTitle.textContent = `${currentCustomer.packName || 'New Customer'} - ${intakeKey === 'general' ? 'General Intake' : intakeKey.toUpperCase() + ' Intake'}`;
		
	if (intakeData.description) {
            const descriptionElement = document.createElement('p');
            descriptionElement.textContent = intakeData.description;
            descriptionElement.className = 'form-description'; 
            activeIntakeForm.appendChild(descriptionElement);
        }

        // Get existing data if available
        const savedData = currentCustomer.intakeData[intakeKey] ? currentCustomer.intakeData[intakeKey].data : {};
        
        intakeData.questions.forEach(question => {
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';

            const label = document.createElement('label');
            label.textContent = question.label;
            label.setAttribute('for', question.name);
            if (question.mandatory) {
                label.classList.add('required-field');
            }

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

            formGroup.appendChild(label);
            formGroup.appendChild(input);
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
        const generateBtn = `<button class="primary" id="btn-generate-docs">Generate Documents</button>`;
        const saveCloseBtn = `<button class="secondary" onclick="event.preventDefault(); window.saveAndNavigate('close')">Save and Close</button>`;
        
        const timeSpan = `<span class="last-saved-time">Last Saved: ${savedTime}</span>`;
        
        // Remove duplication to avoid DOM/event issues
        navTop.innerHTML = saveCloseBtn; 
        navBottom.innerHTML = timeSpan + generateBtn + saveCloseBtn;
        
        // 3b. Document Generation Logic - FIXED VERSION
        document.getElementById('btn-generate-docs').addEventListener('click', async () => {
            const saveSuccessful = saveAndClose('none'); // Save current data
            if (!saveSuccessful) return;

            // Collect ALL intake data for template substitution
            const allData = {};
            
            // Merge general intake data
            if (currentCustomer.intakeData.general?.data) {
                Object.assign(allData, currentCustomer.intakeData.general.data);
            }
            
            // Merge current control family intake data
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
                     const response = await fetch(templatePath);
                     if (!response.ok) {
                         throw new Error(`Template not found (404/500). Expected path: ${templatePath}`);
                     }
                     let content = await response.text();
                     
                     // Perform comprehensive template substitution
                     // Replace {{fieldName}} with actual values from intake data
                     Object.keys(allData).forEach(fieldName => {
                         const regex = new RegExp(`{{${fieldName}}}`, 'g');
                         const value = allData[fieldName] || '';
                         content = content.replace(regex, value);
                     });
                     
                     // Also handle legacy [[FIELD_NAME]] format if present
                     content = content.replace(/\[\[SYSTEM_ACRONYM\]\]/g, systemAcronym);

                     // Create a Blob and initiate download (simulating placing in download folder)
                     const blob = new Blob([content], { type: 'text/markdown' });
                     const url = URL.createObjectURL(blob);
                     const downloadLink = document.createElement('a');
                     
                     const finalFileName = `${systemAcronym}_${intakeKey.toUpperCase()}_${docType}.md`;
                     
                     downloadLink.href = url;
                     downloadLink.download = finalFileName;
                     document.body.appendChild(downloadLink);
                     downloadLink.click();
                     document.body.removeChild(downloadLink);
                     URL.revokeObjectURL(url);
                     
                     return true;
                 } catch (error) {
                     console.error(`Error generating ${docType}:`, error);
                     return false;
                 }
            };
            
            const policySuccess = await generateAndDownload(policyPath, 'Policy');
            const procedureSuccess = await generateAndDownload(procedurePath, 'Procedure');
            
            if (policySuccess && procedureSuccess) {
                 alert(`Successfully generated and downloaded Policy and Procedure for ${intakeKey.toUpperCase()}! Check your downloads folder.`);
            } else {
                 alert(`Generation failed. Check console for missing template errors.`);
            }
        });
    }
    
    // --- Dashboard Functionality (2a) ---
    
    function renderDashboard() {
        showView('customer-dashboard-section');
        
        // 2a. Display Header Menu
        dashboardCustomerName.textContent = currentCustomer.name;
        dashboardPackName.textContent = currentCustomer.packName;
        
	// Display assurance level if it exists in general intake data
    const assuranceLevel = currentCustomer.intakeData.general?.data?.assuranceLevel || 'N/A';
    dashboardAssuranceLevel.textContent = `Assurance Level: ${assuranceLevel}`;
         

	  // Clear old buttons
        controlFamilyContainer.innerHTML = '';
        
        // Setup control family buttons
        loadControlFamilyButtons();
        
        // Setup fixed buttons
        document.getElementById('btn-return-to-general').onclick = () => {
             // 2a. Return to General Intake
             const intakeFileName = `${currentCustomer.packFolder.toLowerCase().replace(/_/g, '-')}-general.json`;
             const intakePath = `/packs/${currentCustomer.packFolder}/${intakeFileName}`;
             loadIntake(intakePath, 'general');
        };
        document.getElementById('btn-delete-customer').onclick = () => {
             // 2a. Delete Customer
             if(confirm(`Are you sure you want to delete all data for ${currentCustomer.name}?`)) {
                 localStorage.removeItem(`customer_${currentCustomer.name}`);
                 currentCustomer = { name: null, packFolder: null, packName: null, intakeData: {} };
                 renderLibrary(); // Go back to the library view
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
            const response = await fetch(`/api/intakes/${packFolder}`);
            if (!response.ok) {
                // If response is not OK, output the status to the console for debugging
                 console.error(`Error fetching intakes: Server returned status ${response.status} for /api/intakes/${packFolder}`);
                 throw new Error('Server intake fetch failed.');
            }

            const intakeFiles = await response.json();
            
            intakeFiles.forEach(fileName => {
                if (fileName.includes('-intake')) {
                    const intakeKey = formatIntakeKey(fileName);
                    const button = document.createElement('button');
                    button.textContent = intakeKey.toUpperCase();
                    button.className = 'intake-button';
                    
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
    
    // --- Global Save Handler (used by inline onclicks) ---
    // Renamed from saveAndClose to avoid conflict with the local one
    window.saveAndNavigate = function(navigate) {
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
        return saveAndClose(navigate);
    };

    // Initialize the app
    loadLandingPage();

    // Add event listener for the persistent Home button (Fixed placement)
    if (btnHome) {
        btnHome.addEventListener('click', loadLandingPage);
    }
});