param(
    [Parameter(Mandatory)][int] $Port,
    [Parameter(Mandatory)][int] $AppProcessId,
    [Parameter(Mandatory)][string] $AppPath
)
$ErrorActionPreference = 'Stop'
$app = Get-CimInstance Win32_Process -Filter "ProcessId=$AppProcessId"
if (-not $app -or $app.Name -ine 'github.exe' -or $app.ExecutablePath -ine $AppPath) {
    throw 'The launched Copilot process is no longer available.'
}
$appSignature = Get-AuthenticodeSignature -LiteralPath $app.ExecutablePath
if ($appSignature.Status -ne 'Valid' -or
    $appSignature.SignerCertificate.GetNameInfo([Security.Cryptography.X509Certificates.X509NameType]::SimpleName, $false) -ne 'GitHub, Inc.' -or
    $appSignature.SignerCertificate.Subject -notmatch '(?:^|,\s*)O="?GitHub, Inc\."?(?:,|$)') {
    throw 'The Copilot process signature is invalid.'
}
$connections = @(Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
if ($connections.Count -ne 1 -or $connections[0].LocalAddress -ne '127.0.0.1') {
    throw 'The debug listener is not exclusively bound to IPv4 loopback.'
}
$process = Get-CimInstance Win32_Process -Filter "ProcessId=$($connections[0].OwningProcess)"
if (-not $process -or $process.Name -ine 'msedgewebview2.exe') {
    throw 'The debug listener is not a WebView2 process.'
}
$signature = Get-AuthenticodeSignature -LiteralPath $process.ExecutablePath
if ($signature.Status -ne 'Valid' -or
    $signature.SignerCertificate.GetNameInfo([Security.Cryptography.X509Certificates.X509NameType]::SimpleName, $false) -ne 'Microsoft Corporation' -or
    $signature.SignerCertificate.Subject -notmatch '(?:^|,\s*)O="?Microsoft Corporation"?(?:,|$)') {
    throw 'The WebView2 process signature is invalid.'
}
$visited = [Collections.Generic.HashSet[int]]::new()
while ($process -and $visited.Add([int]$process.ProcessId)) {
    if ($process.ProcessId -eq $AppProcessId) { exit 0 }
    if (-not $process.ParentProcessId) { break }
    $process = Get-CimInstance Win32_Process -Filter "ProcessId=$($process.ParentProcessId)"
}
throw 'The debug listener is not a descendant of the launched Copilot process.'
