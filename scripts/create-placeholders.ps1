#!/usr/bin/env pwsh
# create-placeholders.ps1
$sysRoot = "C:\Users\Usuario\AppData\Local\FoundryVTT\Data\systems\beyonders-system"
if (-not (Test-Path $sysRoot)) {
  Write-Error "System folder not found: $sysRoot"
  exit 1
}

# helper
function Backup-File($path) { if (Test-Path $path) { Copy-Item $path "$path.bak" -Force; Write-Output ("Backed up {0} -> {1}.bak" -f $path, $path) } }

# Load system.json
$manifestPath = Join-Path $sysRoot "system.json"
if (-not (Test-Path $manifestPath)) { Write-Error "Missing manifest: $manifestPath"; exit 1 }
$json = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json

# Ensure lang folder exists
$langDir = Join-Path $sysRoot "lang"
if (-not (Test-Path $langDir)) { New-Item -ItemType Directory -Path $langDir -Force | Out-Null; Write-Output "Created folder: $langDir" }

# Ensure pt-BR.json exists: copy en.json if present, else create minimal PT-BR file
$enPath = Join-Path $langDir "en.json"
$ptPath = Join-Path $langDir "pt-BR.json"
if (Test-Path $ptPath) {
  Write-Output "pt-BR already exists: $ptPath"
} elseif (Test-Path $enPath) {
  Backup-File $enPath
  Copy-Item -Path $enPath -Destination $ptPath -Force
  Write-Output "Copied $enPath -> $ptPath"
  # rewrite without BOM
  $txt = Get-Content -Raw -LiteralPath $ptPath
  [System.IO.File]::WriteAllText($ptPath, $txt, (New-Object System.Text.UTF8Encoding $false))
  Write-Output "Saved $ptPath as UTF-8 without BOM"
} else {
  $minimal = @{
    "beyonders" = @{
      "name" = "Beyonders Dream (Sistema)"
      "description" = "Tradução PT-BR mínima para o sistema Beyonders"
    }
  } | ConvertTo-Json -Depth 6
  [System.IO.File]::WriteAllText($ptPath, $minimal, (New-Object System.Text.UTF8Encoding $false))
  Write-Output "Created minimal translation: $ptPath"
}

# Utility to create placeholder file with safe encoding
function Ensure-File($relPath, $type) {
  $full = Join-Path $sysRoot $relPath
  $dir = Split-Path $full -Parent
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null; Write-Output ("Created directory: {0}" -f $dir) }
  if (-not (Test-Path $full)) {
    switch ($type) {
      'css' { $content = "/* placeholder: $relPath */`n" }
      'js'  { $content = "// placeholder: $relPath`n" }
      'json' { $content = "{}" }
      default { $content = "// placeholder: $relPath`n" }
    }
    [System.IO.File]::WriteAllText($full, $content, (New-Object System.Text.UTF8Encoding $false))
    Write-Output ("Created placeholder: {0}" -f $full)
  } else {
    Write-Output ("Exists: {0}" -f $full)
  }
}

# Check styles
if ($json.styles) {
  foreach ($s in $json.styles) { Ensure-File $s 'css' }
}

# Check scripts
if ($json.scripts) {
  foreach ($s in $json.scripts) { Ensure-File $s 'js' }
}

# Check esmodules
if ($json.esmodules) {
  foreach ($m in $json.esmodules) { Ensure-File $m 'js' }
}

# Check language files entries
if ($json.languages) {
  foreach ($lang in $json.languages) { if ($lang.path) { Ensure-File $lang.path 'json' } }
}

# Additional checks for packs images etc (optional)
if ($json.background) {
  $bg = Join-Path $sysRoot $json.background
  if (-not (Test-Path $bg)) {
    $dir = Split-Path $bg -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    # create a tiny 1x1 png placeholder (binary) to avoid Foundry complaining about missing image
    $pngBytes = [System.Convert]::FromBase64String('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAm0B9p8QK8AAAAASUVORK5CYII=')
    [System.IO.File]::WriteAllBytes($bg, $pngBytes)
    Write-Output ("Created placeholder image: {0}" -f $bg)
  } else {
    Write-Output ("Background exists: {0}" -f $bg)
  }
}

Write-Output "Scan complete. Summary:"
Get-ChildItem -Path $sysRoot -Recurse -File -Include *.json,*.mjs,*.css,*.js | ForEach-Object { Write-Output ($_.FullName) }
Write-Output "Now restart Foundry (or reload the web UI). If you see errors, paste them here and I will help resolve them."
