# Simple webhook update script
Write-Host "WEBHOOK UPDATE FOR @GuardianGazhBot" -ForegroundColor Red
Write-Host "====================================" -ForegroundColor Red

$baseUrl = "https://antispamgazhbot.vercel.app"
$path = "/bot"
$webhookUrl = "$baseUrl$path"
Write-Host "Webhook URL: $webhookUrl" -ForegroundColor Cyan

Write-Host "Enter your bot token (from @BotFather):" -ForegroundColor Yellow
$botToken = Read-Host "BOT_TOKEN"

if ([string]::IsNullOrWhiteSpace($botToken)) {
    Write-Host "Token cannot be empty!" -ForegroundColor Red
    exit 1
}

Write-Host "Deleting old webhook..." -ForegroundColor Yellow

try {
    $deleteUrl = "https://api.telegram.org/bot$botToken/deleteWebhook"
    $deleteResponse = Invoke-RestMethod -Uri $deleteUrl -Method Post
    
    if ($deleteResponse.ok) {
        Write-Host "Old webhook deleted successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "Error deleting webhook: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

Write-Host "Setting new webhook..." -ForegroundColor Yellow

$secret = Read-Host "Optional WEBHOOK_SECRET (press Enter to skip)"
$payload = @{ url = $webhookUrl; drop_pending_updates = $true; allowed_updates = @('message','callback_query','chat_member') }
if ($secret -and $secret.Trim() -ne "") { $payload.secret_token = $secret }
$body = $payload | ConvertTo-Json

try {
    $setUrl = "https://api.telegram.org/bot$botToken/setWebhook"
    $response = Invoke-RestMethod -Uri $setUrl -Method Post -Body $body -ContentType "application/json"
    
    if ($response.ok) {
        Write-Host ""
        Write-Host "WEBHOOK UPDATED SUCCESSFULLY!" -ForegroundColor Green
        Write-Host "URL: $webhookUrl" -ForegroundColor Cyan
        Write-Host "Description: $($response.description)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "TEST THESE COMMANDS:" -ForegroundColor Yellow
        Write-Host "• /test_moderation" -ForegroundColor White  
        Write-Host "• /badwords list" -ForegroundColor White
        Write-Host "• /modlog" -ForegroundColor White
        Write-Host "• /modstats" -ForegroundColor White
        
    } else {
        Write-Host "ERROR: $($response.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "Connection error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host 