import { useState, useRef, useEffect } from 'react'
import { IconTorch, IconAlert, IconCheck } from '../icons'

const CRITERIOS_CONFORMIDAD = [
  {
    id: 'cristalino',
    titulo: 'Líquido limpio y cristalino',
    detalle: 'Sin turbidez ni aspecto lechoso u opaco a contraluz.',
    beneficio: 'Cumple: Buena transparencia',
  },
  {
    id: 'sin_particulas',
    titulo: 'Libre de partículas y sedimentos',
    detalle: 'Al agitar suave formando un remolino, no flotan residuos, pelusas ni impurezas.',
    beneficio: 'Cumple: Sin cuerpos extraños',
  },
  {
    id: 'color_normal',
    titulo: 'Color normal y uniforme',
    detalle: 'El tono es característico del licor, sin decoloración ni tintes extraños.',
    beneficio: 'Cumple: Color natural',
  },
  {
    id: 'tapa_sellada',
    titulo: 'Tapa y precinto de fábrica',
    detalle: 'El anillo de seguridad no gira en falso ni presenta rastros de pegante casero.',
    beneficio: 'Cumple: Sello intacto',
  },
  {
    id: 'sin_fugas',
    titulo: 'Sin fugas al voltear',
    detalle: 'Al poner la botella boca abajo no gotea ni filtra líquido por la tapa.',
    beneficio: 'Cumple: Cierre hermético seguro',
  },
]

