import React from "react";

const getGridCells = () => Array(4).fill(null).map(() => Array(4).fill(0));

const Game2048 = () => {
    const [grid, setGrid] = React.useState(getGridCells());
    const [score, setScore] = React.useState(0);
    const [gameOver, setGameOver] = React.useState(false);

    const initializeGame = React.useCallback(() => {
        let newGrid = getGridCells();
        addRandomTile(newGrid);
        addRandomTile(newGrid);
        setGrid(newGrid);
        setScore(0);
        setGameOver(false);
    }, []);

    React.useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const addRandomTile = (currentGrid) => {
        const emptyCells = [];
        currentGrid.forEach((row, i) => {
            row.forEach((cell, j) => {
                if (cell === 0) emptyCells.push({ i, j });
            });
        });

        if (emptyCells.length > 0) {
            const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            currentGrid[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    };

    const moveLeft = (currentGrid) => {
        let newScore = 0;
        const newGrid = currentGrid.map(row => {
            let filteredRow = row.filter(val => val !== 0);
            for (let i = 0; i < filteredRow.length - 1; i++) {
                if (filteredRow[i] === filteredRow[i + 1]) {
                    filteredRow[i] *= 2;
                    newScore += filteredRow[i];
                    filteredRow.splice(i + 1, 1);
                }
            }
            while (filteredRow.length < 4) {
                filteredRow.push(0);
            }
            return filteredRow;
        });
        return { newGrid, newScore };
    };

    const rotateRight = (matrix) => {
        const n = matrix.length;
        let res = Array(n).fill(null).map(() => Array(n).fill(0));
        for (let i = 0; i < n; ++i) {
            for (let j = 0; j < n; ++j) {
                res[j][n - 1 - i] = matrix[i][j];
            }
        }
        return res;
    };

    const arraysEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

    const isGameOver = (currentGrid) => {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (currentGrid[i][j] === 0) return false;
                if (j !== 3 && currentGrid[i][j] === currentGrid[i][j + 1]) return false;
                if (i !== 3 && currentGrid[i][j] === currentGrid[i + 1][j]) return false;
            }
        }
        return true;
    };

    const handleKeyDown = React.useCallback((e) => {
        if (gameOver) return;

        let resGrid = grid;
        let points = 0;
        let changed = false;

        const attemptMove = (operation) => {
            const { newGrid, newScore } = operation(grid);
            resGrid = newGrid;
            points = newScore;
            if (!arraysEqual(grid, resGrid)) {
                changed = true;
            }
        };

        if (e.key === "ArrowLeft" || e.key === "a") {
            attemptMove(moveLeft);
        } else if (e.key === "ArrowRight" || e.key === "d") {
            attemptMove((g) => {
                let rot1 = rotateRight(g);
                let rot2 = rotateRight(rot1);
                let res = moveLeft(rot2);
                return { newGrid: rotateRight(rotateRight(res.newGrid)), newScore: res.newScore };
            });
        } else if (e.key === "ArrowUp" || e.key === "w") {
            attemptMove((g) => {
                let rot1 = rotateRight(rotateRight(rotateRight(g)));
                let res = moveLeft(rot1);
                return { newGrid: rotateRight(res.newGrid), newScore: res.newScore };
            });
        } else if (e.key === "ArrowDown" || e.key === "s") {
            attemptMove((g) => {
                let rot1 = rotateRight(g);
                let res = moveLeft(rot1);
                return { newGrid: rotateRight(rotateRight(rotateRight(res.newGrid))), newScore: res.newScore };
            });
        }

        if (changed) {
            addRandomTile(resGrid);
            setGrid(resGrid);
            setScore(s => s + points);
            if (isGameOver(resGrid)) {
                setGameOver(true);
            }
        }
    }, [grid, gameOver]);

    React.useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'var(--terminal-bg-color)', color: 'var(--terminal-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', marginBottom: '10px', alignItems: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '36px' }}>2048</h1>
                <div style={{ backgroundColor: 'var(--terminal-color)', padding: '5px 10px', borderRadius: '4px', color: 'var(--terminal-bg-color)', fontWeight: 'bold' }}>
                    Score: {score}
                </div>
            </div>
            <div style={{ border: '2px solid var(--terminal-color)', padding: '10px', borderRadius: '6px', position: 'relative' }}>
                {gameOver && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'var(--terminal-bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, opacity: 0.9 }}>
                        <div style={{ fontSize: '30px', fontWeight: 'bold', color: 'var(--terminal-color)' }}>Game Over!</div>
                    </div>
                )}
                {grid.map((row, i) => (
                    <div key={i} style={{ display: 'flex' }}>
                        {row.map((cell, j) => (
                            <div key={`${i}-${j}`} style={{
                                width: '65px',
                                height: '65px',
                                margin: '5px',
                                backgroundColor: cell !== 0 ? 'var(--terminal-color)' : 'transparent',
                                color: 'var(--terminal-bg-color)',
                                border: cell === 0 ? '1px solid var(--terminal-color)' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: cell > 100 ? '24px' : '30px',
                                fontWeight: 'bold',
                                borderRadius: '3px'
                            }}>
                                {cell !== 0 ? cell : ""}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Game2048;