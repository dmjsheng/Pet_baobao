param(
  [Parameter(Mandatory = $true)][string]$Sheet,
  [Parameter(Mandatory = $true)][string]$OutputDirectory,
  [Parameter(Mandatory = $true)][int]$Columns,
  [Parameter(Mandatory = $true)][int]$Rows,
  [int]$CanvasWidth = 512,
  [int]$CanvasHeight = 512
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
  if ($cellWidth -gt $CanvasWidth -or $cellHeight -gt $CanvasHeight) {
    throw "Cell dimensions $($cellWidth)x$($cellHeight) exceed requested canvas ${CanvasWidth}x${CanvasHeight}."
  }
  New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null

  for ($index = 0; $index -lt ($Columns * $Rows); $index++) {
    $column = $index % $Columns
    $row = [int][math]::Floor($index / $Columns)
    $rectangle = [System.Drawing.Rectangle]::new($column * $cellWidth, $row * $cellHeight, $cellWidth, $cellHeight)
    $frame = [System.Drawing.Bitmap]::new($CanvasWidth, $CanvasHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($frame)
    try {
      $offsetX = [int][math]::Floor(($CanvasWidth - $cellWidth) / 2)
      $offsetY = [int][math]::Floor(($CanvasHeight - $cellHeight) / 2)
      $graphics.DrawImage($source, [System.Drawing.Rectangle]::new($offsetX, $offsetY, $cellWidth, $cellHeight), $rectangle.X, $rectangle.Y, $rectangle.Width, $rectangle.Height, [System.Drawing.GraphicsUnit]::Pixel)
      $name = '{0:D3}.png' -f $index
      $frame.Save((Join-Path $OutputDirectory $name), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $graphics.Dispose()
      $frame.Dispose()
    }
  }
} finally {
  $source.Dispose()
}