export default function InspeccionTab({ onNavigateTab }) {
  const [linternaEncendida, setLinternaEncendida] = useState(false)
  const [modoContraluz, setModoContraluz] = useState(false)
  const [fondoContraluz, setFondoContraluz] = useState('blanco') // 'blanco' | 'negro'
  const [errorTorch, setErrorTorch] = useState('')

  // Checklist de cumplimiento positivo ("Cumple / No tiene problemas")
  const [cumplidos, setCumplidos] = useState({
    cristalino: true,
    sin_particulas: true,
    color_normal: true,
    tapa_sellada: true,
    sin_fugas: true,
  })

  // Modo para reportar anomalía si el usuario ve algo extraño
  const [reportaAnomalia, setReportaAnomalia] = useState(false)

  const streamRef = useRef(null)

  useEffect(() => {
    return () => {
      // Apagar linterna al salir
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const toggleLinterna = async () => {
    if (linternaEncendida) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      setLinternaEncendida(false)
      return
    }

    setErrorTorch('')
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Navegador sin soporte de cámara/linterna.')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      })
      streamRef.current = stream
      const track = stream.getVideoTracks()[0]
      const caps = track?.getCapabilities ? track.getCapabilities() : {}

      if (caps.torch) {
        await track.applyConstraints({ advanced: [{ torch: true }] })
        setLinternaEncendida(true)
      } else {
        setLinternaEncendida(false)
        setErrorTorch(
          'Este dispositivo o navegador no permite encender la linterna física directamente. ¡Usa el botón de Pantalla Contraluz a continuación!'
        )
      }
    } catch (err) {
      setLinternaEncendida(false)
      setErrorTorch(
        err.message ||
          'Permiso de cámara requerido para encender la linterna. Puedes usar la Pantalla Contraluz.'
      )
    }
  }

  const handleToggleCriterio = (id) => {
    setCumplidos((prev) => ({ ...prev, [id]: !prev[id] }))
    if (reportaAnomalia) setReportaAnomalia(false)
  }

  const handleMarcarTodos = (valor) => {
    const nuevo = {}
    CRITERIOS_CONFORMIDAD.forEach((c) => {
      nuevo[c.id] = valor
    })
    setCumplidos(nuevo)
    if (valor) setReportaAnomalia(false)
  }

  const totalCriterios = CRITERIOS_CONFORMIDAD.length
  const numCumplidos = Object.values(cumplidos).filter(Boolean).length
  const todosCumplen = numCumplidos === totalCriterios && !reportaAnomalia

  return (
    <div className="tab-pane inspeccion-pane fade-in">
      {/* Visor pantalla completa para contraluz en bares/discotecas */}
      {modoContraluz && (
        <div className={`fullscreen-contraluz contraluz-${fondoContraluz}`}>
          <div className="contraluz-controls">
            <span className="contraluz-label">
              Fondo {fondoContraluz === 'blanco' ? 'Blanco Brillante' : 'Negro Puro'}
            </span>
            <div className="contraluz-buttons-row">
              <button
                className="btn-contraluz-toggle"
                onClick={() => setFondoContraluz((f) => (f === 'blanco' ? 'negro' : 'blanco'))}
              >
                Cambiar a fondo {fondoContraluz === 'blanco' ? 'negro' : 'blanco'}
              </button>
              <button
                className="btn-contraluz-close"
                onClick={() => setModoContraluz(false)}
              >
                ✕ Salir
              </button>
            </div>
          </div>
          <div className="contraluz-guide-overlay">
            <p>Coloca la botella frente a esta pantalla para inspeccionar a contraluz</p>
          </div>
        </div>
      )}

      <div className="tab-header">
        <h1>Inspección de botella</h1>
        <p className="tab-subtitle">Paso 3: Verificación óptica con linterna y contraluz</p>
      </div>

      {/* Botón principal: Encender linterna */}
      <div className="torch-action-card">
        <button
          id="btn-encender-linterna"
          className={`btn-torch-main ${linternaEncendida ? 'torch-active' : ''}`}
          onClick={toggleLinterna}
        >
          <div className="torch-icon-circle">
            <IconTorch className="torch-icon" />
          </div>
          <div className="torch-button-text">
            <strong>{linternaEncendida ? 'Apagar linterna' : 'Encender linterna'}</strong>
            <small>
              {linternaEncendida ? 'Linterna del móvil activa' : 'Usa el flash del celular'}
            </small>
          </div>
        </button>

        {/* Botón de apoyo contraluz de pantalla */}
        <button
          id="btn-modo-contraluz"
          className="btn-contraluz-trigger"
          onClick={() => setModoContraluz(true)}
        >
          <span>💡 Modo Pantalla a Contraluz (Blanco/Negro)</span>
        </button>

        {errorTorch && <div className="alert-inline-notice">{errorTorch}</div>}
      </div>

      {/* Instrucción del método a contraluz */}
      <div className="inspection-instruction-banner">
        <div className="instruction-badge">Técnica de inspección</div>
        <p className="instruction-lead">
          <strong>Contraluz, fondo blanco y negro, agita suave.</strong>
        </p>
        <p className="instruction-steps">
          1. Ilumina la botella por detrás con la linterna o la pantalla.
          <br />
          2. Gírala boca abajo suavemente formando un pequeño remolino.
          <br />
          3. Observa que el líquido esté cristalino y los sellos sin daños.
        </p>
      </div>

      {/* Checklist positivo: "Cumple / No tiene problemas" */}
      <div className="checklist-container">
        <div className="checklist-header-row">
          <div>
            <h3 className="checklist-title">Puntos de inspección visual:</h3>
            <small className="checklist-subhead">
              Marca los criterios que cumple la botella sin problemas:
            </small>
          </div>
          <button
            id="btn-marcar-todos-conforme"
            className="btn-quick-check"
            onClick={() => handleMarcarTodos(!todosCumplen)}
          >
            {todosCumplen ? 'Desmarcar todos' : '✓ Cumple todo'}
          </button>
        </div>

        <div className="criterios-list">
          {CRITERIOS_CONFORMIDAD.map((c) => {
            const isChecked = !!cumplidos[c.id] && !reportaAnomalia
            return (
              <label
                key={c.id}
                id={`check-criterio-${c.id}`}
                className={`checklist-item ${isChecked ? 'item-cumple' : 'item-pendiente'}`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleCriterio(c.id)}
                />
                <div className="checklist-item-content">
                  <div className="criterio-title-row">
                    <strong>{c.titulo}</strong>
                    {isChecked ? (
                      <span className="badge-cumple">Cumple ✓</span>
                    ) : (
                      <span className="badge-pendiente">Pendiente</span>
                    )}
                  </div>
                  <small>{c.detalle}</small>
                </div>
              </label>
            )
          })}
        </div>

        {/* Botón para reportar anomalía si encuentra un defecto */}
        <div className="report-issue-row">
          <button
            id="btn-reportar-anomalia"
            className={`btn-reportar-toggle ${reportaAnomalia ? 'active' : ''}`}
            onClick={() => setReportaAnomalia((v) => !v)}
          >
            {reportaAnomalia
              ? '✕ Quitar reporte de anomalía'
              : '⚠️ ¿Notaste alguna turbidez, partícula o anomalía? Toca aquí'}
          </button>
        </div>
      </div>

      {/* Evaluación de resultado visual */}
      <div
        className={`risk-result-card ${
          reportaAnomalia
            ? 'risk-danger'
            : todosCumplen
            ? 'risk-aprobado'
            : 'risk-parcial'
        }`}
      >
        {reportaAnomalia ? (
          <>
            <div className="risk-header">
              <span className="risk-badge-danger">
                <IconAlert /> ¡ANOMALÍA DETECTADA!
              </span>
            </div>
            <p className="risk-msg">
              Has reportado una anomalía física en la botella (turbidez, partículas o sello forzado).
              Existe un alto riesgo de que este licor haya sido adulterado o reembotellado.
            </p>
            <div className="risk-action-note">
              ⛔ <strong>NO consumas esta bebida.</strong> Solicita el cambio inmediato y avisa a las autoridades.
            </div>
          </>
        ) : todosCumplen ? (
          <>
            <div className="risk-header">
              <span className="risk-badge-aprobado">
                <IconCheck /> Inspección visual superada
              </span>
            </div>
            <div className="drink-safe-banner">
              <strong>🎉 No tiene problemas en la inspección visual: puedes beber con normalidad</strong>
              <p>
                El líquido se encuentra limpio, cristalino, con color homogéneo y la tapa conserva su
                precinto de fábrica.
              </p>
            </div>

            {/* Aviso legal solicitado textualmente */}
            <div className="disclaimer-100-box">
              <span className="disclaimer-100-icon">⚠️</span>
              <div>
                <strong>Aviso importante de seguridad:</strong>
                <p>
                  Este aplicativo no confirma al 100% que sea un alcohol verídico ni sustituye un
                  análisis químico de laboratorio. Consume con precaución y responsabilidad; ante
                  cualquier sabor u olor sospechoso, detén el consumo de inmediato.
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="risk-header">
              <span className="risk-badge-parcial">
                <IconAlert /> Verificación en curso ({numCumplidos}/{totalCriterios} puntos cumplidos)
              </span>
            </div>
            <p className="risk-msg">
              Revisa cada punto a contraluz. Si la botella está en óptimas condiciones, marca los
              criterios faltantes o pulsa <strong>&quot;✓ Cumple todo&quot;</strong>.
            </p>
          </>
        )}
      </div>

      {/* Navegación al paso siguiente y anterior */}
      <div className="step-forward-card">
        <button
          id="btn-siguiente-paso-emergencia"
          className="btn primary btn-next-step"
          onClick={() => onNavigateTab?.('emergencia')}
        >
          <span>Pasar al siguiente paso: Emergencia y síntomas</span>
          <span className="next-arrow-icon">→</span>
        </button>
        <div className="step-backward-row">
          <button
            className="btn-link-step"
            onClick={() => onNavigateTab?.('verificar')}
          >
            ← Volver al Paso 2: Validación
          </button>
        </div>
      </div>

      <div className="step-tag-footer">3 · Inspección</div>
    </div>
  )
}
