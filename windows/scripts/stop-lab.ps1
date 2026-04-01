param(
  [Parameter(Mandatory = $true)][string]$Distro,
  [Parameter(Mandatory = $true)][ValidateSet("hello","nginx","python","node","redis")] [string]$Lab
)

$commands = @{
  "hello"  = "kraft stop ukl-hello || true"
  "nginx"  = "kraft stop ukl-nginx || true"
  "python" = "kraft stop ukl-python || true"
  "node"   = "kraft stop ukl-node || true"
  "redis"  = "kraft stop ukl-redis || true"
}

wsl.exe -d $Distro -- bash -lc $commands[$Lab]
