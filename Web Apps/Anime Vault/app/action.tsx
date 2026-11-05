// Runs at build time for the first page and in the browser for the rest (the API allows CORS),
// so the app works as a static export with no server.
import AnimeCard, { AnimeProp } from "@/components/AnimeCard"

const MAX_LIMIT = 8

export async function fetchAnime(page: number) {
  const response = await fetch(
    `https://shikimori.io/api/animes?page=${page}&limit=${MAX_LIMIT}&order=popularity`,
  )

  const data = await response.json()

  return data.map((anime: AnimeProp, index: number) => (
    <AnimeCard key={anime.id} anime={anime} index={index} />
  ))
}
