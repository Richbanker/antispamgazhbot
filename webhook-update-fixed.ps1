# Исправленный скрипт для обновления webhook
Write-Host "🚨 ОБНОВЛЕНИЕ WEBHOOK ДЛЯ @GuardianGazhBot" -ForegroundColor Red
Write-Host "=============================================" -ForegroundColor Red
Write-Host ""

$webhookUrl = "https://antispamgazhbot.vercel.app/bot"
Write-Host "📡 Webhook URL: $webhookUrl" -ForegroundColor Cyan
Write-Host ""

# Запрос токена
Write-Host "🔑 Введите токен вашего бота (от @BotFather):" -ForegroundColor Yellow
$botToken = Read-Host "BOT_TOKEN"

if ([string]::IsNullOrWhiteSpace($botToken)) {
    Write-Host "❌ Токен не может быть пустым!" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "🔄 Удаляем старый webhook..." -ForegroundColor Yellow

try {
    $deleteUrl = "https://api.telegram.org/bot$botToken/deleteWebhook"
    $deleteResponse = Invoke-RestMethod -Uri $deleteUrl -Method Post
    
    if ($deleteResponse.ok) {
        Write-Host "✅ Старый webhook удален" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Удаление: $($deleteResponse.description)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Ошибка удаления: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "⏱️ Ждем 2 секунды..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

Write-Host "🔄 Устанавливаем новый webhook..." -ForegroundColor Yellow

$body = @{
    url = $webhookUrl
    drop_pending_updates = $true
    allowed_updates = @('message', 'callback_query', 'chat_member')
} | ConvertTo-Json

try {
    $setUrl = "https://api.telegram.org/bot$botToken/setWebhook"
    $response = Invoke-RestMethod -Uri $setUrl -Method Post -Body $body -ContentType "application/json"
    
    if ($response.ok) {
        Write-Host ""
        Write-Host "🎉 WEBHOOK УСПЕШНО ОБНОВЛЕН! 🎉" -ForegroundColor Green
        Write-Host "=================================" -ForegroundColor Green
        Write-Host "✅ URL: $webhookUrl" -ForegroundColor Cyan
        Write-Host "✅ Описание: $($response.description)" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "🧪 ТЕСТИРУЙТЕ КОМАНДЫ:" -ForegroundColor Yellow
        Write-Host "• /test_moderation" -ForegroundColor White  
        Write-Host "• /badwords list" -ForegroundColor White
        Write-Host "• /modlog" -ForegroundColor White
        Write-Host "• /modstats" -ForegroundColor White
        Write-Host ""
        
    } else {
        Write-Host "❌ ОШИБКА: $($response.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Ошибка подключения: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Проверьте:" -ForegroundColor Yellow
    Write-Host "• Правильность токена" -ForegroundColor White
    Write-Host "• Интернет соединение" -ForegroundColor White
}

Write-Host ""
Write-Host "Нажмите Enter для выхода..."
Read-Host 