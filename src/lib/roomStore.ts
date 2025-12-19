import { create } from 'zustand';

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface RoomState {
  roomId: string | null;
  isHost: boolean;
  playerName: string;
  players: Player[];
  currentQuestion: Question | null;
  messages: Message[];
  
  // Actions
  createRoom: (playerName: string) => string;
  joinRoom: (roomId: string, playerName: string) => boolean;
  setPlayerName: (name: string) => void;
  addPlayer: (player: Player) => void;
  updateScore: (playerId: string, score: number) => void;
  setCurrentQuestion: (question: Question | null) => void;
  addMessage: (message: Message) => void;
  leaveRoom: () => void;
}

const generateRoomId = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const useRoomStore = create<RoomState>((set, get) => ({
  roomId: null,
  isHost: false,
  playerName: '',
  players: [],
  currentQuestion: null,
  messages: [],

  createRoom: (playerName: string) => {
    const roomId = generateRoomId();
    set({
      roomId,
      isHost: true,
      playerName,
      players: [{ id: '1', name: playerName, score: 0 }],
      messages: [],
      currentQuestion: null,
    });
    return roomId;
  },

  joinRoom: (roomId: string, playerName: string) => {
    // In a real app, this would validate with backend
    const playerId = Date.now().toString();
    set((state) => ({
      roomId,
      isHost: false,
      playerName,
      players: [...state.players, { id: playerId, name: playerName, score: 0 }],
    }));
    return true;
  },

  setPlayerName: (name: string) => set({ playerName: name }),

  addPlayer: (player: Player) =>
    set((state) => ({
      players: [...state.players, player],
    })),

  updateScore: (playerId: string, score: number) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.id === playerId ? { ...p, score } : p
      ),
    })),

  setCurrentQuestion: (question: Question | null) =>
    set({ currentQuestion: question }),

  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  leaveRoom: () =>
    set({
      roomId: null,
      isHost: false,
      playerName: '',
      players: [],
      currentQuestion: null,
      messages: [],
    }),
}));
