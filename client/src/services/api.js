// This file centralizes frontend API calls so swapping endpoints later is easier.
const API_BASE = '/api'

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

export function getRoles() {
  return fetchJson('/roles')
}

export function getVolunteers() {
  return fetchJson('/volunteers')
}

export function getVolunteerById(id) {
  return fetchJson(`/volunteers/${id}`)
}

export function getContinuityNotes() {
  return fetchJson('/continuity-notes')
}
