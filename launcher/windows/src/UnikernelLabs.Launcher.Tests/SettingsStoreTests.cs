using Xunit;
using System.Text.Json;
using UnikernelLabs.Launcher.Models;
using UnikernelLabs.Launcher.Services;

namespace UnikernelLabs.Launcher.Tests;

public class SettingsStoreTests : IDisposable
{
    private readonly string _tempDir = Path.Combine(Path.GetTempPath(), $"unikernel-settings-{Guid.NewGuid():N}");
    private readonly SettingsStore _store;

    public SettingsStoreTests()
    {
        Directory.CreateDirectory(_tempDir);
        _store = new SettingsStore(_tempDir);
    }

    public void Dispose() => Directory.Delete(_tempDir, recursive: true);

    [Fact]
    public void Load_ReturnsDefaults_WhenFileDoesNotExist()
    {
        var settings = _store.Load();

        Assert.Equal("Debian", settings.WslDistro);
        Assert.Equal("/home/tu_usuario/dev/unikernel-labs", settings.LinuxRepoPath);
        Assert.Equal("02", settings.LastSelectedLabId);
    }

    [Fact]
    public void SaveAndLoad_RoundTrips_AllFields()
    {
        var original = new AppSettings
        {
            WslDistro = "Ubuntu-22.04",
            LinuxRepoPath = "/home/testuser/projects/unikernel-labs",
            LastSelectedLabId = "05"
        };

        _store.Save(original);
        var loaded = _store.Load();

        Assert.Equal(original.WslDistro, loaded.WslDistro);
        Assert.Equal(original.LinuxRepoPath, loaded.LinuxRepoPath);
        Assert.Equal(original.LastSelectedLabId, loaded.LastSelectedLabId);
    }

    [Fact]
    public void Load_ReturnsDefaults_WhenFileIsCorrupt()
    {
        File.WriteAllText(Path.Combine(_tempDir, "settings.json"), "not valid json }{");

        var settings = _store.Load();

        Assert.Equal("Debian", settings.WslDistro);
    }

    [Fact]
    public void Save_WritesValidJson()
    {
        var settings = new AppSettings { WslDistro = "Fedora", LinuxRepoPath = "/home/x/repo", LastSelectedLabId = "03" };
        _store.Save(settings);

        var json = File.ReadAllText(Path.Combine(_tempDir, "settings.json"));
        var parsed = JsonSerializer.Deserialize<AppSettings>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        Assert.NotNull(parsed);
        Assert.Equal("Fedora", parsed!.WslDistro);
    }

    [Fact]
    public void Save_Overwrites_ExistingFile()
    {
        _store.Save(new AppSettings { WslDistro = "Debian" });
        _store.Save(new AppSettings { WslDistro = "Ubuntu" });

        var loaded = _store.Load();
        Assert.Equal("Ubuntu", loaded.WslDistro);
    }
}
