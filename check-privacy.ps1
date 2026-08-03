# Quick Group Privacy check
$BotToken = $env:TELEGRAM_BOT_TOKEN

if ([string]::IsNullOrWhiteSpace($BotToken)) {
    Write-Error "The TELEGRAM_BOT_TOKEN environment variable is not set."
    exit 1
}

Write-Host "Checking Group Privacy settings..." -ForegroundColor Yellow

try {
    $botInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$BotToken/getMe"

    if ($botInfo.ok) {
        $bot = $botInfo.result
        Write-Host "`nBot: @$($bot.username)" -ForegroundColor Cyan
        Write-Host "ID: $($bot.id)" -ForegroundColor White

        if ($bot.can_read_all_group_messages -eq $true) {
            Write-Host "Group Privacy is disabled." -ForegroundColor Green
            Write-Host "The bot can read all group messages." -ForegroundColor Green
        } else {
            Write-Host "Group Privacy is enabled." -ForegroundColor Red
            Write-Host "The bot cannot read all group messages." -ForegroundColor Red
            Write-Host "`nHow to disable it:" -ForegroundColor Yellow
            Write-Host "1. Open @BotFather" -ForegroundColor White
            Write-Host "2. /mybots → GuardianGazhBot" -ForegroundColor White
            Write-Host "3. Bot Settings → Group Privacy" -ForegroundColor White
            Write-Host "4. Select 'Turn Off'" -ForegroundColor White
        }
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nRun this script again after changing the setting." -ForegroundColor Yellow
