<?php
// Database-instellingen
$servername = "localhost";  // Verander naar jouw database server
$username = "root";         // Jouw gebruikersnaam (standaard is 'root' bij lokale servers)
$password = "";             // Wachtwoord (standaard is leeg bij lokale servers)
$dbname = "oceaan_game";    // De naam van je database

// Maak verbinding met de database
$conn = new mysqli($servername, $username, $password, $dbname);

// Controleer of de verbinding is gelukt
if ($conn->connect_error) {
    die("Verbinden met database mislukt: " . $conn->connect_error);
}
?>
