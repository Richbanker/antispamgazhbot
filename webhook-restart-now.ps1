# Немедленный перезапуск webhook для GuardianGazhBot
# ВНИМАНИЕ: Замените YOUR_BOT_TOKEN на ваш реальный токен!

$botToken = "YOUR_BOT_TOKEN"
$webhookUrl = "https://antispamgazhbot.vercel.app/bot"

Write-Host "🔄 Принудительный перезапуск webhook..." -ForegroundColor Yellow
Write-Host "📡 URL: $webhookUrl" -ForegroundColor Cyan

if ($botToken -eq "YOUR_BOT_TOKEN") {
    Write-Host ""
    Write-Host "❌ ОСТАНОВКА! Вам нужно заменить YOUR_BOT_TOKEN на реальный токен" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Инструкция:" -ForegroundColor Yellow
    Write-Host "1. Откройте этот файл: webhook-restart-now.ps1" -ForegroundColor White
    Write-Host "2. Замените YOUR_BOT_TOKEN на ваш токен от @BotFather" -ForegroundColor White
    Write-Host "3. Сохраните файл и запустите снова" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

$body = @{
    url = $webhookUrl
    drop_pending_updates = $true
    allowed_updates = @('message', 'callback_query', 'chat_member')
} | ConvertTo-Json

try {
    Write-Host "🌐 Удаляем старый webhook..." -ForegroundColor Yellow
    $deleteResponse = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/deleteWebhook" -Method Post
    
    if ($deleteResponse.ok) {
        Write-Host "✅ Старый webhook удален" -ForegroundColor Green
    }
    
    Start-Sleep -Seconds 2
    
    Write-Host "🔗 Устанавливаем новый webhook..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook" -Method Post -Body $body -ContentType "application/json"
    
    if ($response.ok) {
        Write-Host ""
        Write-Host "🎉 WEBHOOK УСПЕШНО ОБНОВЛЕН!" -ForegroundColor Green
        Write-Host "📡 URL: $webhookUrl" -ForegroundColor Cyan
        Write-Host "🤖 Бот: @GuardianGazhBot" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "🧪 ТЕСТ КОМАНД:" -ForegroundColor Yellow
        Write-Host "Попробуйте в боте:" -ForegroundColor White
        Write-Host "• /test_moderation" -ForegroundColor White
        Write-Host "• /badwords" -ForegroundColor White
        Write-Host "• /badwords list" -ForegroundColor White
        Write-Host ""
        Write-Host "📝 Описание webhook:" -ForegroundColor Cyan
        Write-Host "$($response.description)" -ForegroundColor White
    } else {
        Write-Host "❌ Ошибка установки webhook: $($response.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Ошибка подключения к Telegram API:" -ForegroundColor Red
    Write-Host "$($_.Exception.Message)" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Возможные причины:" -ForegroundColor Yellow
    Write-Host "• Неверный токен бота" -ForegroundColor White
    Write-Host "• Проблемы с интернетом" -ForegroundColor White
    Write-Host "• Блокировка Telegram API" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 