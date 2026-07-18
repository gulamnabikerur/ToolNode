# backup.ps1
# Script to backup the AI Tools Hub project and create a clean, shareable version for friends.

$ProjectRoot = Resolve-Path "$PSScriptRoot\.."
$BackupDir = "$ProjectRoot\backups"
$TempBackup = "$ProjectRoot\temp_backup"
$TempShare = "$ProjectRoot\temp_share"

# Create backups directory if it doesn't exist
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir | Out-Null
}

# Clean any existing temp directories
if (Test-Path $TempBackup) { Remove-Item -Recurse -Force $TempBackup }
if (Test-Path $TempShare) { Remove-Item -Recurse -Force $TempShare }

Write-Host "Creating backup directories..." -ForegroundColor Cyan

# Directories to exclude from copy
$ExcludeDirs = @("node_modules", ".next", ".vercel", "backups", "temp_backup", "temp_share", "test-results", ".git")

# --- 1. Creating Full Personal Backup (includes .env.local) ---
Write-Host "Staging files for personal backup..." -ForegroundColor Yellow
$RobocopyArgs = @(
    $ProjectRoot,
    $TempBackup,
    "/E",
    "/XD"
) + $ExcludeDirs + @("/R:0", "/W:0", "/NFL", "/NDL", "/NJH", "/NJS")

# Run robocopy. Note that robocopy return codes < 8 are successful.
$process = Start-Process robocopy -ArgumentList $RobocopyArgs -Wait -NoNewWindow -PassThru
if ($process.ExitCode -ge 8) {
    Write-Warning "Robocopy failed staging personal backup with exit code $($process.ExitCode)"
}

Write-Host "Compressing personal backup..." -ForegroundColor Yellow
$PersonalZip = "$BackupDir\ai-tools-hub-backup.zip"
if (Test-Path $PersonalZip) { Remove-Item $PersonalZip }
Compress-Archive -Path "$TempBackup\*" -DestinationPath $PersonalZip -Force

# --- 2. Creating Shareable Backup (excludes .env.local) ---
Write-Host "Staging files for shareable backup (excluding sensitive environment variables)..." -ForegroundColor Yellow
$RobocopyArgsShare = @(
    $ProjectRoot,
    $TempShare,
    "/E",
    "/XD"
) + $ExcludeDirs + @("/XF", ".env.local", "/R:0", "/W:0", "/NFL", "/NDL", "/NJH", "/NJS")

$processShare = Start-Process robocopy -ArgumentList $RobocopyArgsShare -Wait -NoNewWindow -PassThru
if ($processShare.ExitCode -ge 8) {
    Write-Warning "Robocopy failed staging shareable backup with exit code $($processShare.ExitCode)"
}

# Create a readme placeholder in the share folder if they need to setup their own .env.local
$EnvReadme = @"
# Environment Variables Setup

Since .env.local contains private API keys and database credentials, it was excluded from this shared archive for security reasons.

To run the application:
1. Copy the `.env.local.example` file to `.env.local`.
2. Open `.env.local` and fill in your own credentials (such as your Hugging Face API Token and Upstash Redis credentials).
"@
$EnvReadme | Out-File -FilePath "$TempShare\README_ENV.md" -Encoding utf8

Write-Host "Compressing shareable backup..." -ForegroundColor Yellow
$ShareZip = "$BackupDir\ai-tools-hub-share.zip"
if (Test-Path $ShareZip) { Remove-Item $ShareZip }
Compress-Archive -Path "$TempShare\*" -DestinationPath $ShareZip -Force

# Clean up temp directories
Write-Host "Cleaning up temporary staging directories..." -ForegroundColor Cyan
if (Test-Path $TempBackup) { Remove-Item -Recurse -Force $TempBackup }
if (Test-Path $TempShare) { Remove-Item -Recurse -Force $TempShare }

Write-Host "`nBackup completed successfully!" -ForegroundColor Green
Write-Host "1. Personal Backup (with .env.local): $PersonalZip" -ForegroundColor Green
Write-Host "2. Shareable Backup (without .env.local): $ShareZip" -ForegroundColor Green
