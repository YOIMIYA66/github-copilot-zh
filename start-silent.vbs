Option Explicit

Dim sh, fso, scriptDir, scriptPath, systemRoot, whereExe, exitCode, cmd, i, waitOnReturn, arg

Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
scriptPath = fso.BuildPath(scriptDir, "start.ps1")

Sub ShowError(message)
    If sh.Environment("PROCESS")("COPILOT_ZH_TEST_POPUP") = "1" Then
        WScript.Echo "VBS_POPUP: " & message
    Else
        MsgBox message, vbCritical, "GitHub Copilot Zh"
    End If
End Sub

systemRoot = sh.ExpandEnvironmentStrings("%SystemRoot%")
whereExe = fso.BuildPath(systemRoot, "System32\where.exe")
If Not fso.FileExists(whereExe) Then
    whereExe = "where.exe"
End If

On Error Resume Next
exitCode = sh.Run("""" & whereExe & """ pwsh.exe", 0, True)
If Err.Number <> 0 Or exitCode <> 0 Then
    ShowError "PowerShell 7 or later (pwsh.exe) was not found on PATH." & vbCrLf & _
              "Please install PowerShell 7, then reopen this launcher."
    WScript.Quit 1
End If
On Error GoTo 0

cmd = "pwsh.exe -NoLogo -NoProfile -WindowStyle Hidden -File """ & scriptPath & """ -Silent -NoPauseOnError"

For i = 0 To WScript.Arguments.Count - 1
    arg = WScript.Arguments(i)
    If InStr(arg, " ") > 0 Then
        cmd = cmd & " """ & arg & """"
    Else
        cmd = cmd & " " & arg
    End If
Next

waitOnReturn = (sh.Environment("PROCESS")("COPILOT_ZH_VBS_WAIT") = "1")
exitCode = sh.Run(cmd, 0, waitOnReturn)
WScript.Quit exitCode
