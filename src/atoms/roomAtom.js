import { atom } from "jotai";

export const roomAtom = atom({
  roomId: null,
  roomName: null,
  players: [],
});
