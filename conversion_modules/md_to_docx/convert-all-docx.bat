@echo off
echo Converting all .md files to .docx...
echo.

for %%f in (*.md) do (
    echo Converting: %%f
    if exist "logo1.png" (
        if exist "logo2.png" (
            node md_to_docx.js "%%f" "%%~nf.docx" "logo1.png" "logo2.png"
        ) else (
            node md_to_docx.js "%%f" "%%~nf.docx" "logo1.png"
        )
    ) else (
        if exist "logo2.png" (
            node md_to_docx.js "%%f" "%%~nf.docx" "" "logo2.png"
        ) else (
            node md_to_docx.js "%%f" "%%~nf.docx"
        )
    )
)

echo.
echo Done! All files converted.
pause