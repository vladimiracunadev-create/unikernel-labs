param(
  [Parameter(Mandatory = $true)][string]$Distro,
  [Parameter(Mandatory = $true)][ValidateSet("hello","nginx","python","node","redis")] [string]$Lab
)

$commands = @{
  "hello"  = "kraft logs ukl-hello || true"
  "nginx"  = "kraft logs ukl-nginx || true"
  "python" = "kraft logs ukl-python || true"
  "node"   = "kraft logs ukl-node || true"
  "redis"  = "kraft logs ukl-redis || true"
}

wsl.exe -d $Distro -- bash -lc $commands[$Lab]
