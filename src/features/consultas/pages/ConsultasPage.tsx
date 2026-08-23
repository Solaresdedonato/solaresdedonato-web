import { useState } from 'react'
import bo from '@/styles/backoffice.module.css'
import { LoadingScreen } from '@/shared/components/LoadingScreen'
import { EmptyState } from '@/shared/components/EmptyState'
import { ConfirmDeleteDialog } from '@/shared/components/ConfirmDeleteDialog'
import { exportRowsAsTxt, exportRowsAsXlsx } from '@/shared/utils/exportTable'
import type { ConsultaContacto } from '@/features/contacto/schemas/contacto.schema'
import type { RegistroBroker } from '@/features/broker/schemas/broker.schema'
import { useConsultasContacto, useEliminarConsultaContacto, useRegistrosBroker, useEliminarRegistroBroker } from '../hooks/useConsultas'
import { ConsultaContactoTable } from '../components/ConsultaContactoTable'
import { RegistroBrokerTable } from '../components/RegistroBrokerTable'
import { CONTACTO_HEADERS, contactoRowToArray, BROKER_HEADERS, brokerRowToArray } from '../utils/exportMappers'

export function ConsultasPage() {
  const [tab, setTab] = useState<'contacto' | 'broker'>('contacto')
  const [contactoAEliminar, setContactoAEliminar] = useState<ConsultaContacto | null>(null)
  const [brokerAEliminar, setBrokerAEliminar] = useState<RegistroBroker | null>(null)

  const { data: contactos, isLoading: cargandoContactos } = useConsultasContacto()
  const { eliminar: eliminarContacto, isLoading: eliminandoContacto, error: errorContacto } = useEliminarConsultaContacto()

  const { data: brokers, isLoading: cargandoBrokers } = useRegistrosBroker()
  const { eliminar: eliminarBroker, isLoading: eliminandoBroker, error: errorBroker } = useEliminarRegistroBroker()

  return (
    <div className={bo.page}>
      <div className={bo.breadcrumb}>Consultas recibidas</div>
      <h1 className={bo.pageTitle} style={{ marginBottom: '2rem' }}>
        Formularios y brokers
      </h1>

      <div className={bo.tabs}>
        <button type="button" className={`${bo.tab} ${tab === 'contacto' ? bo.tabActive : ''}`} onClick={() => setTab('contacto')}>
          Formularios de contacto
          <span className={bo.tabCount}>{contactos?.content.length ?? 0}</span>
        </button>
        <button type="button" className={`${bo.tab} ${tab === 'broker' ? bo.tabActive : ''}`} onClick={() => setTab('broker')}>
          Registro de broker
          <span className={bo.tabCount}>{brokers?.content.length ?? 0}</span>
        </button>
      </div>

      {tab === 'contacto' && (
        <div className={bo.panel}>
          <div className={bo.panelHeader}>
            <span style={{ fontSize: '0.78rem', color: '#999999' }}>{contactos?.content.length ?? 0} consultas recibidas</span>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                className={bo.btnExport}
                onClick={() => exportRowsAsTxt(CONTACTO_HEADERS, (contactos?.content ?? []).map(contactoRowToArray), 'formularios-contacto.txt')}
              >
                Exportar .txt
              </button>
              <button
                type="button"
                className={bo.btnExportPrimary}
                onClick={() =>
                  exportRowsAsXlsx(CONTACTO_HEADERS, (contactos?.content ?? []).map(contactoRowToArray), 'formularios-contacto.xlsx', 'Formularios')
                }
              >
                Exportar .xlsx
              </button>
            </div>
          </div>
          {cargandoContactos ? (
            <LoadingScreen />
          ) : !contactos?.content.length ? (
            <EmptyState message="Todavía no hay consultas de contacto." />
          ) : (
            <ConsultaContactoTable items={contactos.content} onEliminar={setContactoAEliminar} />
          )}
        </div>
      )}

      {tab === 'broker' && (
        <div className={bo.panel}>
          <div className={bo.panelHeader}>
            <span style={{ fontSize: '0.78rem', color: '#999999' }}>{brokers?.content.length ?? 0} brokers registrados</span>
            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                type="button"
                className={bo.btnExport}
                onClick={() => exportRowsAsTxt(BROKER_HEADERS, (brokers?.content ?? []).map(brokerRowToArray), 'registro-brokers.txt')}
              >
                Exportar .txt
              </button>
              <button
                type="button"
                className={bo.btnExportPrimary}
                onClick={() => exportRowsAsXlsx(BROKER_HEADERS, (brokers?.content ?? []).map(brokerRowToArray), 'registro-brokers.xlsx', 'Brokers')}
              >
                Exportar .xlsx
              </button>
            </div>
          </div>
          {cargandoBrokers ? (
            <LoadingScreen />
          ) : !brokers?.content.length ? (
            <EmptyState message="Todavía no hay registros de broker." />
          ) : (
            <RegistroBrokerTable items={brokers.content} onEliminar={setBrokerAEliminar} />
          )}
        </div>
      )}

      <ConfirmDeleteDialog
        open={!!contactoAEliminar}
        title="Eliminar consulta"
        message={`¿Seguro que querés eliminar la consulta de "${contactoAEliminar?.nombre} ${contactoAEliminar?.apellido}"?`}
        loading={eliminandoContacto}
        errorMessage={errorContacto?.message}
        onCancel={() => setContactoAEliminar(null)}
        onConfirm={() => {
          if (contactoAEliminar) eliminarContacto(contactoAEliminar.id, { onSuccess: () => setContactoAEliminar(null) })
        }}
      />
      <ConfirmDeleteDialog
        open={!!brokerAEliminar}
        title="Eliminar registro"
        message={`¿Seguro que querés eliminar el registro de "${brokerAEliminar?.nombre}"?`}
        loading={eliminandoBroker}
        errorMessage={errorBroker?.message}
        onCancel={() => setBrokerAEliminar(null)}
        onConfirm={() => {
          if (brokerAEliminar) eliminarBroker(brokerAEliminar.id, { onSuccess: () => setBrokerAEliminar(null) })
        }}
      />
    </div>
  )
}
