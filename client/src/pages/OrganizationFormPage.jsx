import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card.jsx'
import FormField from '../components/FormField.jsx'
import { SelectInput, TextInput } from '../components/FormControls.jsx'
import SectionHeader from '../components/SectionHeader.jsx'
import { createOrganization } from '../services/api.js'

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
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [createdOrganization, setCreatedOrganization] = useState(null)

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
      setForm(initialForm)

      window.setTimeout(() => {
        navigate(`/tasks/new?orgId=${organization.id}`)
      }, 500)
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
        title="Organization setup"
      />

      <section className="mx-auto w-full max-w-4xl">
        <Card title="Organization profile">
          <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
            <FormField label="Business number (BN)" htmlFor="BN" required>
              <TextInput
                id="BN"
                value={form.BN}
                onChange={updateField('BN')}
                placeholder="886937309RR0001"
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

            <FormField label="Account name" htmlFor="account_name">
              <TextInput
                id="account_name"
                value={form.account_name}
                onChange={updateField('account_name')}
                placeholder="North Shore Food Link"
              />
            </FormField>
            <FormField label="Sector" htmlFor="sector">
              <TextInput
                id="sector"
                value={form.sector}
                onChange={updateField('sector')}
                placeholder="Food access"
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Address line 1" htmlFor="address1">
                <TextInput
                  id="address1"
                  value={form.address1}
                  onChange={updateField('address1')}
                  placeholder="805 West Broadway"
                />
              </FormField>
            </div>

            <div className="md:col-span-2">
              <FormField label="Address line 2" htmlFor="address2" hint="Optional suite, unit, or floor.">
                <TextInput
                  id="address2"
                  value={form.address2}
                  onChange={updateField('address2')}
                  placeholder="12th Floor"
                />
              </FormField>
            </div>

            <FormField label="City" htmlFor="city">
              <TextInput
                id="city"
                value={form.city}
                onChange={updateField('city')}
                placeholder="North Vancouver"
              />
            </FormField>
            <FormField label="Province" htmlFor="province">
              <SelectInput
                id="province"
                value={form.province}
                onChange={updateField('province')}
                options={provinceOptions}
              />
            </FormField>

            <FormField label="Postal code" htmlFor="postal_code">
              <TextInput
                id="postal_code"
                value={form.postal_code}
                onChange={updateField('postal_code')}
                placeholder="V5Z1K1"
              />
            </FormField>
            <FormField label="Country" htmlFor="country">
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
                Saved <span className="font-semibold">{createdOrganization.org_name}</span>.
              </div>
            )}

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#23473d] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? 'Saving organization...' : 'Save organization profile'}
              </button>
            </div>
          </form>
        </Card>
      </section>
    </>
  )
}

export default OrganizationFormPage
