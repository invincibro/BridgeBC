// OrganizationProfilePage loads one organization record by URL id.
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Badge from '../components/Badge.jsx'
import Card from '../components/Card.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import {
  getOrganizationById,
  getOrganizations,
} from '../services/api.js'

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'string') {
    return value
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

function formatDate(isoString) {
  if (!isoString) return 'Not provided'
  return new Date(isoString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const AVAILABILITY_SLOTS = [
  { label: 'Morning',   weekdayKey: 'weekday_morning',   weekendKey: 'weekend_morning' },
  { label: 'Afternoon', weekdayKey: 'weekday_afternoon',  weekendKey: 'weekend_afternoon' },
  { label: 'Evening',   weekdayKey: 'weekday_evening',    weekendKey: 'weekend_evening' },
]

function AvailabilityTable({ org }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="pb-2 text-left font-medium text-slate-500" />
          {AVAILABILITY_SLOTS.map(({ label }) => (
            <th key={label} className="pb-2 text-center font-medium text-slate-500">
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[
          { row: 'Weekday', slotKey: 'weekdayKey' },
          { row: 'Weekend', slotKey: 'weekendKey' },
        ].map(({ row, slotKey }) => (
          <tr key={row}>
            <td className="py-2 text-slate-500">{row}</td>
            {AVAILABILITY_SLOTS.map((slot) => {
              const key = slot[slotKey]
              return (
                <td key={slot.label} className="py-2 text-center">
                  {org[key] ? (
                    <span className="font-semibold text-pine">✓</span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function OrganizationProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orgOptions, setOrgOptions] = useState([])
  const [org, setOrg] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setError('')
    getOrganizations()
      .then((organizations) => {
        setOrgOptions(organizations)

        if (!organizations.length) {
          setOrg(null)
          setError('No organization records are available yet.')
          return
        }

        const selectedId = id || organizations[0].id
        const orgExists = organizations.some((item) => String(item.id) === String(selectedId))

        if (!orgExists) {
          const fallbackId = organizations[0].id
          navigate(`/organizations/${fallbackId}`, { replace: true })
          return
        }

        return getOrganizationById(selectedId).then((record) => {
          setOrg(record[0])
        })
      })
      .catch(() => {
        setOrg(null)
        setError('Organization profile not found.')
      })
  }, [id, navigate])

  if (error) {
    return <p className="rounded-2xl bg-orange-50 p-6 text-orange-700">{error}</p>
  }

  if (!org) {
    return <p className="rounded-2xl bg-white/80 p-6">Loading organization profile...</p>
  }

  const displayName = org.account_name || org.legal_name || org.org_name
  const location = [org.city, org.province].filter(Boolean).join(', ') || 'Location not provided'

  return (
    <>
      <SectionHeader
        eyebrow="Organization Dashboard"
        title={displayName}
        description={`${location} • ${org.sector || 'General'}`}
      />

      <Card
        title="Choose organization"
        subtitle="Switch between seeded organizations to review their profile."
      >
        <label
          htmlFor="org-select"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Organization record
        </label>
        <select
          id="org-select"
          value={org.id}
          onChange={(event) => navigate(`/organizations/${event.target.value}`)}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-moss focus:ring-2 focus:ring-sky/60"
        >
          {orgOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.account_name || option.legal_name || option.org_name} ({option.id})
            </option>
          ))}
        </select>
      </Card>

      <section className="grid gap-6 md:grid-cols-4">
        <Card title="Volunteers needed">
          <p className="text-4xl font-semibold text-pine">
            {org.volunteers_currently_needed ?? 0}
          </p>
          <p className="mt-2 text-sm">Volunteer spots currently open at this organization.</p>
        </Card>
        <Card title="Urgency">
          <p className="text-4xl font-semibold text-pine">{org.volunteer_urgency || '—'}</p>
          <p className="mt-2 text-sm">How urgently volunteers are needed right now.</p>
        </Card>
        <Card title="Skills needed">
          <p className="text-4xl font-semibold text-pine">
            {normalizeList(org.skills_needed).length}
          </p>
          <p className="mt-2 text-sm">Skill areas listed on the organization record.</p>
        </Card>
        <Card title="Languages needed">
          <p className="text-4xl font-semibold text-pine">
            {normalizeList(org.languages_needed).length}
          </p>
          <p className="mt-2 text-sm">Languages required for volunteer engagement.</p>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card
          title="Organization overview"
          subtitle="Profile details that influence volunteer matching."
        >
          <div className="space-y-5 text-sm">
            <div>
              <p className="font-medium text-slate-500">Skills needed</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {normalizeList(org.skills_needed).map((skill) => (
                  <Badge key={skill}>{skill}</Badge>
                ))}
                {normalizeList(org.skills_needed).length === 0 && (
                  <p className="text-slate-400">None listed</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-slate-500">Languages needed</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {normalizeList(org.languages_needed).map((language) => (
                  <Badge key={language} tone="info">{language}</Badge>
                ))}
                {normalizeList(org.languages_needed).length === 0 && (
                  <p className="text-slate-400">None listed</p>
                )}
              </div>
            </div>
            <div>
              <p className="font-medium text-slate-500">Sector</p>
              <p className="mt-2">{org.sector || 'Not provided'}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Org size</p>
              <p className="mt-2">{org.org_size || 'Not provided'}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Address</p>
              <p className="mt-2">
                {[org.address1, org.address2, org.city, org.province, org.postal_code, org.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Availability preference</p>
              <p className="mt-2">{org.availability_preference || 'Not provided'}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Background check required</p>
              <p className="mt-2">{org.background_check_required ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p className="font-medium text-slate-500">Business number (BN)</p>
              <p className="mt-2">{org.bn || org.BN || 'Not provided'}</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card
            title="Availability windows"
            subtitle="Time slots when this organization needs volunteers."
          >
            <AvailabilityTable org={org} />
          </Card>

          <Card title="Record metadata" subtitle="Timestamps and identifiers for this record.">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <p className="font-medium text-slate-500">Record ID</p>
                <p>{org.id}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-medium text-slate-500">Created</p>
                <p>{formatDate(org.created_at)}</p>
              </div>
              <div className="flex justify-between">
                <p className="font-medium text-slate-500">Last updated</p>
                <p>{formatDate(org.updated_at)}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </>
  )
}

export default OrganizationProfilePage