# Tekup AI v2 - System Resource Monitor
# Overvåger CPU, GPU, RAM og disk brug og logger til fil
# Kør: .\scripts\monitor-system-resources.ps1

param(
    [int]$IntervalSeconds = 5,
    [int]$DurationMinutes = 0,  # 0 = kør indtil Ctrl+C
    [string]$LogFile = "logs/system-resources.log",
    [switch]$ShowGUI,
    [switch]$ExportCSV
)

$Host.UI.RawUI.WindowTitle = "Tekup System Resource Monitor"

# Opret logs mappe hvis den ikke findes
$logDir = Split-Path -Parent $LogFile
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# CSV export fil
$csvFile = if ($ExportCSV) { $LogFile -replace '\.log$', '.csv' } else { $null }
if ($ExportCSV -and $csvFile) {
    $csvHeader = "Timestamp,CPU_Percent,GPU_Percent,RAM_Used_GB,RAM_Total_GB,RAM_Percent,Disk_Read_MBps,Disk_Write_MBps,Network_Received_MBps,Network_Sent_MBps,Top_Process_CPU,Top_Process_RAM_MB"
    $csvHeader | Out-File -FilePath $csvFile -Encoding UTF8 -Force
}

# Global variabel til CPU måling over tid
$script:lastCpuMeasurement = $null
$script:lastCpuTime = $null

# Funktion til at hente CPU brug
function Get-CpuUsage {
    try {
        # Metode 1: Prøv Get-Counter med sample interval
        $cpu = Get-Counter '\Processor(_Total)\% Processor Time' -SampleInterval 1 -MaxSamples 1 -ErrorAction SilentlyContinue
        if ($cpu -and $cpu.CounterSamples.Count -gt 0 -and $cpu.CounterSamples[0].CookedValue) {
            return [math]::Round($cpu.CounterSamples[0].CookedValue, 2)
        }
        
        # Metode 2: Mål CPU over tid ved at sammenligne process CPU brug
        $now = Get-Date
        $processes = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.CPU } | Measure-Object -Property CPU -Sum
        $totalCpu = if ($processes) { $processes.Sum } else { 0 }
        
        if ($script:lastCpuMeasurement -ne $null -and $script:lastCpuTime -ne $null) {
            $timeDiff = ($now - $script:lastCpuTime).TotalSeconds
            if ($timeDiff -gt 0) {
                $cpuDiff = ($totalCpu - $script:lastCpuMeasurement) / $timeDiff
                $numCores = (Get-CimInstance Win32_ComputerSystem -ErrorAction SilentlyContinue).NumberOfLogicalProcessors
                if ($numCores -and $numCores -gt 0) {
                    $cpuPercent = ($cpuDiff / $numCores) * 100
                    if ($cpuPercent -ge 0 -and $cpuPercent -le 100) {
                        $script:lastCpuMeasurement = $totalCpu
                        $script:lastCpuTime = $now
                        return [math]::Round($cpuPercent, 2)
                    }
                }
            }
        }
        
        # Initialiser første måling
        $script:lastCpuMeasurement = $totalCpu
        $script:lastCpuTime = $now
        
        # Metode 3: Brug WMI LoadPercentage som fallback
        $proc = Get-CimInstance Win32_Processor -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($proc -and $proc.LoadPercentage -ne $null) {
            return [math]::Round($proc.LoadPercentage, 2)
        }
    } catch {
        # Ignorer fejl
    }
    return 0
}

# Funktion til at hente GPU brug (kræver NVIDIA eller AMD driver)
function Get-GpuUsage {
    try {
        # Prøv NVIDIA først
        $nvidia = nvidia-smi --query-gpu=utilization.gpu --format=csv,noheader,nounits -ErrorAction SilentlyContinue
        if ($nvidia) {
            return [math]::Round([double]$nvidia, 2)
        }
        
        # Prøv AMD (hvis tilgængelig)
        # AMD kræver ekstra tools - skip for nu
        
        return $null
    } catch {
        return $null
    }
}

# Funktion til at hente RAM info
function Get-RamInfo {
    $os = Get-CimInstance Win32_OperatingSystem
    $ramTotal = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
    $ramFree = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
    $ramUsed = $ramTotal - $ramFree
    $ramPercent = [math]::Round(($ramUsed / $ramTotal) * 100, 2)
    
    return @{
        Total = $ramTotal
        Used = $ramUsed
        Free = $ramFree
        Percent = $ramPercent
    }
}

# Global variabel til Disk I/O måling over tid
$script:lastDiskRead = $null
$script:lastDiskWrite = $null
$script:lastDiskTime = $null

