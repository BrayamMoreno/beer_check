import { useState } from 'react'
import { IconCheck, IconAlert, IconInfo, IconChevron, IconExternal, IconSearch } from '../icons'
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
  onNavigateTab,
}) {
  const [activeSubView, setActiveSubView] = useState('validacion') // 'validacion' | 'catalogo'
  const [yaValido, setYaValido] = useState(volvio || false)
  const [resultado, setResultado] = useState(null) // null | 'coincide' | 'no-coincide' | 'no-verificado'
  const [checklistAbierto, setChecklistAbierto] = useState(false)

  const handleIrAValidar = () => {
    onAbrirSyctrace()
    // Una vez abierto, sugerimos confirmar
  }

  const handleConfirmarYaValido = () => {
    setYaValido(true)
    if (!resultado) {
      setResultado('coincide') // Por defecto positivo al validar, pero puede cambiarlo
    }
  }

  const licoresFiltrados = licor
    ? []
    : licores.filter((l) => {
        const q = busqueda.trim().toLowerCase()
        return q ? `${l.nombre} ${l.marca}`.toLowerCase().includes(q) : true
      })

  return (
    <div className="tab-pane verificar-pane fade-in">
      <div className="tab-header">
        <h1>Validar botella</h1>
        <p className="tab-subtitle">Paso 2: Consulta el código de estampilla en la página oficial</p>
      </div>

      {/* Selector de sub-vista: Validación externa vs Catálogo y pH */}
      <div className="view-switch-pills">
        <button
          id="btn-subview-validacion"
          className={`view-pill ${activeSubView === 'validacion' ? 'active' : ''}`}
          onClick={() => setActiveSubView('validacion')}
        >
          <IconCheck /> Validación en la página
        </button>
        <button
          id="btn-subview-catalogo"
          className={`view-pill ${activeSubView === 'catalogo' ? 'active' : ''}`}
          onClick={() => setActiveSubView('catalogo')}
        >
          <IconSearch /> Catálogo & Datos pH
        </button>
      </div>

      {activeSubView === 'validacion' && (
        <div className="validacion-section fade-in">
          {/* Tarjeta principal de validación externa (sin lector de QR) */}
          <div className="external-validation-card">
            <div className="validation-card-header">
              <div className="validation-step-badge">Paso 2 del flujo</div>
              <h2 className="validation-card-title">Validación en la página oficial</h2>
              <p className="validation-card-desc">
                Para garantizar la legitimidad del licor, ingresa el código o revisa la estampilla
                directamente en la plataforma oficial del departamento.
              </p>
            </div>

            {/* Acción 1: Ir a validar en la página */}
            <div className="validation-action-block">
              <span className="action-step-num">1</span>
              <div className="action-step-body">
                <strong>Consulta el código de la estampilla</strong>
                <p>Abre la página oficial de verificación en una nueva pestaña:</p>
                <button
                  id="btn-ir-a-validar-pagina"
                  className="btn primary btn-open-external-page"
                  onClick={handleIrAValidar}
                >
                  <IconExternal className="icon-btn-lead" />
                  <span>Ir a validar en la página</span>
                </button>
                <small className="external-url-caption">
                  {syctraceUrl ? `Sitio web oficial: ${syctraceUrl}` : 'syctrace.org'}
                </small>
              </div>
            </div>

            {/* Acción 2: Ya se validó */}
            <div className="validation-action-block">
              <span className="action-step-num">2</span>
              <div className="action-step-body">
                <strong>Confirma la consulta realizada</strong>
                <p>Una vez consultado el código en la página oficial, confirma para continuar:</p>
                <button
                  id="btn-ya-se-valido"
                  className={`btn ${yaValido ? 'success validated-active' : 'secondary btn-pulse-if-opened'}`}
                  onClick={handleConfirmarYaValido}
                >
                  {yaValido ? '✓ Ya se validó en la página' : 'Confirmar: Ya se validó'}
                </button>
                {!abrioSyctrace && !yaValido && (
                  <small className="hint-muted">
                    Tip: Puedes pulsar &quot;Ir a validar en la página&quot; primero o confirmar si ya lo hiciste.
                  </small>
                )}
              </div>
            </div>

            {/* Acción 3: Selección del resultado obtenido en la página */}
            <div className="validation-action-block">
              <span className="action-step-num">3</span>
              <div className="action-step-body">
                <strong>¿Qué resultado arrojó la página?</strong>
                <div className="results-pills-container mt-2">
                  <div
                    id="pill-res-coincide"
                    className={`result-pill pill-match ${resultado === 'coincide' ? 'selected' : ''}`}
                    onClick={() => {
                      setResultado('coincide')
                      setYaValido(true)
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="result-pill-indicator">
                      <IconCheck />
                    </div>
                    <div className="result-pill-content">
                      <strong>Coincide con el lote</strong>
                      <p>Estampilla registrada y autorizada para distribución legal.</p>
                    </div>
                    {resultado === 'coincide' && <span className="pill-check-badge">✓</span>}
                  </div>

                  <div
                    id="pill-res-no-coincide"
                    className={`result-pill pill-no-match ${resultado === 'no-coincide' ? 'selected' : ''}`}
                    onClick={() => {
                      setResultado('no-coincide')
                      setYaValido(true)
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="result-pill-indicator">
                      <IconAlert />
                    </div>
                    <div className="result-pill-content">
                      <strong>No coincide</strong>
                      <p>Inconsistencia detectada o código reportado como adulterado.</p>
                    </div>
                    {resultado === 'no-coincide' && <span className="pill-check-badge">✓</span>}
                  </div>

                  <div
                    id="pill-res-no-verificado"
                    className={`result-pill pill-unverified ${resultado === 'no-verificado' ? 'selected' : ''}`}
                    onClick={() => {
                      setResultado('no-verificado')
                      setYaValido(true)
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="result-pill-indicator">
                      <IconInfo />
                    </div>
                    <div className="result-pill-content">
                      <strong>No se pudo verificar</strong>
                      <p>Código no encontrado en el sistema o registro ilegible.</p>
                    </div>
                    {resultado === 'no-verificado' && <span className="pill-check-badge">✓</span>}
                  </div>
                </div>

                {resultado && (
                  <div className={`active-scan-report alert-${resultado} mt-2`}>
                    <strong>
                      {resultado === 'coincide' && '✅ Verificación legal confirmada'}
                      {resultado === 'no-coincide' && '🚨 ¡ALERTA! Código inconsistente'}
                      {resultado === 'no-verificado' && '⚠️ Estado no confirmado'}
                    </strong>
                    <p>
                      {resultado === 'coincide' &&
                        'El código coincide con los registros departamentales. Continúa con la inspección física.'}
                      {resultado === 'no-coincide' &&
                        'Este código no corresponde al producto. Hay alto riesgo de adulteración. ¡NO lo consumas!'}
                      {resultado === 'no-verificado' &&
                        'No fue posible validar el código. Es indispensable la inspección visual con linterna a contraluz.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Checklist de etiqueta (desplegable) */}
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
                  Puntos que deben coincidir entre la botella física y la página oficial:
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
                      <small>Las etiquetas originales no tienen tintas corridas ni pegamento casero.</small>
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

          {/* BOTÓN PARA PASAR AL PASO SIGUIENTE (REQUERIDO) */}
          <div className="step-forward-card">
            <button
              id="btn-pasar-al-paso-siguiente"
              className="btn success btn-next-step"
              onClick={() => onNavigateTab?.('inspeccion')}
            >
              <span>Pasar al siguiente paso: Inspección de botella</span>
              <span className="next-arrow-icon">→</span>
            </button>
            <div className="step-backward-row">
              <button
                className="btn-link-step"
                onClick={() => onNavigateTab?.('inicio')}
              >
                ← Volver al Paso 1: Inicio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-vista del catálogo y flujo de pH */}
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

              <button id="btn-abrir-syctrace-cat" className="btn primary" onClick={onAbrirSyctrace}>
                {abrioSyctrace ? 'Abrir SycTrace de nuevo ↗' : 'Ir a validar en la página ↗'}
              </button>
              <button
                id="btn-ya-verifique-cat"
                className={`btn success ${volvio ? 'pulse' : ''}`}
                disabled={!abrioSyctrace}
                onClick={onReiniciarPh}
              >
                ✓ Ya se validó mi licor
              </button>
              {!abrioSyctrace && (
                <small className="muted">Primero debes abrir la página para desbloquear los datos de pH.</small>
              )}
            </section>
          )}

          {/* Paso 4: Resultado de pH */}
          {tipo && licor && ph && (
            <section className="fade-in">
              <ResultadoPh ph={ph} />
              <div className="ph-actions-row mt-4">
                <button
                  id="btn-ir-a-inspeccion"
                  className="btn success btn-next-step"
                  onClick={() => onNavigateTab?.('inspeccion')}
                >
                  <span>Pasar al siguiente paso: Inspección</span>
                  <span className="next-arrow-icon">→</span>
                </button>
                <button
                  id="btn-nueva-consulta-cat"
                  className="btn ghost mt-2"
                  onClick={onVolverTipo}
                >
                  Consultar otro licor
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      <div className="step-tag-footer">2 · Validación</div>
    </div>
  )
}
