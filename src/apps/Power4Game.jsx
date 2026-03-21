import React from "react";

export default function Power4Game() {
    const ROWS = 6;
    const COLS = 7;
    const [board, setBoard] = React.useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    const [currentPlayer, setCurrentPlayer] = React.useState('P');
    const [winner, setWinner] = React.useState(null);
    const [isThinking, setIsThinking] = React.useState(false);
    const [message, setMessage] = React.useState('Votre tour (cercle clair)');

    const checkWinner = (board, row, col, player) => {
        // Vérifier horizontal
        let count = 1;
        for (let c = col - 1; c >= 0 && board[row][c] === player; c--) count++;
        for (let c = col + 1; c < COLS && board[row][c] === player; c++) count++;
        if (count >= 4) return true;

        // Vérifier vertical
        count = 1;
        for (let r = row - 1; r >= 0 && board[r][col] === player; r--) count++;
        for (let r = row + 1; r < ROWS && board[r][col] === player; r++) count++;
        if (count >= 4) return true;

        // Vérifier diagonal /
        count = 1;
        for (let r = row - 1, c = col + 1; r >= 0 && c < COLS && board[r][c] === player; r--, c++) count++;
        for (let r = row + 1, c = col - 1; r < ROWS && c >= 0 && board[r][c] === player; r++, c--) count++;
        if (count >= 4) return true;

        // Vérifier diagonal \
        count = 1;
        for (let r = row - 1, c = col - 1; r >= 0 && c >= 0 && board[r][c] === player; r--, c--) count++;
        for (let r = row + 1, c = col + 1; r < ROWS && c < COLS && board[r][c] === player; r++, c++) count++;
        if (count >= 4) return true;

        return false;
    };

    const findWinningMove = (board, player) => {
        for (let col = 0; col < COLS; col++) {
            for (let row = ROWS - 1; row >= 0; row--) {
                if (!board[row][col]) {
                    const testBoard = board.map(r => [...r]);
                    testBoard[row][col] = player;
                    if (checkWinner(testBoard, row, col, player)) {
                        return col;
                    }
                    break;
                }
            }
        }
        return -1;
    };

    const getComputerMove = (board) => {
        // 1. Vérifier si l'ordinateur peut gagner
        const winningMove = findWinningMove(board, 'C');
        if (winningMove !== -1) return winningMove;

        // 2. Bloquer le joueur s'il peut gagner
        const blockMove = findWinningMove(board, 'P');
        if (blockMove !== -1) return blockMove;

        // 3. Préférer la colonne du milieu
        const center = Math.floor(COLS / 2);
        for (let offset = 0; offset < COLS; offset++) {
            const col = center + (offset % 2 === 0 ? offset / 2 : -Math.ceil(offset / 2));
            if (col >= 0 && col < COLS) {
                for (let row = ROWS - 1; row >= 0; row--) {
                    if (!board[row][col]) {
                        return col;
                    }
                }
            }
        }
        return 0;
    };

    const dropPiece = (col) => {
        if (winner || isThinking || currentPlayer !== 'P') return;

        // Trouver la première ligne vide de bas en haut
        for (let row = ROWS - 1; row >= 0; row--) {
            if (!board[row][col]) {
                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = 'P';
                setBoard(newBoard);

                if (checkWinner(newBoard, row, col, 'P')) {
                    setWinner('P');
                    setMessage('Vous avez gagné ! 🎉');
                } else if (newBoard.every(r => r.every(c => c !== null))) {
                    setWinner('draw');
                    setMessage('Match nul !');
                } else {
                    setCurrentPlayer('C');
                    setMessage('Ordinateur réfléchit...');
                    setIsThinking(true);

                    // Tour de l'ordinateur après un délai
                    setTimeout(() => {
                        const computerCol = getComputerMove(newBoard);
                        for (let r = ROWS - 1; r >= 0; r--) {
                            if (!newBoard[r][computerCol]) {
                                newBoard[r][computerCol] = 'C';
                                setBoard([...newBoard]);

                                if (checkWinner(newBoard, r, computerCol, 'C')) {
                                    setWinner('C');
                                    setMessage('L\'ordinateur gagne !');
                                } else if (newBoard.every(row => row.every(c => c !== null))) {
                                    setWinner('draw');
                                    setMessage('Match nul !');
                                } else {
                                    setCurrentPlayer('P');
                                    setMessage('Votre tour (cercle clair)');
                                }
                                setIsThinking(false);
                                break;
                            }
                        }
                    }, 600);
                }
                return;
            }
        }
    };

    const resetGame = () => {
        setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
        setCurrentPlayer('P');
        setWinner(null);
        setIsThinking(false);
        setMessage('Votre tour (cercle clair)');
    };

    return (
        <div style={{ 
            padding: '16px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center'
        }}>
            <div style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                {message}
            </div>
            <div style={{ 
                display: 'inline-flex', 
                flexDirection: 'column', 
                border: '3px solid currentColor', 
                padding: '10px', 
                borderRadius: '8px'
            }}>
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} style={{ display: 'flex' }}>
                        {row.map((cell, colIndex) => (
                            <div
                                key={colIndex}
                                onClick={() => dropPiece(colIndex)}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    margin: '4px',
                                    backgroundColor: cell === 'P' ? 'rgba(255, 255, 255, 0.8)' : cell === 'C' ? 'rgba(255, 255, 255, 0.2)' : 'inherit',
                                    border: '2px solid currentColor',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: (winner || isThinking || currentPlayer !== 'P') ? 'default' : 'pointer',
                                    transition: 'transform 0.1s, background-color 0.2s',
                                    userSelect: 'none',
                                    opacity: !cell ? 0.3 : 1
                                }}
                                onMouseEnter={(e) => {
                                    if (!winner && !isThinking && currentPlayer === 'P') {
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                        if (!cell) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                                        }
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    if (!cell) {
                                        e.currentTarget.style.backgroundColor = 'inherit';
                                    }
                                }}
                            >
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <button
                onClick={resetGame}
                style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    backgroundColor: 'inherit',
                    color: 'inherit',
                    border: '1px solid currentColor',
                    borderRadius: '4px'
                }}
            >
                Nouvelle partie
            </button>
        </div>
    );
}
