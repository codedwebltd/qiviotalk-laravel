#!/usr/bin/env node

/**
 * Widget Obfuscator
 * 
 * This script obfuscates all JavaScript files in the public/widgets directory
 * Run after: php artisan widgets:update-scripts
 * 
 * Usage: node obfuscate-widgets.js
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Configuration
const WIDGETS_DIR = path.join(__dirname, 'public', 'widgets');
const BACKUP_DIR = path.join(WIDGETS_DIR, 'backups');

// Obfuscation options (matching your config/obfuscation.php)
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: true,
    debugProtectionInterval: 4000,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: true,
    selfDefending: true,
    stringArray: true,
    stringArrayEncoding: ['rc4'],
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function createBackup(filename, content) {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilename = `${filename}.${timestamp}.backup`;
    const backupPath = path.join(BACKUP_DIR, backupFilename);
    
    fs.writeFileSync(backupPath, content);
    return backupPath;
}

function obfuscateFile(filePath) {
    const filename = path.basename(filePath);
    
    try {
        // Read original file
        const originalCode = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(originalCode, 'utf8');
        
        log(`  Processing: ${filename}`, 'cyan');
        
        // Create backup
        const backupPath = createBackup(filename, originalCode);
        log(`  ✓ Backup created`, 'blue');
        
        // Obfuscate
        const obfuscationResult = JavaScriptObfuscator.obfuscate(originalCode, obfuscationOptions);
        const obfuscatedCode = obfuscationResult.getObfuscatedCode();
        const obfuscatedSize = Buffer.byteLength(obfuscatedCode, 'utf8');
        
        // Save obfuscated version
        fs.writeFileSync(filePath, obfuscatedCode);
        
        log(`  ✓ Obfuscated: ${originalSize} → ${obfuscatedSize} bytes`, 'green');
        log(`  ✓ Ratio: ${((obfuscatedSize / originalSize) * 100).toFixed(2)}%`, 'green');
        
        return { success: true, filename, originalSize, obfuscatedSize };
        
    } catch (error) {
        log(`  ✗ Error: ${error.message}`, 'red');
        return { success: false, filename, error: error.message };
    }
}

function main() {
    log('\n========================================', 'cyan');
    log('  Widget JavaScript Obfuscator', 'cyan');
    log('========================================\n', 'cyan');
    
    // Check if widgets directory exists
    if (!fs.existsSync(WIDGETS_DIR)) {
        log('✗ Widgets directory not found!', 'red');
        log(`  Expected: ${WIDGETS_DIR}`, 'red');
        process.exit(1);
    }
    
    // Get all .js files in widgets directory
    const files = fs.readdirSync(WIDGETS_DIR)
        .filter(file => file.endsWith('.js') && file.startsWith('widget-'))
        .map(file => path.join(WIDGETS_DIR, file));
    
    if (files.length === 0) {
        log('✗ No widget files found!', 'yellow');
        log('  Run: php artisan widgets:update-scripts first', 'yellow');
        process.exit(0);
    }
    
    log(`Found ${files.length} widget file(s)\n`, 'blue');
    
    // Process each file
    const results = {
        success: 0,
        failed: 0,
        totalOriginalSize: 0,
        totalObfuscatedSize: 0
    };
    
    files.forEach((filePath, index) => {
        log(`[${index + 1}/${files.length}]`, 'yellow');
        
        const result = obfuscateFile(filePath);
        
        if (result.success) {
            results.success++;
            results.totalOriginalSize += result.originalSize;
            results.totalObfuscatedSize += result.obfuscatedSize;
        } else {
            results.failed++;
        }
        
        console.log(''); // Empty line
    });
    
    // Summary
    log('========================================', 'cyan');
    log('  Summary', 'cyan');
    log('========================================', 'cyan');
    log(`✓ Successful: ${results.success}`, 'green');
    
    if (results.failed > 0) {
        log(`✗ Failed: ${results.failed}`, 'red');
    }
    
    if (results.success > 0) {
        log(`  Total original size: ${results.totalOriginalSize} bytes`, 'blue');
        log(`  Total obfuscated size: ${results.totalObfuscatedSize} bytes`, 'blue');
        log(`  Overall ratio: ${((results.totalObfuscatedSize / results.totalOriginalSize) * 100).toFixed(2)}%`, 'blue');
    }
    
    log(`\nBackups saved to: ${BACKUP_DIR}`, 'yellow');
    log('\n✓ Done!\n', 'green');
}

// Run
main();