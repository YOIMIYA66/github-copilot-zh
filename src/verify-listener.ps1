param(
    [Parameter(Mandatory)][int] $Port,
    [Parameter(Mandatory)][int] $AppProcessId,
    [Parameter(Mandatory)][string] $AppPath,
    [int] $WaitTimeoutMs = 0,
    [switch] $SkipAppSignatureCheck,
    [switch] $Interactive
)
$ErrorActionPreference = 'Stop'

function Get-AppExecutablePath([int] $TargetPid) {
    try {
        $proc = [System.Diagnostics.Process]::GetProcessById($TargetPid)
        if ($proc.HasExited -or $proc.ProcessName -ine 'github') { return $null }
        try {
            $exe = $proc.MainModule.FileName
            if ($exe) { return $exe }
        } catch {}
        $cim = Get-CimInstance Win32_Process -Filter "ProcessId=$TargetPid"
        if ($cim -and $cim.Name -ieq 'github.exe') { return $cim.ExecutablePath }
    } catch {}
    return $null
}

function Assert-AppRunning([bool] $CheckSignature) {
    $exePath = Get-AppExecutablePath $AppProcessId
    if (-not $exePath -or $exePath -ine $AppPath) {
        throw 'The launched Copilot process is no longer available.'
    }
    if ($CheckSignature) {
        $appSignature = Get-AuthenticodeSignature -LiteralPath $exePath
        if ($appSignature.Status -ne 'Valid' -or
            $appSignature.SignerCertificate.GetNameInfo([Security.Cryptography.X509Certificates.X509NameType]::SimpleName, $false) -ne 'GitHub, Inc.' -or
            $appSignature.SignerCertificate.Subject -notmatch '(?:^|,\s*)O="?GitHub, Inc\."?(?:,|$)') {
            throw 'The Copilot process signature is invalid.'
        }
    }
}

function Get-ListeningPortOwners([int] $TargetPort) {
    $ipProps = [Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties()
    $endpoints = @($ipProps.GetActiveTcpListeners() | Where-Object { $_.Port -eq $TargetPort })
    if ($endpoints.Count -eq 0) { return ,@() }
    if ($endpoints.Count -gt 1 -or $endpoints[0].Address.ToString() -ne '127.0.0.1') {
        throw 'The debug listener is not exclusively bound to IPv4 loopback.'
    }
    $netstat = & "$env:SystemRoot\System32\netstat.exe" -ano -p TCP
    $rows = @()
    $portPattern = "^\s*TCP\s+(\S+):$TargetPort\s+(?:0\.0\.0\.0:0|\[::\]:0|\*:\*)\s+\S+\s+(\d+)\s*$"
    foreach ($line in $netstat) {
        if ($line -match $portPattern) {
            $rows += [pscustomobject]@{
                LocalAddress  = $Matches[1]
                OwningProcess = [int]$Matches[2]
            }
        }
    }
    return ,$rows
}

function Wait-VerifiedListener([int] $TimeoutMs) {
    $startTime = [Environment]::TickCount64
    while ($true) {
        $connections = Get-ListeningPortOwners $Port
        if ($connections.Count -eq 1 -and $connections[0].LocalAddress -eq '127.0.0.1') {
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
                if ($process.ProcessId -eq $AppProcessId) { return }
                if (-not $process.ParentProcessId) { break }
                $process = Get-CimInstance Win32_Process -Filter "ProcessId=$($process.ParentProcessId)"
            }
            throw 'The debug listener is not a descendant of the launched Copilot process.'
        }

        if ($connections.Count -gt 1 -or ($connections.Count -eq 1 -and $connections[0].LocalAddress -ne '127.0.0.1')) {
            throw 'The debug listener is not exclusively bound to IPv4 loopback.'
        }

        if ($TimeoutMs -le 0 -or ([Environment]::TickCount64 - $startTime) -ge $TimeoutMs) {
            throw 'The debug listener is not exclusively bound to IPv4 loopback.'
        }

        try {
            $appProc = [System.Diagnostics.Process]::GetProcessById($AppProcessId)
            if ($appProc.HasExited -or $appProc.ProcessName -ine 'github') {
                throw 'The launched Copilot process is no longer available.'
            }
        } catch {
            throw 'The launched Copilot process is no longer available.'
        }

        Start-Sleep -Milliseconds 15
    }
}

Assert-AppRunning (-not $SkipAppSignatureCheck)
Wait-VerifiedListener $WaitTimeoutMs

if (-not $Interactive) {
    exit 0
}

[Console]::Out.WriteLine('READY')
[Console]::Out.Flush()

$line = [Console]::In.ReadLine()
if ($line -ne 'VERIFY') {
    throw 'Verification handshake cancelled.'
}

Assert-AppRunning $false
Wait-VerifiedListener 0
[Console]::Out.WriteLine('VERIFIED')
[Console]::Out.Flush()
