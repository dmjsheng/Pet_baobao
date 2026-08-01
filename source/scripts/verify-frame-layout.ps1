param(
  [Parameter(Mandatory = $true)][string]$FrameRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$limits = @{
  'pet-nuzzle' = @{ CenterTolerance = 3; SizeTolerance = 0.02 }
  'eat-treat' = @{ CenterTolerance = 3; SizeTolerance = 0.02 }
  'knead-paws' = @{ CenterTolerance = 3; WidthTolerance = 0.02; HeightTolerance = 0.03; VerticalAnchor = 'top' }
}

function Get-AlphaBounds([string]$Path) {
  $bitmap = [System.Drawing.Bitmap]::new($Path)
  try {
    $minX = $bitmap.Width
    $minY = $bitmap.Height
    $maxX = -1
    $maxY = -1

    for ($y = 0; $y -lt $bitmap.Height; $y++) {
      for ($x = 0; $x -lt $bitmap.Width; $x++) {
        if ($bitmap.GetPixel($x, $y).A -ge 32) {
          if ($x -lt $minX) { $minX = $x }
          if ($x -gt $maxX) { $maxX = $x }
          if ($y -lt $minY) { $minY = $y }
          if ($y -gt $maxY) { $maxY = $y }
        }
      }
    }

    if ($maxX -lt 0) { throw "No visible alpha pixels in $Path" }

    [pscustomobject]@{
      Path = $Path
      Width = $maxX - $minX + 1
      Height = $maxY - $minY + 1
      CenterX = ($minX + $maxX) / 2.0
      Top = $minY
      Bottom = $maxY
    }
  } finally {
    $bitmap.Dispose()
  }
}

foreach ($action in $limits.Keys) {
  $files = @(Get-ChildItem -LiteralPath (Join-Path $FrameRoot $action) -Filter '*.png' -File | Sort-Object Name)
  if ($files.Count -lt 2) { throw "$action needs at least two frames to check layout." }

  $reference = Get-AlphaBounds $files[0].FullName
  $centerLimit = $limits[$action].CenterTolerance
  $verticalAnchor = if ($limits[$action].ContainsKey('VerticalAnchor')) { $limits[$action].VerticalAnchor } else { 'bottom' }
  $widthTolerance = if ($limits[$action].ContainsKey('WidthTolerance')) { $limits[$action].WidthTolerance } else { $limits[$action].SizeTolerance }
  $heightTolerance = if ($limits[$action].ContainsKey('HeightTolerance')) { $limits[$action].HeightTolerance } else { $limits[$action].SizeTolerance }
  $widthLimit = [math]::Ceiling($reference.Width * $widthTolerance)
  $heightLimit = [math]::Ceiling($reference.Height * $heightTolerance)

  foreach ($file in $files) {
    $actual = Get-AlphaBounds $file.FullName
    $centerDelta = [math]::Abs($actual.CenterX - $reference.CenterX)
    $verticalDelta = if ($verticalAnchor -eq 'top') { [math]::Abs($actual.Top - $reference.Top) } else { [math]::Abs($actual.Bottom - $reference.Bottom) }
    $widthDelta = [math]::Abs($actual.Width - $reference.Width)
    $heightDelta = [math]::Abs($actual.Height - $reference.Height)
    if ($centerDelta -gt $centerLimit -or $verticalDelta -gt $centerLimit -or $widthDelta -gt $widthLimit -or $heightDelta -gt $heightLimit) {
      throw "$action layout drift in $($file.Name): center=$centerDelta $verticalAnchor=$verticalDelta width=$widthDelta height=$heightDelta"
    }
  }

  Write-Host "$action stable: $($files.Count) frames, center/$verticalAnchor <= $centerLimit px, width <= $($widthTolerance.ToString('P0')), height <= $($heightTolerance.ToString('P0'))."
}
