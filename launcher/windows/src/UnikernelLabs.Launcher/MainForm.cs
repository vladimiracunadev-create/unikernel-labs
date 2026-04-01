using System.Diagnostics;
using System.Drawing.Drawing2D;
using System.Net.Http;
using System.Net.Sockets;
using System.Text;
using UnikernelLabs.Launcher.Models;
using UnikernelLabs.Launcher.Services;

namespace UnikernelLabs.Launcher;

public sealed class MainForm : Form
{
    private static readonly HttpClient HttpHealthClient = new()
    {
        Timeout = TimeSpan.FromSeconds(4)
    };

    private readonly ComboBox _cmbDistro = new() { DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly TextBox _txtRepoPath = new() { Text = "/home/tu_usuario/dev/unikernel-labs" };
    private readonly DataGridView _gridLabs = new();
    private readonly TextBox _txtOutput = new() { Multiline = true, ScrollBars = ScrollBars.Both, ReadOnly = true, Font = new Font("Consolas", 10f) };

    private readonly Button _btnStart = CreateActionButton("Iniciar", true);
    private readonly Button _btnStop = CreateActionButton("Detener");
    private readonly Button _btnLogs = CreateActionButton("Logs");
    private readonly Button _btnOpen = CreateActionButton("Abrir localhost");
    private readonly Button _btnStatus = CreateActionButton("Estado");
    private readonly Button _btnDoctor = CreateActionButton("Doctor");
    private readonly Button _btnHealth = CreateActionButton("Health total");
    private readonly Button _btnRefresh = CreateActionButton("Recargar catálogo");
    private readonly Button _btnDetectDistro = CreateCompactButton("Detectar distros");
    private readonly Button _btnDetectRepo = CreateCompactButton("Detectar ruta");
    private readonly Button _btnDetectAll = CreateCompactButton("Autodetectar inicio");

    private readonly Label _lblHeroTitle = new() { Text = "Unikernel Control Center v1", AutoSize = true, ForeColor = Color.White, Font = new Font("Segoe UI", 22f, FontStyle.Bold) };
    private readonly Label _lblHeroSubtitle = new() { Text = "Launcher Windows con backend WSL2 para levantar servicios unikernel de forma controlada, visible y medible.", AutoSize = true, ForeColor = Color.FromArgb(214, 227, 255), Font = new Font("Segoe UI", 10.5f) };
    private readonly Label _lblSelectedTitle = new() { Text = "Selecciona un servicio", AutoSize = true, Font = new Font("Segoe UI", 15f, FontStyle.Bold), ForeColor = Color.FromArgb(20, 36, 62) };
    private readonly Label _lblSelectedDesc = new() { Text = "Aquí verás el detalle operativo del lab seleccionado.", AutoSize = true, MaximumSize = new Size(760, 0), ForeColor = Color.FromArgb(70, 84, 110), Font = new Font("Segoe UI", 10f) };
    private readonly Label _lblSelectedPath = CreateDetailValue();
    private readonly Label _lblSelectedUrl = CreateDetailValue();
    private readonly Label _lblSelectedCommands = CreateDetailValue();
    private readonly Label _lblEnvironmentHints = new() { AutoSize = true, MaximumSize = new Size(760, 0), ForeColor = Color.FromArgb(76, 92, 121), Font = new Font("Segoe UI", 9.25f) };
    private readonly Label _lblHealthState = new() { AutoSize = true, Font = new Font("Segoe UI", 11f, FontStyle.Bold), ForeColor = Color.FromArgb(93, 103, 122) };
    private readonly Label _lblHealthDetails = new() { AutoSize = true, MaximumSize = new Size(760, 0), ForeColor = Color.FromArgb(87, 98, 118), Font = new Font("Segoe UI", 9.5f) };
    private readonly Label _lblDetectedDistros = new() { AutoSize = true, ForeColor = Color.FromArgb(76, 92, 121), Font = new Font("Segoe UI", 8.75f) };
    private readonly Label _lblGridLegend = new() { AutoSize = true, ForeColor = Color.FromArgb(76, 92, 121), Font = new Font("Segoe UI", 8.75f) };

    private readonly StatusStrip _statusStrip = new();
    private readonly ToolStripStatusLabel _statusText = new() { Text = "Listo" };
    private readonly ToolStripStatusLabel _statusEnv = new() { Text = "Windows + WSL2", Spring = true, TextAlign = ContentAlignment.MiddleRight };

    private readonly SettingsStore _settingsStore = new();
    private AppSettings _settings = new();
    private IReadOnlyList<LabDefinition> _labs = Array.Empty<LabDefinition>();
    private readonly Dictionary<string, ServiceStatusSnapshot> _serviceStatuses = new(StringComparer.OrdinalIgnoreCase);
    private CancellationTokenSource? _healthCheckCts;
    private bool _isUpdatingGridSelection;

    public MainForm()
    {
        Text = "Unikernel Control Center v1";
        Width = 1480;
        Height = 920;
        MinimumSize = new Size(1300, 800);
        StartPosition = FormStartPosition.CenterScreen;
        BackColor = Color.FromArgb(242, 246, 252);
        Font = new Font("Segoe UI", 9.5f);
        Icon = LoadAppIcon();

        ConfigureLabsGrid();
        BuildUi();
        WireEvents();
        LoadSettings();
        LoadLabs();
        UpdateStatus("Aplicación lista.");
    }

    private void BuildUi()
    {
        var menu = BuildMenu();
        MainMenuStrip = menu;
        Controls.Add(menu);

        _statusStrip.Items.AddRange(new ToolStripItem[] { _statusText, _statusEnv });
        Controls.Add(_statusStrip);

        var shell = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            RowCount = 1,
            Padding = new Padding(14, 12, 14, 12),
            BackColor = BackColor
        };
        shell.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 112));
        shell.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));

        shell.Controls.Add(BuildSidebar(), 0, 0);
        shell.Controls.Add(BuildMainContent(), 1, 0);

        Controls.Add(shell);
    }

    private Control BuildSidebar()
    {
        var panel = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.FromArgb(17, 31, 56),
            Padding = new Padding(10),
            Margin = new Padding(0, 0, 12, 0)
        };

        var logoWrap = new Panel
        {
            Dock = DockStyle.Top,
            Height = 92,
            BackColor = Color.Transparent
        };

        var logo = new PictureBox
        {
            SizeMode = PictureBoxSizeMode.Zoom,
            Size = new Size(56, 56),
            Location = new Point(18, 10),
            BackColor = Color.Transparent,
            Image = LoadLogo()
        };
        logoWrap.Controls.Add(logo);

        var logoText = new Label
        {
            Text = "UCC v1",
            AutoSize = true,
            ForeColor = Color.White,
            Font = new Font("Segoe UI", 11f, FontStyle.Bold),
            Location = new Point(18, 68)
        };
        logoWrap.Controls.Add(logoText);

        var nav = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            Height = 440,
            FlowDirection = FlowDirection.TopDown,
            WrapContents = false,
            BackColor = Color.Transparent
        };
        nav.Controls.Add(CreateSidebarButton("🧪", "Servicios", FocusServices));
        nav.Controls.Add(CreateSidebarButton("▶", "Operación", FocusOperation));
        nav.Controls.Add(CreateSidebarButton("🧭", "Autodetect", async () => await AutoDetectEnvironmentAsync(true)));
        nav.Controls.Add(CreateSidebarButton("💓", "Health", async () => await RefreshAllServiceStatusesAsync(true)));
        nav.Controls.Add(CreateSidebarButton("🌐", "Dashboard", () => OpenUrl("http://localhost:9091")));
        nav.Controls.Add(CreateSidebarButton("📄", "Docs", ShowDocsHint));

        var footer = new Label
        {
            Dock = DockStyle.Bottom,
            Height = 80,
            Text = "Windows\n+\nWSL2",
            ForeColor = Color.FromArgb(182, 201, 235),
            Font = new Font("Segoe UI", 10f, FontStyle.Bold),
            TextAlign = ContentAlignment.MiddleCenter
        };

        panel.Controls.Add(footer);
        panel.Controls.Add(nav);
        panel.Controls.Add(logoWrap);
        return panel;
    }

    private Control BuildMainContent()
    {
        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 3,
            BackColor = BackColor
        };
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 146));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        root.RowStyles.Add(new RowStyle(SizeType.Absolute, 230));

        root.Controls.Add(BuildHeroPanel(), 0, 0);
        root.Controls.Add(BuildWorkArea(), 0, 1);
        root.Controls.Add(BuildOutputPanel(), 0, 2);

        return root;
    }

    private MenuStrip BuildMenu()
    {
        var menu = new MenuStrip
        {
            Dock = DockStyle.Top,
            BackColor = Color.White,
            RenderMode = ToolStripRenderMode.System
        };

        var file = new ToolStripMenuItem("Archivo");
        file.DropDownItems.Add("Guardar configuración", null, (_, _) => SaveSettings());
        file.DropDownItems.Add("Salir", null, (_, _) => Close());

        var operations = new ToolStripMenuItem("Operación");
        operations.DropDownItems.Add("Autodetectar entorno al inicio", null, async (_, _) => await AutoDetectEnvironmentAsync(true));
        operations.DropDownItems.Add(new ToolStripSeparator());
        operations.DropDownItems.Add("Iniciar servicio", null, async (_, _) => await ExecuteSelectedCommandAsync(CommandType.Start));
        operations.DropDownItems.Add("Detener servicio", null, async (_, _) => await ExecuteSelectedCommandAsync(CommandType.Stop));
        operations.DropDownItems.Add("Ver logs", null, async (_, _) => await ExecuteSelectedCommandAsync(CommandType.Logs));
        operations.DropDownItems.Add("Verificar health de toda la grilla", null, async (_, _) => await RefreshAllServiceStatusesAsync(true));
        operations.DropDownItems.Add(new ToolStripSeparator());
        operations.DropDownItems.Add("Estado global", null, async (_, _) => await RunStatusAsync());
        operations.DropDownItems.Add("Doctor del entorno", null, async (_, _) => await RunDoctorAsync());
        operations.DropDownItems.Add("Recargar catálogo", null, (_, _) => LoadLabs());

        var navigation = new ToolStripMenuItem("Navegación");
        navigation.DropDownItems.Add("Abrir servicio seleccionado", null, (_, _) => OpenSelectedLab());
        navigation.DropDownItems.Add("Abrir dashboard localhost", null, (_, _) => OpenUrl("http://localhost:9091"));

        var help = new ToolStripMenuItem("Ayuda");
        help.DropDownItems.Add("Packaging / Publish", null, (_, _) => ShowPackagingHint());
        help.DropDownItems.Add("Acerca de", null, (_, _) => ShowAbout());

        menu.Items.AddRange(new ToolStripItem[] { file, operations, navigation, help });
        return menu;
    }

    private Control BuildHeroPanel()
    {
        var panel = new GradientPanel
        {
            Dock = DockStyle.Fill,
            Padding = new Padding(24, 18, 24, 18),
            StartColor = Color.FromArgb(16, 34, 64),
            EndColor = Color.FromArgb(29, 63, 116),
            BorderColor = Color.FromArgb(77, 118, 184),
            Radius = 24
        };

        var logo = new PictureBox
        {
            SizeMode = PictureBoxSizeMode.Zoom,
            Size = new Size(92, 92),
            Location = new Point(24, 24),
            BackColor = Color.Transparent,
            Image = LoadLogo()
        };
        panel.Controls.Add(logo);

        var titleWrap = new Panel
        {
            BackColor = Color.Transparent,
            Location = new Point(132, 26),
            Size = new Size(840, 92)
        };
        _lblHeroSubtitle.MaximumSize = new Size(820, 0);
        _lblHeroSubtitle.Location = new Point(0, 48);
        titleWrap.Controls.Add(_lblHeroTitle);
        titleWrap.Controls.Add(_lblHeroSubtitle);
        panel.Controls.Add(titleWrap);

        var badges = new FlowLayoutPanel
        {
            Location = new Point(900, 28),
            Size = new Size(420, 84),
            WrapContents = true,
            BackColor = Color.Transparent
        };
        badges.Controls.Add(CreateBadge("Versión 1", Color.FromArgb(45, 90, 160)));
        badges.Controls.Add(CreateBadge("Autodetect al iniciar", Color.FromArgb(40, 84, 150)));
        badges.Controls.Add(CreateBadge("Selector de distros", Color.FromArgb(62, 107, 177)));
        badges.Controls.Add(CreateBadge("Grilla con estado", Color.FromArgb(58, 117, 144)));
        panel.Controls.Add(badges);

        return panel;
    }

    private Control BuildWorkArea()
    {
        var split = new SplitContainer
        {
            Dock = DockStyle.Fill,
            BackColor = BackColor,
            FixedPanel = FixedPanel.Panel1
        };
        split.HandleCreated += (_, _) => BeginInvoke(new MethodInvoker(() => ConfigureWorkAreaSplit(split)));
        split.SizeChanged += (_, _) => ConfigureWorkAreaSplit(split);
        split.Panel1.Padding = new Padding(0, 10, 8, 10);
        split.Panel2.Padding = new Padding(8, 10, 0, 10);

        split.Panel1.Controls.Add(BuildLeftPanel());
        split.Panel2.Controls.Add(BuildRightPanel());
        return split;
    }

    private static void ConfigureWorkAreaSplit(SplitContainer split)
    {
        const int desiredLeftWidth = 430;
        const int minLeftWidth = 380;
        const int minRightWidth = 640;

        if (split.IsDisposed)
        {
            return;
        }

        var availableWidth = split.ClientSize.Width - split.SplitterWidth;
        if (availableWidth <= 0)
        {
            return;
        }

        var maxLeftWidth = availableWidth - minRightWidth;
        if (maxLeftWidth < minLeftWidth)
        {
            split.Panel1MinSize = 0;
            split.Panel2MinSize = 0;

            var fallbackWidth = Math.Max(0, Math.Min(desiredLeftWidth, availableWidth / 2));
            if (split.SplitterDistance != fallbackWidth)
            {
                split.SplitterDistance = fallbackWidth;
            }

            return;
        }

        split.Panel1MinSize = minLeftWidth;
        split.Panel2MinSize = minRightWidth;

        var targetWidth = Math.Clamp(desiredLeftWidth, minLeftWidth, maxLeftWidth);
        if (split.SplitterDistance != targetWidth)
        {
            split.SplitterDistance = targetWidth;
        }
    }

    private Control BuildLeftPanel()
    {
        var card = CreateCardPanel();
        card.Padding = new Padding(18);

        var layout = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 10,
            BackColor = Color.Transparent
        };
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 30));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 40));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 22));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 30));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 40));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 52));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 28));
        layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 42));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 44));

        layout.Controls.Add(CreateSectionLabel("Distros WSL detectadas"), 0, 0);
        ConfigureComboBox(_cmbDistro);
        layout.Controls.Add(CreateEditorRow(_cmbDistro, _btnDetectDistro), 0, 1);
        _lblDetectedDistros.Text = "Aún no se han consultado distros WSL.";
        layout.Controls.Add(_lblDetectedDistros, 0, 2);

        layout.Controls.Add(CreateSectionLabel("Ruta Linux del repo"), 0, 3);
        ConfigureTextBox(_txtRepoPath);
        layout.Controls.Add(CreateEditorRow(_txtRepoPath, _btnDetectRepo), 0, 4);
        layout.Controls.Add(CreateButtonRow(_btnDetectAll, _btnRefresh), 0, 5);
        layout.Controls.Add(CreateSectionLabel("Servicios disponibles"), 0, 6);

        layout.Controls.Add(_gridLabs, 0, 7);
        _lblGridLegend.Text = "Leyenda: Verde = OK · Rojo = Down/Error · Naranja = Timeout/Pendiente · Gris = Sin URL.";
        layout.Controls.Add(_lblGridLegend, 0, 8);

        var footer = new Label
        {
            Text = "La grilla muestra estado por servicio para que el launcher se sienta más operativo y menos como un script aislado.",
            Dock = DockStyle.Fill,
            ForeColor = Color.FromArgb(90, 103, 129),
            TextAlign = ContentAlignment.MiddleLeft
        };
        layout.Controls.Add(footer, 0, 9);

        card.Controls.Add(layout);
        return card;
    }

    private Control BuildRightPanel()
    {
        var card = CreateCardPanel();
        card.Padding = new Padding(18);

        var layout = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 3,
            BackColor = Color.Transparent
        };
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 248));
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute, 84));
        layout.RowStyles.Add(new RowStyle(SizeType.Percent, 100));

        layout.Controls.Add(BuildSummaryPanel(), 0, 0);
        layout.Controls.Add(BuildActionPanel(), 0, 1);
        layout.Controls.Add(BuildQuickInfoPanel(), 0, 2);

        card.Controls.Add(layout);
        return card;
    }

    private Control BuildSummaryPanel()
    {
        var summary = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            RowCount = 7,
            BackColor = Color.Transparent
        };
        summary.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 164));
        summary.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        summary.RowStyles.Add(new RowStyle(SizeType.Absolute, 42));
        summary.RowStyles.Add(new RowStyle(SizeType.Absolute, 52));
        summary.RowStyles.Add(new RowStyle(SizeType.Absolute, 36));
        summary.RowStyles.Add(new RowStyle(SizeType.Absolute, 36));
        summary.RowStyles.Add(new RowStyle(SizeType.Absolute, 42));
        summary.RowStyles.Add(new RowStyle(SizeType.Absolute, 28));
        summary.RowStyles.Add(new RowStyle(SizeType.Percent, 100));

        summary.Controls.Add(_lblSelectedTitle, 0, 0);
        summary.SetColumnSpan(_lblSelectedTitle, 2);
        summary.Controls.Add(_lblSelectedDesc, 0, 1);
        summary.SetColumnSpan(_lblSelectedDesc, 2);
        summary.Controls.Add(CreateDetailLabel("Ruta del lab"), 0, 2);
        summary.Controls.Add(_lblSelectedPath, 1, 2);
        summary.Controls.Add(CreateDetailLabel("Endpoint"), 0, 3);
        summary.Controls.Add(_lblSelectedUrl, 1, 3);
        summary.Controls.Add(CreateDetailLabel("Entorno"), 0, 4);
        summary.Controls.Add(_lblEnvironmentHints, 1, 4);

        summary.Controls.Add(CreateDetailLabel("Health"), 0, 5);
        var healthPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.Transparent,
            FlowDirection = FlowDirection.TopDown,
            WrapContents = false,
            AutoSize = false
        };
        healthPanel.Controls.Add(_lblHealthState);
        healthPanel.Controls.Add(_lblHealthDetails);
        summary.Controls.Add(healthPanel, 1, 5);

        return summary;
    }

    private Control BuildActionPanel()
    {
        var panel = new Panel { Dock = DockStyle.Fill, BackColor = Color.Transparent };

        var flow = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.Transparent,
            AutoSize = false,
            WrapContents = true,
            FlowDirection = FlowDirection.LeftToRight,
            Padding = new Padding(0, 8, 0, 0)
        };

        flow.Controls.AddRange(new Control[] { _btnStart, _btnStop, _btnLogs, _btnOpen, _btnStatus, _btnDoctor, _btnHealth });
        panel.Controls.Add(flow);
        return panel;
    }

    private Control BuildQuickInfoPanel()
    {
        var split = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            RowCount = 3,
            BackColor = Color.Transparent
        };
        split.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 56));
        split.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 44));
        split.RowStyles.Add(new RowStyle(SizeType.Absolute, 28));
        split.RowStyles.Add(new RowStyle(SizeType.Absolute, 42));
        split.RowStyles.Add(new RowStyle(SizeType.Percent, 100));

        split.Controls.Add(CreateSectionLabel("Comando principal"), 0, 0);
        split.Controls.Add(CreateSectionLabel("Siguiente paso"), 1, 0);
        split.Controls.Add(WrapInCodeCard(_lblSelectedCommands), 0, 1);
        split.Controls.Add(CreateInstallCard(), 1, 1);
        split.Controls.Add(CreateNotesCard(), 0, 2);
        split.Controls.Add(CreatePublishCard(), 1, 2);

        return split;
    }

    private Control BuildOutputPanel()
    {
        var card = CreateCardPanel();
        card.Padding = new Padding(18);

        var title = new Label
        {
            Text = "Consola operacional",
            Dock = DockStyle.Top,
            Font = new Font("Segoe UI", 12f, FontStyle.Bold),
            ForeColor = Color.FromArgb(20, 36, 62),
            Height = 28
        };

        _txtOutput.Dock = DockStyle.Fill;
        _txtOutput.BackColor = Color.FromArgb(14, 21, 37);
        _txtOutput.ForeColor = Color.FromArgb(222, 234, 255);
        _txtOutput.BorderStyle = BorderStyle.FixedSingle;

        card.Controls.Add(_txtOutput);
        card.Controls.Add(title);
        return card;
    }

    private void ConfigureLabsGrid()
    {
        _gridLabs.Dock = DockStyle.Fill;
        _gridLabs.AllowUserToAddRows = false;
        _gridLabs.AllowUserToDeleteRows = false;
        _gridLabs.AllowUserToResizeRows = false;
        _gridLabs.MultiSelect = false;
        _gridLabs.ReadOnly = true;
        _gridLabs.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
        _gridLabs.RowHeadersVisible = false;
        _gridLabs.AutoGenerateColumns = false;
        _gridLabs.BorderStyle = BorderStyle.FixedSingle;
        _gridLabs.BackgroundColor = Color.White;
        _gridLabs.GridColor = Color.FromArgb(230, 236, 246);
        _gridLabs.EnableHeadersVisualStyles = false;
        _gridLabs.ColumnHeadersDefaultCellStyle.BackColor = Color.FromArgb(231, 238, 249);
        _gridLabs.ColumnHeadersDefaultCellStyle.ForeColor = Color.FromArgb(20, 36, 62);
        _gridLabs.ColumnHeadersDefaultCellStyle.Font = new Font("Segoe UI", 9f, FontStyle.Bold);
        _gridLabs.DefaultCellStyle.Font = new Font("Segoe UI", 9f);
        _gridLabs.DefaultCellStyle.SelectionBackColor = Color.FromArgb(214, 228, 250);
        _gridLabs.DefaultCellStyle.SelectionForeColor = Color.FromArgb(20, 36, 62);
        _gridLabs.Columns.Clear();
        _gridLabs.Columns.Add(new DataGridViewTextBoxColumn { Name = "status", HeaderText = "Estado", Width = 78, SortMode = DataGridViewColumnSortMode.NotSortable });
        _gridLabs.Columns.Add(new DataGridViewTextBoxColumn { Name = "id", HeaderText = "Id", Width = 48, SortMode = DataGridViewColumnSortMode.NotSortable });
        _gridLabs.Columns.Add(new DataGridViewTextBoxColumn { Name = "name", HeaderText = "Servicio", AutoSizeMode = DataGridViewAutoSizeColumnMode.Fill, SortMode = DataGridViewColumnSortMode.NotSortable });
        _gridLabs.Columns.Add(new DataGridViewTextBoxColumn { Name = "endpoint", HeaderText = "Endpoint", Width = 150, SortMode = DataGridViewColumnSortMode.NotSortable });
    }

    private void WireEvents()
    {
        _btnRefresh.Click += (_, _) => LoadLabs();
        _btnStart.Click += async (_, _) => await ExecuteSelectedCommandAsync(CommandType.Start);
        _btnStop.Click += async (_, _) => await ExecuteSelectedCommandAsync(CommandType.Stop);
        _btnLogs.Click += async (_, _) => await ExecuteSelectedCommandAsync(CommandType.Logs);
        _btnStatus.Click += async (_, _) => await RunStatusAsync();
        _btnDoctor.Click += async (_, _) => await RunDoctorAsync();
        _btnHealth.Click += async (_, _) => await RefreshAllServiceStatusesAsync(true);
        _btnOpen.Click += (_, _) => OpenSelectedLab();
        _btnDetectDistro.Click += async (_, _) => await DetectPreferredDistroAsync(true);
        _btnDetectRepo.Click += async (_, _) => await DetectRepoPathAsync(true);
        _btnDetectAll.Click += async (_, _) => await AutoDetectEnvironmentAsync(true);
        _gridLabs.CellDoubleClick += (_, _) => OpenSelectedLab();
        _gridLabs.SelectionChanged += (_, _) =>
        {
            if (!_isUpdatingGridSelection)
            {
                UpdateSelectedLabDetails();
            }
        };
        _txtRepoPath.Leave += (_, _) => UpdateSelectedLabDetails();
        _cmbDistro.SelectedIndexChanged += (_, _) => UpdateSelectedLabDetails();
        FormClosing += (_, _) => SaveSettings();
        Shown += async (_, _) => await AutoDetectEnvironmentAsync(false);
    }

    private void LoadLabs()
    {
        try
        {
            _labs = LabCatalog.Load(AppContext.BaseDirectory);
            PopulateLabGrid();
            if (!string.IsNullOrWhiteSpace(_settings.LastSelectedLabId))
            {
                SelectLabById(_settings.LastSelectedLabId);
            }
            else if (_gridLabs.Rows.Count > 0)
            {
                _gridLabs.Rows[0].Selected = true;
            }

            UpdateSelectedLabDetails();
            WriteOutput("Catálogo de labs cargado correctamente.");
            UpdateStatus($"Catálogo cargado: {_labs.Count} elemento(s).");
        }
        catch (Exception ex)
        {
            WriteOutput($"Error cargando catálogo: {ex.Message}");
            UpdateStatus("Error cargando catálogo.");
        }
    }

    private void PopulateLabGrid()
    {
        _isUpdatingGridSelection = true;
        _gridLabs.Rows.Clear();
        foreach (var lab in _labs)
        {
            var rowIndex = _gridLabs.Rows.Add("Pendiente", lab.Id, lab.Name, lab.Url ?? "—");
            var row = _gridLabs.Rows[rowIndex];
            row.Tag = lab;
            ApplyStatusToRow(row, GetCachedStatus(lab));
        }
        _isUpdatingGridSelection = false;
    }

    private void LoadSettings()
    {
        _settings = _settingsStore.Load();
        PopulateDistroSelector(Array.Empty<string>(), _settings.WslDistro);
        if (!string.IsNullOrWhiteSpace(_settings.LinuxRepoPath)) _txtRepoPath.Text = _settings.LinuxRepoPath;
    }

    private void SaveSettings()
    {
        _settings.WslDistro = _cmbDistro.Text.Trim();
        _settings.LinuxRepoPath = _txtRepoPath.Text.Trim();
        _settings.LastSelectedLabId = GetSelectedLab()?.Id ?? _settings.LastSelectedLabId;
        _settingsStore.Save(_settings);
        UpdateStatus("Configuración guardada.");
    }

    private async Task AutoDetectEnvironmentAsync(bool announce)
    {
        try
        {
            ToggleButtons(false);
            UpdateStatus("Autodetectando entorno WSL2...");

            var detectedDistro = await DetectPreferredDistroAsync(announce);
            if (!string.IsNullOrWhiteSpace(detectedDistro))
            {
                await DetectRepoPathAsync(announce);
            }

            UpdateSelectedLabDetails();
            SaveSettings();
            await RefreshAllServiceStatusesAsync(false);
            if (announce)
            {
                WriteOutput($"Autodetect finalizado. Distro: {_cmbDistro.Text.Trim()} · Repo: {_txtRepoPath.Text.Trim()}");
            }

            UpdateStatus("Autodetección completada.");
        }
        catch (Exception ex)
        {
            WriteOutput($"Autodetect error: {ex.Message}");
            UpdateStatus("Autodetección con error.");
        }
        finally
        {
            ToggleButtons(true);
        }
    }

    private async Task<string> DetectPreferredDistroAsync(bool announce)
    {
        var distros = await WslRunner.ListDistrosAsync();
        if (distros.Count == 0)
        {
            PopulateDistroSelector(Array.Empty<string>(), _cmbDistro.Text.Trim());
            _lblDetectedDistros.Text = "No se detectaron distros WSL disponibles.";
            if (announce)
            {
                WriteOutput("No se detectaron distros WSL disponibles. Instala Debian o Ubuntu primero.");
            }

            return string.Empty;
        }

        var preferred = WslRunner.SelectPreferredDistro(distros);
        PopulateDistroSelector(distros, preferred);
        _lblDetectedDistros.Text = $"Detectadas: {string.Join(", ", distros)}";
        if (announce)
        {
            WriteOutput($"Distros detectadas: {string.Join(", ", distros)}");
            WriteOutput($"Distro sugerida/seleccionada: {preferred}");
        }

        return preferred;
    }

    private async Task<string> DetectRepoPathAsync(bool announce)
    {
        var distro = _cmbDistro.Text.Trim();
        if (string.IsNullOrWhiteSpace(distro))
        {
            if (announce)
            {
                WriteOutput("No hay distro WSL definida para buscar la ruta Linux del repo.");
            }

            return string.Empty;
        }

        var candidates = await WslRunner.DetectRepoPathsAsync(distro);
        var preferred = candidates.FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(preferred))
        {
            _txtRepoPath.Text = preferred;
            if (announce)
            {
                WriteOutput($"Ruta(s) detectadas para unikernel-labs: {string.Join(", ", candidates)}");
                WriteOutput($"Ruta seleccionada: {preferred}");
            }
            return preferred;
        }

        if (announce)
        {
            WriteOutput("No se encontró la ruta Linux del repo automáticamente. Usa ~/dev/unikernel-labs o actualiza el campo manualmente.");
        }

        return string.Empty;
    }

    private async Task ExecuteSelectedCommandAsync(CommandType type)
    {
        if (GetSelectedLab() is not LabDefinition lab)
        {
            WriteOutput("Selecciona un lab.");
            return;
        }

        var distro = _cmbDistro.Text.Trim();
        var repo = _txtRepoPath.Text.Trim();

        if (string.IsNullOrWhiteSpace(distro) || string.IsNullOrWhiteSpace(repo))
        {
            WriteOutput("Define la distro y la ruta Linux del repo.");
            return;
        }

        var command = type switch
        {
            CommandType.Start => lab.StartCommand,
            CommandType.Stop => lab.StopCommand,
            CommandType.Logs => lab.LogsCommand,
            _ => string.Empty
        };

        command = WslRunner.BuildRepoAwareCommand(repo, lab.RelativePath, command);
        WriteOutput($"> wsl -d {distro} -- bash -lc \"{command}\"");

        try
        {
            ToggleButtons(false);
            UpdateStatus($"Ejecutando {type.ToString().ToLowerInvariant()} sobre {lab.Name}...");
            var result = await WslRunner.RunAsync(distro, command);
            WriteOutput(result);
            UpdateStatus($"Comando completado sobre {lab.Name}.");
        }
        catch (Exception ex)
        {
            WriteOutput($"Error: {ex.Message}");
            UpdateStatus("Operación con error.");
        }
        finally
        {
            ToggleButtons(true);
        }

        await RefreshAllServiceStatusesAsync(false);
    }

    private async Task RunStatusAsync()
    {
        var distro = _cmbDistro.Text.Trim();
        if (string.IsNullOrWhiteSpace(distro))
        {
            WriteOutput("Define la distro WSL.");
            return;
        }

        try
        {
            ToggleButtons(false);
            UpdateStatus("Consultando estado global de kraft...");
            var result = await WslRunner.RunAsync(distro, "kraft ps");
            WriteOutput(result);
            UpdateStatus("Estado global consultado.");
        }
        catch (Exception ex)
        {
            WriteOutput($"Error: {ex.Message}");
            UpdateStatus("No se pudo consultar el estado global.");
        }
        finally
        {
            ToggleButtons(true);
        }

        await RefreshAllServiceStatusesAsync(false);
    }

    private async Task RunDoctorAsync()
    {
        var distro = _cmbDistro.Text.Trim();
        var repo = _txtRepoPath.Text.Trim();

        if (string.IsNullOrWhiteSpace(distro) || string.IsNullOrWhiteSpace(repo))
        {
            WriteOutput("Define la distro y la ruta Linux del repo.");
            return;
        }

        var command = $"cd '{repo}' && bash scripts/doctor.sh";
        try
        {
            ToggleButtons(false);
            UpdateStatus("Ejecutando doctor del entorno...");
            var result = await WslRunner.RunAsync(distro, command);
            WriteOutput(result);
            UpdateStatus("Doctor completado.");
        }
        catch (Exception ex)
        {
            WriteOutput($"Error: {ex.Message}");
            UpdateStatus("Doctor con error.");
        }
        finally
        {
            ToggleButtons(true);
        }
    }

    private void OpenSelectedLab()
    {
        if (GetSelectedLab() is not LabDefinition lab)
        {
            WriteOutput("Selecciona un lab.");
            return;
        }

        if (string.IsNullOrWhiteSpace(lab.Url))
        {
            WriteOutput("Este servicio no expone una URL localhost directa.");
            return;
        }

        OpenUrl(lab.Url);
    }

    private void OpenUrl(string url)
    {
        try
        {
            Process.Start(new ProcessStartInfo
            {
                FileName = url,
                UseShellExecute = true
            });
            WriteOutput($"Abriendo: {url}");
            UpdateStatus($"Abierto: {url}");
        }
        catch (Exception ex)
        {
            WriteOutput($"No se pudo abrir la URL: {ex.Message}");
            UpdateStatus("No se pudo abrir la URL.");
        }
    }

    private void UpdateSelectedLabDetails()
    {
        var lab = GetSelectedLab();
        if (lab is null)
        {
            _lblSelectedTitle.Text = "Selecciona un servicio";
            _lblSelectedDesc.Text = "Aquí verás el detalle operativo del lab seleccionado.";
            _lblSelectedPath.Text = "—";
            _lblSelectedUrl.Text = "—";
            _lblSelectedCommands.Text = "—";
            _lblEnvironmentHints.Text = "Completa la distro y la ruta Linux del repo para operar el launcher.";
            ApplyStatusToDetails(ServiceStatusSnapshot.Pending("Elige un servicio para verificar el endpoint."));
            _btnOpen.Enabled = false;
            return;
        }

        var repo = string.IsNullOrWhiteSpace(_txtRepoPath.Text) ? "/home/tu_usuario/dev/unikernel-labs" : _txtRepoPath.Text.Trim();
        var distro = string.IsNullOrWhiteSpace(_cmbDistro.Text) ? "WSL2 sin definir" : _cmbDistro.Text.Trim();
        _lblSelectedTitle.Text = $"{lab.Id} · {lab.Name}";
        _lblSelectedDesc.Text = lab.Description;
        _lblSelectedPath.Text = string.IsNullOrWhiteSpace(lab.RelativePath)
            ? repo
            : $"{repo.TrimEnd('/')}/{lab.RelativePath}";
        _lblSelectedUrl.Text = string.IsNullOrWhiteSpace(lab.Url) ? "Sin URL pública directa" : lab.Url!;
        _lblSelectedCommands.Text = WslRunner.BuildRepoAwareCommand(repo, lab.RelativePath, lab.StartCommand);
        _lblEnvironmentHints.Text = $"Distro: {distro} · Repo: {repo}";
        _btnOpen.Enabled = !string.IsNullOrWhiteSpace(lab.Url);
        _statusEnv.Text = $"Entorno: {distro} · localhost";
        ApplyStatusToDetails(GetCachedStatus(lab));
        _settings.LastSelectedLabId = lab.Id;
    }

    private async Task RefreshAllServiceStatusesAsync(bool announce)
    {
        _healthCheckCts?.Cancel();
        _healthCheckCts?.Dispose();
        _healthCheckCts = new CancellationTokenSource(TimeSpan.FromSeconds(12));

        try
        {
            ToggleButtons(false);
            UpdateStatus("Verificando health de la grilla...");

            var summary = new List<string>();
            foreach (var lab in _labs)
            {
                var snapshot = await InspectLabAsync(lab, _healthCheckCts.Token);
                _serviceStatuses[lab.Id] = snapshot;
                ApplyStatusToGrid(lab, snapshot);
                if (announce)
                {
                    summary.Add($"{lab.Name}: {snapshot.Indicator}");
                }
            }

            UpdateSelectedLabDetails();
            if (announce)
            {
                WriteOutput($"Health de grilla actualizado: {string.Join(" · ", summary)}");
            }
            UpdateStatus("Health de la grilla actualizado.");
        }
        catch (OperationCanceledException)
        {
            WriteOutput("La verificación de la grilla excedió el tiempo esperado.");
            UpdateStatus("Health global con timeout.");
        }
        catch (Exception ex)
        {
            WriteOutput($"Health global con error: {ex.Message}");
            UpdateStatus("Health global con error.");
        }
        finally
        {
            ToggleButtons(true);
        }
    }

    private async Task<ServiceStatusSnapshot> InspectLabAsync(LabDefinition lab, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(lab.Url))
        {
            return ServiceStatusSnapshot.NotApplicable("Este servicio no expone endpoint localhost verificable.");
        }

        if (!Uri.TryCreate(lab.Url, UriKind.Absolute, out var uri))
        {
            return ServiceStatusSnapshot.Failure("URL inválida", "Formato inválido", "La URL configurada no pudo interpretarse.", Color.Firebrick);
        }

        try
        {
            var snapshot = await CheckHealthSnapshotAsync(uri, cancellationToken);
            return new ServiceStatusSnapshot(snapshot.Indicator, snapshot.Title, snapshot.Details, snapshot.Color, snapshot.Success);
        }
        catch (OperationCanceledException)
        {
            return ServiceStatusSnapshot.Warning("Timeout", $"Sin respuesta dentro de la ventana esperada para {uri.Host}:{uri.Port}.");
        }
        catch (Exception ex)
        {
            return ServiceStatusSnapshot.Failure("Error", "Error", ex.Message, Color.Firebrick);
        }
    }

    private static async Task<HealthSnapshot> CheckHealthSnapshotAsync(Uri uri, CancellationToken cancellationToken)
    {
        return uri.Scheme.ToLowerInvariant() switch
        {
            "http" or "https" => await CheckHttpAsync(uri, cancellationToken),
            "redis" => await CheckRedisAsync(uri, cancellationToken),
            _ => await CheckTcpAsync(uri, cancellationToken)
        };
    }

    private static async Task<HealthSnapshot> CheckHttpAsync(Uri uri, CancellationToken cancellationToken)
    {
        var started = Stopwatch.StartNew();
        using var request = new HttpRequestMessage(HttpMethod.Get, uri);
        using var response = await HttpHealthClient.SendAsync(request, HttpCompletionOption.ResponseContentRead, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        started.Stop();

        var snippet = LimitSnippet(body, 140);
        var title = $"HTTP {(int)response.StatusCode} {response.ReasonPhrase}";
        var details = $"GET {uri.PathAndQuery} en {started.ElapsedMilliseconds} ms";
        if (!string.IsNullOrWhiteSpace(snippet))
        {
            details += $" · {snippet}";
        }

        return new HealthSnapshot(response.IsSuccessStatusCode, response.IsSuccessStatusCode ? "OK" : "FAIL", title, details, response.IsSuccessStatusCode ? Color.ForestGreen : Color.Firebrick);
    }

    private static async Task<HealthSnapshot> CheckRedisAsync(Uri uri, CancellationToken cancellationToken)
    {
        var host = string.IsNullOrWhiteSpace(uri.Host) ? "localhost" : uri.Host;
        var port = uri.Port <= 0 ? 6379 : uri.Port;
        using var client = new TcpClient();
        var started = Stopwatch.StartNew();
        await client.ConnectAsync(host, port, cancellationToken);
        using var stream = client.GetStream();
        var ping = Encoding.ASCII.GetBytes("*1\r\n$4\r\nPING\r\n");
        await stream.WriteAsync(ping, cancellationToken);
        await stream.FlushAsync(cancellationToken);

        var buffer = new byte[64];
        var read = await stream.ReadAsync(buffer, cancellationToken);
        started.Stop();

        var payload = Encoding.ASCII.GetString(buffer, 0, Math.Max(read, 0)).Trim();
        var success = payload.Contains("PONG", StringComparison.OrdinalIgnoreCase);
        var details = success
            ? $"PING/PONG en {started.ElapsedMilliseconds} ms · {payload}"
            : $"Respuesta inesperada en {started.ElapsedMilliseconds} ms · {payload}";

        return new HealthSnapshot(success, success ? "OK" : "FAIL", success ? "Redis PONG" : "Redis sin PONG", details, success ? Color.ForestGreen : Color.Firebrick);
    }

    private static async Task<HealthSnapshot> CheckTcpAsync(Uri uri, CancellationToken cancellationToken)
    {
        var host = string.IsNullOrWhiteSpace(uri.Host) ? "localhost" : uri.Host;
        var port = uri.IsDefaultPort ? 80 : uri.Port;
        using var client = new TcpClient();
        var started = Stopwatch.StartNew();
        await client.ConnectAsync(host, port, cancellationToken);
        started.Stop();
        return new HealthSnapshot(true, "OK", "TCP abierto", $"Conexión TCP exitosa a {host}:{port} en {started.ElapsedMilliseconds} ms", Color.ForestGreen);
    }

    private static string LimitSnippet(string? text, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(text))
        {
            return string.Empty;
        }

        var normalized = text.Replace("\r", " ").Replace("\n", " ").Trim();
        if (normalized.Length <= maxLength)
        {
            return normalized;
        }

        return normalized[..maxLength].TrimEnd() + "…";
    }

    private void ApplyStatusToGrid(LabDefinition lab, ServiceStatusSnapshot status)
    {
        foreach (DataGridViewRow row in _gridLabs.Rows)
        {
            if (row.Tag is LabDefinition tagged && string.Equals(tagged.Id, lab.Id, StringComparison.OrdinalIgnoreCase))
            {
                ApplyStatusToRow(row, status);
                return;
            }
        }
    }

    private void ApplyStatusToRow(DataGridViewRow row, ServiceStatusSnapshot status)
    {
        row.Cells["status"].Value = status.Indicator;
        row.Cells["endpoint"].Value = (row.Tag as LabDefinition)?.Url ?? "—";
        var cell = row.Cells["status"];
        cell.Style.BackColor = status.Color;
        cell.Style.ForeColor = Color.White;
        cell.Style.SelectionBackColor = status.Color;
        cell.Style.SelectionForeColor = Color.White;
        row.DefaultCellStyle.BackColor = Lighten(status.Color, 0.93f);
        row.DefaultCellStyle.SelectionBackColor = Lighten(status.Color, 0.84f);
        row.DefaultCellStyle.SelectionForeColor = Color.FromArgb(20, 36, 62);
    }

    private void ApplyStatusToDetails(ServiceStatusSnapshot status)
    {
        _lblHealthState.Text = status.Title;
        _lblHealthState.ForeColor = status.Color;
        _lblHealthDetails.Text = status.Details;
    }

    private ServiceStatusSnapshot GetCachedStatus(LabDefinition lab)
        => _serviceStatuses.TryGetValue(lab.Id, out var status)
            ? status
            : (string.IsNullOrWhiteSpace(lab.Url)
                ? ServiceStatusSnapshot.NotApplicable("Este servicio no expone endpoint localhost verificable.")
                : ServiceStatusSnapshot.Pending("Verifica el endpoint cuando el servicio esté levantado."));

    private LabDefinition? GetSelectedLab()
    {
        if (_gridLabs.SelectedRows.Count == 0)
        {
            return null;
        }

        return _gridLabs.SelectedRows[0].Tag as LabDefinition;
    }

    private void SelectLabById(string labId)
    {
        foreach (DataGridViewRow row in _gridLabs.Rows)
        {
            if (row.Tag is LabDefinition lab && string.Equals(lab.Id, labId, StringComparison.OrdinalIgnoreCase))
            {
                _isUpdatingGridSelection = true;
                row.Selected = true;
                _gridLabs.CurrentCell = row.Cells[1];
                _isUpdatingGridSelection = false;
                return;
            }
        }
    }

    private void PopulateDistroSelector(IEnumerable<string> distros, string preferred)
    {
        var current = string.IsNullOrWhiteSpace(preferred) ? _cmbDistro.Text.Trim() : preferred.Trim();
        var items = distros
            .Where(static item => !string.IsNullOrWhiteSpace(item))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (!string.IsNullOrWhiteSpace(current) && !items.Contains(current, StringComparer.OrdinalIgnoreCase))
        {
            items.Insert(0, current);
        }

        _cmbDistro.BeginUpdate();
        _cmbDistro.Items.Clear();
        foreach (var item in items)
        {
            _cmbDistro.Items.Add(item);
        }
        _cmbDistro.EndUpdate();

        if (!string.IsNullOrWhiteSpace(current))
        {
            var selected = items.FirstOrDefault(item => string.Equals(item, current, StringComparison.OrdinalIgnoreCase));
            if (selected is not null)
            {
                _cmbDistro.SelectedItem = selected;
            }
            else
            {
                _cmbDistro.Text = current;
            }
        }
        else if (_cmbDistro.Items.Count > 0)
        {
            _cmbDistro.SelectedIndex = 0;
        }
    }

    private void ToggleButtons(bool enabled)
    {
        _btnStart.Enabled = enabled;
        _btnStop.Enabled = enabled;
        _btnLogs.Enabled = enabled;
        _btnOpen.Enabled = enabled && GetSelectedLab() is LabDefinition lab && !string.IsNullOrWhiteSpace(lab.Url);
        _btnStatus.Enabled = enabled;
        _btnDoctor.Enabled = enabled;
        _btnHealth.Enabled = enabled;
        _btnRefresh.Enabled = enabled;
        _btnDetectDistro.Enabled = enabled;
        _btnDetectRepo.Enabled = enabled;
        _btnDetectAll.Enabled = enabled;
        _cmbDistro.Enabled = enabled;
        _gridLabs.Enabled = enabled;
    }

    private void WriteOutput(string text)
    {
        _txtOutput.AppendText($"[{DateTime.Now:HH:mm:ss}] {text}{Environment.NewLine}{Environment.NewLine}");
    }

    private void UpdateStatus(string message)
    {
        _statusText.Text = message;
        _statusEnv.Text = $"Entorno: {_cmbDistro.Text.Trim()} · localhost";
    }

    private void FocusServices()
    {
        _gridLabs.Focus();
        WriteOutput("Atajo lateral: foco puesto en la grilla de servicios.");
    }

    private void FocusOperation()
    {
        _btnStart.Focus();
        WriteOutput("Atajo lateral: foco puesto en los controles de operación.");
    }

    private void ShowDocsHint()
    {
        MessageBox.Show(
            "Revisa estas rutas dentro del repo:\n\n- windows/PUBLISH_AND_INSTALL.md\n- docs/04-windows-localhost-launcher.md\n- launcher/README.md\n\nÚsalas para publicar el launcher y preparar una instalación guiada más completa.",
            "Documentación del producto",
            MessageBoxButtons.OK,
            MessageBoxIcon.Information);
    }

    private void ShowPackagingHint()
    {
        MessageBox.Show(
            "Comandos sugeridos:\n\n dotnet publish launcher\\windows\\src\\UnikernelLabs.Launcher\\UnikernelLabs.Launcher.csproj -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true\n\nConsulta windows/PUBLISH_AND_INSTALL.md para el flujo completo de publicación e instalación.",
            "Packaging / Publish",
            MessageBoxButtons.OK,
            MessageBoxIcon.Information);
    }

    private void ShowAbout()
    {
        MessageBox.Show(
            "Unikernel Control Center v1\n\nLauncher Windows orientado a levantar y observar servicios unikernel usando WSL2 como backend operativo.\n\nEsta v7 del starter agrega autodetección al iniciar, selector visual de distros y grilla de servicios con estado por colores.",
            "Acerca de",
            MessageBoxButtons.OK,
            MessageBoxIcon.Information);
    }

    private static Button CreateActionButton(string text, bool primary = false)
    {
        return new Button
        {
            Text = text,
            Width = primary ? 138 : 126,
            Height = 42,
            Margin = new Padding(0, 0, 10, 10),
            FlatStyle = FlatStyle.Flat,
            BackColor = primary ? Color.FromArgb(32, 82, 156) : Color.White,
            ForeColor = primary ? Color.White : Color.FromArgb(20, 36, 62)
        };
    }

    private static Button CreateCompactButton(string text)
    {
        return new Button
        {
            Text = text,
            AutoSize = false,
            Height = 32,
            Width = 150,
            Margin = new Padding(8, 0, 0, 0),
            FlatStyle = FlatStyle.Flat,
            BackColor = Color.FromArgb(247, 250, 255),
            ForeColor = Color.FromArgb(20, 36, 62)
        };
    }

    private static Button CreateSidebarButton(string icon, string text, Action action)
    {
        var button = new Button
        {
            Width = 84,
            Height = 72,
            Margin = new Padding(4, 0, 4, 10),
            FlatStyle = FlatStyle.Flat,
            BackColor = Color.FromArgb(24, 42, 74),
            ForeColor = Color.White,
            Text = $"{icon}\n{text}",
            Font = new Font("Segoe UI Emoji", 10f, FontStyle.Bold),
            TextAlign = ContentAlignment.MiddleCenter
        };
        button.Click += (_, _) => action();
        return button;
    }

    private static Control CreateEditorRow(Control editor, Button actionButton)
    {
        var row = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 2,
            RowCount = 1,
            BackColor = Color.Transparent
        };
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        row.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 160));
        row.Controls.Add(editor, 0, 0);
        row.Controls.Add(actionButton, 1, 0);
        return row;
    }

    private static Control CreateButtonRow(params Button[] buttons)
    {
        var flow = new FlowLayoutPanel
        {
            Dock = DockStyle.Fill,
            FlowDirection = FlowDirection.LeftToRight,
            WrapContents = true,
            BackColor = Color.Transparent,
            Margin = new Padding(0)
        };
        foreach (var button in buttons)
        {
            flow.Controls.Add(button);
        }
        return flow;
    }

    private static Label CreateSectionLabel(string text) => new()
    {
        Text = text,
        Dock = DockStyle.Fill,
        Font = new Font("Segoe UI", 9f, FontStyle.Bold),
        ForeColor = Color.FromArgb(58, 74, 102),
        TextAlign = ContentAlignment.BottomLeft
    };

    private static Label CreateDetailLabel(string text) => new()
    {
        Text = text,
        Dock = DockStyle.Fill,
        Font = new Font("Segoe UI", 9f, FontStyle.Bold),
        ForeColor = Color.FromArgb(58, 74, 102),
        TextAlign = ContentAlignment.MiddleLeft
    };

    private static Label CreateDetailValue() => new()
    {
        Dock = DockStyle.Fill,
        ForeColor = Color.FromArgb(41, 55, 81),
        Font = new Font("Segoe UI", 9.5f),
        AutoEllipsis = true,
        TextAlign = ContentAlignment.MiddleLeft
    };

    private static Label CreateBadge(string text, Color backColor) => new()
    {
        AutoSize = true,
        Padding = new Padding(12, 8, 12, 8),
        Margin = new Padding(0, 0, 10, 10),
        BackColor = backColor,
        ForeColor = Color.White,
        Text = text,
        Font = new Font("Segoe UI", 9f, FontStyle.Bold)
    };

    private static Panel CreateCardPanel()
    {
        return new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.White,
            BorderStyle = BorderStyle.FixedSingle
        };
    }

    private static void ConfigureTextBox(TextBox textBox)
    {
        textBox.Dock = DockStyle.Fill;
        textBox.BorderStyle = BorderStyle.FixedSingle;
        textBox.Font = new Font("Segoe UI", 10f);
    }

    private static void ConfigureComboBox(ComboBox comboBox)
    {
        comboBox.Dock = DockStyle.Fill;
        comboBox.FlatStyle = FlatStyle.Flat;
        comboBox.Font = new Font("Segoe UI", 10f);
        comboBox.DropDownStyle = ComboBoxStyle.DropDownList;
    }

    private static Control WrapInCodeCard(Label label)
    {
        var panel = new Panel
        {
            Dock = DockStyle.Fill,
            BackColor = Color.FromArgb(247, 250, 255),
            BorderStyle = BorderStyle.FixedSingle,
            Padding = new Padding(12, 10, 12, 10)
        };
        label.Dock = DockStyle.Fill;
        label.Font = new Font("Consolas", 9.5f);
        label.ForeColor = Color.FromArgb(32, 62, 109);
        panel.Controls.Add(label);
        return panel;
    }

    private static Control CreateInstallCard()
    {
        return new Label
        {
            Dock = DockStyle.Fill,
            Text = "1. Usa Autodetectar inicio\n2. Elige la distro en el selector\n3. Valida WSL2 y /dev/kvm\n4. Ejecuta doctor-windows.ps1\n5. Compila o publica el launcher",
            ForeColor = Color.FromArgb(66, 79, 104),
            Padding = new Padding(12, 10, 12, 10),
            BorderStyle = BorderStyle.FixedSingle,
            BackColor = Color.FromArgb(247, 250, 255)
        };
    }

    private static Control CreateNotesCard()
    {
        return new Label
        {
            Dock = DockStyle.Fill,
            Text = "Úsala como capa operativa honesta: inicia servicios, autodetecta el contexto WSL2 al abrir, muestra estado por colores en la grilla, verifica HTTP/Redis/TCP, abre localhost y deja trazabilidad.",
            ForeColor = Color.FromArgb(66, 79, 104),
            Padding = new Padding(12, 10, 12, 10),
            BorderStyle = BorderStyle.FixedSingle,
            BackColor = Color.FromArgb(247, 250, 255)
        };
    }

    private static Control CreatePublishCard()
    {
        return new Label
        {
            Dock = DockStyle.Fill,
            Text = "Publish recomendado:\n\n dotnet publish ... -c Release -r win-x64 --self-contained true /p:PublishSingleFile=true\n\nLuego empaqueta output + README + scripts de soporte.",
            ForeColor = Color.FromArgb(66, 79, 104),
            Padding = new Padding(12, 10, 12, 10),
            BorderStyle = BorderStyle.FixedSingle,
            BackColor = Color.FromArgb(247, 250, 255)
        };
    }

    private static Icon? LoadAppIcon()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "app.ico");
        return File.Exists(path) ? new Icon(path) : null;
    }

    private static Image? LoadLogo()
    {
        var path = Path.Combine(AppContext.BaseDirectory, "logo.png");
        return File.Exists(path) ? Image.FromFile(path) : null;
    }

    private static Color Lighten(Color color, float factor)
    {
        factor = Math.Clamp(factor, 0f, 1f);
        int channel(int value) => value + (int)((255 - value) * factor);
        return Color.FromArgb(channel(color.R), channel(color.G), channel(color.B));
    }

    private enum CommandType
    {
        Start,
        Stop,
        Logs
    }

    private sealed record HealthSnapshot(bool Success, string Indicator, string Title, string Details, Color Color);

    private sealed record ServiceStatusSnapshot(string Indicator, string Title, string Details, Color Color, bool IsOnline)
    {
        public static ServiceStatusSnapshot Pending(string details)
            => new("PEND", "Pendiente", details, Color.DarkOrange, false);

        public static ServiceStatusSnapshot NotApplicable(string details)
            => new("N/A", "No aplica", details, Color.FromArgb(115, 126, 145), false);

        public static ServiceStatusSnapshot Warning(string title, string details)
            => new("TIMEOUT", title, details, Color.DarkOrange, false);

        public static ServiceStatusSnapshot Failure(string indicator, string title, string details, Color color)
            => new(indicator.ToUpperInvariant(), title, details, color, false);
    }
}

