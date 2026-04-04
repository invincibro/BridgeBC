// This file centralizes frontend API calls so swapping endpoints later is easier.
const API_BASE = '/api'

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`)

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json()
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const payload = await response.json()
      message = payload.message || message
    } catch {
      // Keep the status-based fallback message.
    }

    throw new Error(message)
  }

  return response.json()
}

export function getOrganizations() {
  return fetchJson('/organizations')
}

export function createOrganization(payload) {
  return postJson('/organizations', payload)
}

export function getTasks() {
  return fetchJson('/tasks')
}

export function createTask(payload) {
  return postJson('/tasks', payload)
}

export function getVolunteers() {
  return fetchJson('/volunteers')
}

export function getVolunteerById(id) {
  return fetchJson(`/volunteers/${id}`)
}

export function createVolunteer(payload) {
  return postJson('/volunteers', payload)
}

export function getContinuityNotes() {
  return fetchJson('/continuity-notes')
}
