param(
  [Parameter(Mandatory = $true)][ValidateSet("dashboard","nginx","python","node","redis")] [string]$Lab
)

$targets = @{
  "dashboard" = @{ Type = "http"; Url = "http://localhost:9091" }
  "nginx"     = @{ Type = "http"; Url = "http://localhost:8080" }
  "python"    = @{ Type = "http"; Url = "http://localhost:8081" }
  "node"      = @{ Type = "http"; Url = "http://localhost:8082" }
  "redis"     = @{ Type = "redis"; Host = "localhost"; Port = 6379 }
}

$target = $targets[$Lab]

if ($target.Type -eq "http") {
  try {
    $response = Invoke-WebRequest -Uri $target.Url -UseBasicParsing -TimeoutSec 4
    $body = ($response.Content | Out-String).Trim()
    if ($body.Length -gt 140) { $body = $body.Substring(0, 140) + "…" }
    Write-Host "HEALTH OK - $Lab respondió HTTP $($response.StatusCode) en $($target.Url)" -ForegroundColor Green
    if ($body) { Write-Host $body }
    exit 0
  } catch {
    Write-Host "HEALTH FAIL - $Lab no respondió correctamente en $($target.Url)" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
  }
}

if ($target.Type -eq "redis") {
  try {
    $client = [System.Net.Sockets.TcpClient]::new()
    $client.Connect($target.Host, $target.Port)
    $stream = $client.GetStream()
    $writer = [System.IO.StreamWriter]::new($stream)
    $writer.NewLine = "`r`n"
    $writer.AutoFlush = $true
    $writer.Write("*1`r`n`$4`r`nPING`r`n")

    $buffer = New-Object byte[] 64
    $read = $stream.Read($buffer, 0, $buffer.Length)
    $payload = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $read).Trim()

    $stream.Dispose()
    $client.Dispose()

    if ($payload -match 'PONG') {
      Write-Host "HEALTH OK - redis respondió PONG en $($target.Host):$($target.Port)" -ForegroundColor Green
      Write-Host $payload
      exit 0
    }

    Write-Host "HEALTH FAIL - redis respondió algo inesperado en $($target.Host):$($target.Port)" -ForegroundColor Red
    Write-Host $payload
    exit 1
  } catch {
    Write-Host "HEALTH FAIL - redis no respondió en $($target.Host):$($target.Port)" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
  }
}
