import { useEffect, useMemo, useState } from 'react'
import { api } from './api'

const STORAGE_KEY = 'licores-ph-state'
const PASOS = ['Tipo', 'Licor', 'Verificar', 'Datos pH']

const loadState = () => {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}

export default function App() {
  const saved = loadState()
  const [paso, setPaso] = useState(saved.paso ?? 0)
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

  // Persistimos el flujo: al volver de SycTrace (sobre todo en móvil) no se pierde el progreso
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ paso, tipo, licor, abrioSyctrace }))
  }, [paso, tipo, licor, abrioSyctrace])

  useEffect(() => {
    api.config().then((c) => setSyctraceUrl(c.syctrace_url)).catch(() => {})
    api.tipos().then(setTipos).catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    if (!tipo) return
    setCargando(true)
    api.licores(tipo.id).then(setLicores).catch((e) => setError(e.message)).finally(() => setCargando(false))
  }, [tipo])

  // Detecta cuando el usuario regresa a la app tras abrir SycTrace
  useEffect(() => {
    if (paso !== 2 || !abrioSyctrace) return
    const onVisible = () => document.visibilityState === 'visible' && setVolvio(true)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [paso, abrioSyctrace])

  useEffect(() => {
    if (paso !== 3 || !licor) return
    setCargando(true)
    api.ph(licor.id).then(setPh).catch((e) => setError(e.message)).finally(() => setCargando(false))
  }, [paso, licor])

  const licoresFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return q ? licores.filter((l) => `${l.nombre} ${l.marca}`.toLowerCase().includes(q)) : licores
  }, [licores, busqueda])

  const elegirTipo = (t) => { setTipo(t); setLicor(null); setBusqueda(''); setPaso(1) }
  const elegirLicor = (l) => { setLicor(l); setAbrioSyctrace(false); setVolvio(false); setPaso(2) }
  const abrirSyctrace = () => {
    window.open(syctraceUrl, '_blank', 'noopener,noreferrer')
    setAbrioSyctrace(true)
  }
  const reiniciar = () => {
    setPaso(0); setTipo(null); setLicor(null); setPh(null); setAbrioSyctrace(false); setVolvio(false)
  }
  const irA = (i) => { if (i < paso && i < 3) setPaso(i) }

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true"><span /><span /><span /></div>

      <header className="header">
        <img src="/icon-192.png" alt="" className="logo" />
        <div>
          <h1>Licores <span className="grad">pH</span></h1>
          <p className="subtitle">Verifica tu licor y conoce su acidez</p>
        </div>
      </header>

      <nav className="stepper" aria-label="Progreso">
        {PASOS.map((p, i) => (
          <button key={p} id={`paso-${i}`} onClick={() => irA(i)}
            className={`step ${i === paso ? 'active' : ''} ${i < paso ? 'done' : ''}`}
            disabled={i >= paso || paso === 3}>
            <span className="dot">{i < paso ? '✓' : i + 1}</span>
            <span className="label">{p}</span>
          </button>
        ))}
      </nav>

      {error && (
        <div className="alert" role="alert">
          {error} <button className="link" onClick={() => setError('')}>Cerrar</button>
        </div>
      )}

      <main className="card-wrap" key={paso}>
        {paso === 0 && (
          <section className="fade-in">
            <h2>¿Qué tipo de licor tienes?</h2>
            <div className="grid tipos">
              {tipos.map((t) => (
                <button key={t.id} id={`tipo-${t.id}`} className="tile" onClick={() => elegirTipo(t)}>
                  <span className="emoji">{t.icono || '🍾'}</span>
                  <span>{t.nombre}</span>
                </button>
              ))}
              {!tipos.length && !error && <Skeleton n={6} />}
            </div>
          </section>
        )}

        {paso === 1 && (
          <section className="fade-in">
            <h2>{tipo?.icono} Selecciona tu {tipo?.nombre.toLowerCase()}</h2>
            <input id="buscar-licor" className="search" placeholder="Buscar por nombre o marca…"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            <div className="grid licores">
              {cargando ? <Skeleton n={3} /> : licoresFiltrados.map((l) => (
                <button key={l.id} id={`licor-${l.id}`} className="licor" onClick={() => elegirLicor(l)}>
                  <Thumb src={l.imagen} alt={l.nombre} icono={tipo?.icono} />
                  <div className="info">
                    <strong>{l.nombre}</strong>
                    <small>{l.marca}</small>
                    <span className="badge">{Number(l.grado_alcoholico)}% vol</span>
                  </div>
                  <span className="chev">›</span>
                </button>
              ))}
              {!cargando && !licoresFiltrados.length && <p className="muted">No hay licores para mostrar.</p>}
            </div>
            <button className="btn ghost" onClick={() => setPaso(0)}>← Cambiar tipo</button>
          </section>
        )}

        {paso === 2 && licor && (
          <section className="fade-in verify">
            <div className="shield">🛡️</div>
            <h2>Verifica la autenticidad</h2>
            <p className="muted">
              Para ver los datos de pH de <strong>{licor.nombre}</strong>, primero valida tu botella
              en <strong>SycTrace</strong> (escanea o ingresa el código de la estampilla).
            </p>

            <ol className="checklist">
              <li className={abrioSyctrace ? 'ok' : ''}>Abre SycTrace y realiza la validación</li>
              <li className={volvio ? 'ok' : ''}>Regresa a esta app</li>
              <li>Confirma que completaste la verificación</li>
            </ol>

            <button id="btn-abrir-syctrace" className="btn primary" onClick={abrirSyctrace}>
              {abrioSyctrace ? 'Abrir SycTrace de nuevo ↗' : 'Verificar en SycTrace ↗'}
            </button>
            <button id="btn-ya-verifique" className={`btn success ${volvio ? 'pulse' : ''}`}
              disabled={!abrioSyctrace} onClick={() => setPaso(3)}>
              ✓ Ya verifiqué mi licor
            </button>
            {!abrioSyctrace && <small className="muted">Primero debes abrir SycTrace.</small>}
            <button className="btn ghost" onClick={() => setPaso(1)}>← Elegir otro licor</button>
          </section>
        )}

        {paso === 3 && (
          <section className="fade-in">
            {cargando || !ph ? <Skeleton n={2} /> : <ResultadoPh ph={ph} />}
            <button id="btn-nueva-consulta" className="btn primary" onClick={reiniciar}>Nueva consulta</button>
          </section>
        )}
      </main>

      <footer className="footer">
        La verificación se realiza directamente en <a href={syctraceUrl} target="_blank" rel="noreferrer">syctrace.org</a>.
        Valores de pH de referencia.
      </footer>
    </div>
  )
}

