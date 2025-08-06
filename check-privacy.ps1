# Быстрая проверка Group Privacy
$BotToken = "7939956032:AAEM5gbuz-vegyYNJ_zswjRAF2jQ2jFeZN8"

Write-Host "🔍 Проверяю Group Privacy настройки..." -ForegroundColor Yellow

try {
    $botInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$BotToken/getMe"
    
    if ($botInfo.ok) {
        $bot = $botInfo.result
        Write-Host "`n🤖 Бот: @$($bot.username)" -ForegroundColor Cyan
        Write-Host "📊 ID: $($bot.id)" -ForegroundColor White
        
        if ($bot.can_read_all_group_messages -eq $true) {
            Write-Host "✅ Group Privacy: ОТКЛЮЧЕНА (хорошо!)" -ForegroundColor Green
            Write-Host "💬 Бот может читать все сообщения в группах" -ForegroundColor Green
        } else {
            Write-Host "❌ Group Privacy: ВКЛЮЧЕНА (проблема!)" -ForegroundColor Red
            Write-Host "🚫 Бот НЕ может читать сообщения в группах" -ForegroundColor Red
            Write-Host "`n🔧 РЕШЕНИЕ:" -ForegroundColor Yellow
            Write-Host "1. Откройте @BotFather" -ForegroundColor White
            Write-Host "2. /mybots → GuardianGazhBot" -ForegroundColor White
            Write-Host "3. Bot Settings → Group Privacy" -ForegroundColor White
            Write-Host "4. Нажмите 'Turn Off'" -ForegroundColor White
        }
    }
} catch {
    Write-Host "❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n💡 После изменения запустите этот скрипт снова" -ForegroundColor Yellow