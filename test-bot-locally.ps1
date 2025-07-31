# Скрипт для диагностики Telegram бота
param(
    [string]$ChatId = "",
    [string]$Message = "Тест бота"
)

# Получаем токен из .env файла или окружения
$BotToken = $env:BOT_TOKEN
if (-not $BotToken -and (Test-Path ".env")) {
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "BOT_TOKEN=([^\r\n]+)") {
        $BotToken = $matches[1]
    }
}

if (-not $BotToken) {
    Write-Host "❌ BOT_TOKEN не найден!" -ForegroundColor Red
    Write-Host "💡 Убедитесь что токен есть в .env файле или переменной окружения" -ForegroundColor Yellow
    exit 1
}

Write-Host "🧪 ТЕСТИРОВАНИЕ БОТА @GuardianGazhBot" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# 1. Проверяем информацию о боте
Write-Host "`n1. Проверяем информацию о боте..." -ForegroundColor Yellow
try {
    $botInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$BotToken/getMe" -Method Get
    if ($botInfo.ok) {
        Write-Host "✅ Бот найден:" -ForegroundColor Green
        Write-Host "   Username: @$($botInfo.result.username)" -ForegroundColor Cyan
        Write-Host "   ID: $($botInfo.result.id)" -ForegroundColor White
        Write-Host "   Имя: $($botInfo.result.first_name)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Ошибка получения информации о боте: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Проверяем webhook
Write-Host "`n2. Проверяем webhook..." -ForegroundColor Yellow
try {
    $webhookInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$BotToken/getWebhookInfo" -Method Get
    if ($webhookInfo.ok) {
        $info = $webhookInfo.result
        Write-Host "✅ Webhook настроен:" -ForegroundColor Green
        Write-Host "   URL: $($info.url)" -ForegroundColor Cyan
        Write-Host "   Pending updates: $($info.pending_update_count)" -ForegroundColor White
        
        if ($info.last_error_message) {
            Write-Host "   ⚠️ Последняя ошибка: $($info.last_error_message)" -ForegroundColor Red
        } else {
            Write-Host "   ✅ Ошибок нет" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Ошибка получения webhook: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Проверяем endpoint на Vercel
Write-Host "`n3. Проверяем endpoint на Vercel..." -ForegroundColor Yellow
try {
    $endpoint = Invoke-RestMethod -Uri "https://antispamgazhbot.vercel.app/bot" -Method Get
    Write-Host "✅ Endpoint работает:" -ForegroundColor Green
    Write-Host "   Статус: $($endpoint.status)" -ForegroundColor Cyan
    Write-Host "   Версия: $($endpoint.version)" -ForegroundColor White
    Write-Host "   Токен установлен: $($endpoint.config.hasToken)" -ForegroundColor White
} catch {
    Write-Host "❌ Ошибка подключения к endpoint: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Отправляем тестовое сообщение (если указан chat_id)
if ($ChatId -ne "") {
    Write-Host "`n4. Отправляем тестовое сообщение в чат $ChatId..." -ForegroundColor Yellow
    try {
        $body = @{
            chat_id = $ChatId
            text = "🧪 Тест: $Message"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "https://api.telegram.org/bot$BotToken/sendMessage" -Method Post -Body $body -ContentType "application/json"
        
        if ($response.ok) {
            Write-Host "✅ Сообщение отправлено успешно!" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Ошибка отправки сообщения: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Возможные причины:" -ForegroundColor Yellow
        Write-Host "   - Бот не добавлен в чат" -ForegroundColor White
        Write-Host "   - Неверный chat_id" -ForegroundColor White
        Write-Host "   - Бот заблокирован пользователем" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "🔗 Ссылка на бота: https://t.me/GuardianGazhBot" -ForegroundColor Cyan
Write-Host "💡 Для тестирования в чате добавьте параметр -ChatId YOUR_CHAT_ID" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 ВАЖНО: Если бот не отвечает в группе:" -ForegroundColor Yellow
Write-Host "   1. Откройте @BotFather" -ForegroundColor White
Write-Host "   2. /mybots → выберите бота → Bot Settings → Group Privacy" -ForegroundColor White  
Write-Host "   3. Нажмите 'Turn Off' (отключить приватность)" -ForegroundColor White
Write-Host "   4. Добавьте бота в группу как администратора" -ForegroundColor White