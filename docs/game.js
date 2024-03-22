document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game');
    let tubes = [];
    const colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'cyan', 'magenta', 'lime', 'pink', 'teal', 'gray'];
    let selectedBallColor = null;
    let selectedTubeIndex = null;
    // Globale Variable für das schwebende Element
    let floatingBall = null;

    // Initialisiert das Spiel
    function initGame() {
        tubes = []; // Zurücksetzen der Reagenzgläser
        for (let i = 0; i < 15; i++) { // Anpassung auf 15 Reagenzgläser
            tubes.push({balls: []});
        }
    

        // Vorbereiten der Kugeln und Mischen
        let allBalls = [];
        colors.forEach(color => {
            for (let i = 0; i < 4; i++) {
                allBalls.push(color);
            }
        });
        allBalls = shuffleArray(allBalls);

        // Verteilen der Kugeln auf die ersten 12 Reagenzgläser
        for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 4; j++) {
                tubes[i].balls.push(allBalls.shift());
            }
        }

        renderGame();
    }
    // Erstellt und zeigt das schwebende Element an
    function showFloatingBall(color, tubeElement) {
        // Erstelle das Element, wenn es noch nicht existiert
        if (!floatingBall) {
            floatingBall = document.createElement('div');
            floatingBall.className = 'selected-ball';
            document.body.appendChild(floatingBall);
        }

        // Setze die Farbe und Position des schwebenden Balls
        floatingBall.style.backgroundColor = color;
        const rect = tubeElement.getBoundingClientRect();
        floatingBall.style.left = `${rect.left + (rect.width / 2) - 15}px`; // Zentriere über dem Reagenzglas
        floatingBall.style.top = `${rect.top - 20}px`; // Positioniere ein wenig über dem Reagenzglas
    }

    // Versteckt das schwebende Element
    function hideFloatingBall() {
        if (floatingBall) {
            floatingBall.remove();
            floatingBall = null;
        }
    }

    // Funktion zum Mischen der Elemente in einem Array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Zeichnet das Spiel und setzt die Interaktionen auf
    function renderGame() {
        gameContainer.innerHTML = '';
        tubes.forEach((tube, index) => {
            const tubeElement = document.createElement('div');
            tubeElement.className = 'tube';
            if (index === 14) { // Index des Ersatzreagenzglases
                tubeElement.classList.add('helper-tube'); // Füge die spezielle Klasse hinzu
            }
            
            const ballsToRender = tube.balls.slice(); // Kopiere das Array, um Manipulationen zu ermöglichen
    
            // Wenn dieses Reagenzglas das ausgewählte ist und eine Kugel ausgewählt wurde, zeige die oberste Kugel nicht
            if (selectedTubeIndex === index && selectedBallColor !== null) {
                ballsToRender.pop(); // Entferne die oberste Kugel visuell
            }
    
            ballsToRender.forEach(color => {
                const ballElement = document.createElement('div');
                ballElement.className = 'ball';
                ballElement.style.backgroundColor = color;
                tubeElement.appendChild(ballElement);
            });
    
            tubeElement.addEventListener('click', () => handleTubeClick(index));
            gameContainer.appendChild(tubeElement);
        });
    }
    

    // Behandelt Klicks auf die Reagenzgläser
    function handleTubeClick(index) {
        const tubeElement = document.querySelectorAll('.tube')[index];
    
        if (selectedTubeIndex === null && tubes[index].balls.length > 0) {
            selectedTubeIndex = index;
            selectedBallColor = tubes[index].balls[tubes[index].balls.length - 1];
            showFloatingBall(selectedBallColor, tubeElement); // Zeige die ausgewählte Kugel
        } else if (selectedTubeIndex !== null) {
            if (canMoveBall(selectedTubeIndex, index)) {
                moveBall(selectedTubeIndex, index);
                hideFloatingBall(); // Verstecke die ausgewählte Kugel, sobald sie bewegt wird
            } else {
                // Wenn der Zug nicht erlaubt ist, verstecke die ausgewählte Kugel und reset
                hideFloatingBall();
            }
            selectedTubeIndex = null;
            selectedBallColor = null;
        }
        renderGame(); // Aktualisiere das Spielfeld nach jedem Zug
    }

    // Überprüft, ob die Kugel bewegt werden kann
// Überprüft, ob die Kugel bewegt werden kann
function canMoveBall(fromIndex, toIndex) {
    // Spezielle Logik für das Hilfs-Reagenzglas
    if (toIndex === 14) { // Wenn das Ziel das Hilfs-Reagenzglas ist
        return tubes[toIndex].balls.length < 2; // Erlaube nur, wenn weniger als 2 Kugeln enthalten sind
    }
    // Erlaube das Zurücklegen einer Kugel in das gleiche Reagenzglas
    if (fromIndex === toIndex) {
        return false; // Verhindert unnötige Bewegungen innerhalb desselben Reagenzglases
    }

    // Prüfe, ob das Zielreagenzglas leer ist oder die oberste Kugel die gleiche Farbe hat
    if (tubes[toIndex].balls.length === 0 || (tubes[toIndex].balls[tubes[toIndex].balls.length - 1] === selectedBallColor && tubes[toIndex].balls.length < 4)) {
        return true;
    }

    return false;
}

    // Bewegt die Kugel
    function moveBall(fromIndex, toIndex) {
         // Spezielle Behandlung, wenn aus dem Hilfs-Reagenzglas bewegt wird
    if (fromIndex === 14 && tubes[toIndex].balls.length < 4) {
        // Erlaube das Bewegen aus dem Hilfs-Reagenzglas, wenn das Zielreagenzglas nicht voll ist
        const ball = tubes[fromIndex].balls.pop();
        tubes[toIndex].balls.push(ball);
    } else if (fromIndex !== toIndex && tubes[fromIndex].balls.length > 0 && tubes[toIndex].balls.length < 4) {
            tubes[fromIndex].balls.pop(); // Entferne die Kugel physisch, wenn erfolgreich verschoben
            tubes[toIndex].balls.push(selectedBallColor);
            hideFloatingBall(); // Verstecke das schwebende Element
            if (checkWin()) {
                alert('Glückwunsch! Du hast gewonnen!');
            }
        }
        renderGame(); // Aktualisiere das Spielfeld nach jedem Zug
    }

// Überprüft, ob das Spiel gewonnen wurde
function checkWin() {
    // Zähle, wie viele Reagenzgläser leer sind (ohne das Hilfsreagenzglas zu berücksichtigen)
    let emptyTubes = 0;
    for (let i = 0; i < tubes.length - 1; i++) { // Ignoriere das Hilfsreagenzglas am Ende
        if (tubes[i].balls.length === 0) {
            emptyTubes++;
        }
    }

    // Überprüfe, ob genau 2 Reagenzgläser leer sind
    if (emptyTubes !== 2) {
        return false;
    }

    // Überprüfe, ob jedes gefüllte Reagenzglas nur Kugeln einer Farbe enthält
    for (let i = 0; i < tubes.length - 1; i++) { // Ignoriere das Hilfsreagenzglas
        if (tubes[i].balls.length > 0 && !tubes[i].balls.every(color => color === tubes[i].balls[0])) {
            return false;
        }
    }

    return true; // Das Spiel ist gewonnen
}
    initGame();
});

