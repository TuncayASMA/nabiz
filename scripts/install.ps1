$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$packageDir = Join-Path $projectRoot 'release/win-unpacked'
$programRoot = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Programs'))
$installDir = [IO.Path]::GetFullPath((Join-Path $programRoot 'Nabiz'))
$legacyExe = Join-Path $programRoot 'Kota/Kota.exe'
if (-not $installDir.StartsWith($programRoot + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Kurulum yolu geçersiz.' }
if (-not (Test-Path -LiteralPath (Join-Path $packageDir 'Nabiz.exe'))) { throw 'Önce npm run package çalıştır.' }
$legacyExe = [IO.Path]::GetFullPath($legacyExe)
$existing = Get-Process -Name Nabiz,Kota -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq (Join-Path $installDir 'Nabiz.exe') -or $_.Path -eq $legacyExe }
if ($existing) { throw 'Önce Nabız uygulamasını saat yanındaki menüden kapat.' }
New-Item -ItemType Directory -Path $installDir -Force | Out-Null
Get-ChildItem -LiteralPath $packageDir | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $installDir -Recurse -Force }
$exe = Join-Path $installDir 'Nabiz.exe'
$shell = New-Object -ComObject WScript.Shell
foreach ($directory in @([Environment]::GetFolderPath('Desktop'), [Environment]::GetFolderPath('Programs'))) {
    # WScript persists shortcut filenames through an ANSI path on this Windows.
    # Save to an ASCII filename, then rename through the Unicode filesystem API.
    $asciiLink = Join-Path $directory 'Nabiz.lnk'
    $displayLink = Join-Path $directory 'Nabız.lnk'
    $shortcut = $shell.CreateShortcut($asciiLink)
    $shortcut.TargetPath = $exe
    $shortcut.WorkingDirectory = $installDir
    $shortcut.IconLocation = "$exe,0"
    $shortcut.Description = 'Yapay zekâ hesaplarının kullanım kotaları'
    $shortcut.Save()
    Move-Item -LiteralPath $asciiLink -Destination $displayLink -Force
    $legacyLink = Join-Path $directory 'Kota.lnk'
    if (Test-Path -LiteralPath $legacyLink) {
        $oldShortcut = $shell.CreateShortcut($legacyLink)
        if ($oldShortcut.TargetPath -eq $legacyExe) { Remove-Item -LiteralPath $legacyLink }
    }
}
# Preserve the existing startup entry and its enabled/disabled state; only update our executable path.
$runKey = 'HKCU:/Software/Microsoft/Windows/CurrentVersion/Run'
if (Test-Path -LiteralPath $runKey) {
    $quotedLegacyExe = '"' + $legacyExe + '"'
    $entries = (Get-ItemProperty -LiteralPath $runKey).PSObject.Properties
    foreach ($entry in $entries) {
        if ($entry.Value -is [string] -and ($entry.Value -eq $quotedLegacyExe -or $entry.Value.StartsWith($quotedLegacyExe + ' ', [StringComparison]::OrdinalIgnoreCase))) {
            $newValue = '"' + $exe + '"' + $entry.Value.Substring($quotedLegacyExe.Length)
            Set-ItemProperty -LiteralPath $runKey -Name $entry.Name -Value $newValue
        }
    }
}
Write-Output "Kuruldu: $exe"