internal sealed class GradientPanel : Panel
{
    public Color StartColor { get; set; } = Color.FromArgb(16, 34, 64);
    public Color EndColor { get; set; } = Color.FromArgb(29, 63, 116);
    public Color BorderColor { get; set; } = Color.FromArgb(77, 118, 184);
    public int Radius { get; set; } = 24;

    protected override void OnPaintBackground(PaintEventArgs e)
    {
        e.Graphics.SmoothingMode = SmoothingMode.AntiAlias;
        var rect = ClientRectangle;
        rect.Width -= 1;
        rect.Height -= 1;

        using var path = CreateRoundedRect(rect, Radius);
        using var brush = new LinearGradientBrush(rect, StartColor, EndColor, LinearGradientMode.Horizontal);
        using var pen = new Pen(BorderColor, 1f);
        e.Graphics.FillPath(brush, path);
        e.Graphics.DrawPath(pen, path);
    }

    private static GraphicsPath CreateRoundedRect(Rectangle rect, int radius)
    {
        var path = new GraphicsPath();
        var diameter = radius * 2;
        path.AddArc(rect.X, rect.Y, diameter, diameter, 180, 90);
        path.AddArc(rect.Right - diameter, rect.Y, diameter, diameter, 270, 90);
        path.AddArc(rect.Right - diameter, rect.Bottom - diameter, diameter, diameter, 0, 90);
        path.AddArc(rect.X, rect.Bottom - diameter, diameter, diameter, 90, 90);
        path.CloseFigure();
        return path;
    }
}
