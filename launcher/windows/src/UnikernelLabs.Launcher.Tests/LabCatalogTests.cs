using System.Text.Json;
using UnikernelLabs.Launcher.Models;
using UnikernelLabs.Launcher.Services;

namespace UnikernelLabs.Launcher.Tests;

public class LabCatalogTests : IDisposable
{
    private readonly string _tempDir = Path.Combine(Path.GetTempPath(), $"unikernel-tests-{Guid.NewGuid():N}");

    public LabCatalogTests() => Directory.CreateDirectory(_tempDir);

    public void Dispose() => Directory.Delete(_tempDir, recursive: true);

    private string WriteCatalog(object data)
    {
        var json = JsonSerializer.Serialize(data);
        File.WriteAllText(Path.Combine(_tempDir, "labs.windows.json"), json);
        return _tempDir;
    }

    // ── Happy path ────────────────────────────────────────────────────────

    [Fact]
    public void Load_ReturnsAllLabs_WhenJsonIsValid()
    {
        var labs = new[]
        {
            new { Id = "01", Name = "hello-world", Description = "Basic test", RelativePath = "01-hello-world",
                  StartCommand = "kraft run", StopCommand = "kraft stop ukl-hello", LogsCommand = "kraft logs ukl-hello", Url = (string?)null },
            new { Id = "02", Name = "nginx", Description = "NGINX unikernel", RelativePath = "02-nginx-runtime",
                  StartCommand = "kraft run -p 8080:80", StopCommand = "kraft stop ukl-nginx", LogsCommand = "kraft logs ukl-nginx", Url = (string?)"http://localhost:8080" }
        };

        var dir = WriteCatalog(labs);
        var result = LabCatalog.Load(dir);

        Assert.Equal(2, result.Count);
        Assert.Equal("01", result[0].Id);
        Assert.Equal("nginx", result[1].Name);
    }

    [Fact]
    public void Load_ParsesUrl_WhenPresent()
    {
        var labs = new[]
        {
            new { Id = "02", Name = "nginx", Description = "desc", RelativePath = "02-nginx-runtime",
                  StartCommand = "s", StopCommand = "s", LogsCommand = "s", Url = (string?)"http://localhost:8080" }
        };

        var dir = WriteCatalog(labs);
        var result = LabCatalog.Load(dir);

        Assert.Equal("http://localhost:8080", result[0].Url);
    }

    [Fact]
    public void Load_AcceptsNullUrl()
    {
        var labs = new[]
        {
            new { Id = "01", Name = "hello-world", Description = "desc", RelativePath = "01-hello-world",
                  StartCommand = "s", StopCommand = "s", LogsCommand = "s", Url = (string?)null }
        };

        var dir = WriteCatalog(labs);
        var result = LabCatalog.Load(dir);

        Assert.Null(result[0].Url);
    }

    [Fact]
    public void Load_ReturnsEmptyList_WhenJsonIsEmptyArray()
    {
        var dir = WriteCatalog(Array.Empty<object>());
        var result = LabCatalog.Load(dir);

        Assert.Empty(result);
    }

    [Fact]
    public void Load_IsCaseInsensitive_ForPropertyNames()
    {
        var json = """[{"id":"99","name":"test","description":"d","relativePath":"path","startCommand":"s","stopCommand":"s","logsCommand":"s","url":null}]""";
        File.WriteAllText(Path.Combine(_tempDir, "labs.windows.json"), json);

        var result = LabCatalog.Load(_tempDir);

        Assert.Single(result);
        Assert.Equal("99", result[0].Id);
    }

    // ── Error cases ───────────────────────────────────────────────────────

    [Fact]
    public void Load_Throws_WhenFileDoesNotExist()
    {
        var emptyDir = Path.Combine(Path.GetTempPath(), $"unikernel-empty-{Guid.NewGuid():N}");
        Directory.CreateDirectory(emptyDir);

        try
        {
            Assert.Throws<FileNotFoundException>(() => LabCatalog.Load(emptyDir));
        }
        finally
        {
            Directory.Delete(emptyDir);
        }
    }

    [Fact]
    public void Load_Throws_WhenJsonIsMalformed()
    {
        File.WriteAllText(Path.Combine(_tempDir, "labs.windows.json"), "{ this is not valid json }");

        Assert.Throws<JsonException>(() => LabCatalog.Load(_tempDir));
    }
}
