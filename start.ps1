param(
    [string] $AppPath = (Join-Path $env:LOCALAPPDATA 'Programs\GitHub Copilot\github.exe')
)

$ErrorActionPreference = 'Stop'
if ($PSVersionTable.PSVersion.Major -lt 7) { throw 'PowerShell 7 or later is required.' }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js 22 or later is required.' }
$major = & node -p 'Number(process.versions.node.split(".")[0])'
if ($LASTEXITCODE -ne 0 -or [int]$major -lt 22) { throw 'Node.js 22 or later is required.' }
$resolved = (Resolve-Path -LiteralPath $AppPath).Path
if ([IO.Path]::GetFileName($resolved) -ine 'github.exe') { throw 'Expected the GitHub Copilot desktop executable, github.exe.' }
$signature = Get-AuthenticodeSignature -LiteralPath $resolved
if ($signature.Status -ne 'Valid' -or
    $signature.SignerCertificate.GetNameInfo([Security.Cryptography.X509Certificates.X509NameType]::SimpleName, $false) -ne 'GitHub, Inc.' -or
    $signature.SignerCertificate.Subject -notmatch '(?:^|,\s*)O="?GitHub, Inc\."?(?:,|$)') {
    throw 'The Copilot executable does not have a valid GitHub signature.'
}
if (Get-CimInstance Win32_Process -Filter "Name='github.exe'") {
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
Write-Host 'Copilot started. Leave this terminal open; press Ctrl+C to stop the translation.'
& node (Join-Path $PSScriptRoot 'src\runner.js') $port $app.Id $resolved
if ($LASTEXITCODE -ne 0) { throw "Translation stopped with an error (exit code $LASTEXITCODE). Copilot was not terminated." }
