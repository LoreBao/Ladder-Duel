#Requires -RunAsAdministrator

param(
  [ValidateSet("Allow", "Block")]
  [string]$DefaultInboundAction = "Allow"
)

$ErrorActionPreference = "Stop"

$wslCreatorId = "{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}"

if (-not (Get-Command Set-NetFirewallHyperVVMSetting -ErrorAction SilentlyContinue)) {
  throw "Set-NetFirewallHyperVVMSetting is not available on this Windows build. Use the portproxy script or update WSL/Windows."
}

Set-NetFirewallHyperVVMSetting `
  -Name $wslCreatorId `
  -DefaultInboundAction $DefaultInboundAction

Write-Host "WSL Hyper-V firewall DefaultInboundAction = $DefaultInboundAction"
Write-Host "Test from Windows: curl.exe http://<windows-lan-ip>:5173"
Write-Host "Test backend:      curl.exe http://<windows-lan-ip>:3001/health"
