# Import Checker for verbatimModuleSyntax
# Detects mixed type/value imports that violate TypeScript's strict mode
# Usage: .\check-imports.ps1

$knownTypes = @(
    'Card', 'Deck', 'Tag', 'QueueStats', 'ReviewCard', 'RatingResponse',
    'CardListResponse', 'CardFilters', 'CardCreateRequest', 'CardUpdateRequest',
    'UserSettings', 'UserSettingsUpdate', 'ImportResponse', 'ImportStatus'
)

Write-Host "`n🔍 Checking for import issues with verbatimModuleSyntax...`n" -ForegroundColor Cyan

$issuesFound = 0
$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" -Exclude "*.d.ts"

foreach ($file in $files) {
    $lineNum = 0
    $fileIssues = @()
    
    Get-Content $file.FullName | ForEach-Object {
        $lineNum++
        $line = $_
        
        # Check for imports without 'import type' that contain known type names
        if ($line -match "^import\s+\{([^}]+)\}\s+from\s+['\`"]([^'\`"]+)['\`"]" -and $line -notmatch "import type") {
            $imports = $matches[1] -split ',' | ForEach-Object { $_.Trim() -replace '\s+as\s+.*$', '' }
            $source = $matches[2]
            
            $typesInImport = $imports | Where-Object { $knownTypes -contains $_ }
            
            if ($typesInImport.Count -gt 0) {
                $fileIssues += @{
                    Line = $lineNum
                    Content = $line.Trim()
                    Types = $typesInImport -join ', '
                }
            }
        }
    }
    
    if ($fileIssues.Count -gt 0) {
        $issuesFound += $fileIssues.Count
        $relativePath = $file.FullName.Replace("$PWD\src\", "src\")
        
        Write-Host "📄 $relativePath" -ForegroundColor Yellow
        foreach ($issue in $fileIssues) {
            Write-Host "  Line $($issue.Line): Possible type imports without 'import type'" -ForegroundColor Red
            Write-Host "    Types found: $($issue.Types)" -ForegroundColor Gray
            Write-Host "    Current: $($issue.Content)" -ForegroundColor Gray
            Write-Host ""
        }
    }
}

if ($issuesFound -eq 0) {
    Write-Host "✅ No import issues detected!`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Found $issuesFound potential issue(s).`n" -ForegroundColor Yellow
    Write-Host "💡 Tip: With verbatimModuleSyntax enabled, use 'import type { ... }' for types" -ForegroundColor Cyan
    Write-Host "   Example:" -ForegroundColor Gray
    Write-Host "   ❌ import { api, Card } from './api'" -ForegroundColor Red
    Write-Host "   ✅ import { api } from './api'; import type { Card } from './api'`n" -ForegroundColor Green
}