# Funktion til at hente disk I/O
function Get-DiskIO {
    try {
        # Metode 1: Prøv Get-Counter med sample interval
        $disk = Get-Counter '\PhysicalDisk(_Total)\Disk Read Bytes/sec', '\PhysicalDisk(_Total)\Disk Write Bytes/sec' -SampleInterval 1 -MaxSamples 1 -ErrorAction SilentlyContinue
        if ($disk -and $disk.CounterSamples.Count -ge 2) {
            $readMBps = [math]::Round($disk.CounterSamples[0].CookedValue / 1MB, 2)
            $writeMBps = [math]::Round($disk.CounterSamples[1].CookedValue / 1MB, 2)
            return @{
                ReadMBps = $readMBps
                WriteMBps = $writeMBps
            }
        }
        
        # Metode 2: Mål disk I/O over tid ved at sammenligne raw data
        $now = Get-Date
        $diskData = Get-CimInstance Win32_PerfRawData_PerfDisk_PhysicalDisk -Filter "Name='_Total'" -ErrorAction SilentlyContinue
        if ($diskData) {
            $readBytes = $diskData.DiskReadBytesPerSec
            $writeBytes = $diskData.DiskWriteBytesPerSec
            
            if ($script:lastDiskRead -ne $null -and $script:lastDiskTime -ne $null) {
                $timeDiff = ($now - $script:lastDiskTime).TotalSeconds
                if ($timeDiff -gt 0) {
                    $readDiff = ($readBytes - $script:lastDiskRead) / $timeDiff
                    $writeDiff = ($writeBytes - $script:lastDiskWrite) / $timeDiff
                    $readMBps = [math]::Round($readDiff / 1MB, 2)
                    $writeMBps = [math]::Round($writeDiff / 1MB, 2)
                    
                    $script:lastDiskRead = $readBytes
                    $script:lastDiskWrite = $writeBytes
                    $script:lastDiskTime = $now
                    
                    return @{
                        ReadMBps = [math]::Max(0, $readMBps)
                        WriteMBps = [math]::Max(0, $writeMBps)
                    }
                }
            }
            
            # Initialiser første måling
            $script:lastDiskRead = $readBytes
            $script:lastDiskWrite = $writeBytes
            $script:lastDiskTime = $now
        }
    } catch {
        # Ignorer fejl
    }
    return @{ ReadMBps = 0; WriteMBps = 0 }
}

# Funktion til at hente network I/O
function Get-NetworkIO {
    $net = Get-Counter '\Network Interface(*)\Bytes Received/sec', '\Network Interface(*)\Bytes Sent/sec' -ErrorAction SilentlyContinue
    if ($net) {
        $received = ($net.CounterSamples | Where-Object { $_.Path -like '*Bytes Received/sec*' } | Measure-Object -Property CookedValue -Sum).Sum
        $sent = ($net.CounterSamples | Where-Object { $_.Path -like '*Bytes Sent/sec*' } | Measure-Object -Property CookedValue -Sum).Sum
        return @{
            ReceivedMBps = [math]::Round($received / 1MB, 2)
            SentMBps = [math]::Round($sent / 1MB, 2)
        }
    }
    return @{ ReceivedMBps = 0; SentMBps = 0 }
}

# Funktion til at finde top processer
function Get-TopProcesses {
    $processes = Get-Process | Where-Object { $_.CPU -gt 0 -or $_.WorkingSet -gt 100MB } | 
        Select-Object ProcessName, 
            @{Name="CPU";Expression={[math]::Round($_.CPU, 2)}}, 
            @{Name="RAM_MB";Expression={[math]::Round($_.WorkingSet / 1MB, 2)}} |
        Sort-Object CPU -Descending | Select-Object -First 5
    
    $topCpu = if ($processes) { $processes[0].ProcessName } else { "N/A" }
    $topRam = ($processes | Sort-Object RAM_MB -Descending | Select-Object -First 1).ProcessName
    $topRamMB = ($processes | Sort-Object RAM_MB -Descending | Select-Object -First 1).RAM_MB
    
    return @{
        TopCpu = $topCpu
        TopRam = $topRam
        TopRamMB = $topRamMB
        All = $processes
    }
}

