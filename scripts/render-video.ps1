# Render Video — Wrapper for npx hyperframes render
# Usage: .\scripts\render-video.ps1 [-Quality draft|standard|high] [-Output "name.mp4"]

param(
    [ValidateSet("draft", "standard", "high")]
    [string]$Quality = "draft",
    [string]$Output = ""
)

$projectDir = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectDir

$cmd = "npx hyperframes render --quality $Quality"
if ($Output -ne "") {
    $cmd += " --output $Output"
}

Write-Output "🎬 Rendering with: $cmd"
Write-Output ""

# Run the command
Invoke-Expression $cmd

if ($LASTEXITCODE -eq 0) {
    Write-Output ""
    Write-Output "✅ Render complete!"
} else {
    Write-Output ""
    Write-Output "❌ Render failed (exit code: $LASTEXITCODE)"
}
