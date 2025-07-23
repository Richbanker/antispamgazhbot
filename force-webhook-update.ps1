# ЭКСТРЕННОЕ ОБНОВЛЕНИЕ WEBHOOK
# Этот скрипт ПРИНУДИТЕЛЬНО обновит webhook для активации новых команд

Write-Host "🚨 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ WEBHOOK ДЛЯ @GuardianGazhBot" -ForegroundColor Red
Write-Host "=================================================" -ForegroundColor Red
Write-Host ""

# URL webhook
$webhookUrl = "https://antispamgazhbot.vercel.app/bot"
Write-Host "📡 Webhook URL: $webhookUrl" -ForegroundColor Cyan
Write-Host ""

# Запрос токена у пользователя
Write-Host "🔑 Введите токен вашего бота (от @BotFather):" -ForegroundColor Yellow
$botToken = Read-Host "BOT_TOKEN"

Write-Host ""
Write-Host "🔄 Шаг 1: Удаляем старый webhook..." -ForegroundColor Yellow

try {
    # Удаляем старый webhook
    $deleteUrl = "https://api.telegram.org/bot$botToken/deleteWebhook"
    $deleteResponse = Invoke-RestMethod -Uri $deleteUrl -Method Post
    
    if ($deleteResponse.ok) {
        Write-Host "✅ Старый webhook удален успешно" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Проблема с удалением: $($deleteResponse.description)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Ошибка удаления webhook: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "⏱️ Ждем 3 секунды..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "🔄 Шаг 2: Устанавливаем новый webhook..." -ForegroundColor Yellow

# Настройка нового webhook
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
        Write-Host "🎉🎉🎉 WEBHOOK УСПЕШНО ОБНОВЛЕН! 🎉🎉🎉" -ForegroundColor Green
        Write-Host "=================================================" -ForegroundColor Green
        Write-Host "✅ URL: $webhookUrl" -ForegroundColor Cyan
        Write-Host "✅ Описание: $($response.description)" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "🧪 НЕМЕДЛЕННО ПРОТЕСТИРУЙТЕ КОМАНДЫ:" -ForegroundColor Yellow
        Write-Host "=================================================" -ForegroundColor Yellow
        Write-Host "• /test_moderation - должна ответить 'Система v2.0.0 активна'" -ForegroundColor White
        Write-Host "• /badwords - должна показать справку по командам" -ForegroundColor White
        Write-Host "• /badwords list - должна показать 17 запрещенных слов" -ForegroundColor White
        Write-Host "• /help - должна показать новые команды модерации" -ForegroundColor White
        Write-Host ""
        
        Write-Host "🎯 ЕСЛИ КОМАНДЫ НЕ РАБОТАЮТ:" -ForegroundColor Red
        Write-Host "1. Подождите 1-2 минуты (Telegram кэш)" -ForegroundColor White
        Write-Host "2. Перезапустите Telegram приложение" -ForegroundColor White
        Write-Host "3. Попробуйте команды снова" -ForegroundColor White
        
    } else {
        Write-Host "❌ ОШИБКА УСТАНОВКИ WEBHOOK!" -ForegroundColor Red
        Write-Host "Описание: $($response.description)" -ForegroundColor White
    }
} catch {
    Write-Host ""
    Write-Host "❌ КРИТИЧЕСКАЯ ОШИБКА!" -ForegroundColor Red
    Write-Host "=================================================" -ForegroundColor Red
    Write-Host "Ошибка: $($_.Exception.Message)" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 ВОЗМОЖНЫЕ ПРИЧИНЫ:" -ForegroundColor Yellow
    Write-Host "• Неверный токен бота" -ForegroundColor White
    Write-Host "• Проблемы с интернетом" -ForegroundColor White
    Write-Host "• Блокировка Telegram API" -ForegroundColor White
}

Write-Host ""
Write-Host "Press Enter to exit..."
Read-Host 