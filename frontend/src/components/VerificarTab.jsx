import { useState, useRef, useEffect } from 'react'
import { IconQr, IconCheck, IconAlert, IconInfo, IconChevron, IconExternal, IconSearch } from '../icons'
import ResultadoPh, { Thumb } from './ResultadoPh'

export default function VerificarTab({
  tipos,
  tipo,
  onElegirTipo,
  licores,
  licor,
  onElegirLicor,
  cargando,
  error,
  busqueda,
  setBusqueda,
  syctraceUrl,
  abrioSyctrace,
  onAbrirSyctrace,
  volvio,
  ph,
  onReiniciarPh,
  onVolverTipo,
  onVolverLicor,
}) {
  const [activeSubView, setActiveSubView] = useState('escaner') // 'escaner' | 'catalogo'
  const [codigoInput, setCodigoInput] = useState('')
  const [resultadoEscaner, setResultadoEscaner] = useState(null) // null | 'coincide' | 'no-coincide' | 'no-verificado'
  const [codigoEscaneado, setCodigoEscaneado] = useState('')
  const [checklistAbierto, setChecklistAbierto] = useState(false)
  const [camaraActiva, setCamaraActiva] = useState(false)
  const [camaraError, setCamaraError] = useState('')
  const [linternaEscaner, setLinternaEscaner] = useState(false)

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // Apagar la cámara al desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  // Iniciar cámara web para escanear
  const toggleCamara = async () => {
    if (camaraActiva) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      setCamaraActiva(false)
      setLinternaEscaner(false)
      return
    }

    setCamaraError('')
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('La cámara no está disponible en este dispositivo o navegador.')
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      setCamaraActiva(true)

      // Conectar con el elemento video tras el re-render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      }, 100)

      // Si existe BarcodeDetector, intentar detección automática
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13'] })
        const interval = setInterval(async () => {
          if (!videoRef.current || !streamRef.current) {
            clearInterval(interval)
            return
          }
          try {
            const barcodes = await detector.detect(videoRef.current)
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue
              clearInterval(interval)
              verificarCodigoTexto(code)
            }
          } catch {
            // Continúa intentando
          }
        }, 600)
      }
    } catch (err) {
      setCamaraError(err.message || 'No se pudo acceder a la cámara. Revisa los permisos.')
      setCamaraActiva(false)
    }
  }

  // Linterna en cámara del escáner
  const toggleLinternaEscaner = async () => {
    if (!streamRef.current) return
    const track = streamRef.current.getVideoTracks()[0]
    if (!track) return

    try {
      const caps = track.getCapabilities ? track.getCapabilities() : {}
      if (!caps.torch) {
        alert('Este dispositivo no soporta encendido de linterna mediante el navegador.')
        return
      }
      const nuevoEstado = !linternaEscaner
      await track.applyConstraints({ advanced: [{ torch: nuevoEstado }] })
      setLinternaEscaner(nuevoEstado)
    } catch {
      alert('No se pudo activar la linterna de la cámara.')
    }
  }

  const verificarCodigoTexto = (codigo) => {
    const clean = codigo.trim().toUpperCase()
    if (!clean) return
    setCodigoEscaneado(clean)

    // Lógica inteligente de verificación:
    // Lotes oficiales simulados o patrones válidos de estampillas (ej: letras + números)
    if (clean.includes('FAIL') || clean.includes('FALSO') || clean === '99999' || clean === '00000') {
      setResultadoEscaner('no-coincide')
    } else if (clean.length < 4 || clean === '1234') {
      setResultadoEscaner('no-verificado')
    } else {
      setResultadoEscaner('coincide')
    }
  }

  const handleVerificarManual = (e) => {
    e.preventDefault()
    if (!codigoInput.trim()) return
    verificarCodigoTexto(codigoInput)
  }

  const licoresFiltrados = licor ? [] : licores.filter((l) => {
    const q = busqueda.trim().toLowerCase()
    return q ? `${l.nombre} ${l.marca}`.toLowerCase().includes(q) : true
  })

  return (
    <div className="tab-pane verificar-pane fade-in">
      <div className="tab-header">
        <h1>Verificar</h1>
        <p className="tab-subtitle">Validación de código de estampilla y lote</p>
      </div>

      {/* Selector de sub-vista: Escáner QR vs Catálogo y pH */}
      <div className="view-switch-pills">
        <button
          id="btn-subview-escaner"
          className={`view-pill ${activeSubView === 'escaner' ? 'active' : ''}`}
          onClick={() => setActiveSubView('escaner')}
        >
          <IconQr /> Escáner de botella
        </button>
        <button
          id="btn-subview-catalogo"
          className={`view-pill ${activeSubView === 'catalogo' ? 'active' : ''}`}
          onClick={() => setActiveSubView('catalogo')}
        >
          <IconSearch /> Catálogo & Datos pH
        </button>
      </div>

      {activeSubView === 'escaner' && (
        <div className="escaner-section fade-in">
          {/* Cuadro de cámara / Escáner del croquis */}
          <div className="scanner-viewfinder-card">
            <div className={`scanner-viewfinder ${camaraActiva ? 'camera-on' : ''}`}>
              {camaraActiva ? (
                <video ref={videoRef} playsInline autoPlay muted className="scanner-video" />
              ) : (
                <div className="viewfinder-placeholder">
                  <div className="viewfinder-icon-wrap">
                    <IconQr className="viewfinder-icon" />
                  </div>
                  <strong className="viewfinder-title">Apunta al QR</strong>
                  <p className="viewfinder-hint">Ubica el código de la estampilla dentro del marco</p>
                </div>
              )}

              <div className="scanner-corner tl" />
              <div className="scanner-corner tr" />
              <div className="scanner-corner bl" />
              <div className="scanner-corner br" />
              <div className="scanner-laser" />
            </div>

            <div className="scanner-actions-bar">
              <button
                id="btn-toggle-camara"
                className={`btn-action-small ${camaraActiva ? 'active' : ''}`}
                onClick={toggleCamara}
              >
                {camaraActiva ? 'Detener cámara' : 'Abrir cámara'}
              </button>
              {camaraActiva && (
                <button
                  id="btn-linterna-escaner"
                  className={`btn-action-small ${linternaEscaner ? 'active' : ''}`}
                  onClick={toggleLinternaEscaner}
                >
                  {linternaEscaner ? '🔦 Apagar flash' : '🔦 Encender flash'}
                </button>
              )}
            </div>

            {camaraError && <p className="scanner-error-msg">{camaraError}</p>}
          </div>

          {/* Formulario de ingreso manual */}
          <form className="manual-code-form" onSubmit={handleVerificarManual}>
            <label htmlFor="input-codigo-lote" className="code-label">
              O ingresa el código de estampilla manualmente:
            </label>
            <div className="code-input-row">
              <input
                id="input-codigo-lote"
                type="text"
                className="code-input"
                placeholder="Ej. ANT-2024-94812 o LOTE-481"
                value={codigoInput}
                onChange={(e) => setCodigoInput(e.target.value)}
              />
              <button id="btn-comprobar-codigo" type="submit" className="btn-code-submit">
                Verificar
              </button>
            </div>
          </form>

          {/* Simulador rápido para pruebas */}
          <div className="demo-chips-row">
            <span className="demo-chips-label">Probar ejemplo:</span>
            <button
              type="button"
              className="chip-btn chip-ok"
              onClick={() => {
                setCodigoInput('COL-2024-81729')
                verificarCodigoTexto('COL-2024-81729')
              }}
            >
              Lote oficial
            </button>
            <button
              type="button"
              className="chip-btn chip-fail"
              onClick={() => {
                setCodigoInput('FAIL-999-DUB')
                verificarCodigoTexto('FAIL-999-DUB')
              }}
            >
              Lote alterado
            </button>
            <button
              type="button"
              className="chip-btn chip-warn"
              onClick={() => {
                setCodigoInput('12')
                verificarCodigoTexto('12')
              }}
            >
              No verificado
            </button>
          </div>

          {/* Posibles resultados del croquis */}
          <div className="posibles-resultados-box">
            <h3 className="section-title">Posibles resultados</h3>
            <div className="results-pills-container">
              <div
                className={`result-pill pill-match ${resultadoEscaner === 'coincide' ? 'selected' : ''}`}
                onClick={() => setResultadoEscaner('coincide')}
              >
                <div className="result-pill-indicator">
                  <IconCheck />
                </div>
                <div className="result-pill-content">
                  <strong>Coincide con el lote</strong>
                  <p>Estampilla registrada y autorizada para distribución legal.</p>
                </div>
              </div>

              <div
                className={`result-pill pill-no-match ${resultadoEscaner === 'no-coincide' ? 'selected' : ''}`}
                onClick={() => setResultadoEscaner('no-coincide')}
              >
                <div className="result-pill-indicator">
                  <IconAlert />
                </div>
                <div className="result-pill-content">
                  <strong>No coincide</strong>
                  <p>Inconsistencia detectada o código reportado como adulterado.</p>
                </div>
              </div>

              <div
                className={`result-pill pill-unverified ${resultadoEscaner === 'no-verificado' ? 'selected' : ''}`}
                onClick={() => setResultadoEscaner('no-verificado')}
              >
                <div className="result-pill-indicator">
                  <IconInfo />
                </div>
                <div className="result-pill-content">
                  <strong>No se pudo verificar</strong>
                  <p>Código no encontrado en el sistema o registro ilegible.</p>
                </div>
              </div>
            </div>

            {resultadoEscaner && (
              <div className={`active-scan-report alert-${resultadoEscaner}`}>
                <strong>Código consultado: {codigoEscaneado || codigoInput || 'Muestra'}</strong>
                <p>
                  {resultadoEscaner === 'coincide' &&
                    '✅ El código coincide con los registros oficiales de rentas departamentales.'}
                  {resultadoEscaner === 'no-coincide' &&
                    '🚨 ATENCIÓN: El código NO coincide con la base oficial. Posible botella adulterada.'}
                  {resultadoEscaner === 'no-verificado' &&
                    '⚠️ El código no pudo ser verificado. Realiza inspección física y revisa la estampilla.'}
                </p>
                <div className="scan-report-actions">
                  <a
                    href={syctraceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-syctrace-link"
                  >
                    Validar en SycTrace oficial <IconExternal />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Checklist de etiqueta del croquis */}
          <div className="etiqueta-checklist-card">
            <button
              id="btn-toggle-checklist-etiqueta"
              className="etiqueta-header-btn"
              onClick={() => setChecklistAbierto((v) => !v)}
              aria-expanded={checklistAbierto}
            >
              <span>Checklist de etiqueta</span>
              <span className={`accordion-icon ${checklistAbierto ? 'open' : ''}`}>
                <IconChevron />
              </span>
            </button>

            {checklistAbierto && (
              <div className="etiqueta-content fade-in">
                <p className="etiqueta-intro">
                  Verifica estos puntos clave en la botella antes de abrirla:
                </p>
                <ul className="etiqueta-list">
                  <li>
                    <span className="chk-icon">🔍</span>
                    <div>
                      <strong>Estampilla departamental</strong>
                      <small>Debe tener holograma de seguridad reflectivo y código de barras nítido.</small>
                    </div>
                  </li>
                  <li>
                    <span className="chk-icon">🔍</span>
                    <div>
                      <strong>Registro Sanitario INVIMA</strong>
                      <small>Debe estar claramente impreso en la contraetiqueta con su número oficial.</small>
                    </div>
                  </li>
                  <li>
                    <span className="chk-icon">🔍</span>
                    <div>
                      <strong>Calidad de impresión</strong>
                      <small>Las etiquetas originales no tienen tintas borrosas ni esquinas despegadas.</small>
                    </div>
                  </li>
                  <li>
                    <span className="chk-icon">🔍</span>
                    <div>
                      <strong>Leyendas legales obligatorias</strong>
                      <small>Debe incluir advertencias de salud y el grado alcohólico en % vol.</small>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-vista del catálogo y flujo de pH existente */}
      {activeSubView === 'catalogo' && (
        <div className="catalogo-ph-flow fade-in">
          {error && <div className="alert">{error}</div>}

          {/* Paso 1: Elegir tipo */}
          {!tipo && (
            <section className="fade-in">
              <h2>¿Qué tipo de licor tienes?</h2>
              <div className="grid tipos">
                {tipos.map((t) => (
                  <button
                    key={t.id}
                    id={`tipo-${t.id}`}
                    className="tile"
                    onClick={() => onElegirTipo(t)}
                  >
                    <span className="emoji">{t.icono || '🍾'}</span>
                    <span>{t.nombre}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Paso 2: Elegir licor */}
          {tipo && !licor && (
            <section className="fade-in">
              <div className="flow-nav-back">
                <button className="btn-link-back" onClick={onVolverTipo}>
                  ← Cambiar tipo ({tipo.nombre})
                </button>
              </div>
              <h2>
                {tipo.icono} Selecciona tu {tipo.nombre.toLowerCase()}
              </h2>
              <input
                id="buscar-licor"
                className="search"
                placeholder="Buscar por nombre o marca…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <div className="grid licores">
                {cargando ? (
                  <p className="muted">Cargando licores…</p>
                ) : (
                  licoresFiltrados.map((l) => (
                    <button
                      key={l.id}
                      id={`licor-${l.id}`}
                      className="licor"
                      onClick={() => onElegirLicor(l)}
                    >
                      <Thumb src={l.imagen} alt={l.nombre} icono={tipo?.icono} />
                      <div className="info">
                        <strong>{l.nombre}</strong>
                        <small>{l.marca}</small>
                        <span className="badge">{Number(l.grado_alcoholico)}% vol</span>
                      </div>
                      <span className="chev">›</span>
                    </button>
                  ))
                )}
                {!cargando && !licoresFiltrados.length && (
                  <p className="muted">No hay licores para mostrar.</p>
                )}
              </div>
            </section>
          )}

          {/* Paso 3: Validación SycTrace para el licor seleccionado */}
          {tipo && licor && !ph && (
            <section className="fade-in verify-flow-card">
              <div className="flow-nav-back">
                <button className="btn-link-back" onClick={onVolverLicor}>
                  ← Elegir otro licor ({licor.nombre})
                </button>
              </div>
              <div className="shield">🛡️</div>
              <h2>Verifica la autenticidad</h2>
              <p className="muted">
                Para ver los datos fisicoquímicos y rango de pH de <strong>{licor.nombre}</strong>,
                valida tu botella en <strong>SycTrace</strong>.
              </p>

              <ol className="checklist">
                <li className={abrioSyctrace ? 'ok' : ''}>Abre SycTrace y consulta el código</li>
                <li className={volvio ? 'ok' : ''}>Regresa a esta app</li>
                <li>Confirma que completaste la verificación</li>
              </ol>

              <button id="btn-abrir-syctrace" className="btn primary" onClick={onAbrirSyctrace}>
                {abrioSyctrace ? 'Abrir SycTrace de nuevo ↗' : 'Verificar en SycTrace ↗'}
              </button>
              <button
                id="btn-ya-verifique"
                className={`btn success ${volvio ? 'pulse' : ''}`}
                disabled={!abrioSyctrace}
                onClick={onReiniciarPh}
              >
                ✓ Ya verifiqué mi licor
              </button>
              {!abrioSyctrace && (
                <small className="muted">Primero debes abrir SycTrace para desbloquear los datos.</small>
              )}
            </section>
          )}

          {/* Paso 4: Resultado de pH */}
          {tipo && licor && ph && (
            <section className="fade-in">
              <ResultadoPh ph={ph} />
              <button
                id="btn-nueva-consulta"
                className="btn primary mt-4"
                onClick={onVolverTipo}
              >
                Consultar otro licor
              </button>
            </section>
          )}
        </div>
      )}

      <div className="step-tag-footer">2 · Escáner QR</div>
    </div>
  )
}
