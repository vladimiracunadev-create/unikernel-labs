param(
  [Parameter(Mandatory = $true)][string]$Distro,
  [Parameter(Mandatory = $true)][string]$LinuxRepoPath,
  [Parameter(Mandatory = $true)][ValidateSet("hello","nginx","python","node","redis","dashboard")] [string]$Lab
)

$commands = @{
  "hello"     = "cd $LinuxRepoPath/01-hello-world && kraft run -W -d --name ukl-hello"
  "nginx"     = "cd $LinuxRepoPath/02-nginx-runtime && kraft run -W -d --name ukl-nginx -p 8080:80"
  "python"    = "cd $LinuxRepoPath/03-python-http && kraft run -W -d --name ukl-python -p 8081:8081"
  "node"      = "cd $LinuxRepoPath/04-node-http && kraft run -W -d --name ukl-node -p 8082:8082"
  "redis"     = "cd $LinuxRepoPath/05-redis-runtime && kraft run -W -d --name ukl-redis -p 6379:6379"
  "dashboard" = "cd $LinuxRepoPath && nohup python3 -m http.server 9091 >/tmp/unikernel-labs-dashboard.log 2>&1 &"
}

wsl.exe -d $Distro -- bash -lc $commands[$Lab]
