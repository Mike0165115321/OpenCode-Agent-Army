# Snapshot Video — Capture key frames from a rendered video
# Usage: .\scripts\snapshot-video.ps1 -InputFile "akira-intro-poc.mp4" -OutputDir "snapshots" -Times "0.5,3.0,5.0,7.5,9.0"

param(
    [Parameter(Mandatory = $true)]
    [string]$InputFile,

    [Parameter(Mandatory = $false)]
    [string]$OutputDir = "snapshots",

    [Parameter(Mandatory = $false)]
    [string]$Times = "0.5,3.0,5.0,7.5,9.0"
)

# Ensure output directory exists
if (-not (Test-Path -LiteralPath $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$times = $Times -split "[, ]" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
$videoName = [System.IO.Path]::GetFileNameWithoutExtension($InputFile)

foreach ($t in $times) {
    $outputFile = Join-Path -Path $OutputDir -ChildPath "${videoName}_t${t}.png"
    Write-Output "Capturing frame at t=${t}s → $outputFile"
    & ffmpeg -y -ss $t -i $InputFile -vframes 1 -q:v 3 $outputFile 2>&1 | Out-Null
}

Write-Output "Done. Snapshots saved to $OutputDir"
