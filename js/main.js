/**
 * Main Entry Point
 */
// import Game from './Game.js'; // Removed for global scope

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    // Start the game loop
    game.start();
});
