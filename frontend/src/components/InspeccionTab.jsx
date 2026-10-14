import { useState, useRef, useEffect } from 'react'
import { IconTorch, IconAlert, IconCheck } from '../icons'

export default function InspeccionTab({ onNavigateTab }) {
  const [linternaEncendida, setLinternaEncendida] = useState(false)
  const [modoContraluz, setModoContraluz] = useState(false)
  const [fondoContraluz, setFondoContraluz] = useState('blanco') // 'blanco' | 'negro'
  const [errorTorch, setErrorTorch] = useState('')

  // Checklist de anomalías del croquis
  const [checks, setChecks] = useState({
    turbidez: false,
    particulas: false,
    colorAnormal: false,
    tapaDañada: false,
    fugas: false,
  })

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

  const handleToggleCheck = (key) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const totalAnomalias = Object.values(checks).filter(Boolean).length

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
        <h1>Inspección</h1>
        <p className="tab-subtitle">Prueba física y óptica de la botella</p>
      </div>

      {/* Botón principal del croquis: Encender linterna */}
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

      {/* Instrucción textual del croquis: Contraluz, fondo blanco y negro, agita suave */}
      <div className="inspection-instruction-banner">
        <div className="instruction-badge">Método recomendado</div>
        <p className="instruction-lead">
          <strong>Contraluz, fondo blanco y negro, agita suave.</strong>
        </p>
        <p className="instruction-steps">
          1. Ilumina la botella por detrás.
          <br />
          2. Gírala boca abajo y agita formando un remolino lento.
          <br />
          3. Observa si suben burbujas anómalas o sedimentos.
        </p>
      </div>

      {/* Checklist interactivo del croquis */}
      <div className="checklist-container">
        <h3 className="checklist-title">Señales de alerta a verificar:</h3>

        <label className={`checklist-item ${checks.turbidez ? 'danger-checked' : ''}`}>
          <input
            type="checkbox"
            id="check-turbidez"
            checked={checks.turbidez}
            onChange={() => handleToggleCheck('turbidez')}
          />
          <div className="checklist-item-content">
            <strong>Turbidez</strong>
            <small>El licor no es cristalino; luce opaco, lechoso o sin brillo.</small>
          </div>
        </label>

        <label className={`checklist-item ${checks.particulas ? 'danger-checked' : ''}`}>
          <input
            type="checkbox"
            id="check-particulas"
            checked={checks.particulas}
            onChange={() => handleToggleCheck('particulas')}
          />
          <div className="checklist-item-content">
            <strong>Partículas</strong>
            <small>Se aprecian sedimentos flotando, fibras, pelusas o impurezas al fondo.</small>
          </div>
        </label>

        <label className={`checklist-item ${checks.colorAnormal ? 'danger-checked' : ''}`}>
          <input
            type="checkbox"
            id="check-color-anormal"
            checked={checks.colorAnormal}
            onChange={() => handleToggleCheck('colorAnormal')}
          />
          <div className="checklist-item-content">
            <strong>Color anormal</strong>
            <small>El tono luce amarillento, desteñido o distinto al licor original.</small>
          </div>
        </label>

        <label className={`checklist-item ${checks.tapaDañada ? 'danger-checked' : ''}`}>
          <input
            type="checkbox"
            id="check-tapa-danada"
            checked={checks.tapaDañada}
            onChange={() => handleToggleCheck('tapaDañada')}
          />
          <div className="checklist-item-content">
            <strong>Tapa o precinto forzado</strong>
            <small>El anillo de seguridad gira en falso o tiene rastros de pegamento artesanal.</small>
          </div>
        </label>
      </div>

      {/* Evaluación de riesgo */}
      <div className={`risk-result-card ${totalAnomalias > 0 ? 'risk-danger' : 'risk-clean'}`}>
        {totalAnomalias > 0 ? (
          <>
            <div className="risk-header">
              <span className="risk-badge-danger">
                <IconAlert /> ¡PELIGRO DETECTADO!
              </span>
            </div>
            <p className="risk-msg">
              Has marcado <strong>{totalAnomalias} anomalía(s)</strong> físicas. Hay un alto riesgo de
              que este licor sea adulterado o reembotellado.
            </p>
            <div className="risk-action-note">
              ⛔ <strong>NO lo consumas.</strong> Exige el cambio de la botella y avisa al personal del establecimiento.
            </div>
          </>
        ) : (
          <>
            <div className="risk-header">
              <span className="risk-badge-clean">
                <IconCheck /> Sin anomalías marcadas
              </span>
            </div>
            <p className="risk-msg">
              El aspecto visual preliminar luce adecuado. Recuerda verificar también el código QR de la estampilla.
            </p>
          </>
        )}
      </div>

      {/* Navegación al paso siguiente y anterior */}
      <div className="step-forward-card">
        <button
          id="btn-siguiente-paso-emergencia"
          className="btn danger btn-next-step"
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
            ← Volver al Paso 2: Verificar
          </button>
        </div>
      </div>

      <div className="step-tag-footer">3 · Inspección</div>
    </div>
  )
}
