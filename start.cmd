@echo off
setlocal
"%SystemRoot%\System32\where.exe" pwsh.exe >nul 2>&1
if errorlevel 1 goto missing_powershell
pwsh.exe -NoLogo -NoProfile -File "%~dp0start.ps1" -NoPauseOnError %*
set "result=%errorlevel%"
if "%result%"=="0" exit /b 0
echo.
echo Translation did not start or stopped with an error. Read the message above.
echo The launcher does not close Copilot automatically.
pause
exit /b %result%

:missing_powershell
echo PowerShell 7 or later (pwsh.exe) was not found on PATH.
echo Install PowerShell 7, then reopen this launcher.
pause
exit /b 1
