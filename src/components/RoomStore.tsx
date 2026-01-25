import { create } from 'zustand';

/* =======================
   TYPES
======================= */

export type Player = {
  id: number;
  name: string;
  score: number;
};

export type Question = {
  id: string;
  text: string;
  options: string[];
};

export type RoomState = {
  roomId: string | null;
  players: Player[];
  currentQuestion: Question | null;

  setRoomId: (id: string | null) => void;
  setCurrentQuestion: (q: Question | null) => void;

  // snapshot load
  setPlayers: (players: Player[]) => void;

  // realtime updates
  addPlayer: (player: Player) => void;
  setLeaderboard: (scores: Record<string, number>) => void;

  // cleanup
  resetRoom: () => void;
};

/* =======================
   STORE
======================= */

export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  players: [],
  currentQuestion: null,

  setRoomId: (id) => set({ roomId: id }),

  setCurrentQuestion: (q) => set({ currentQuestion: q }),

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

  // ✅ REALTIME SCORE UPDATE
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

  // ✅ HARD RESET
  resetRoom: () =>
    set({
      roomId: null,
      players: [],
      currentQuestion: null,
    }),
}));
