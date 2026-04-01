using System.Text.Json;
using UnikernelLabs.Launcher.Models;

namespace UnikernelLabs.Launcher.Services;

public sealed class SettingsStore
{
    private readonly string _settingsPath;

    public SettingsStore()
    {
        var basePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "UnikernelControlCenter");
        Directory.CreateDirectory(basePath);
        _settingsPath = Path.Combine(basePath, "settings.json");
    }

    /// <summary>
    /// Constructor used in tests to redirect storage to an arbitrary directory.
    /// </summary>
    public SettingsStore(string baseDirectory)
    {
        _settingsPath = Path.Combine(baseDirectory, "settings.json");
    }

    public AppSettings Load()
    {
        if (!File.Exists(_settingsPath)) return new AppSettings();

        try
        {
            var json = File.ReadAllText(_settingsPath);
            return JsonSerializer.Deserialize<AppSettings>(json) ?? new AppSettings();
        }
        catch
        {
            return new AppSettings();
        }
    }

    public void Save(AppSettings settings)
    {
        var options = new JsonSerializerOptions { WriteIndented = true };
        File.WriteAllText(_settingsPath, JsonSerializer.Serialize(settings, options));
    }
}
