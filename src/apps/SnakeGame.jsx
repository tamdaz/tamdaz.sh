import React from "react";

const SnakeGame = () => {
    const canvasRef = React.useRef(null);
    const [gameOver, setGameOver] = React.useState(false);
    const [score, setScore] = React.useState(0);
    const [isStarted, setIsStarted] = React.useState(false);

    React.useEffect(() => {
        const loadingTimer = setTimeout(() => {
            setIsStarted(true);
        }, 1500); // 1.5 seconds loading time
        
        return () => clearTimeout(loadingTimer);
    }, []);

    React.useEffect(() => {
        if (!isStarted || gameOver) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const gridSize = 20;
        let snake = [{x: 200, y: 200}, {x: 180, y: 200}, {x: 160, y: 200}];
        let dx = gridSize;
        let dy = 0;
        let foodX;
        let foodY;
        let interval;
        let isChangingDirection = false;

        const generateFood = () => {
            foodX = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
            foodY = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
        };

        generateFood();

        const drawRect = (x, y, color) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, gridSize, gridSize);
            ctx.strokeStyle = "rgba(0,0,0,0.5)";
            ctx.strokeRect(x, y, gridSize, gridSize);
        };

        const draw = () => {
            if (gameOver) return;

            // Resolve CSS variables for canvas context
            const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--terminal-bg-color').trim() || '#000';
            const fgColor = getComputedStyle(document.documentElement).getPropertyValue('--terminal-color').trim() || '#0f0';

            // Clear canvas
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Move snake
            const head = { x: snake[0].x + dx, y: snake[0].y + dy };
            snake.unshift(head);

            // Eat food
            if (head.x === foodX && head.y === foodY) {
                setScore(s => s + 10);
                generateFood();
            } else {
                snake.pop(); // Remove tail if not eating
            }

            // Check collision
            if (
                head.x < 0 || head.x >= canvas.width || 
                head.y < 0 || head.y >= canvas.height ||
                snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
            ) {
                setGameOver(true);
                clearInterval(interval);
            }

            // Draw food
            drawRect(foodX, foodY, fgColor);

            // Draw snake
            snake.forEach((segment, index) => {
                drawRect(segment.x, segment.y, fgColor);
            });

            isChangingDirection = false;
        };

        interval = setInterval(draw, 100);

        const handleKeyDown = (e) => {
            if (isChangingDirection) return;

            const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
            const key = e.keyCode;

            const wLetter = 87, aLetter = 65, sLetter = 83, dLetter = 68;

            if ((key === LEFT || key === aLetter) && dx === 0) {
                dx = -gridSize; dy = 0; isChangingDirection = true;
            } else if ((key === UP || key === wLetter) && dy === 0) {
                dx = 0; dy = -gridSize; isChangingDirection = true;
            } else if ((key === RIGHT || key === dLetter) && dx === 0) {
                dx = gridSize; dy = 0; isChangingDirection = true;
            } else if ((key === DOWN || key === sLetter) && dy === 0) {
                dx = 0; dy = gridSize; isChangingDirection = true;
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            clearInterval(interval);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [gameOver, isStarted]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--terminal-bg-color)', color: 'var(--terminal-color)', width: '100%', height: '100%', justifyContent: 'center' }}>
            {!isStarted ? (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '1.5rem' }}>
                    Chargement du jeu...
                </div>
            ) : null}
            <div style={{ marginBottom: '10px' }}>Score: {score}</div>
            <canvas 
                ref={canvasRef} 
                width={400} 
                height={400} 
                style={{ backgroundColor: 'var(--terminal-bg-color)', border: '2px solid var(--terminal-color)', outline: 'none', filter: isStarted ? 'none' : 'blur(4px)', opacity: isStarted ? 1 : 0.5, transition: 'all 0.3s ease' }}
                tabIndex={0}
            />
            {gameOver && (
                <div style={{ marginTop: '10px', color: 'var(--terminal-color)', fontWeight: 'bold' }}>
                    Game Over!
                </div>
            )}
        </div>
    );
};

export default SnakeGame;
