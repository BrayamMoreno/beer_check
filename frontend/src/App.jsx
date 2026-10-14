import { useEffect, useState } from 'react'
import { api } from './api'
import BottomNav from './components/BottomNav'
import { TABS } from './tabs'
import InicioTab from './components/InicioTab'
import VerificarTab from './components/VerificarTab'
import InspeccionTab from './components/InspeccionTab'
import EmergenciaTab from './components/EmergenciaTab'

const STORAGE_KEY = 'licores-app-state'

const loadState = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export default function App() {
  const saved = loadState()
  const [activeTab, setActiveTab] = useState(saved.activeTab ?? 'inicio')
  const [tipo, setTipo] = useState(saved.tipo ?? null)
  const [licor, setLicor] = useState(saved.licor ?? null)
  const [abrioSyctrace, setAbrioSyctrace] = useState(saved.abrioSyctrace ?? false)
  const [volvio, setVolvio] = useState(false)

  const [syctraceUrl, setSyctraceUrl] = useState('https://syctrace.org/')
  const [tipos, setTipos] = useState([])
  const [licores, setLicores] = useState([])
  const [ph, setPh] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Persistir en sessionStorage
  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ activeTab, tipo, licor, abrioSyctrace })
    )
  }, [activeTab, tipo, licor, abrioSyctrace])

  // Carga inicial de tipos y config
  useEffect(() => {
    api.config().then((c) => setSyctraceUrl(c.syctrace_url)).catch(() => {})
    api.tipos().then(setTipos).catch((e) => setError(e.message))
  }, [])

  // Carga de licores al seleccionar tipo
  useEffect(() => {
    if (!tipo) return
    let cancel = false
    api.licores(tipo.id)
      .then((data) => {
        if (!cancel) setLicores(data)
      })
      .catch((e) => {
        if (!cancel) setError(e.message)
      })
      .finally(() => {
        if (!cancel) setCargando(false)
      })
    return () => {
      cancel = true
    }
  }, [tipo])

  // Detecta retorno de SycTrace
  useEffect(() => {
    if (!abrioSyctrace) return
    const onVisible = () => {
      if (document.visibilityState === 'visible') setVolvio(true)
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [abrioSyctrace])

  const handleElegirTipo = (t) => {
    setCargando(true)
    setTipo(t)
    setLicor(null)
    setPh(null)
    setBusqueda('')
  }

  const handleElegirLicor = (l) => {
    setLicor(l)
    setAbrioSyctrace(false)
    setVolvio(false)
  }

  const handleAbrirSyctrace = () => {
    window.open(syctraceUrl, '_blank', 'noopener,noreferrer')
    setAbrioSyctrace(true)
  }

  const handleConsultarPh = () => {
    if (!licor) return
    setCargando(true)
    api.ph(licor.id)
      .then(setPh)
      .catch((e) => setError(e.message))
      .finally(() => setCargando(false))
  }

  const handleVolverTipo = () => {
    setTipo(null)
    setLicor(null)
    setPh(null)
    setLicores([])
    setBusqueda('')
  }

  const handleVolverLicor = () => {
    setLicor(null)
    setPh(null)
    setAbrioSyctrace(false)
    setVolvio(false)
  }

  const currentTabObj = TABS.find((t) => t.id === activeTab) || TABS[0]

  return (
    <div className="app-container">
      {/* Fondo dinámico moderno con orbes de luz */}
      <div className="bg-orbs" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {/* Header superior móvil */}
      <header className="app-topbar">
        <div className="brand-group" onClick={() => setActiveTab('inicio')}>
          <div className="brand-logo-pill">
            <img src="/icon-192.png" alt="" className="brand-icon" />
          </div>
          <div className="brand-titles">
            <span className="brand-name">
              Beer<span className="grad">Check</span>
            </span>
            <small className="brand-step-indicator">{currentTabObj.subLabel}</small>
          </div>
        </div>

        {/* Indicador de pestaña rápida */}
        <div className="topbar-status-badge">
          <span className="live-dot" />
          <span>Verificación activa</span>
        </div>
      </header>

      {/* Mensaje global de error si ocurre */}
      {error && (
        <div className="alert global-alert" role="alert">
          <span>{error}</span>
          <button className="link" onClick={() => setError('')}>
            Cerrar
          </button>
        </div>
      )}

      {/* Contenido principal de la pestaña activa */}
      <main className="app-main-content">
        {activeTab === 'inicio' && <InicioTab onNavigateTab={setActiveTab} />}

        {activeTab === 'verificar' && (
          <VerificarTab
            tipos={tipos}
            tipo={tipo}
            onElegirTipo={handleElegirTipo}
            licores={licores}
            licor={licor}
            onElegirLicor={handleElegirLicor}
            cargando={cargando}
            error={error}
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            syctraceUrl={syctraceUrl}
            abrioSyctrace={abrioSyctrace}
            onAbrirSyctrace={handleAbrirSyctrace}
            volvio={volvio}
            ph={ph}
            onReiniciarPh={handleConsultarPh}
            onVolverTipo={handleVolverTipo}
            onVolverLicor={handleVolverLicor}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'inspeccion' && <InspeccionTab onNavigateTab={setActiveTab} />}

        {activeTab === 'emergencia' && <EmergenciaTab onNavigateTab={setActiveTab} />}
      </main>

      {/* Barra de navegación inferior persistente (Croquis) */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  )
}
