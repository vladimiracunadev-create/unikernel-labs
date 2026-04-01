namespace UnikernelLabs.Launcher.Models;

public sealed class AppSettings
{
    public string WslDistro { get; set; } = "Debian";
    public string LinuxRepoPath { get; set; } = "/home/tu_usuario/dev/unikernel-labs";
    public string LastSelectedLabId { get; set; } = "02";
}