# Funktion til at logge data
function Write-ResourceLog {
    param(
        [hashtable]$Data
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logLine = "$timestamp | CPU: $($Data.CPU)% | GPU: $($Data.GPU)% | RAM: $($Data.RAM.Used)GB/$($Data.RAM.Total)GB ($($Data.RAM.Percent)%) | Disk: R:$($Data.Disk.ReadMBps)MB/s W:$($Data.Disk.WriteMBps)MB/s | Net: Down:$($Data.Network.ReceivedMBps)MB/s Up:$($Data.Network.SentMBps)MB/s | Top: $($Data.TopProcesses.TopCpu)"
    
    # Skriv til log fil
    $logLine | Out-File -FilePath $LogFile -Append -Encoding UTF8
    
    # Skriv til CSV hvis aktiveret
    if ($ExportCSV -and $csvFile) {
        $csvLine = "$timestamp,$($Data.CPU),$($Data.GPU),$($Data.RAM.Used),$($Data.RAM.Total),$($Data.RAM.Percent),$($Data.Disk.ReadMBps),$($Data.Disk.WriteMBps),$($Data.Network.ReceivedMBps),$($Data.Network.SentMBps),$($Data.TopProcesses.TopCpu),$($Data.TopProcesses.TopRamMB)"
        $csvLine | Out-File -FilePath $csvFile -Append -Encoding UTF8
    }
    
    return $logLine
}

# Funktion til at vise anbefalinger
function Show-Recommendations {
    param(
        [hashtable]$Data
    )
    
    $recommendations = @()
    
    # RAM anbefalinger
    if ($Data.RAM.Percent -gt 85) {
        $recommendations += "[WARNING] RAM brug er hoj ($($Data.RAM.Percent)%) - Overvej at lukke unodvendige programmer"
    } elseif ($Data.RAM.Percent -gt 70) {
        $recommendations += "[INFO] RAM brug er moderat ($($Data.RAM.Percent)%) - Overvaag noje"
    }
    
    # CPU anbefalinger
    if ($Data.CPU -gt 90) {
        $recommendations += "[WARNING] CPU brug er meget hoj ($($Data.CPU)%) - Systemet kan vaere langsomt"
    } elseif ($Data.CPU -gt 70) {
        $recommendations += "[INFO] CPU brug er hoj ($($Data.CPU)%) - Overvej at reducere belastning"
    }
    
    # Top processer
    if ($Data.TopProcesses.All) {
        $heavyProcesses = $Data.TopProcesses.All | Where-Object { $_.RAM_MB -gt 500 -or $_.CPU -gt 10 }
        if ($heavyProcesses) {
            $recommendations += "[INFO] Tunge processer: $($heavyProcesses.ProcessName -join ', ')"
        }
    }
    
    return $recommendations
}

# Funktion til at vise statistik
function Show-Statistics {
    param(
        [array]$History
    )
    
    if ($History.Count -eq 0) { return }
    
    $avgCpu = ($History | Measure-Object -Property CPU -Average).Average
    $maxCpu = ($History | Measure-Object -Property CPU -Maximum).Maximum
    $avgRam = ($History | Measure-Object -Property { $_.RAM.Percent } -Average).Average
    $maxRam = ($History | Measure-Object -Property { $_.RAM.Percent } -Maximum).Maximum
    
    Write-Host "`n[STATS] Statistik (sidste $($History.Count) maalinger):" -ForegroundColor Cyan
    Write-Host "   CPU:  Gennemsnit: $([math]::Round($avgCpu, 1))% | Maks: $([math]::Round($maxCpu, 1))%" -ForegroundColor White
    Write-Host "   RAM:  Gennemsnit: $([math]::Round($avgRam, 1))% | Maks: $([math]::Round($maxRam, 1))%" -ForegroundColor White
}

# Header
Clear-Host
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "   TEKUP AI V2 - SYSTEM RESOURCE MONITOR                    " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[LOG] Log fil: $LogFile" -ForegroundColor Yellow
if ($ExportCSV) {
    Write-Host "[CSV] CSV export: $csvFile" -ForegroundColor Yellow
}
Write-Host "[TIME] Interval: $IntervalSeconds sekunder" -ForegroundColor Yellow
if ($DurationMinutes -gt 0) {
    Write-Host "[DURATION] Varighed: $DurationMinutes minutter" -ForegroundColor Yellow
} else {
    Write-Host "[DURATION] Varighed: Indtil Ctrl+C" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Tryk Ctrl+C for at stoppe`n" -ForegroundColor DarkGray
Write-Host ("-" * 70) -ForegroundColor DarkGray
Write-Host ""

# Initialiser counter for disk/network (skal have baseline)
# Vent lidt for at få baseline målinger
Start-Sleep -Seconds 2

# Initialiser CPU og Disk målinger (første måling for baseline)
$null = Get-CpuUsage
$null = Get-DiskIO
Start-Sleep -Seconds 1

# Hovedloop
$startTime = Get-Date
$endTime = if ($DurationMinutes -gt 0) { $startTime.AddMinutes($DurationMinutes) } else { $null }
$history = @()
$iteration = 0

try {
    while ($true) {
        $iteration++
        
        # Tjek om tiden er udløbet
        if ($endTime -and (Get-Date) -ge $endTime) {
            Write-Host "`n[TIME] Tidsgraense naaet. Stopper monitoring..." -ForegroundColor Yellow
            break
        }
        
        # Hent alle metrics
        $cpu = Get-CpuUsage
        $gpu = Get-GpuUsage
        $ram = Get-RamInfo
        $disk = Get-DiskIO
        $network = Get-NetworkIO
        $topProcesses = Get-TopProcesses
        
        # Opret data objekt
        $data = @{
            CPU = $cpu
            GPU = if ($gpu) { $gpu } else { 0 }
            RAM = $ram
            Disk = $disk
            Network = $network
            TopProcesses = $topProcesses
            Timestamp = Get-Date
        }
        
        # Gem i historik
        $history += $data
        if ($history.Count -gt 1000) {
            $history = $history[-1000..-1]  # Behold kun sidste 1000
        }
        
        # Log data
        $logLine = Write-ResourceLog -Data $data
        
        # Vis i konsol
        $gpuDisplay = if ($gpu) { "$gpu%" } else { "N/A" }
        Write-Host "$logLine" -ForegroundColor White
        
        # Vis anbefalinger hver 10. iteration
        if ($iteration % 10 -eq 0) {
            $recommendations = Show-Recommendations -Data $data
            if ($recommendations.Count -gt 0) {
                Write-Host ""
                foreach ($rec in $recommendations) {
                    Write-Host "   $rec" -ForegroundColor Yellow
                }
                Write-Host ""
            }
        }
        
        # Vis statistik hver 20. iteration
        if ($iteration % 20 -eq 0 -and $history.Count -gt 0) {
            Show-Statistics -History $history
            Write-Host ""
        }
        
        # Vent til næste måling
        Start-Sleep -Seconds $IntervalSeconds
        
    }
} catch {
    Write-Host "`n[ERROR] Fejl under monitoring: $_" -ForegroundColor Red
} finally {
    # Vis final statistik
    Write-Host "`n" + ("=" * 70) -ForegroundColor Cyan
    Write-Host "[STATS] FINAL STATISTIK" -ForegroundColor Cyan
    Write-Host ("=" * 70) -ForegroundColor Cyan
    
    if ($history.Count -gt 0) {
        $totalTime = ((Get-Date) - $startTime).TotalMinutes
        $avgCpu = ($history | Measure-Object -Property CPU -Average).Average
        $maxCpu = ($history | Measure-Object -Property CPU -Maximum).Maximum
        $minCpu = ($history | Measure-Object -Property CPU -Minimum).Minimum
        $avgRam = ($history | Measure-Object -Property { $_.RAM.Percent } -Average).Average
        $maxRam = ($history | Measure-Object -Property { $_.RAM.Percent } -Maximum).Maximum
        $minRam = ($history | Measure-Object -Property { $_.RAM.Percent } -Minimum).Minimum
        
        Write-Host "[TIME] Total tid: $([math]::Round($totalTime, 1)) minutter" -ForegroundColor White
        Write-Host "[STATS] Maalinger: $($history.Count)" -ForegroundColor White
        Write-Host ""
        Write-Host "CPU:" -ForegroundColor Yellow
        Write-Host "   Gennemsnit: $([math]::Round($avgCpu, 1))%" -ForegroundColor White
        Write-Host "   Minimum:    $([math]::Round($minCpu, 1))%" -ForegroundColor White
        Write-Host "   Maksimum:   $([math]::Round($maxCpu, 1))%" -ForegroundColor White
        Write-Host ""
        Write-Host "RAM:" -ForegroundColor Yellow
        Write-Host "   Gennemsnit: $([math]::Round($avgRam, 1))%" -ForegroundColor White
        Write-Host "   Minimum:    $([math]::Round($minRam, 1))%" -ForegroundColor White
        Write-Host "   Maksimum:   $([math]::Round($maxRam, 1))%" -ForegroundColor White
        
        if ($ExportCSV -and $csvFile) {
            Write-Host ""
            Write-Host "[OK] Data eksporteret til: $csvFile" -ForegroundColor Green
        }
    }
    
    Write-Host ""
    Write-Host "[OK] Monitoring stoppet. Log fil: $LogFile" -ForegroundColor Green
    Write-Host ""
}

