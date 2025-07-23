# PowerShell скрипт для перезапуска Telegram webhook
# Замените YOUR_BOT_TOKEN на ваш реальный токен

$botToken = "YOUR_BOT_TOKEN"
$webhookUrl = "https://antispamgazhbot.vercel.app/bot"

if ($botToken -eq "YOUR_BOT_TOKEN") {
    Write-Host "❌ Замените YOUR_BOT_TOKEN на ваш реальный токен в скрипте" -ForegroundColor Red
    exit 1
}

Write-Host "🔄 Обновление webhook..." -ForegroundColor Yellow

$body = @{
    url = $webhookUrl
    drop_pending_updates = $true
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Method Post -Body $body -ContentType "application/json"
    
    if ($response.ok) {
        Write-Host "✅ Webhook успешно обновлен!" -ForegroundColor Green
        Write-Host "📡 URL: $webhookUrl" -ForegroundColor Cyan
        Write-Host "🤖 Попробуйте команду /badwords в боте" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Ошибка: $($response.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Ошибка подключения: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n💡 Если команды не работают, проверьте переменные окружения в Vercel!" -ForegroundColor Yellow 