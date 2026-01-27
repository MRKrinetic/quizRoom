export type WsEvent =
  | { type: 'QUESTION'; payload: any }
  | { type: 'LEADERBOARD'; payload: any }
  | { type: 'PLAYER_JOINED'; payload: any }
  | { type: 'QUIZ_ENDED'; payload: any }
  | { type: 'ROOM_ENDED'; payload: any };
