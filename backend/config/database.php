<?php
$servername = "localhost:3306";
$username = "tcgadmin";
$password = "tcg089404";
$database = "tcg_project";


$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Fouten gooien als uitzonderingen
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Fetch modus
    PDO::ATTR_EMULATE_PREPARES   => false,                  // Echte prepared statements
];

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$database", $username, $password, $options);
} catch (PDOException $e) {
    // Dit toont de gedetailleerde foutmelding als de verbinding niet lukt
    die("Connection failed: " . $e->getMessage());
}
?>
