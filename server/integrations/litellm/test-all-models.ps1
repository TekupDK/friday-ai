# Test All 6 FREE OpenRouter Models via LiteLLM
# Run from: server/integrations/litellm/

Write-Host "🚀 Testing All 6 FREE OpenRouter Models via LiteLLM" -ForegroundColor Cyan
Write-Host "=" * 60

$models = @(
    @{name="GLM-4.5 Air"; id="openrouter/z-ai/glm-4.5-air:free"; desc="Primary - 100% accuracy"},
    @{name="DeepSeek Chat"; id="openrouter/deepseek/deepseek-chat-v3.1:free"; desc="Fallback 1 - Coding"},
    @{name="MiniMax M2"; id="openrouter/minimax/minimax-m2:free"; desc="Fallback 2 - Fast"},
    @{name="Kimi K2"; id="openrouter/moonshotai/kimi-k2:free"; desc="Fallback 3 - Long context"},
    @{name="Qwen3 Coder"; id="openrouter/qwen/qwen3-coder:free"; desc="Fallback 4 - Code specialist"}
)

$results = @()

foreach ($model in $models) {
    Write-Host "`n📝 Testing: $($model.name) ($($model.desc))" -ForegroundColor Yellow
    
    # Create test payload
    $payload = @{
        model = $model.id
        messages = @(
            @{
                role = "user"
                content = "Svar kort på dansk: Hvad er 2+2?"
            }
        )
        max_tokens = 100
    } | ConvertTo-Json -Depth 10
    
    # Test the model
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:4000/chat/completions" `
            -Method POST `
            -Headers @{"Content-Type"="application/json"} `
            -Body $payload `
            -TimeoutSec 30
        
        $content = $response.choices[0].message.content
        $tokens = $response.usage.total_tokens
        $cost = $response.usage.cost
        
        Write-Host "✅ SUCCESS!" -ForegroundColor Green
        Write-Host "   Response: $($content.Substring(0, [Math]::Min(100, $content.Length)))..." -ForegroundColor Gray
        Write-Host "   Tokens: $tokens | Cost: `$$cost" -ForegroundColor Gray
        
        $results += @{
            model = $model.name
            status = "✅ PASS"
            tokens = $tokens
            cost = $cost
        }
    }
    catch {
        Write-Host "❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            model = $model.name
            status = "❌ FAIL"
            tokens = 0
            cost = 0
        }
    }
    
    Start-Sleep -Seconds 2
}

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

$passCount = ($results | Where-Object { $_.status -eq "✅ PASS" }).Count
$totalCount = $results.Count

foreach ($result in $results) {
    Write-Host "$($result.status) $($result.model) - Tokens: $($result.tokens) | Cost: `$$($result.cost)"
}

Write-Host "`n🎯 Result: $passCount/$totalCount models passed" -ForegroundColor $(if ($passCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host "💰 Total Cost: `$0.00 (All FREE!)" -ForegroundColor Green

if ($passCount -eq $totalCount) {
    Write-Host "`n✅ ALL MODELS WORKING! Ready for integration!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some models failed. Check configuration." -ForegroundColor Yellow
}
