<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kaarten Weergave</title>
    <link rel="stylesheet" href="css/test.css">
</head>
<body>
    <?php
    ini_set('display_errors', 1); 
    error_reporting(E_ALL);
    
    // PHP code om kaarten uit de database te halen
    include 'php/config.php'; // Zorg ervoor dat je de databaseverbinding hier hebt
    include 'php/kaarten.php'; // Voeg de kaarten weergave toe
    ?>
</body>
</html>
