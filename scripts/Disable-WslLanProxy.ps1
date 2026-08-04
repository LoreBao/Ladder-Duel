#Requires -RunAsAdministrator

param(
  [int[]]$Ports = @(5173, 3001),
  [string[]]$ListenAddress = @("0.0.0.0", "127.0.0.1")
)

$ErrorActionPreference = "Stop"

foreach ($port in $Ports) {
  foreach ($address in $ListenAddress) {
    Write-Host "Removing TCP forward $address`:$port"
    & netsh interface portproxy delete v4tov4 `
      listenaddress=$address `
      listenport=$port 2>$null | Out-Null
  }

  $ruleName = "Ladder Duel WSL TCP $port"
  Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue |
    Remove-NetFirewallRule
}

Write-Host ""
Write-Host "Current portproxy rules:"
& netsh interface portproxy show v4tov4
