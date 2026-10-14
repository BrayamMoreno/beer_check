import { useState } from 'react'
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
  onNavigateTab,
}) {
  const [activeSubView, setActiveSubView] = useState('escaner') // 'escaner' | 'catalogo'
  const [resultadoEscaner, setResultadoEscaner] = useState(null) // null | 'coincide' | 'no-coincide' | 'no-verificado'
  const [checklistAbierto, setChecklistAbierto] = useState(false)

  const handleSeleccionarResultado = (res) => {
    setResultadoEscaner(res)
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
        <h1>Verificar</h1>
        <p className="tab-subtitle">Validación del código de la botella con SycTrace</p>
      </div>

      {/* Selector de sub-vista: Escáner externo vs Catálogo y pH */}
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
          {/* Tarjeta del visor de escaneo externo (fiel al croquis) */}
          <div className="scanner-viewfinder-card">
            <div
              className={`scanner-viewfinder external-scanner ${abrioSyctrace ? 'camera-on' : ''}`}
              onClick={onAbrirSyctrace}
              title="Abrir SycTrace para escanear"
            >
              <div className="viewfinder-placeholder">
                <div className="viewfinder-icon-wrap external-pulse">
                  <IconQr className="viewfinder-icon" />
                </div>
                <strong className="viewfinder-title">Apunta al QR</strong>
                <p className="viewfinder-hint">
                  {abrioSyctrace
                    ? '✓ Escáner abierto en SycTrace. Toca para abrir de nuevo si lo necesitas.'
                    : 'Escaneo con la aplicación oficial SycTrace'}
                </p>
              </div>

              <div className="scanner-corner tl" />
              <div className="scanner-corner tr" />
              <div className="scanner-corner bl" />
              <div className="scanner-corner br" />
              <div className="scanner-laser" />
            </div>

            {/* Botón principal de apertura de aplicación externa */}
            <div className="scanner-external-launch-wrap">
              <button
                id="btn-abrir-escaner-externo"
                className={`btn primary btn-launch-external ${volvio ? 'pulse' : ''}`}
                onClick={onAbrirSyctrace}
              >
                <IconExternal className="icon-btn-lead" />
                <span>{abrioSyctrace ? 'Abrir SycTrace de nuevo ↗' : 'Escanear en SycTrace ↗'}</span>
              </button>
              <small className="external-app-notice">
                {abrioSyctrace
                  ? 'Verifica el código en SycTrace y selecciona abajo qué resultado obtuviste.'
                  : `Se abrirá la plataforma oficial (${syctraceUrl}) en una nueva pestaña.`}
              </small>
            </div>
          </div>

          {/* Posibles resultados del croquis */}
          <div className="posibles-resultados-box">
            <div className="section-title-row">
              <h3 className="section-title">Posibles resultados</h3>
              {abrioSyctrace && <span className="badge-select-hint">Selecciona tu resultado</span>}
            </div>

            <p className="results-intro-text">
              ¿Qué indicó la consulta en la aplicación externa?
            </p>

            <div className="results-pills-container">
              {/* Opción 1: Coincide con el lote (Verde) */}
              <div
                id="pill-resultado-coincide"
                className={`result-pill pill-match ${resultadoEscaner === 'coincide' ? 'selected' : ''}`}
                onClick={() => handleSeleccionarResultado('coincide')}
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
                {resultadoEscaner === 'coincide' && <span className="pill-check-badge">✓</span>}
              </div>

              {/* Opción 2: No coincide (Rojo) */}
              <div
                id="pill-resultado-no-coincide"
                className={`result-pill pill-no-match ${resultadoEscaner === 'no-coincide' ? 'selected' : ''}`}
                onClick={() => handleSeleccionarResultado('no-coincide')}
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
                {resultadoEscaner === 'no-coincide' && <span className="pill-check-badge">✓</span>}
              </div>

              {/* Opción 3: No se pudo verificar (Naranja) */}
              <div
                id="pill-resultado-no-verificado"
                className={`result-pill pill-unverified ${resultadoEscaner === 'no-verificado' ? 'selected' : ''}`}
                onClick={() => handleSeleccionarResultado('no-verificado')}
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
                {resultadoEscaner === 'no-verificado' && <span className="pill-check-badge">✓</span>}
              </div>
            </div>

            {/* Mensaje de orientación según el resultado marcado */}
            {resultadoEscaner && (
              <div className={`active-scan-report alert-${resultadoEscaner}`}>
                <strong>
                  {resultadoEscaner === 'coincide' && '✅ Verificación exitosa en SycTrace'}
                  {resultadoEscaner === 'no-coincide' && '🚨 ¡ALERTA! Código no coincide en SycTrace'}
                  {resultadoEscaner === 'no-verificado' && '⚠️ Verificación no confirmada'}
                </strong>
                <p>
                  {resultadoEscaner === 'coincide' &&
                    'El lote y registro sanitario corresponden a los datos de la gobernación. Continúa con la inspección física de la botella.'}
                  {resultadoEscaner === 'no-coincide' &&
                    '¡Cuidado! Este código no pertenece al producto o no está autorizado. NO consumas esta bebida.'}
                  {resultadoEscaner === 'no-verificado' &&
                    'No se pudo confirmar en la base de datos oficial. Es fundamental realizar la inspección visual con linterna a contraluz.'}
                </p>
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
                  Puntos que deben coincidir entre la botella y el resultado de la app externa:
                </p>
                <ul className="etiqueta-list">
                  <li>
                    <span className="chk-icon">🔍</span>
                    <div>
                      <strong>Estampilla departamental</strong>
                      <small>Debe tener holograma reflectivo de seguridad y código nítido.</small>
                    </div>
                  </li>
                  <li>
                    <span className="chk-icon">🔍</span>
                    <div>
                      <strong>Registro Sanitario INVIMA</strong>
                      <small>Debe estar claramente impreso en la etiqueta con su número oficial.</small>
                    </div>
                  </li>
                  <li>
                    <span className="chk-icon">🔍</span>
                    <div>
                      <strong>Calidad de impresión</strong>
                      <small>Las etiquetas originales no tienen tintas borrosas ni pegante casero.</small>
                    </div>
                  </li>
                  <li>
                    <span className="chk-icon">🔍</span>
                    <div>
                      <strong>Leyendas legales obligatorias</strong>
                      <small>Advertencias de salud y grado alcohólico en % vol legibles.</small>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* BOTÓN PARA PASAR AL PASO SIGUIENTE (REQUERIDO) */}
          <div className="step-forward-card">
            <button
              id="btn-siguiente-paso-inspeccion"
              className="btn success btn-next-step"
              onClick={() => onNavigateTab?.('inspeccion')}
            >
              <span>Pasar al siguiente paso: Inspección</span>
              <span className="next-arrow-icon">→</span>
            </button>
            <div className="step-backward-row">
              <button
                className="btn-link-step"
                onClick={() => onNavigateTab?.('inicio')}
              >
                ← Volver al Inicio
              </button>
            </div>
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

              <button id="btn-abrir-syctrace-cat" className="btn primary" onClick={onAbrirSyctrace}>
                {abrioSyctrace ? 'Abrir SycTrace de nuevo ↗' : 'Verificar en SycTrace ↗'}
              </button>
              <button
                id="btn-ya-verifique-cat"
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

      <div className="step-tag-footer">2 · Escáner QR</div>
    </div>
  )
}
