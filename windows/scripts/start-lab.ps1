param(
  [Parameter(Mandatory = $true)][string]$Distro,
  [Parameter(Mandatory = $true)][string]$LinuxRepoPath,
  [Parameter(Mandatory = $true)][ValidateSet("hello","nginx","python","node","redis","dashboard")] [string]$Lab
)

# El repo path se pasa como argumento posicional ($1) a bash — nunca se
# interpola en la línea de comando — para evitar word-splitting con espacios
# e inyección de shell.
$scripts = @{
  "hello"     = 'cd "$1/01-hello-world" && kraft run -W -d --name ukl-hello'
  "nginx"     = 'cd "$1/02-nginx-runtime" && kraft run -W -d --name ukl-nginx -p 8080:80'
  "python"    = 'cd "$1/03-python-http" && kraft run -W -d --name ukl-python -p 8081:8081'
  "node"      = 'cd "$1/04-node-http" && kraft run -W -d --name ukl-node -p 8082:8082'
  "redis"     = 'cd "$1/05-redis-runtime" && kraft run -W -d --name ukl-redis -p 6379:6379'
  "dashboard" = 'cd "$1" && nohup python3 -m http.server 9091 --bind 127.0.0.1 >/tmp/unikernel-labs-dashboard.log 2>&1 &'
}

wsl.exe -d $Distro -- bash -lc $scripts[$Lab] bash $LinuxRepoPath
