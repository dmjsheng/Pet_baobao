param(
  [Parameter(Mandatory = $true)][string]$KeyFrameDirectory,
  [Parameter(Mandatory = $true)][string]$FrameDirectory,
  [double]$Tolerance = 0.03
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function Get-AlphaBounds([System.Drawing.Bitmap]$Bitmap) {
  $minX = $Bitmap.Width
  $minY = $Bitmap.Height
  $maxX = -1
  $maxY = -1
  for ($y = 0; $y -lt $Bitmap.Height; $y++) {
    for ($x = 0; $x -lt $Bitmap.Width; $x++) {
      if ($Bitmap.GetPixel($x, $y).A -ge 32) {
        if ($x -lt $minX) { $minX = $x }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  if ($maxX -lt 0) { throw 'Frame has no visible alpha pixels.' }
  [System.Drawing.Rectangle]::new($minX, $minY, $maxX - $minX + 1, $maxY - $minY + 1)
}

function Get-AlphaAspect([string]$Path) {
  $bitmap = [System.Drawing.Bitmap]::new($Path)
  try {
    $bounds = Get-AlphaBounds $bitmap
    return $bounds.Width / [double]$bounds.Height
  } finally {
    $bitmap.Dispose()
  }
}

$keyFrames = @(Get-ChildItem -LiteralPath $KeyFrameDirectory -Filter '*.png' -File | Sort-Object Name)
if ($keyFrames.Count -ne 4) { throw "Expected four key frames in $KeyFrameDirectory." }

for ($index = 0; $index -lt $keyFrames.Count; $index += 1) {
  $outputPath = Join-Path $FrameDirectory ('{0:D3}.png' -f $index)
  if (-not (Test-Path -LiteralPath $outputPath -PathType Leaf)) { throw "Missing output frame: $outputPath" }

  $keyAspect = Get-AlphaAspect $keyFrames[$index].FullName
  $outputAspect = Get-AlphaAspect $outputPath
  $difference = [math]::Abs($outputAspect - $keyAspect) / $keyAspect
  if ($difference -gt $Tolerance) {
    throw ('{0} changes aspect ratio from {1:N3} to {2:N3} ({3:P1}); limit is {4:P1}.' -f $keyFrames[$index].Name, $keyAspect, $outputAspect, $difference, $Tolerance)
  }
}

Write-Host "Frame aspect ratio matches its source key frames within $($Tolerance.ToString('P0'))."
