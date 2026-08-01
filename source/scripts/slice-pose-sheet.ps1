param(
  [Parameter(Mandatory = $true)][string]$Sheet,
  [Parameter(Mandatory = $true)][string]$OutputDirectory,
  [ValidateRange(1, 8)][int]$Columns = 2,
  [ValidateRange(1, 8)][int]$Rows = 2
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Bitmap]::new($Sheet)
try {
  if ($source.Width % $Columns -ne 0 -or $source.Height % $Rows -ne 0) {
    throw "Sheet dimensions $($source.Width)x$($source.Height) are not divisible by ${Columns}x${Rows}."
  }

  $cellWidth = [int]($source.Width / $Columns)
  $cellHeight = [int]($source.Height / $Rows)
  $scale = [math]::Min(512.0 / $cellWidth, 512.0 / $cellHeight)
  $drawWidth = [int][math]::Round($cellWidth * $scale)
  $drawHeight = [int][math]::Round($cellHeight * $scale)
  $drawX = [int][math]::Floor((512 - $drawWidth) / 2)
  $drawY = [int][math]::Floor((512 - $drawHeight) / 2)
  New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

  for ($index = 0; $index -lt ($Columns * $Rows); $index++) {
    $column = $index % $Columns
    $row = [int][math]::Floor($index / $Columns)
    $sourceRectangle = [System.Drawing.Rectangle]::new($column * $cellWidth, $row * $cellHeight, $cellWidth, $cellHeight)
    $frame = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($frame)
    try {
      $graphics.Clear([System.Drawing.Color]::FromArgb(255, 255, 0, 255))
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.DrawImage($source, [System.Drawing.Rectangle]::new($drawX, $drawY, $drawWidth, $drawHeight), $sourceRectangle.X, $sourceRectangle.Y, $sourceRectangle.Width, $sourceRectangle.Height, [System.Drawing.GraphicsUnit]::Pixel)
      $frame.Save((Join-Path $OutputDirectory ('{0:D3}.png' -f $index)), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $graphics.Dispose()
      $frame.Dispose()
    }
  }
} finally {
  $source.Dispose()
}
