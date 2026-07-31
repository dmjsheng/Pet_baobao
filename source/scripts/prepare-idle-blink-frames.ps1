param(
  [string]$AssetRoot = (Join-Path $PSScriptRoot '..\..\assets\baobao\frames\idle-look')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$frames = @(
  @{ Output = '000.png'; Source = '000.png'; OffsetX = 0 },
  @{ Output = '001.png'; Source = '001.png'; OffsetX = 27 },
  @{ Output = '002.png'; Source = '002.png'; OffsetX = 48 },
  @{ Output = '003.png'; Source = '001.png'; OffsetX = 27 }
)

$sourceBitmaps = @{}
foreach ($frame in $frames) {
  if (-not $sourceBitmaps.ContainsKey($frame.Source)) {
    $loadedBitmap = [System.Drawing.Bitmap]::FromFile((Join-Path $AssetRoot $frame.Source))
    try {
      $sourceBitmaps[$frame.Source] = New-Object System.Drawing.Bitmap $loadedBitmap
    } finally {
      $loadedBitmap.Dispose()
    }
  }
}

try {
  foreach ($frame in $frames) {
    $canvas = New-Object System.Drawing.Bitmap 512, 512, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.DrawImageUnscaled($sourceBitmaps[$frame.Source], [int]$frame.OffsetX, 0)
      $canvas.Save((Join-Path $AssetRoot $frame.Output), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $graphics.Dispose()
      $canvas.Dispose()
    }
  }
} finally {
  foreach ($bitmap in $sourceBitmaps.Values) { $bitmap.Dispose() }
}

Remove-Item -LiteralPath (Join-Path $AssetRoot '004.png'), (Join-Path $AssetRoot '005.png') -Force
Write-Host "Prepared four anchored idle/blink frames in $AssetRoot"
