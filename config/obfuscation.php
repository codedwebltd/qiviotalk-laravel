<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Enable Obfuscation
    |--------------------------------------------------------------------------
    |
    | Enable or disable JavaScript obfuscation globally
    |
    */
    'enabled' => env('OBFUSCATION_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Node.js Path
    |--------------------------------------------------------------------------
    |
    | Full path to Node.js binary find out using (which node) command in terminal and replace here
    |
    */
    'node_path' => env('NODE_PATH', '/home/palestine/.nvm/versions/node/v24.11.0/bin/node'),

    /*
    |--------------------------------------------------------------------------
    | JavaScript Obfuscator Path
    |--------------------------------------------------------------------------
    |
    | Full path to javascript-obfuscator binary
    |
    */
    'obfuscator_path' => env('OBFUSCATOR_PATH', '/home/palestine/.nvm/versions/node/v24.11.0/bin/javascript-obfuscator'),

    /*
    |--------------------------------------------------------------------------
    | Obfuscation Options
    |--------------------------------------------------------------------------
    |
    | Options passed to javascript-obfuscator
    | See: https://github.com/javascript-obfuscator/javascript-obfuscator
    |
    */
    'options' => [
        'compact' => true,
        'controlFlowFlattening' => true,
        'controlFlowFlatteningThreshold' => 0.75,
        'deadCodeInjection' => true,
        'deadCodeInjectionThreshold' => 0.4,
        'debugProtection' => true,
        'debugProtectionInterval' => 4000,  // 4 seconds
        'disableConsoleOutput' => true,
        'identifierNamesGenerator' => 'hexadecimal',
        'renameGlobals' => true,
        'selfDefending' => true,
        'stringArray' => true,
        'stringArrayEncoding' => ['rc4'],
        'stringArrayThreshold' => 0.75,
        'transformObjectKeys' => true,
        'unicodeEscapeSequence' => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Remove Console Logs
    |--------------------------------------------------------------------------
    |
    | Strip console.* statements before obfuscation
    |
    */
    'remove_console_logs' => true,

    /*
    |--------------------------------------------------------------------------
    | Anti-Debugger Protection
    |--------------------------------------------------------------------------
    |
    | Wrap code with debugger trap after obfuscation
    |
    */
    'anti_debugger' => true,

    /*
    |--------------------------------------------------------------------------
    | Temp Directory
    |--------------------------------------------------------------------------
    |
    | Directory for temporary files during obfuscation
    |
    */
    'temp_dir' => storage_path('app/temp'),

];