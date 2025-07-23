param(
    [Parameter(Mandatory=$true)]
    [string]$BotToken
)

Write-Host "CHECKING WEBHOOK STATUS" -ForegroundColor Yellow
Write-Host "======================" -ForegroundColor Yellow

try {
    $url = "https://api.telegram.org/bot$BotToken/getWebhookInfo"
    $response = Invoke-RestMethod -Uri $url -Method Get
    
    if ($response.ok) {
        $info = $response.result
        Write-Host ""
        Write-Host "WEBHOOK STATUS:" -ForegroundColor Green
        Write-Host "URL: $($info.url)" -ForegroundColor Cyan
        Write-Host "Has custom certificate: $($info.has_custom_certificate)" -ForegroundColor White
        Write-Host "Pending update count: $($info.pending_update_count)" -ForegroundColor White
        Write-Host "Last error date: $($info.last_error_date)" -ForegroundColor White
        Write-Host "Last error message: $($info.last_error_message)" -ForegroundColor Red
        Write-Host "Max connections: $($info.max_connections)" -ForegroundColor White
        Write-Host "Allowed updates: $($info.allowed_updates -join ', ')" -ForegroundColor White
        
        if ($info.pending_update_count -gt 0) {
            Write-Host ""
            Write-Host "WARNING: $($info.pending_update_count) pending updates!" -ForegroundColor Red
            Write-Host "This may cause delays in bot responses." -ForegroundColor Yellow
        }
        
        if ($info.last_error_message) {
            Write-Host ""
            Write-Host "LAST ERROR DETECTED!" -ForegroundColor Red
            Write-Host "Error: $($info.last_error_message)" -ForegroundColor White
            Write-Host "Recommendation: Reset webhook to clear errors" -ForegroundColor Yellow
        }
        
        if (-not $info.url) {
            Write-Host ""
            Write-Host "NO WEBHOOK SET!" -ForegroundColor Red
            Write-Host "This is why bot doesn't respond to commands." -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "Error getting webhook info: $($response.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "Failed to check webhook: $($_.Exception.Message)" -ForegroundColor Red
} 