# Sends one plugin-feedback report to the plugin team's feedback form with a single HTTPS call.
# Windows PowerShell 5.1 or PowerShell 7. No browser, nothing to install.
#
# Usage (report piped in, or passed as a file):
#   @'
#   TOPIC: <skill-name> - <title>
#   Reporter: ...
#   '@ | powershell -NoProfile -ExecutionPolicy Bypass -File send-feedback.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File send-feedback.ps1 -ReportFile report.txt
# -DryRun prints the JSON payload instead of sending it.
# Prints "sent", or "saved to <path>: <reason>" and exits 1 when sending failed.
param(
  [string]$ReportFile,
  [switch]$DryRun
)
$ErrorActionPreference = 'Stop'

$WorkspaceId = '2515745'
$FormId = '2crt1-44615'
$FormToken = 'XOMFWZK3ADDFQ3I7NX'
$DefaultApiBase = 'https://frontdoor-prod-eu-west-1-3.clickup.com'

if ($ReportFile) {
  $report = [IO.File]::ReadAllText((Resolve-Path $ReportFile), [Text.Encoding]::UTF8)
} else {
  $report = (@($input) -join "`n")
}
$lines = @($report -split "`r?`n")

function Save-Report([string]$reason) {
  $dir = Join-Path (Get-Location) 'output\feedback'
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $path = Join-Path $dir ((Get-Date -Format 'yyyy-MM-dd-HHmmss') + '.md')
  [IO.File]::WriteAllText($path, $report, (New-Object Text.UTF8Encoding $false))
  Write-Output "saved to ${path}: $reason"
  exit 1
}

if ($lines.Count -eq 0 -or $lines[0] -notmatch '^TOPIC:') { Save-Report 'the first line must start with TOPIC:' }
$topic = ($lines[0] -replace '^TOPIC:\s*', '').Trim()
if (-not $topic) { Save-Report 'the TOPIC line is empty' }
$bodyLines = @($lines | Select-Object -Skip 1 | Where-Object { $_.Trim() -ne '' })
if ($bodyLines.Count -eq 0) { Save-Report 'the report has no body' }
$body = ($bodyLines -join "`n") + "`n"

# Strip control characters other than tab and newline.
$topic = $topic -replace '[\x00-\x08\x0B\x0C\x0E-\x1F]', ''
$body = $body -replace '[\x00-\x08\x0B\x0C\x0E-\x1F]', ''

# Turn the body into rich-text ops the form's editor understands:
#   "Label: value" lines (Reporter, Customer, ...) -> bold label, plain value
#   GOAL / WHAT WENT WRONG / WHAT WAS TRIED / SUGGESTED FIX -> a blank line, a bold heading
#   on its own line, then the text below it
#   any other line -> plain text
$titles = @{
  'GOAL'            = 'What the operator was trying to do'
  'WHAT WENT WRONG' = 'What went wrong'
  'WHAT WAS TRIED'  = 'What was tried'
  'SUGGESTED FIX'   = 'Suggested fix'
}
$ops = New-Object System.Collections.ArrayList
function Add-Op([string]$text, [bool]$bold) {
  if ($bold) { [void]$ops.Add([ordered]@{ insert = $text; attributes = @{ bold = $true } }) }
  else { [void]$ops.Add([ordered]@{ insert = $text }) }
}
foreach ($line in ($body.TrimEnd("`n") -split "`n")) {
  $m = [regex]::Match($line, '^([A-Z][A-Za-z ]*):\s*(.*)$')
  if ($m.Success -and $m.Groups[1].Value.Length -le 31) {
    $key = $m.Groups[1].Value
    $rest = $m.Groups[2].Value
    if ($titles.ContainsKey($key)) {
      Add-Op "`n" $false
      Add-Op $titles[$key] $true
      Add-Op "`n" $false
      if ($rest) { Add-Op ($rest + "`n") $false }
      continue
    }
    Add-Op ($key + ':') $true
    Add-Op (' ' + $rest + "`n") $false
    continue
  }
  Add-Op ($line + "`n") $false
}

$payload = [ordered]@{
  customFields    = @()
  timezone        = 'UTC'
  assignees       = @()
  group_assignees = @()
  name            = $topic
  content         = @{ ops = @($ops) }
} | ConvertTo-Json -Depth 8 -Compress

if ($DryRun) { Write-Output $payload; exit 0 }

try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }

# The form's API host depends on the workspace's shard; ask for it, fall back to the known one.
$apiBase = $DefaultApiBase
try {
  $shard = Invoke-RestMethod -Uri "https://id.app.clickup.com/shard/v1/handshake/$WorkspaceId" -TimeoutSec 10 -UseBasicParsing
  $candidate = $shard.appEnvironment.apiUrlBase
  if ($candidate -match '^https://[A-Za-z0-9.-]+\.clickup\.com$') { $apiBase = $candidate }
} catch { }

$url = "$apiBase/ui/v3/workspaces/$WorkspaceId/forms/$FormId/submit?token=$FormToken"
$headers = @{
  'x-csrf'         = '1'
  'x-workspace-id' = $WorkspaceId
  'origin'         = 'https://forms.clickup.com'
}
# Windows PowerShell 5.1 refuses Referer as a plain header; PowerShell 7 accepts it.
if ($PSVersionTable.PSVersion.Major -ge 6) { $headers['referer'] = 'https://forms.clickup.com/' }
try {
  $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
  $resp = Invoke-WebRequest -Uri $url -Method Post -Headers $headers -Body $bytes `
    -ContentType 'application/json; charset=utf-8' -TimeoutSec 30 -UseBasicParsing
  if ($resp.StatusCode -eq 200 -or $resp.StatusCode -eq 201) { Write-Output 'sent'; exit 0 }
  Save-Report "the feedback form answered HTTP $($resp.StatusCode)"
} catch {
  $code = $null
  try { $code = [int]$_.Exception.Response.StatusCode } catch { }
  if ($code) { Save-Report "the feedback form answered HTTP $code" }
  Save-Report 'the feedback form could not be reached'
}
