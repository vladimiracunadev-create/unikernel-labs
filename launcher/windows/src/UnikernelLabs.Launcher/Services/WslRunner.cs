using System.Diagnostics;

namespace UnikernelLabs.Launcher.Services;

public sealed record CommandResult(int ExitCode, string StandardOutput, string StandardError)
{
    public string CombinedOutput
    {
        get
        {
            if (string.IsNullOrWhiteSpace(StandardError))
            {
                return StandardOutput;
            }

            if (string.IsNullOrWhiteSpace(StandardOutput))
            {
                return StandardError;
            }

            return $"{StandardOutput}{Environment.NewLine}{StandardError}";
        }
    }
}

public static class WslRunner
{
    public static async Task<string> RunAsync(string distro, string command, CancellationToken cancellationToken = default)
    {
        var result = await RunWithResultAsync(distro, command, cancellationToken);
        return result.CombinedOutput;
    }

    public static Task<CommandResult> RunWithResultAsync(string distro, string command, CancellationToken cancellationToken = default)
    {
        var args = new[] { "-d", distro, "--", "bash", "-lc", command };
        return RunProcessAsync("wsl.exe", args, cancellationToken);
    }

    public static Task<CommandResult> RunHostAsync(IEnumerable<string> args, CancellationToken cancellationToken = default)
        => RunProcessAsync("wsl.exe", args, cancellationToken);

    public static async Task<IReadOnlyList<string>> ListDistrosAsync(CancellationToken cancellationToken = default)
    {
        var result = await RunHostAsync(new[] { "-l", "-q" }, cancellationToken);
        return ParseLines(result.StandardOutput)
            .Where(static value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public static string SelectPreferredDistro(IEnumerable<string> distros)
    {
        var ordered = distros
            .Where(static item => !string.IsNullOrWhiteSpace(item))
            .ToList();

        var preferredNames = new[]
        {
            "Debian",
            "Ubuntu",
            "Ubuntu-24.04",
            "Ubuntu-22.04"
        };

        foreach (var preferred in preferredNames)
        {
            var match = ordered.FirstOrDefault(item => string.Equals(item, preferred, StringComparison.OrdinalIgnoreCase));
            if (match is not null)
            {
                return match;
            }
        }

        return ordered.FirstOrDefault(static item => !item.Contains("docker", StringComparison.OrdinalIgnoreCase))
            ?? ordered.FirstOrDefault()
            ?? string.Empty;
    }

    public static async Task<IReadOnlyList<string>> DetectRepoPathsAsync(string distro, string repoName = "unikernel-labs", CancellationToken cancellationToken = default)
    {
        var command =
            $"for p in \"$HOME/dev/{repoName}\" \"$HOME/projects/{repoName}\" \"$HOME/src/{repoName}\" \"$HOME/work/{repoName}\" \"$HOME/code/{repoName}\"; do " +
            "[ -d \"$p\" ] && echo \"$p\"; " +
            "done; " +
            $"find \"$HOME\" -maxdepth 5 -type d -name '{repoName}' 2>/dev/null | head -n 8";

        var result = await RunWithResultAsync(distro, command, cancellationToken);
        return ParseLines(result.StandardOutput)
            .Where(static value => !string.IsNullOrWhiteSpace(value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    public static string BuildRepoAwareCommand(string linuxRepoPath, string relativePath, string rawCommand)
    {
        var escapedRepo = linuxRepoPath.Replace("'", "'\\''");
        var normalizedRelativePath = string.IsNullOrWhiteSpace(relativePath)
            ? string.Empty
            : relativePath.Replace("\\", "/").Replace("'", "'\\''");
        var repoPath = string.IsNullOrWhiteSpace(normalizedRelativePath)
            ? escapedRepo
            : $"{escapedRepo.TrimEnd('/')}/{normalizedRelativePath.TrimStart('/')}";

        return rawCommand
            .Replace("{repo}", escapedRepo)
            .Replace("{lab_path}", repoPath);
    }

    private static async Task<CommandResult> RunProcessAsync(string fileName, IEnumerable<string> args, CancellationToken cancellationToken)
    {
        var psi = new ProcessStartInfo
        {
            FileName = fileName,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        // WSL_UTF8=1 fuerza salida UTF-8 en `wsl.exe -l` (por defecto UTF-16LE),
        // evitando nombres de distro con bytes NUL que rompen la autodetección.
        psi.Environment["WSL_UTF8"] = "1";

        foreach (var arg in args)
        {
            psi.ArgumentList.Add(arg);
        }

        using var process = new Process { StartInfo = psi };
        process.Start();

        var stdout = process.StandardOutput.ReadToEndAsync();
        var stderr = process.StandardError.ReadToEndAsync();

        // Timeout de seguridad: si el llamador no impone deadline, un wsl.exe/kraft
        // colgado no debe congelar la UI de forma indefinida.
        using var timeoutCts = new CancellationTokenSource(TimeSpan.FromSeconds(120));
        using var linked = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

        try
        {
            await process.WaitForExitAsync(linked.Token);
        }
        catch (OperationCanceledException)
        {
            try { process.Kill(entireProcessTree: true); } catch { /* el proceso ya terminó */ }

            if (cancellationToken.IsCancellationRequested)
            {
                throw; // cancelación explícita del llamador: propágala
            }

            return new CommandResult(124, string.Empty, "El comando excedió el tiempo límite (120 s).");
        }

        return new CommandResult(process.ExitCode, await stdout, await stderr);
    }

    private static IEnumerable<string> ParseLines(string text)
        => (text ?? string.Empty)
            .Replace("\0", string.Empty)
            .Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
