# Markdown to Word Converter

First Time Running Instructions:

1. Install Node.js from https://nodejs.org
- Skip to step 2 if you already have node.js installed. 

2. Create a project folder (like md_to_docx) on your local machine then download and extract the project files into the folder.
  
3. Open terminal and cd to your project folder:
- example:  cd...\conversion_modules\md_to_docx\

3. Install 2 dependencies (first time only): 
- npm install (if needed)
- npm install docx

You may now close the terminal window.

4. Return to the folder using File Explorer and ensure your source md files are in the same folder.

To include the customer logo, name the file "logo1.png" and ensure its in the same folder.

The folder should look like this:
...\md_to_docx\
	node_modules\
	package.json
	package-lock.json
	convert-all-docx.bat
	md_to_docx.js
	sATytoLogo.png
	logo1.png
	README-DOCX.txt

6. Double-click convert-all-docx.bat


## Notes

- Works for 1 file or 100 files - same process
- The `.docx` files will have the same name as your `.md` files
- All files must be in the same folder

---

## Troubleshooting

**If you get an error about "Cannot find module 'docx'":**
- You need to run `npm install docx` in the folder (see Step 3 above)

**If nothing happens when you double-click the .bat file:**
- Make sure Node.js is installed
- Make sure all files are in the same folder