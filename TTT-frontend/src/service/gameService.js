import { fetchWithAuth } from "../state/auth";

export const joinQuickMatch = async (userName, token) => {
  // TODO: implement when backend endpoint is available
  return Promise.reject(new Error("joinQuickMatch not implemented"));
};

export const createOnlineGame = async (
  userName,
  gameName,
  maxPlayerCount,
  character,
  token,
) => {
  const res = await fetchWithAuth("/api/games/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userName,
      gameName,
      maxPlayerCount,
      character,
    }),
    token,
  });
  if (!res.ok) throw new Error("Creation failed");
  return res.json();
};

export const joinOnlineGame = async (token, character, gameId) => {
  const res = await fetchWithAuth(`/api/games/${gameId}/join`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      character: character,
    }),
    token,
  });
  if (!res.ok) throw new Error("Joining online game failed");
};

export const startOnlineGame = async (token, gameId) => {
  const res = await fetchWithAuth(`/api/games/${gameId}/start`, {
    method: "PATCH",
    token,
  });
  if (!res.ok) throw new Error("Starting online game failed");
};

export const makeMove = async (token, gameId, { userName, br, bc, sr, sc }) => {
  const res = await fetchWithAuth(`/games/${gameId}/move`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, br, bc, sr, sc }),
    token,
  });
  if (!res.ok) throw new Error("Move failed");
  return res.json();
};

export const getAvailableGames = async (token) => {
  const res = await fetchWithAuth("/api/games/available", {
    method: "GET",
    token,
  });
  if (!res.ok) throw new Error("Getting available games failed");
  return res.json();
};

export const getMyGames = async (token) => {
  const res = await fetchWithAuth("/api/games/mine", {
    method: "GET",
    token,
  });
  if (!res.ok) throw new Error("Getting available games failed");
  return res.json();
};

export const getGameStatus = async (token, gameId) => {
  const res = await fetchWithAuth(`/api/games/${gameId}`, {
    method: "GET",
    token,
  });
  if (!res.ok) throw new Error(`Getting game #${gameId} failed`);
  return res.json();
};
