param(
  [Parameter(Mandatory = $true)][ValidateSet("dashboard","nginx","python","node")] [string]$Lab
)

$urls = @{
  "dashboard" = "http://localhost:9091"
  "nginx"     = "http://localhost:8080"
  "python"    = "http://localhost:8081"
  "node"      = "http://localhost:8082"
}

Start-Process $urls[$Lab]
