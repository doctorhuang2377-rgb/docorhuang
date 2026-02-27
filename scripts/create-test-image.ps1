Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(500, 300)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.Clear([System.Drawing.Color]::White)
# 使用默认字体或者系统字体
$font = New-Object System.Drawing.Font("Microsoft YaHei", 24)
$brush = [System.Drawing.Brushes]::Black
# 使用 Unicode 字符串防止编码问题
$text = "测试报告 肺癌 T1N0M0"
$graphics.DrawString($text, $font, $brush, 50, 100)
$bmp.Save("E:\2026\lung-cancer-tnm-pwa\test-data\report-sample.jpg", [System.Drawing.Imaging.ImageFormat]::Jpeg)
$graphics.Dispose()
$bmp.Dispose()