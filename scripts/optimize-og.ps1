param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [Parameter(Mandatory = $true)]
  [string]$OutputPath
)

Add-Type -AssemblyName System.Drawing

$source = [System.Drawing.Image]::FromFile($InputPath)
$canvas = New-Object System.Drawing.Bitmap 1200, 630
$graphics = [System.Drawing.Graphics]::FromImage($canvas)

try {
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

  $targetRatio = 1200 / 630
  $sourceRatio = $source.Width / $source.Height

  if ($sourceRatio -gt $targetRatio) {
    $cropHeight = $source.Height
    $cropWidth = [int]($cropHeight * $targetRatio)
    $cropX = [int](($source.Width - $cropWidth) / 2)
    $cropY = 0
  } else {
    $cropWidth = $source.Width
    $cropHeight = [int]($cropWidth / $targetRatio)
    $cropX = 0
    $cropY = [int](($source.Height - $cropHeight) / 2)
  }

  $destination = New-Object System.Drawing.Rectangle 0, 0, 1200, 630
  $crop = New-Object System.Drawing.Rectangle $cropX, $cropY, $cropWidth, $cropHeight
  $graphics.DrawImage($source, $destination, $crop, [System.Drawing.GraphicsUnit]::Pixel)

  $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" }
  $quality = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality,
    [long]84
  )
  $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters 1
  $encoderParams.Param[0] = $quality
  $canvas.Save($OutputPath, $jpegCodec, $encoderParams)
} finally {
  $graphics.Dispose()
  $canvas.Dispose()
  $source.Dispose()
}
