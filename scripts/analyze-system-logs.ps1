# Tekup AI v2 - System Log Analyzer
# Analyserer system resource logs og giver forbedringsforslag

param(
    [string]$LogFile = "logs/system-resources.log",
    [int]$Hours = 24,
    [switch]$ShowChart
)

$Host.UI.RawUI.WindowTitle = "Tekup System Log Analyzer"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   TEKUP AI V2 - SYSTEM LOG ANALYZER                         " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Tjek om log fil findes
if (-not (Test-Path $LogFile)) {
    Write-Host "[ERROR] Log fil ikke fundet: $LogFile" -ForegroundColor Red
    Write-Host "   Koer foerst: .\scripts\monitor-system-resources.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "[LOG] Analyserer: $LogFile" -ForegroundColor Yellow
Write-Host "[TIME] Tidsperiode: Sidste $Hours timer" -ForegroundColor Yellow
Write-Host ""

# Læs log fil
$lines = Get-Content $LogFile -ErrorAction SilentlyContinue
if ($lines.Count -eq 0) {
    Write-Host "[ERROR] Log fil er tom" -ForegroundColor Red
    exit 1
}

# Parse log linjer
$cutoffTime = (Get-Date).AddHours(-$Hours)
$dataPoints = @()

foreach ($line in $lines) {
    if ($line -match '(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})') {
        $timestamp = [DateTime]::Parse($matches[1])
        
        if ($timestamp -ge $cutoffTime) {
            # Parse CPU
            if ($line -match 'CPU: ([\d.]+)%') {
                $cpu = [double]$matches[1]
            } else { $cpu = 0 }
            
            # Parse GPU
            if ($line -match 'GPU: ([\d.]+)%') {
                $gpu = [double]$matches[1]
            } else { $gpu = 0 }
            
            # Parse RAM
            if ($line -match 'RAM: ([\d.]+)GB/([\d.]+)GB \(([\d.]+)%\)') {
                $ramUsed = [double]$matches[1]
                $ramTotal = [double]$matches[2]
                $ramPercent = [double]$matches[3]
            } else {
                $ramUsed = 0
                $ramTotal = 0
                $ramPercent = 0
            }
            
            # Parse Disk
            if ($line -match 'Disk: R:([\d.]+)MB/s W:([\d.]+)MB/s') {
                $diskRead = [double]$matches[1]
                $diskWrite = [double]$matches[2]
            } else {
                $diskRead = 0
                $diskWrite = 0
            }
            
            # Parse Network
            if ($line -match 'Net: Down:([\d.]+)MB/s Up:([\d.]+)MB/s') {
                $netReceived = [double]$matches[1]
                $netSent = [double]$matches[2]
            } else {
                $netReceived = 0
                $netSent = 0
            }
            
            $dataPoints += [PSCustomObject]@{
                Timestamp = $timestamp
                CPU = $cpu
                GPU = $gpu
                RAMUsed = $ramUsed
                RAMTotal = $ramTotal
                RAMPercent = $ramPercent
                DiskRead = $diskRead
                DiskWrite = $diskWrite
                NetReceived = $netReceived
                NetSent = $netSent
            }
        }
    }
}

if ($dataPoints.Count -eq 0) {
    Write-Host "[ERROR] Ingen data fundet i den valgte tidsperiode" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Fundet $($dataPoints.Count) datapunkter" -ForegroundColor Green
Write-Host ""

# Beregn statistik
$stats = @{
    CPU = @{
        Avg = ($dataPoints | Measure-Object -Property CPU -Average).Average
        Max = ($dataPoints | Measure-Object -Property CPU -Maximum).Maximum
        Min = ($dataPoints | Measure-Object -Property CPU -Minimum).Minimum
        P95 = ($dataPoints | Sort-Object CPU)[[math]::Floor($dataPoints.Count * 0.95)].CPU
    }
    RAM = @{
        Avg = ($dataPoints | Measure-Object -Property RAMPercent -Average).Average
        Max = ($dataPoints | Measure-Object -Property RAMPercent -Maximum).Maximum
        Min = ($dataPoints | Measure-Object -Property RAMPercent -Minimum).Minimum
        P95 = ($dataPoints | Sort-Object RAMPercent)[[math]::Floor($dataPoints.Count * 0.95)].RAMPercent
    }
    GPU = @{
        Avg = ($dataPoints | Where-Object { $_.GPU -gt 0 } | Measure-Object -Property GPU -Average).Average
        Max = ($dataPoints | Measure-Object -Property GPU -Maximum).Maximum
    }
    Disk = @{
        ReadAvg = ($dataPoints | Measure-Object -Property DiskRead -Average).Average
        WriteAvg = ($dataPoints | Measure-Object -Property DiskWrite -Average).Average
        ReadMax = ($dataPoints | Measure-Object -Property DiskRead -Maximum).Maximum
        WriteMax = ($dataPoints | Measure-Object -Property DiskWrite -Maximum).Maximum
    }
    Network = @{
        ReceivedAvg = ($dataPoints | Measure-Object -Property NetReceived -Average).Average
        SentAvg = ($dataPoints | Measure-Object -Property NetSent -Average).Average
        ReceivedMax = ($dataPoints | Measure-Object -Property NetReceived -Maximum).Maximum
        SentMax = ($dataPoints | Measure-Object -Property NetSent -Maximum).Maximum
    }
}

# Vis statistik
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "[STATS] STATISTIK" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

Write-Host "[CPU] CPU:" -ForegroundColor Yellow
Write-Host "   Gennemsnit: $([math]::Round($stats.CPU.Avg, 1))%" -ForegroundColor White
Write-Host "   Minimum:    $([math]::Round($stats.CPU.Min, 1))%" -ForegroundColor White
Write-Host "   Maksimum:   $([math]::Round($stats.CPU.Max, 1))%" -ForegroundColor White
Write-Host "   95. percentil: $([math]::Round($stats.CPU.P95, 1))%" -ForegroundColor White
Write-Host ""

Write-Host "[RAM] RAM:" -ForegroundColor Yellow
Write-Host "   Gennemsnit: $([math]::Round($stats.RAM.Avg, 1))%" -ForegroundColor White
Write-Host "   Minimum:    $([math]::Round($stats.RAM.Min, 1))%" -ForegroundColor White
Write-Host "   Maksimum:   $([math]::Round($stats.RAM.Max, 1))%" -ForegroundColor White
Write-Host "   95. percentil: $([math]::Round($stats.RAM.P95, 1))%" -ForegroundColor White
Write-Host ""

if ($stats.GPU.Avg) {
    Write-Host "[GPU] GPU:" -ForegroundColor Yellow
    Write-Host "   Gennemsnit: $([math]::Round($stats.GPU.Avg, 1))%" -ForegroundColor White
    Write-Host "   Maksimum:   $([math]::Round($stats.GPU.Max, 1))%" -ForegroundColor White
    Write-Host ""
}

Write-Host "[DISK] Disk I/O:" -ForegroundColor Yellow
Write-Host "   Laes:  Gennemsnit: $([math]::Round($stats.Disk.ReadAvg, 2)) MB/s | Maks: $([math]::Round($stats.Disk.ReadMax, 2)) MB/s" -ForegroundColor White
Write-Host "   Skriv: Gennemsnit: $([math]::Round($stats.Disk.WriteAvg, 2)) MB/s | Maks: $([math]::Round($stats.Disk.WriteMax, 2)) MB/s" -ForegroundColor White
Write-Host ""

Write-Host "[NET] Netvaerk:" -ForegroundColor Yellow
Write-Host "   Modtaget: Gennemsnit: $([math]::Round($stats.Network.ReceivedAvg, 2)) MB/s | Maks: $([math]::Round($stats.Network.ReceivedMax, 2)) MB/s" -ForegroundColor White
Write-Host "   Sendt:    Gennemsnit: $([math]::Round($stats.Network.SentAvg, 2)) MB/s | Maks: $([math]::Round($stats.Network.SentMax, 2)) MB/s" -ForegroundColor White
Write-Host ""

# Anbefalinger
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "[RECOMMENDATIONS] FORBEDRINGSFORSLAG" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

$recommendations = @()

# CPU anbefalinger
if ($stats.CPU.Avg -gt 80) {
    $recommendations += "[WARNING] CPU brug er meget hoj (gennemsnit: $([math]::Round($stats.CPU.Avg, 1))%)"
    $recommendations += "   -> Overvej at opgradere CPU eller reducere antal samtidige processer"
    $recommendations += "   -> Tjek for CPU-intensive programmer og luk dem hvis muligt"
} elseif ($stats.CPU.Avg -gt 60) {
    $recommendations += "[INFO] CPU brug er moderat-hoj (gennemsnit: $([math]::Round($stats.CPU.Avg, 1))%)"
    $recommendations += "   -> Overvaag noje og overvej optimering"
}

if ($stats.CPU.P95 -gt 90) {
    $recommendations += "[WARNING] CPU spikes op til $([math]::Round($stats.CPU.P95, 1))% - systemet kan vaere langsomt under belastning"
}

# RAM anbefalinger
if ($stats.RAM.Avg -gt 85) {
    $recommendations += "[WARNING] RAM brug er meget hoj (gennemsnit: $([math]::Round($stats.RAM.Avg, 1))%)"
    $recommendations += "   -> Overvej at tilfoeje mere RAM eller lukke unodvendige programmer"
    $recommendations += "   -> Koer: .\scripts\optimize-performance.ps1 for at frigoe RAM"
} elseif ($stats.RAM.Avg -gt 70) {
    $recommendations += "[INFO] RAM brug er moderat-hoj (gennemsnit: $([math]::Round($stats.RAM.Avg, 1))%)"
    $recommendations += "   -> Overvaag noje og luk unodvendige programmer"
}

if ($stats.RAM.Max -gt 95) {
    $recommendations += "[WARNING] RAM brug naaede $([math]::Round($stats.RAM.Max, 1))% - systemet kan have brugt swap/virtual memory"
    $recommendations += "   -> Dette kan drastisk reducere ydeevne"
}

# Disk anbefalinger
if ($stats.Disk.ReadAvg -gt 50 -or $stats.Disk.WriteAvg -gt 50) {
    $recommendations += "[INFO] Disk I/O er hoj"
    $recommendations += "   -> Overvej at opgradere til SSD hvis du bruger HDD"
    $recommendations += "   -> Tjek for disk-intensive operationer"
}

# Network anbefalinger
if ($stats.Network.ReceivedAvg -gt 10 -or $stats.Network.SentAvg -gt 10) {
    $recommendations += "[INFO] Netvaerksaktivitet er hoj"
    $recommendations += "   -> Tjek om der er unodvendig dataoverfoersel"
}

# Generelle anbefalinger
if ($stats.CPU.Avg -lt 30 -and $stats.RAM.Avg -lt 50) {
    $recommendations += "[OK] System ressourcer ser sunde ud!"
    $recommendations += "   -> Du har god kapacitet til yderligere belastning"
}

# Vis anbefalinger
if ($recommendations.Count -eq 0) {
    Write-Host "[OK] Ingen specifikke anbefalinger - systemet ser fint ud!" -ForegroundColor Green
} else {
    foreach ($rec in $recommendations) {
        $color = if ($rec -match '\[WARNING\]') { "Red" } elseif ($rec -match '\[INFO\]') { "Yellow" } else { "Green" }
        Write-Host $rec -ForegroundColor $color
    }
}

Write-Host ""

# Peak times analyse
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host "[PEAK] PEAK TIDER" -ForegroundColor Cyan
Write-Host ("=" * 70) -ForegroundColor Cyan
Write-Host ""

# Gruppér efter time
$hourlyStats = $dataPoints | Group-Object { $_.Timestamp.Hour } | 
    ForEach-Object {
        [PSCustomObject]@{
            Hour = $_.Name
            AvgCPU = ($_.Group | Measure-Object -Property CPU -Average).Average
            AvgRAM = ($_.Group | Measure-Object -Property RAMPercent -Average).Average
            MaxCPU = ($_.Group | Measure-Object -Property CPU -Maximum).Maximum
            MaxRAM = ($_.Group | Measure-Object -Property RAMPercent -Maximum).Maximum
        }
    } | Sort-Object AvgCPU -Descending

Write-Host "Top 5 timer med højest CPU brug:" -ForegroundColor Yellow
$hourlyStats | Select-Object -First 5 | ForEach-Object {
    Write-Host "   $($_.Hour):00 - CPU: $([math]::Round($_.AvgCPU, 1))% (maks: $([math]::Round($_.MaxCPU, 1))%) | RAM: $([math]::Round($_.AvgRAM, 1))%" -ForegroundColor White
}

Write-Host ""

Write-Host "[OK] Analyse faerdig!" -ForegroundColor Green
Write-Host ""

