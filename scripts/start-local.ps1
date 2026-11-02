$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path -LiteralPath 'node_modules/next')) { throw '请先在项目目录运行 npm ci。' }
& npm.cmd run dev
