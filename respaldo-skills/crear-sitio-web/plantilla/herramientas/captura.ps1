param(
  [string]$Page,
  [int]$Width = 1440,
  [int]$Tall = 9000,
  [int]$Slice = 1100,
  [string]$Tag = 'd',
  [string]$Query = '',
  [double]$Scale = 1
)
# Captura la página completa en una ventana alta (sin scroll) y la corta en tramos para revisarla
$chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$out = Join-Path $base 'capturas'
$prof = Join-Path $base 'chrome-perfil'
New-Item -ItemType Directory -Force $out | Out-Null
$name = [IO.Path]::GetFileNameWithoutExtension($Page)
$q = if ($Query) { "?$Query" } else { '' }
$full = Join-Path $out "$name-$Tag-completa.png"
if (Test-Path $full) { Remove-Item $full -Force }
$cargs = @('--headless=new', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--hide-scrollbars', '--force-prefers-reduced-motion', '--no-first-run', "--user-data-dir=$prof",
  "--window-size=$Width,$Tall", "--force-device-scale-factor=$Scale", '--virtual-time-budget=6000', "--screenshot=$full", "http://localhost:4321/$Page$q")
& $chrome @cargs 2>$null | Out-Null
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Bitmap]::FromFile($full)
# Alto real del contenido: última fila que no es color de fondo uniforme
$bg = $img.GetPixel(2, $img.Height - 2).ToArgb()
$last = $img.Height - 1
for ($y = $img.Height - 1; $y -ge 0; $y -= 8) {
  $diff = $false
  for ($x = 0; $x -lt $img.Width; $x += 24) { if ($img.GetPixel($x, $y).ToArgb() -ne $bg) { $diff = $true; break } }
  if ($diff) { $last = [Math]::Min($img.Height - 1, $y + 40); break }
}
$i = 0
for ($top = 0; $top -lt $last; $top += $Slice) {
  $h = [Math]::Min($Slice, $last - $top)
  $part = $img.Clone((New-Object System.Drawing.Rectangle 0, $top, $img.Width, $h), $img.PixelFormat)
  $f = Join-Path $out ("$name-$Tag-{0:D2}.png" -f $i)
  $part.Save($f, [System.Drawing.Imaging.ImageFormat]::Png)
  $part.Dispose()
  "tramo $i -> $f"
  $i++
}
$img.Dispose()
"alto contenido: $last"
