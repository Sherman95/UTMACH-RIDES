'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth-context'
import { Vehicle } from '@/types/database'
import {
  Car,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Shield,
} from 'lucide-react'

interface VehicleFormData {
  brand: string
  model: string
  color: string
  license_plate: string
}

const emptyForm: VehicleFormData = {
  brand: '',
  model: '',
  color: '',
  license_plate: '',
}

export function VehicleManager() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Inline editing: 'add' shows form at top, vehicle id shows form inline on that card
  const [editingId, setEditingId] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [form, setForm] = useState<VehicleFormData>(emptyForm)

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { user } = useAuth()

  useEffect(() => {
    if (user) fetchVehicles()
  }, [user])

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 2500)
      return () => clearTimeout(timer)
    }
  }, [success])

  async function fetchVehicles() {
    if (!user) return
    setFetchError(false)
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, brand, model, color, license_plate, driver_id, created_at')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setVehicles(data)
    } catch {
      setFetchError(true)
    } finally {
      setLoading(false)
    }
  }

  function startAdd() {
    setForm(emptyForm)
    setEditingId(null)
    setAddingNew(true)
    setError('')
  }

  function startEdit(vehicle: Vehicle) {
    setForm({
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      license_plate: vehicle.license_plate || '',
    })
    setEditingId(vehicle.id)
    setAddingNew(false)
    setError('')
  }

  function cancelForm() {
    setEditingId(null)
    setAddingNew(false)
    setForm(emptyForm)
    setError('')
  }

  async function handleSaveAdd() {
    setError('')
    if (!form.brand.trim() || !form.model.trim() || !form.color.trim()) {
      setError('Marca, modelo y color son obligatorios')
      return
    }

    setSaving(true)
    try {
      if (!user) throw new Error('No autenticado')

      const { error } = await supabase.from('vehicles').insert({
        driver_id: user.id,
        brand: form.brand.trim(),
        model: form.model.trim(),
        color: form.color.trim(),
        license_plate: form.license_plate.trim() || null,
      })
      if (error) throw error

      setSuccess('Vehiculo agregado')
      cancelForm()
      await fetchVehicles()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEdit() {
    setError('')
    if (!editingId) return
    if (!form.brand.trim() || !form.model.trim() || !form.color.trim()) {
      setError('Marca, modelo y color son obligatorios')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({
          brand: form.brand.trim(),
          model: form.model.trim(),
          color: form.color.trim(),
          license_plate: form.license_plate.trim() || null,
        })
        .eq('id', editingId)
      if (error) throw error

      setSuccess('Vehiculo actualizado')
      cancelForm()
      await fetchVehicles()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(vehicleId: string) {
    setDeleting(true)
    setError('')

    try {
      const { count } = await supabase
        .from('trips')
        .select('id', { count: 'exact', head: true })
        .eq('vehicle_id', vehicleId)
        .eq('status', 'active')

      if (count && count > 0) {
        setError('No se puede eliminar: este vehiculo tiene viajes activos')
        setDeleteConfirmId(null)
        setDeleting(false)
        return
      }

      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)
      if (error) throw error

      setDeleteConfirmId(null)
      setSuccess('Vehiculo eliminado')
      await fetchVehicles()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setDeleting(false)
    }
  }

  function renderForm(onSave: () => void, saveLabel: string) {
    return (
      <div className="space-y-2.5 border-t border-zinc-800 pt-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-medium">Marca *</label>
            <input
              type="text"
              placeholder="Chevrolet"
              value={form.brand}
              maxLength={50}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="w-full py-2 px-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand transition"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-medium">Modelo *</label>
            <input
              type="text"
              placeholder="Aveo"
              value={form.model}
              maxLength={50}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="w-full py-2 px-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand transition"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-medium">Color *</label>
            <input
              type="text"
              placeholder="Blanco"
              value={form.color}
              maxLength={30}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full py-2 px-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand transition"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 font-medium">Placa (opcional)</label>
            <input
              type="text"
              placeholder="ABC-1234"
              value={form.license_plate}
              maxLength={10}
              onChange={(e) => setForm({ ...form, license_plate: e.target.value })}
              className="w-full py-2 px-2.5 rounded-lg bg-zinc-800/50 border border-zinc-700 text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand transition"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 rounded-lg p-2.5 border border-red-800/30">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 text-xs py-2 rounded-lg bg-brand/20 text-brand font-medium flex items-center justify-center gap-1.5 hover:bg-brand/30 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saveLabel}
          </button>
          <button
            onClick={cancelForm}
            className="flex-1 text-xs py-2 rounded-lg bg-zinc-800 text-zinc-400 font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Cancelar
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-brand" />
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="text-center py-6 space-y-3">
        <div className="w-10 h-10 glass rounded-xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-5 h-5 text-red-400" />
        </div>
        <p className="text-sm text-zinc-400">Error al cargar vehiculos</p>
        <button
          onClick={() => { setLoading(true); fetchVehicles() }}
          className="text-xs px-4 py-2 rounded-lg bg-brand/20 text-brand font-medium hover:bg-brand/30 transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-900/20 rounded-lg p-2.5 border border-emerald-800/30">
          <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Top-level error (delete errors) */}
      {error && !addingNew && !editingId && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 rounded-lg p-2.5 border border-red-800/30">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Inline Add Form */}
      {addingNew && (
        <div className="glass-card rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-brand" />
            <p className="text-sm font-semibold text-white">Nuevo vehiculo</p>
          </div>
          {renderForm(handleSaveAdd, 'Agregar')}
        </div>
      )}

      {/* Vehicle list */}
      {vehicles.length === 0 && !addingNew ? (
        <div className="text-center py-6 space-y-2">
          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center mx-auto">
            <Car className="w-5 h-5 text-zinc-600" />
          </div>
          <p className="text-sm text-zinc-500">No tienes vehiculos registrados</p>
          <p className="text-xs text-zinc-600">Agrega uno para publicar viajes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((vehicle) => {
            const isEditing = editingId === vehicle.id

            return (
              <div key={vehicle.id} className="glass-card rounded-xl p-4 space-y-3">
                {/* Vehicle header row */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4 text-brand" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {vehicle.color}
                      {vehicle.license_plate && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {vehicle.license_plate}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  {deleteConfirmId === vehicle.id ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-red-400">Eliminar?</span>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        disabled={deleting}
                        className="p-1.5 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/60 transition-colors"
                      >
                        {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : !isEditing ? (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(vehicle)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-brand hover:bg-brand/10 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setDeleteConfirmId(vehicle.id); setError('') }}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : null}
                </div>

                {/* Inline edit form */}
                {isEditing && renderForm(handleSaveEdit, 'Guardar')}
              </div>
            )
          })}
        </div>
      )}

      {/* Add button */}
      {!addingNew && (
        <button
          onClick={startAdd}
          className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:text-brand hover:border-brand/50 font-medium text-xs transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar vehiculo
        </button>
      )}
    </div>
  )
}
