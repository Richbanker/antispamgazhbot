param(
    [Parameter(Mandatory=$true)]
    [string]$BotToken
)

# Non-interactive webhook update script
Write-Host "WEBHOOK UPDATE FOR @GuardianGazhBot" -ForegroundColor Red
Write-Host "====================================" -ForegroundColor Red

$webhookUrl = "https://antispamgazhbot.vercel.app/bot"
Write-Host "Webhook URL: $webhookUrl" -ForegroundColor Cyan

Write-Host "Using provided bot token..." -ForegroundColor Yellow

Write-Host "Step 1: Deleting old webhook..." -ForegroundColor Yellow

try {
    $deleteUrl = "https://api.telegram.org/bot$BotToken/deleteWebhook"
    $deleteResponse = Invoke-RestMethod -Uri $deleteUrl -Method Post
    
    if ($deleteResponse.ok) {
        Write-Host "✓ Old webhook deleted successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ Delete response: $($deleteResponse.description)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Error deleting webhook: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Waiting 2 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

Write-Host "Step 2: Setting new webhook..." -ForegroundColor Yellow

$body = @{
    url = $webhookUrl
    drop_pending_updates = $true
    allowed_updates = @('message', 'callback_query', 'chat_member')
} | ConvertTo-Json

try {
    $setUrl = "https://api.telegram.org/bot$BotToken/setWebhook"
    $response = Invoke-RestMethod -Uri $setUrl -Method Post -Body $body -ContentType "application/json"
    
    if ($response.ok) {
        Write-Host ""
        Write-Host "🎉 WEBHOOK UPDATED SUCCESSFULLY! 🎉" -ForegroundColor Green
        Write-Host "=================================" -ForegroundColor Green
        Write-Host "✓ URL: $webhookUrl" -ForegroundColor Cyan
        Write-Host "✓ Description: $($response.description)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "NOW TEST THESE COMMANDS IN YOUR BOT:" -ForegroundColor Yellow
        Write-Host "• /test_moderation  (should respond with 'System v2.0.0 active')" -ForegroundColor White  
        Write-Host "• /badwords list    (should show 17 banned words)" -ForegroundColor White
        Write-Host "• /modlog          (should show recent actions)" -ForegroundColor White
        Write-Host "• /modstats        (should show statistics)" -ForegroundColor White
        Write-Host "• /help            (should show new moderation commands)" -ForegroundColor White
        Write-Host ""
        Write-Host "If commands don't work immediately:" -ForegroundColor Cyan
        Write-Host "- Wait 1-2 minutes for Telegram cache to clear" -ForegroundColor White
        Write-Host "- Restart Telegram app" -ForegroundColor White
        Write-Host "- Try commands again" -ForegroundColor White
        
    } else {
        Write-Host "✗ ERROR SETTING WEBHOOK: $($response.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Connection error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "• Invalid bot token" -ForegroundColor White
    Write-Host "• Network connectivity issues" -ForegroundColor White
    Write-Host "• Telegram API temporarily unavailable" -ForegroundColor White
}

Write-Host ""
Write-Host "Webhook update process completed." -ForegroundColor Cyan 