param(
    [string] $AppPath = (Join-Path $env:LOCALAPPDATA 'Programs\GitHub Copilot\github.exe'),
    [switch] $NoPauseOnError,
    [switch] $Silent
)

$ErrorActionPreference = 'Stop'

function Show-LauncherError([string] $message) {
    if ($env:COPILOT_ZH_TEST_POPUP -eq '1') {
        Write-Output "POPUP: $message"
        return
    }
    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction Stop
        [System.Windows.Forms.MessageBox]::Show(
            $message,
            'GitHub Copilot Zh',
            [System.Windows.Forms.MessageBoxButtons]::OK,
            [System.Windows.Forms.MessageBoxIcon]::Error
        ) | Out-Null
    } catch {
        try {
            $ws = New-Object -ComObject WScript.Shell
            $ws.Popup($message, 0, 'GitHub Copilot Zh', 16) | Out-Null
        } catch {}
    }
}

trap {
    $msg = "Launcher failed: $($_.Exception.Message)"
    Write-Host $msg -ForegroundColor Red
    if ($Silent) {
        Show-LauncherError $msg
    } elseif (-not $NoPauseOnError) {
        Write-Host 'Press Enter to close.'
        Read-Host 'Press Enter to close' | Out-Null
    }
    exit 1
}

if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'PowerShell 7 or later is required.' }
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCmd) { throw 'Node.js 22 or later is required.' }
$major = $nodeCmd.FileVersionInfo.ProductMajorPart
if (-not $major -or [int]$major -le 0) {
    $major = & node -p 'Number(process.versions.node.split(".")[0])'
    if ($LASTEXITCODE -ne 0) { throw 'Node.js 22 or later is required.' }
}
if ([int]$major -lt 22) { throw 'Node.js 22 or later is required.' }
$resolved = (Resolve-Path -LiteralPath $AppPath).Path
if ([IO.Path]::GetFileName($resolved) -ine 'github.exe') { throw 'Expected the GitHub Copilot desktop executable, github.exe.' }
$signature = Get-AuthenticodeSignature -LiteralPath $resolved
if ($signature.Status -ne 'Valid' -or
    $signature.SignerCertificate.GetNameInfo([Security.Cryptography.X509Certificates.X509NameType]::SimpleName, $false) -ne 'GitHub, Inc.' -or
    $signature.SignerCertificate.Subject -notmatch '(?:^|,\s*)O="?GitHub, Inc\."?(?:,|$)') {
    throw 'The Copilot executable does not have a valid GitHub signature.'
}
if (Get-Process -Name 'github' -ErrorAction SilentlyContinue) {
    throw 'A github.exe process is already running. Save your work and exit Copilot normally before trying again; no process was terminated.'
}

$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, 0)
$listener.Start()
try { $port = $listener.LocalEndpoint.Port } finally { $listener.Stop() }
$oldArguments = $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS
try {
    $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = "--remote-debugging-port=$port --remote-debugging-address=127.0.0.1"
    $app = Start-Process -FilePath $resolved -PassThru
} finally {
    $env:WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = $oldArguments
}

if ($Silent) {
    $runnerErr = & node (Join-Path $PSScriptRoot 'src\runner.js') $port $app.Id $resolved 2>&1
    if ($LASTEXITCODE -ne 0) {
        $details = ($runnerErr | Out-String).Trim()
        if ($details) {
            throw "Translation stopped with an error:`n$details`n`nCopilot was not terminated."
        } else {
            throw "Translation stopped with an error (exit code $LASTEXITCODE). Copilot was not terminated."
        }
    }
} else {
    Write-Host 'Copilot started. Leave this terminal open; press Ctrl+C to stop the translation.'
    & node (Join-Path $PSScriptRoot 'src\runner.js') $port $app.Id $resolved
    if ($LASTEXITCODE -ne 0) { throw "Translation stopped with an error (exit code $LASTEXITCODE). Copilot was not terminated." }
}
