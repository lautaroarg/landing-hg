Add-Type -AssemblyName System.Drawing
New-Item -ItemType Directory -Force -Path public/images | Out-Null
$crops = @(
 @('codex-clipboard-af30040d-8625-458b-b4d6-7f6acef4f3be.png','hero.jpg',0,0,620,700),
 @('codex-clipboard-4535fb17-cc7e-4225-855a-d5167dc0a73e.png','after.jpg',30,140,630,610),
 @('codex-clipboard-8cb3b94f-e6d7-45f7-b6fb-8ddfe4c55cd4.png','before.jpg',30,140,630,610),
 @('codex-clipboard-d48e8690-36ae-4d7b-b8a6-94f2fd7f2761.png','details.jpg',0,0,724,855)
)
foreach ($c in $crops) {
 $src = [System.Drawing.Image]::FromFile(('C:/Users/Lautaro/AppData/Local/Temp/' + $c[0]))
 $bmp = New-Object System.Drawing.Bitmap ([int]$c[4]),([int]$c[5])
 $g = [System.Drawing.Graphics]::FromImage($bmp)
 $dest = New-Object System.Drawing.Rectangle 0,0,([int]$c[4]),([int]$c[5])
 $rect = New-Object System.Drawing.Rectangle ([int]$c[2]),([int]$c[3]),([int]$c[4]),([int]$c[5])
 $g.DrawImage($src,$dest,$rect,[System.Drawing.GraphicsUnit]::Pixel)
 $bmp.Save((Join-Path $PWD ('public/images/' + $c[1])),[System.Drawing.Imaging.ImageFormat]::Jpeg)
 $g.Dispose(); $bmp.Dispose(); $src.Dispose()
}

