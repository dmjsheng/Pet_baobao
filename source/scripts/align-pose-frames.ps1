param(
  [Parameter(Mandatory = $true)][string]$FrameRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$offsetsByAction = @{
  'companion-sit' = @(
    @{ Name = '000.png'; X = 0; Y = 0 },
    @{ Name = '001.png'; X = 22; Y = 0 },
    @{ Name = '002.png'; X = 0; Y = 6 },
    @{ Name = '003.png'; X = 24; Y = 5 }
  )
  'sleep-curl' = @(
    @{ Name = '000.png'; X = 0; Y = 0 },
    @{ Name = '001.png'; X = 7; Y = -1 },
    @{ Name = '002.png'; X = 0; Y = 31 },
    @{ Name = '003.png'; X = 7; Y = 31 }
  )
}

foreach ($action in $offsetsByAction.Keys) {
  $directory = Join-Path $FrameRoot $action
  $sources = @{}
  foreach ($frame in $offsetsByAction[$action]) {
    $loaded = [System.Drawing.Bitmap]::FromFile((Join-Path $directory $frame.Name))
    try {
      $sources[$frame.Name] = New-Object System.Drawing.Bitmap $loaded
    } finally {
      $loaded.Dispose()
    }
  }

  try {
    foreach ($frame in $offsetsByAction[$action]) {
      $canvas = New-Object System.Drawing.Bitmap 512, 512, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.DrawImageUnscaled($sources[$frame.Name], [int]$frame.X, [int]$frame.Y)
        $canvas.Save((Join-Path $directory $frame.Name), [System.Drawing.Imaging.ImageFormat]::Png)
      } finally {
        $graphics.Dispose()
        $canvas.Dispose()
      }
    }
  } finally {
    foreach ($source in $sources.Values) { $source.Dispose() }
  }
}

Write-Host "Aligned companion-sit and sleep-curl frames in $FrameRoot"
