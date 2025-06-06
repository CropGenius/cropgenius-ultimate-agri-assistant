# Create temp directory for backups
$backupDir = "ui-components-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
New-Item -Path $backupDir -ItemType Directory | Out-Null

Get-ChildItem -Path ".\src\components\ui\*.tsx" | ForEach-Object {
    # Create backup
    Copy-Item $_.FullName -Destination "$backupDir\$($_.Name)"
    
    # Load content
    $content = Get-Content $_.FullName -Raw
    
    # Replace React imports and references
    $newContent = $content -replace "import \* as React from ""react""", "import { forwardRef, ElementRef, ComponentPropsWithoutRef } from ""react"""
    $newContent = $newContent -replace "React\.forwardRef", "forwardRef" 
    $newContent = $newContent -replace "React\.ElementRef", "ElementRef"
    $newContent = $newContent -replace "React\.ComponentPropsWithoutRef", "ComponentPropsWithoutRef"
    
    # Save changed content
    $newContent | Set-Content $_.FullName -NoNewline
    
    Write-Host "Fixed $($_.Name)"
}

Write-Host "`nFixed all UI component files. Backups stored in $backupDir."
Write-Host "If something went wrong, restore with: Get-ChildItem -Path ""$backupDir\*.tsx"" | ForEach-Object { Copy-Item $_.FullName -Destination "".\src\components\ui\"" }"
