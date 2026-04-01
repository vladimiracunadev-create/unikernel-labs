#define MyAppName "Unikernel Control Center"
#define MyAppPublisher "Unikernel Labs"
#define MyAppExeName "UnikernelLabs.Launcher.exe"

#ifndef MyAppVersion
  #define MyAppVersion "1.0.0"
#endif

#ifndef MyPublishDir
  #error MyPublishDir no fue definido.
#endif

#ifndef MyRepoRoot
  #error MyRepoRoot no fue definido.
#endif

#ifndef MyOutputDir
  #define MyOutputDir AddBackslash(SourcePath) + "Output"
#endif

[Setup]
AppId={{9F90D781-7B85-4441-89F9-7A0F9949F20A}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL=https://github.com/vladimiracunadev-create/unikernel-labs
AppSupportURL=https://github.com/vladimiracunadev-create/unikernel-labs
AppUpdatesURL=https://github.com/vladimiracunadev-create/unikernel-labs
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
LicenseFile={#MyRepoRoot}\LICENSE
OutputDir={#MyOutputDir}
OutputBaseFilename=UnikernelControlCenter-{#MyAppVersion}-win-x64-setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequired=admin
PrivilegesRequiredOverridesAllowed=dialog
SetupIconFile={#MyRepoRoot}\launcher\windows\src\UnikernelLabs.Launcher\app.ico
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Crear un acceso directo en el escritorio"; GroupDescription: "Accesos directos:"

[Files]
Source: "{#MyPublishDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "{#MyRepoRoot}\launcher\README.md"; DestDir: "{app}\docs"; Flags: ignoreversion
Source: "{#MyRepoRoot}\windows\README.md"; DestDir: "{app}\docs"; Flags: ignoreversion
Source: "{#MyRepoRoot}\windows\PUBLISH_AND_INSTALL.md"; DestDir: "{app}\docs"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; WorkingDir: "{app}"; Tasks: desktopicon
Name: "{autoprograms}\Desinstalar {#MyAppName}"; Filename: "{uninstallexe}"

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Abrir {#MyAppName}"; Flags: nowait postinstall skipifsilent
