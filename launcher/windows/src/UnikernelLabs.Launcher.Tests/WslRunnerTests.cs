using Xunit;
using UnikernelLabs.Launcher.Services;

namespace UnikernelLabs.Launcher.Tests;

public class WslRunnerTests
{
    // ── SelectPreferredDistro ─────────────────────────────────────────────

    [Fact]
    public void SelectPreferredDistro_PrefersDebian_WhenPresent()
    {
        var distros = new[] { "Ubuntu", "Debian", "Ubuntu-22.04" };
        var result = WslRunner.SelectPreferredDistro(distros);
        Assert.Equal("Debian", result);
    }

    [Fact]
    public void SelectPreferredDistro_FallsBackToUbuntu_WhenDebianAbsent()
    {
        var distros = new[] { "Ubuntu-22.04", "Ubuntu" };
        var result = WslRunner.SelectPreferredDistro(distros);
        Assert.Equal("Ubuntu", result);
    }

    [Fact]
    public void SelectPreferredDistro_SkipsDockerDistro_WhenOthersAvailable()
    {
        var distros = new[] { "docker-desktop", "Arch" };
        var result = WslRunner.SelectPreferredDistro(distros);
        Assert.Equal("Arch", result);
    }

    [Fact]
    public void SelectPreferredDistro_ReturnsFirstNonDocker_WhenNoPreferredMatch()
    {
        var distros = new[] { "docker-desktop-data", "docker-desktop", "Fedora" };
        var result = WslRunner.SelectPreferredDistro(distros);
        Assert.Equal("Fedora", result);
    }

    [Fact]
    public void SelectPreferredDistro_ReturnsEmpty_WhenListIsEmpty()
    {
        var result = WslRunner.SelectPreferredDistro(Array.Empty<string>());
        Assert.Equal(string.Empty, result);
    }

    [Fact]
    public void SelectPreferredDistro_IgnoresBlankEntries()
    {
        var distros = new[] { "", "  ", "Ubuntu" };
        var result = WslRunner.SelectPreferredDistro(distros);
        Assert.Equal("Ubuntu", result);
    }

    [Fact]
    public void SelectPreferredDistro_IsCaseInsensitive()
    {
        var distros = new[] { "DEBIAN", "ubuntu" };
        var result = WslRunner.SelectPreferredDistro(distros);
        Assert.Equal("DEBIAN", result);
    }

    // ── BuildRepoAwareCommand ─────────────────────────────────────────────

    [Fact]
    public void BuildRepoAwareCommand_ReplacesBothPlaceholders()
    {
        const string repoPath = "/home/user/dev/unikernel-labs";
        const string relativePath = "02-nginx-runtime";
        const string raw = "cd '{lab_path}' && kraft run";

        var result = WslRunner.BuildRepoAwareCommand(repoPath, relativePath, raw);

        Assert.Equal("cd '/home/user/dev/unikernel-labs/02-nginx-runtime' && kraft run", result);
    }

    [Fact]
    public void BuildRepoAwareCommand_ReplacesRepoPaths()
    {
        const string repoPath = "/home/user/dev/unikernel-labs";
        const string raw = "cd '{repo}' && python3 -m http.server 9091";

        var result = WslRunner.BuildRepoAwareCommand(repoPath, string.Empty, raw);

        Assert.Equal("cd '/home/user/dev/unikernel-labs' && python3 -m http.server 9091", result);
    }

    [Fact]
    public void BuildRepoAwareCommand_HandlesEmptyRelativePath()
    {
        const string repoPath = "/home/user/dev/unikernel-labs";
        const string raw = "cd '{lab_path}' && make run";

        var result = WslRunner.BuildRepoAwareCommand(repoPath, string.Empty, raw);

        // With empty relativePath, {lab_path} should equal {repo}
        Assert.Equal("cd '/home/user/dev/unikernel-labs' && make run", result);
    }

    [Fact]
    public void BuildRepoAwareCommand_EscapesSingleQuotesInRepoPath()
    {
        const string repoPath = "/home/o'brien/dev/unikernel-labs";
        const string raw = "cd '{repo}'";

        var result = WslRunner.BuildRepoAwareCommand(repoPath, string.Empty, raw);

        // Single quotes in the path must be shell-escaped
        Assert.Contains("o'\\''brien", result);
    }

    [Fact]
    public void BuildRepoAwareCommand_EscapesSingleQuotesInRelativePath()
    {
        const string repoPath = "/home/user/dev/unikernel-labs";
        const string relativePath = "lab's-dir";
        const string raw = "cd '{lab_path}'";

        var result = WslRunner.BuildRepoAwareCommand(repoPath, relativePath, raw);

        // Single quotes in the relative path must be shell-escaped (defense in depth).
        Assert.Contains("lab'\\''s-dir", result);
    }

    [Fact]
    public void BuildRepoAwareCommand_NormalizesBackslashesInRelativePath()
    {
        const string repoPath = "/home/user/dev/unikernel-labs";
        const string relativePath = @"02-nginx-runtime\sub";
        const string raw = "cd '{lab_path}'";

        var result = WslRunner.BuildRepoAwareCommand(repoPath, relativePath, raw);

        Assert.DoesNotContain("\\", result);
    }

    [Fact]
    public void BuildRepoAwareCommand_TrimsTrailingSlashOnRepo()
    {
        const string repoPath = "/home/user/dev/unikernel-labs/";
        const string relativePath = "02-nginx-runtime";
        const string raw = "cd '{lab_path}'";

        var result = WslRunner.BuildRepoAwareCommand(repoPath, relativePath, raw);

        // Should not produce double slashes
        Assert.DoesNotContain("//", result);
    }
}
