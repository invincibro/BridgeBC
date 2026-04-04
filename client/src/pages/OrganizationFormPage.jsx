import { useEffect, useState } from 'react'
import Card from '../components/Card.jsx'
import FormField from '../components/FormField.jsx'
import { SelectInput, TextInput } from '../components/FormControls.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { createOrganization, getOrganizations } from '../services/api.js'

const orgSizeOptions = [
  'Micro (1-5 staff)',
  'Small (6-15 staff)',
  'Medium (16-50 staff)',
  'Large (51+ staff)',
]
const provinceOptions = ['BC', 'AB', 'ON', 'QC', 'NS', 'NB', 'PE', 'NL', 'SK', 'MB', 'YT', 'NT', 'NU']
const countryOptions = ['CA', 'US']

const initialForm = {
  BN: '',
  legal_name: '',
  account_name: '',
  address1: '',
  address2: '',
  sector: '',
  city: '',
  province: 'BC',
  postal_code: '',
  country: 'CA',
  org_size: 'Small (6-15 staff)',
}

function OrganizationFormPage() {
  const [form, setForm] = useState(initialForm)
  const [organizations, setOrganizations] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [createdOrganization, setCreatedOrganization] = useState(null)

  useEffect(() => {
    getOrganizations().then(setOrganizations).catch(() => setOrganizations([]))
  }, [])

  function updateField(field) {
    return (event) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const organization = await createOrganization(form)
      setCreatedOrganization(organization)
      setOrganizations((current) => [organization, ...current])
      setForm(initialForm)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SectionHeader
        eyebrow="Organization profile"
        title="Store organization details once, then create volunteer needs separately."
        description="This form now matches the organization table much more closely, including BN and full address fields that belong to the nonprofit record."
      />

      <section className="mx-auto w-full max-w-4xl">
        <div className="space-y-6">
          <Card title="Profile form" subtitle="Save the core organization record here. Volunteer need details should live on task postings.">
            <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
              <FormField
                label="Business number (BN)"
                htmlFor="BN"
                required
                hint="Use the BN field from your nonprofit table."
              >
                <TextInput
                  id="BN"
                  value={form.BN}
                  onChange={updateField('BN')}
                  placeholder="886937309RR"
                />
              </FormField>
              <FormField label="Organization size" htmlFor="org_size">
                <SelectInput
                  id="org_size"
                  value={form.org_size}
                  onChange={updateField('org_size')}
                  options={orgSizeOptions}
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Legal name" htmlFor="legal_name" required>
                  <TextInput
                    id="legal_name"
                    value={form.legal_name}
                    onChange={updateField('legal_name')}
                    placeholder="North Shore Food Link Society"
                  />
                </FormField>
              </div>
              <FormField
                label="Account name"
                htmlFor="account_name"
                hint="Optional public-facing name if it is shorter than the legal name."
              >
                <TextInput
                  id="account_name"
                  value={form.account_name}
                  onChange={updateField('account_name')}
                  placeholder="North Shore Food Link"
                />
              </FormField>
              <FormField label="Sector / category" htmlFor="sector" required>
                <TextInput
                  id="sector"
                  value={form.sector}
                  onChange={updateField('sector')}
                  placeholder="Food access"
                />
              </FormField>
              <div className="md:col-span-2">
                <FormField label="Address line 1" htmlFor="address1" required>
                  <TextInput
                    id="address1"
                    value={form.address1}
                    onChange={updateField('address1')}
                    placeholder="805 West Broadway"
                  />
                </FormField>
              </div>
              <div className="md:col-span-2">
                <FormField
                  label="Address line 2"
                  htmlFor="address2"
                  hint="Optional suite, unit, or floor."
                >
                  <TextInput
                    id="address2"
                    value={form.address2}
                    onChange={updateField('address2')}
                    placeholder="12th Floor"
                  />
                </FormField>
              </div>
              <FormField
                label="City"
                htmlFor="city"
                required
                hint="Use the city field from the organizations table."
              >
                <TextInput
                  id="city"
                  value={form.city}
                  onChange={updateField('city')}
                  placeholder="North Vancouver"
                />
              </FormField>
              <FormField label="Province" htmlFor="province" required>
                <SelectInput
                  id="province"
                  value={form.province}
                  onChange={updateField('province')}
                  options={provinceOptions}
                />
              </FormField>
              <FormField label="Postal code" htmlFor="postal_code" required>
                <TextInput
                  id="postal_code"
                  value={form.postal_code}
                  onChange={updateField('postal_code')}
                  placeholder="V5Z1K1"
                />
              </FormField>
              <FormField label="Country" htmlFor="country" required>
                <SelectInput
                  id="country"
                  value={form.country}
                  onChange={updateField('country')}
                  options={countryOptions}
                />
              </FormField>
              {error && <p className="md:col-span-2 text-sm text-orange-700">{error}</p>}
              {createdOrganization && (
                <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  Saved <span className="font-semibold">{createdOrganization.org_name}</span> with
                  the full organization record. You can now create tasks under this organization.
                </div>
              )}
              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23473d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? 'Saving profile...' : 'Save organization profile'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </>
  )
}

export default OrganizationFormPage
