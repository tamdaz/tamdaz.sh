import React from "react";

export default function TicTacToeGame() {
    const [board, setBoard] = React.useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = React.useState(true);
    const [winner, setWinner] = React.useState(null);
    const [isThinking, setIsThinking] = React.useState(false);

    const calculateWinner = (squares) => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Lignes
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colonnes
            [0, 4, 8], [2, 4, 6] // Diagonales
        ];

        for (let i = 0; i < lines.length; i++) {
            const [a, b, c] = lines[i];
            
            if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
                return squares[a];
            }
        }
        return null;
    };

    const minimax = (squares, isMaximizing) => {
        const winner = calculateWinner(squares);
        if (winner === 'O') return 1;
        if (winner === 'X') return -1;
        if (squares.every(s => s !== null)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (!squares[i]) {
                    squares[i] = 'O';
                    const score = minimax(squares, false);
                    squares[i] = null;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (!squares[i]) {
                    squares[i] = 'X';
                    const score = minimax(squares, true);
                    squares[i] = null;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    };

    const getBestMove = (squares) => {
        let bestScore = -Infinity;
        let bestMove = -1;
        for (let i = 0; i < 9; i++) {
            if (!squares[i]) {
                squares[i] = 'O';
                const score = minimax(squares, false);
                squares[i] = null;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    };

    const handleClick = (index) => {
        if (board[index] || winner || !isXNext || isThinking) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);

        const gameWinner = calculateWinner(newBoard);
        if (gameWinner) {
            setWinner(gameWinner);
            return;
        }

        if (newBoard.every(s => s !== null)) {
            setWinner('draw');
            return;
        }

        setIsXNext(false);
        setIsThinking(true);

        // Tour de l'ordinateur après un délai
        setTimeout(() => {
            const computerMove = getBestMove(newBoard);
            if (computerMove !== -1) {
                newBoard[computerMove] = 'O';
                setBoard([...newBoard]);

                const computerWinner = calculateWinner(newBoard);
                if (computerWinner) {
                    setWinner(computerWinner);
                } else if (newBoard.every(s => s !== null)) {
                    setWinner('draw');
                } else {
                    setIsXNext(true);
                }
            }
            setIsThinking(false);
        }, 500);
    };

    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setIsXNext(true);
        setWinner(null);
        setIsThinking(false);
    };

    const renderSquare = (index) => {
        return (
            <button
                onClick={() => handleClick(index)}
                style={{
                    width: '80px',
                    height: '80px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: (winner || board[index] || !isXNext || isThinking) ? 'default' : 'pointer',
                    backgroundColor: 'inherit',
                    color: 'inherit',
                    border: '2px solid currentColor',
                    transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                    if (!winner && !board[index]) {
                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'inherit';
                }}
            >
                {board[index]}
            </button>
        );
    };

    const isBoardFull = board.every(square => square !== null);
    const message = winner === 'X'
        ? '🎉 Vous avez gagné !'
        : winner === 'O'
        ? 'L\'ordinateur gagne !'
        : winner === 'draw'
        ? '🤝 Match nul !'
        : isThinking
        ? 'Ordinateur réfléchit...'
        : isXNext
        ? 'Votre tour (X)'
        : 'Tour de l\'ordinateur (O)';

    return (
        <div style={{ 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            height: '100%',
            justifyContent: 'center'
        }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px' }}>
                Tic Tac Toe
            </div>

            <div style={{ fontSize: '16px', marginBottom: '16px', minHeight: '24px' }}>
                {message}
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 80px)', 
                gap: '4px',
                marginBottom: '24px'
            }}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(index => (
                    <React.Fragment key={index}>
                        {renderSquare(index)}
                    </React.Fragment>
                ))}
            </div>

            <button
                onClick={resetGame}
                style={{
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
