namespace UnikernelLabs.Launcher.Models;

public sealed class LabDefinition
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string RelativePath { get; set; } = "";
    public string StartCommand { get; set; } = "";
    public string StopCommand { get; set; } = "";
    public string LogsCommand { get; set; } = "";
    public string? Url { get; set; }

    public override string ToString() => $"{Id} · {Name}";
}
