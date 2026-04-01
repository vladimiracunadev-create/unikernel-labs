using System.Text.Json;
using UnikernelLabs.Launcher.Models;

namespace UnikernelLabs.Launcher.Services;

public static class LabCatalog
{
    public static IReadOnlyList<LabDefinition> Load(string baseDirectory)
    {
        var path = Path.Combine(baseDirectory, "labs.windows.json");
        if (!File.Exists(path))
        {
            throw new FileNotFoundException("No se encontró labs.windows.json", path);
        }

        using var stream = File.OpenRead(path);
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };

        var data = JsonSerializer.Deserialize<List<LabDefinition>>(stream, options);
        return data ?? new List<LabDefinition>();
    }
}