function clasificar(v) {
  if (v < 3.5) return { txt: 'Muy ácido', cls: 'acid-strong' }
  if (v < 6.5) return { txt: 'Ácido', cls: 'acid' }
  if (v <= 7.5) return { txt: 'Neutro', cls: 'neutral' }
  return { txt: 'Alcalino', cls: 'alkaline' }
}

function ResultadoPh({ ph }) {
  const min = Number(ph.ph_minimo), max = Number(ph.ph_maximo), prom = Number(ph.ph_promedio)
  const pct = (v) => `${(v / 14) * 100}%`
  const c = clasificar(prom)

  return (
    <div className="resultado">
      <div className="verified-badge">✓ Verificado por el usuario en SycTrace</div>
      <div className="res-head">
        <Thumb big src={ph.imagen} alt={ph.nombre} icono={ph.tipo?.icono} />
        <div>
          <h2>{ph.nombre}</h2>
          <p className="muted">{ph.marca} · {ph.tipo?.nombre} · {Number(ph.grado_alcoholico)}% vol</p>
        </div>
      </div>

      <div className={`ph-hero ${c.cls}`}>
        <span className="ph-label">pH promedio</span>
        <span className="ph-value">{prom.toFixed(2)}</span>
        <span className="ph-class">{c.txt}</span>
      </div>

      <div className="scale" aria-label={`Rango de pH entre ${min} y ${max}`}>
        <div className="scale-bar">
          <div className="range" style={{ left: pct(min), width: `calc(${pct(max)} - ${pct(min)})` }} />
          <div className="marker" style={{ left: pct(prom) }} />
        </div>
        <div className="scale-ticks">{[0, 2, 4, 6, 7, 8, 10, 12, 14].map((t) => <span key={t} style={{ left: pct(t) }}>{t}</span>)}</div>
        <div className="scale-legend"><span>Ácido</span><span>Neutro</span><span>Alcalino</span></div>
      </div>

      <div className="stats">
        <div><small>Mínimo</small><strong>{min.toFixed(2)}</strong></div>
        <div><small>Promedio</small><strong>{prom.toFixed(2)}</strong></div>
        <div><small>Máximo</small><strong>{max.toFixed(2)}</strong></div>
      </div>

      {ph.descripcion && <p className="desc">{ph.descripcion}</p>}
    </div>
  )
}

function Skeleton({ n }) {
  return Array.from({ length: n }, (_, i) => <div key={i} className="skeleton" />)
}

// Muestra la imagen (archivo subido o URL pública); si falla la carga, usa el emoji del tipo
function Thumb({ src, alt, icono, big }) {
  const [fallida, setFallida] = useState(false)
  return (
    <div className={`thumb ${big ? 'big' : ''}`}>
      {src && !fallida
        ? <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFallida(true)} />
        : <span>{icono || '🍾'}</span>}
    </div>
  )
}
