param(
  [Parameter(Mandatory = $true)][string]$Sheet,
  [Parameter(Mandatory = $true)][string]$OutputDirectory
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Bitmap]::new($Sheet)
try {
  if ($source.Width % 2 -ne 0 -or $source.Height % 2 -ne 0) {
    throw "Sheet dimensions $($source.Width)x$($source.Height) are not divisible by 2x2."
  }

  $cellWidth = [int]($source.Width / 2)
  $cellHeight = [int]($source.Height / 2)
  New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

  for ($index = 0; $index -lt 4; $index++) {
    $column = $index % 2
    $row = [int][math]::Floor($index / 2)
    $sourceRectangle = [System.Drawing.Rectangle]::new($column * $cellWidth, $row * $cellHeight, $cellWidth, $cellHeight)
    $frame = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($frame)
    try {
      $graphics.Clear([System.Drawing.Color]::FromArgb(255, 255, 0, 255))
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.DrawImage($source, [System.Drawing.Rectangle]::new(0, 0, 512, 512), $sourceRectangle.X, $sourceRectangle.Y, $sourceRectangle.Width, $sourceRectangle.Height, [System.Drawing.GraphicsUnit]::Pixel)
      $frame.Save((Join-Path $OutputDirectory ('{0:D3}.png' -f $index)), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $graphics.Dispose()
      $frame.Dispose()
    }
  }
} finally {
  $source.Dispose()
}
