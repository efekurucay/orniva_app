import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BIRD_SIZE = 30;
const PIPE_WIDTH = 50;
const PIPE_GAP = 150;
const GRAVITY = 0.5;
const JUMP_VELOCITY = -8;
const GAME_HEIGHT = 300;
const PIPE_SPEED = 2;
const BIRD_LEFT = 60;

interface BirdFlightGameProps {
  /** Called when score changes */
  onScoreChange?: (score: number) => void;
}

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
  id: number;
}

/**
 * BirdFlightGame Component (Flappy Bird Style)
 * 
 * A simple Flappy Bird game to play while waiting for analysis
 * Tap to make the bird fly and avoid pipes!
 */
export function BirdFlightGame({ onScoreChange }: BirdFlightGameProps) {
  const { colors } = useTheme();
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  // Game state
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const birdVelocity = useRef(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const pipeIdRef = useRef(0);
  
  // Initialize first pipe
  useEffect(() => {
    if (pipes.length === 0) {
      setPipes([{
        x: SCREEN_WIDTH,
        gapY: GAME_HEIGHT / 2 - PIPE_GAP / 2,
        passed: false,
        id: 0
      }]);
    }
  }, []);
  
  // Game loop
  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }
    
    gameLoopRef.current = setInterval(() => {
      // Update bird physics
      birdVelocity.current += GRAVITY;
      setBirdY(prevY => {
        const newY = prevY + birdVelocity.current;
        
        // Check ground/ceiling collision
        if (newY < 0 || newY > GAME_HEIGHT - BIRD_SIZE) {
          handleGameOver();
          return prevY;
        }
        
        return newY;
      });
      
      // Update pipes
      setPipes(prevPipes => {
        const newPipes = prevPipes.map(pipe => ({
          ...pipe,
          x: pipe.x - PIPE_SPEED
        }));
        
        // Add new pipes
        const lastPipe = newPipes[newPipes.length - 1];
        if (lastPipe && lastPipe.x < SCREEN_WIDTH - 200) {
          const gapY = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
          newPipes.push({
            x: SCREEN_WIDTH,
            gapY,
            passed: false,
            id: ++pipeIdRef.current
          });
        }
        
        // Remove off-screen pipes and update score
        return newPipes.filter(pipe => {
          if (pipe.x < -PIPE_WIDTH) {
            return false;
          }
          
          // Check if bird passed pipe
          if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_LEFT) {
            pipe.passed = true;
            setScore(prev => {
              const newScore = prev + 1;
              onScoreChange?.(newScore);
              return newScore;
            });
          }
          
          return true;
        });
      });
      
      // Check collision with pipes
      checkCollision();
    }, 16);
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameStarted, gameOver]);
  
  const checkCollision = () => {
    pipes.forEach(pipe => {
      // Check if bird is within pipe's x range
      if (pipe.x < BIRD_LEFT + BIRD_SIZE && pipe.x + PIPE_WIDTH > BIRD_LEFT) {
        // Check if bird is not in the gap
        if (birdY < pipe.gapY || birdY + BIRD_SIZE > pipe.gapY + PIPE_GAP) {
          handleGameOver();
        }
      }
    });
  };
  
  const handleTap = () => {
    if (!gameStarted) {
      setGameStarted(true);
      return;
    }
    
    if (gameOver) {
      resetGame();
      return;
    }
    
    // Make bird jump
    birdVelocity.current = JUMP_VELOCITY;
  };
  
  const handleGameOver = () => {
    setGameOver(true);
  };
  
  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setBirdY(GAME_HEIGHT / 2);
    birdVelocity.current = 0;
    pipeIdRef.current = 0;
    setPipes([{
      x: SCREEN_WIDTH,
      gapY: GAME_HEIGHT / 2 - PIPE_GAP / 2,
      passed: false,
      id: 0
    }]);
    onScoreChange?.(0);
  };
  
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handleTap}
      style={styles.gameContainer}
    >
      <View style={[styles.sky, { backgroundColor: colors.primary + '20' }]}>
        {/* Pipes */}
        {pipes.map(pipe => (
          <View
            key={pipe.id}
            style={[
              styles.pipeContainer,
              {
                left: pipe.x,
              },
            ]}
          >
            {/* Top pipe */}
            <View 
              style={[
                styles.pipe, 
                styles.pipeTop, 
                { 
                  height: pipe.gapY, 
                  backgroundColor: colors.success 
                }
              ]} 
            />
            {/* Bottom pipe */}
            <View 
              style={[
                styles.pipe,
                styles.pipeBottom,
                {
                  height: GAME_HEIGHT - pipe.gapY - PIPE_GAP,
                  backgroundColor: colors.success,
                },
              ]} 
            />
          </View>
        ))}
        
        {/* Bird */}
        <View
          style={[
            styles.birdContainer,
            {
              left: BIRD_LEFT,
              top: birdY,
            },
          ]}
        >
          <Text style={styles.bird}>🐦</Text>
        </View>
        
        {/* Score display */}
        <View style={[styles.scoreContainer, { backgroundColor: colors.surface }]}>
          <Text style={[styles.scoreValue, { color: colors.primary }]}>
            {score}
          </Text>
        </View>
        
        {/* Start message */}
        {!gameStarted && !gameOver && (
          <View style={[styles.messageContainer, { backgroundColor: colors.surface + 'F0' }]}>
            <Text style={[styles.messageTitle, { color: colors.primary }]}>
              🎮 Orniva Game
            </Text>
            <Text style={[styles.messageText, { color: colors.text }]}>
              Tap to start flying!
            </Text>
            <Text style={[styles.messageSubtext, { color: colors.textSecondary }]}>
              Keep tapping to stay in the air
            </Text>
          </View>
        )}
        
        {/* Game over message */}
        {gameOver && (
          <View style={[styles.messageContainer, { backgroundColor: colors.surface + 'F0' }]}>
            <Text style={[styles.messageTitle, { color: colors.error }]}>
              💥 Crashed!
            </Text>
            <Text style={[styles.messageScore, { color: colors.primary }]}>
              Final Score: {score}
            </Text>
            <Text style={[styles.messageText, { color: colors.text }]}>
              Tap to try again
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gameContainer: {
    width: '100%',
    height: GAME_HEIGHT,
    marginVertical: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sky: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  birdContainer: {
    position: 'absolute',
    width: BIRD_SIZE,
    height: BIRD_SIZE,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bird: {
    fontSize: BIRD_SIZE,
    textAlign: 'center',
  },
  pipeContainer: {
    position: 'absolute',
    width: PIPE_WIDTH,
    height: GAME_HEIGHT,
    zIndex: 5,
  },
  pipe: {
    width: PIPE_WIDTH,
    position: 'absolute',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  pipeTop: {
    top: 0,
  },
  pipeBottom: {
    bottom: 0,
  },
  scoreContainer: {
    position: 'absolute',
    top: 20,
    left: '50%',
    transform: [{ translateX: -40 }],
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  messageContainer: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    transform: [{ translateX: -120 }],
    padding: 20,
    borderRadius: 16,
    zIndex: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: 'center',
    width: 240,
  },
  messageTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  messageScore: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 10,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  messageSubtext: {
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
});
