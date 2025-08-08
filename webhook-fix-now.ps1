param([string]$BotToken)

Write-Host "FIXING WEBHOOK NOW..." -ForegroundColor Red

$baseUrl = "https://antispamgazhbot.vercel.app"
$path = "/bot"
$webhookUrl = "$baseUrl$path"

# Delete old webhook
try {
    $deleteUrl = "https://api.telegram.org/bot$BotToken/deleteWebhook"
    $deleteResponse = Invoke-RestMethod -Uri $deleteUrl -Method Post
    Write-Host "Old webhook deleted: $($deleteResponse.ok)" -ForegroundColor Yellow
} catch {
    Write-Host "Delete error: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# Set new webhook
$payload = @{ url = $webhookUrl; drop_pending_updates = $true; allowed_updates = @('message','callback_query','chat_member') }
$body = $payload | ConvertTo-Json

try {
    $setUrl = "https://api.telegram.org/bot$BotToken/setWebhook"
    $response = Invoke-RestMethod -Uri $setUrl -Method Post -Body $body -ContentType "application/json"
    
    if ($response.ok) {
        Write-Host "SUCCESS! Webhook updated" -ForegroundColor Green
        Write-Host "URL: $webhookUrl" -ForegroundColor Cyan
        Write-Host "Description: $($response.description)" -ForegroundColor White
        Write-Host ""
        Write-Host "TEST COMMANDS NOW:" -ForegroundColor Yellow
        Write-Host "/test_moderation" -ForegroundColor White
        Write-Host "/badwords list" -ForegroundColor White
        Write-Host "/help" -ForegroundColor White
    } else {
        Write-Host "ERROR: $($response.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "Set error: $($_.Exception.Message)" -ForegroundColor Red
} 