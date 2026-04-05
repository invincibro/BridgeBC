// This file centralizes frontend API calls so swapping endpoints later is easier.
const API_BASE = '/api'

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`)
  console.log(response)
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
      message = payload.message || payload.error || message
    } catch {
      // Fall back to the status-based message.
    }

    throw new Error(message)
  }

  return response.json()
}

export function getOrganizations() {
  return fetchJson('/organizations')
}

export function getOrganizationById(id) {
  return fetchJson(`/organizations/${id}`)
}

export function createOrganization(payload) {
  return postJson('/organizations', payload)
}

export function getTasks() {
  return fetchJson('/tasks')
}

export function getRoles() {
  return getTasks()
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

export function getVolunteerAlerts(id) {
  return fetchJson('/volunteers')
}

export function getRecommendedOrganizationsForVolunteer(id) {
  return fetchJson(`/volunteers/${id}/recommended-organizations`)
}

export function createVolunteer(payload) {
  return postJson('/volunteers', payload)
}

export function getContinuityNotes() {
  return fetchJson('/continuity-notes')
}
