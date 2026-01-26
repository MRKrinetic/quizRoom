import { create } from 'zustand';

/* =======================
   TYPES
======================= */

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  imageUrl?: string | null;
  correctAnswerIndex?: number;
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

  // lifecycle
  createRoom: (roomId: string, playerName: string) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  leaveRoom: () => void;

  // players
  setPlayers: (players: Player[]) => void;      // snapshot
  addPlayer: (player: Player) => void;          // realtime
  setLeaderboard: (scores: Record<string, number>) => void;

  // question & chat
  setCurrentQuestion: (question: Question | null) => void;
  addMessage: (message: Message) => void;
}

/* =======================
   STORE
======================= */

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  isHost: false,
  playerName: '',
  players: [],
  currentQuestion: null,
  messages: [],

  /* ===== ROOM ===== */

  createRoom: (roomId, playerName) =>
    set({
      roomId,
      isHost: true,
      playerName,
      players: [],
      currentQuestion: null,
      messages: [],
    }),

  joinRoom: (roomId, playerName) =>
    set({
      roomId,
      isHost: false,
      playerName,
    }),

  leaveRoom: () =>
    set({
      roomId: null,
      isHost: false,
      playerName: '',
      players: [],
      currentQuestion: null,
      messages: [],
    }),

  /* ===== PLAYERS ===== */

  // ✅ SNAPSHOT LOAD (HOST / PLAYER INIT)
  setPlayers: (players) =>
    set({
      players: players.map((p) => ({
        ...p,
        score: p.score ?? 0,
      })),
    }),

  // ✅ REALTIME JOIN (NO DUPLICATES)
  addPlayer: (player) =>
    set((state) => ({
      players: state.players.some((p) => p.id === player.id)
        ? state.players
        : [...state.players, { ...player, score: player.score ?? 0 }],
    })),

  // ✅ REALTIME SCORE UPDATE (DO NOT REPLACE PLAYERS)
  setLeaderboard: (scores) =>
    set((state) => ({
      players: state.players.map((p) => ({
        ...p,
        score:
          typeof scores[p.id] === 'number'
            ? scores[p.id]
            : p.score,
      })),
    })),

  /* ===== QUESTION & CHAT ===== */

  setCurrentQuestion: (question) =>
    set({ currentQuestion: question }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}));
