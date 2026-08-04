#Requires -RunAsAdministrator

param(
  [int[]]$Ports = @(5173, 3001),
  [string]$ListenAddress = "0.0.0.0",
  [string]$ConnectAddress = "127.0.0.1",
  [string]$Distro = "",
  [ValidateSet("Domain", "Private", "Public", "Any")]
  [string]$FirewallProfile = "Private"
)

$ErrorActionPreference = "Stop"

function Get-WslIPv4 {
  $args = @()
  if ($Distro.Trim().Length -gt 0) {
    $args += @("-d", $Distro)
  }
  $args += @("sh", "-lc", "hostname -I")

  $raw = & wsl.exe @args
  $ip = ($raw -split "\s+" | Where-Object {
      $_ -match "^\d{1,3}(\.\d{1,3}){3}$" -and $_ -notlike "169.254.*" -and $_ -notlike "172.17.*"
    } | Select-Object -First 1)

  if (-not $ip) {
    throw "Unable to detect WSL IPv4 address. Start the WSL distro first."
  }

  return $ip
}

if ($ConnectAddress -eq "wsl") {
  $ConnectAddress = Get-WslIPv4
}

Write-Host "Connect address: $ConnectAddress"
Write-Host "Listen address:  $ListenAddress"

foreach ($port in $Ports) {
  Write-Host "Forwarding TCP $ListenAddress`:$port -> $ConnectAddress`:$port"

  foreach ($address in @($ListenAddress, "0.0.0.0", "127.0.0.1")) {
    & netsh interface portproxy delete v4tov4 `
      listenaddress=$address `
      listenport=$port 2>$null | Out-Null
  }

  & netsh interface portproxy add v4tov4 `
    listenaddress=$ListenAddress `
    listenport=$port `
    connectaddress=$ConnectAddress `
    connectport=$port | Out-Null

  $ruleName = "Ladder Duel WSL TCP $port"
  if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule `
      -DisplayName $ruleName `
      -Direction Inbound `
      -Action Allow `
      -Protocol TCP `
      -LocalPort $port `
      -Profile $FirewallProfile | Out-Null
  }
}

Write-Host ""
Write-Host "Current portproxy rules:"
& netsh interface portproxy show v4tov4
Write-Host ""
Write-Host "Check listeners:"
Get-NetTCPConnection -LocalPort $Ports -State Listen -ErrorAction SilentlyContinue |
  Select-Object LocalAddress, LocalPort, State, OwningProcess |
  Format-Table -AutoSize
Write-Host ""
Write-Host "Open http://<windows-lan-ip>:5173 from Windows or another LAN device."
