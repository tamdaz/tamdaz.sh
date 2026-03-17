import React from "react";

export default function RPSGame() {
    const choices = [
        { name: '🪨 Pierre', value: 'rock', emoji: '🪨' },
        { name: '📄 Feuille', value: 'paper', emoji: '📄' },
        { name: '✂️ Ciseaux', value: 'scissors', emoji: '✂️' }
    ];

    const [playerChoice, setPlayerChoice] = React.useState(null);
    const [computerChoice, setComputerChoice] = React.useState(null);
    const [result, setResult] = React.useState('');
    const [score, setScore] = React.useState({ player: 0, computer: 0, draw: 0 });

    const determineWinner = (player, computer) => {
        if (player === computer) return 'draw';
        if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) {
            return 'player';
        }
        return 'computer';
    };

    const play = (choice) => {
        const computerPick = choices[Math.floor(Math.random() * 3)];
        setPlayerChoice(choice);
        setComputerChoice(computerPick);

        const winner = determineWinner(choice.value, computerPick.value);
        
        if (winner === 'player') {
            setResult('🎉 Vous gagnez !');
            setScore(s => ({ ...s, player: s.player + 1 }));
        } else if (winner === 'computer') {
            setResult('💻 L\'ordinateur gagne !');
            setScore(s => ({ ...s, computer: s.computer + 1 }));
        } else {
            setResult('🤝 Match nul !');
            setScore(s => ({ ...s, draw: s.draw + 1 }));
        }
    };

    const reset = () => {
        setPlayerChoice(null);
        setComputerChoice(null);
        setResult('');
    };

    return (
        <div style={{ 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            height: '100%',
            justifyContent: 'space-around'
        }}>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
                Pierre - Feuille - Ciseaux
            </div>

            <div style={{ 
                display: 'flex', 
                gap: '24px', 
                marginBottom: '24px',
                fontSize: '16px',
                opacity: 0.8
            }}>
                <div>Vous: {score.player}</div>
                <div>Nuls: {score.draw}</div>
                <div>Ordi: {score.computer}</div>
            </div>

            {!playerChoice ? (
                <div>
                    <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                        Choisissez votre coup :
                    </div>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        {choices.map((choice) => (
                            <button
                                key={choice.value}
                                onClick={() => play(choice)}
                                style={{
                                    padding: '16px',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    backgroundColor: 'inherit',
                                    border: '2px solid currentColor',
                                    borderRadius: '8px',
                                    transition: 'transform 0.1s'
                                }}
                                onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                {choice.emoji}
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        display: 'flex', 
                        gap: '48px', 
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '24px'
                    }}>
                        <div>
                            <div style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.8 }}>Vous</div>
                            <div style={{ fontSize: '16px' }}>{playerChoice.emoji}</div>
                        </div>
                        <div style={{ fontSize: '16px', opacity: 0.6 }}>VS</div>
                        <div>
                            <div style={{ fontSize: '16px', marginBottom: '8px', opacity: 0.8 }}>Ordinateur</div>
                            <div style={{ fontSize: '16px' }}>{computerChoice.emoji}</div>
                        </div>
                    </div>
                    
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '24px' }}>
                        {result}
                    </div>

                    <button
                        onClick={reset}
                        style={{
                            padding: '12px 24px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            backgroundColor: 'inherit',
                            color: 'inherit',
                            border: '1px solid currentColor',
                            borderRadius: '4px'
                        }}
                    >
                        Rejouer
                    </button>
                </div>
            )}
        </div>
    );
}
