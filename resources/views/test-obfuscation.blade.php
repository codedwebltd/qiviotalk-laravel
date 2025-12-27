
 
 <!DOCTYPE html>
 <html>
 <head>
     <title>JS Obfuscation Test</title>
     <style>
         body { font-family: Arial, sans-serif; margin: 20px; }
         pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
         .stats { margin: 20px 0; padding: 10px; background: #e0f2fe; border-radius: 5px; }
     </style>
 </head>
 <body>
     <h1>JavaScript Obfuscation Test</h1>
     
     <div class="stats">
         <strong>Original size:</strong> {{ $originalSize }} bytes<br>
         <strong>Minified size:</strong> {{ $minifiedSize }} bytes<br>
         <strong>Reduction:</strong> {{ round(($originalSize - $minifiedSize) / $originalSize * 100, 2) }}%
     </div>
     
     <h2>Original Code:</h2>
     <pre>{{ $original }}</pre>
     
     <h2>Minified Code:</h2>
     <pre>{{ $minified }}</pre>
 </body>
 </html>














