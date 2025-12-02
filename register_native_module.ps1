# Script para adicionar o AudioMetadataPackage no MainApplication.kt

$mainAppPath = "android\app\src\main\java\com\evxf\sounds\MainApplication.kt"

Write-Host "Lendo MainApplication.kt..." -ForegroundColor Yellow

$content = Get-Content $mainAppPath -Raw

# Verifica se já foi adicionado
if ($content -match "AudioMetadataPackage") {
    Write-Host "✅ AudioMetadataPackage já está registrado no MainApplication.kt" -ForegroundColor Green
    exit 0
}

Write-Host "Adicionando import do AudioMetadataPackage..." -ForegroundColor Yellow

# Adiciona o import
if ($content -notmatch "import com.evxf.sounds.AudioMetadataPackage") {
    # Encontra a última linha de import e adiciona após
    $content = $content -replace "(import.*\n)(package|class)", "`$1import com.evxf.sounds.AudioMetadataPackage`n`n`$2"
}

Write-Host "Adicionando package na lista..." -ForegroundColor Yellow

# Adiciona o package na lista
# Procura por patterns comuns de adicionar packages
if ($content -match "PackageList\(this\)\.packages\.apply\s*\{") {
    $content = $content -replace "(PackageList\(this\)\.packages\.apply\s*\{\s*)", "`$1`n        // Módulo nativo de metadados de áudio`n        add(AudioMetadataPackage())`n"
} elseif ($content -match "packages\.add\(") {
    # Se já tem outros packages sendo adicionados, adiciona após o último
    $content = $content -replace "(packages\.add\([^\)]+\)\s*)", "`$1`n    packages.add(AudioMetadataPackage())`n"
} else {
    Write-Host "⚠️  ATENÇÃO: Não foi possível adicionar automaticamente." -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, adicione manualmente no MainApplication.kt:" -ForegroundColor Yellow
    Write-Host "1. Import: import com.evxf.sounds.AudioMetadataPackage" -ForegroundColor Cyan
    Write-Host "2. No método getPackages(), adicione: packages.add(AudioMetadataPackage())" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Salva o arquivo
Set-Content -Path $mainAppPath -Value $content -NoNewline

Write-Host "✅ AudioMetadataPackage adicionado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximo passo: Execute o rebuild:" -ForegroundColor Yellow
Write-Host "cd android" -ForegroundColor Cyan
Write-Host ".\gradlew.bat clean assembleRelease" -ForegroundColor Cyan
