param(
  [Parameter(Mandatory = $true)][string]$KeyFrameRoot,
  [Parameter(Mandatory = $true)][string]$OutputRoot
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$sequenceMaps = @{
  'pet-nuzzle' = @(0, 1, 2, 3, 2, 1)
  'eat-treat' = @(0, 1, 2, 3, 2, 1)
  'knead-paws' = @(0, 1, 2, 3, 0, 1, 2, 3)
}

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
  if ($maxX -lt 0) { throw 'Key frame has no visible alpha pixels.' }
  [System.Drawing.Rectangle]::new($minX, $minY, $maxX - $minX + 1, $maxY - $minY + 1)
}

function New-NormalizedFrame([System.Drawing.Bitmap]$Source, [System.Drawing.Rectangle]$Bounds, [int]$TargetWidth, [int]$TargetHeight, [int]$TargetBottom, [bool]$PreserveNaturalProportions) {
  if ($PreserveNaturalProportions) {
    # Kneading moves the front paws but not the cat's whole body.  Keeping the
    # source crop at its natural size prevents any horizontal or vertical stretch;
    # anchoring its top keeps the face and shoulders still while the paws move.
    $frame = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($frame)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $targetX = [int][math]::Floor((512 - $Bounds.Width) / 2)
      $targetY = 30
      $graphics.DrawImage($Source, [System.Drawing.Rectangle]::new($targetX, $targetY, $Bounds.Width, $Bounds.Height), $Bounds.X, $Bounds.Y, $Bounds.Width, $Bounds.Height, [System.Drawing.GraphicsUnit]::Pixel)

      $actual = Get-AlphaBounds $frame
      $offsetX = [int][math]::Round(255.5 - (($actual.X + $actual.Width - 1 + $actual.X) / 2.0))
      $offsetY = $targetY - $actual.Y
      $corrected = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
      $correctedGraphics = [System.Drawing.Graphics]::FromImage($corrected)
      try {
        $correctedGraphics.Clear([System.Drawing.Color]::Transparent)
        $correctedGraphics.DrawImageUnscaled($frame, $offsetX, $offsetY)
        return $corrected
      } finally {
        $correctedGraphics.Dispose()
      }
    } finally {
      $graphics.Dispose()
      $frame.Dispose()
    }
  }

  $frame = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($frame)
  try {
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $targetX = [int][math]::Floor((512 - $TargetWidth) / 2)
    $targetY = $TargetBottom - $TargetHeight + 1
    $graphics.DrawImage($Source, [System.Drawing.Rectangle]::new($targetX, $targetY, $TargetWidth, $TargetHeight), $Bounds.X, $Bounds.Y, $Bounds.Width, $Bounds.Height, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $graphics.Dispose()
  }

  # Resampling can move the alpha edge by a few pixels; snap that measured
  # edge back to the common center and baseline so no action frame shakes.
  $actual = Get-AlphaBounds $frame
  $visible = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $visibleGraphics = [System.Drawing.Graphics]::FromImage($visible)
  try {
    $visibleGraphics.Clear([System.Drawing.Color]::Transparent)
    $visibleGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $visibleGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $visibleGraphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $visibleGraphics.DrawImage($frame, [System.Drawing.Rectangle]::new($targetX, $targetY, $TargetWidth, $TargetHeight), $actual.X, $actual.Y, $actual.Width, $actual.Height, [System.Drawing.GraphicsUnit]::Pixel)
  } finally {
    $visibleGraphics.Dispose()
    $frame.Dispose()
  }

  $visibleBounds = Get-AlphaBounds $visible
  $offsetX = [int][math]::Round(255.5 - (($visibleBounds.X + $visibleBounds.Width - 1 + $visibleBounds.X) / 2.0))
  $offsetY = $TargetBottom - ($visibleBounds.Y + $visibleBounds.Height - 1)
  $corrected = [System.Drawing.Bitmap]::new(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $correctedGraphics = [System.Drawing.Graphics]::FromImage($corrected)
  try {
    $correctedGraphics.Clear([System.Drawing.Color]::Transparent)
    $correctedGraphics.DrawImageUnscaled($visible, $offsetX, $offsetY)
    return $corrected
  } finally {
    $correctedGraphics.Dispose()
    $visible.Dispose()
  }
}

foreach ($action in $sequenceMaps.Keys) {
  $keyDirectory = Join-Path $KeyFrameRoot $action
  $keyFiles = @(Get-ChildItem -LiteralPath $keyDirectory -Filter '*.png' -File | Sort-Object Name)
  if ($keyFiles.Count -ne 4) { throw "$action needs exactly four key frames in $keyDirectory." }

  $sourceFrames = @()
  $bounds = @()
  try {
    foreach ($keyFile in $keyFiles) {
      $source = [System.Drawing.Bitmap]::new($keyFile.FullName)
      $sourceFrames += $source
      $bounds += (Get-AlphaBounds $source)
    }

    # One shared footprint across all repaired actions eliminates visible scale changes.
    $targetWidth = 350
    $targetHeight = 430
    $targetBottom = 470
    $normalized = @()
    try {
      for ($index = 0; $index -lt $sourceFrames.Count; $index++) {
        $normalized += (New-NormalizedFrame $sourceFrames[$index] $bounds[$index] $targetWidth $targetHeight $targetBottom ($action -eq 'knead-paws'))
      }

      $destination = Join-Path $OutputRoot $action
      New-Item -ItemType Directory -Path $destination -Force | Out-Null
      Get-ChildItem -LiteralPath $destination -Filter '*.png' -File | Remove-Item -Force
      for ($index = 0; $index -lt $sequenceMaps[$action].Count; $index++) {
        $frame = $normalized[$sequenceMaps[$action][$index]]
        $frame.Save((Join-Path $destination ('{0:D3}.png' -f $index)), [System.Drawing.Imaging.ImageFormat]::Png)
      }
      Write-Host "$action wrote $($sequenceMaps[$action].Count) stable frames."
    } finally {
      foreach ($frame in $normalized) { $frame.Dispose() }
    }
  } finally {
    foreach ($source in $sourceFrames) { $source.Dispose() }
  }
}
