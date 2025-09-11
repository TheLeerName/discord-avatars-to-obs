@echo off
clip <devtools.js
echo How to run:
echo 1. Enable developer mode in Discord desktop app
echo 2. Open developer tools with Ctrl + Shift + I
echo 3. Open console and write "allow pasting"
echo 4. Paste script to console and run it (its already in your clipboard)
echo 5. Click "Enable speaking avatar capturing" in left upper corner of discord
echo 6. Paste this link to OBS browser source: http://localhost:62520/
echo 7. PROFIT!
echo[
choice /c YN /m "Do you want to hide assets folder?"

if %errorlevel% equ 1 (
	attrib +h "../assets" >nul
	echo Folder was hidden
)
echo[

pause