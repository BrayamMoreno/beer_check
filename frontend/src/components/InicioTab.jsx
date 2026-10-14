import { useState } from 'react'
import { IconCheck, IconTorch, IconPhone, IconAlert, IconChevron } from '../icons'

const CONSEJOS = [
  'Revisa el sello de la tapa antes de pagar. El anillo de seguridad no debe estar roto.',
  'Coloca la botella a contraluz: si ves sedimentos, turbidez o basuritas, ¡no la consumas!',
  'Desconfía de precios excesivamente bajos en comparación con el mercado formal.',
  'La etiqueta debe tener impresión nítida, sin tintas corridas ni pegamento casero.',
  'Verifica que el código de la estampilla departamental coincida con la botella.',
]

export default function InicioTab({ onNavigateTab }) {
  const [consejoIdx, setConsejoIdx] = useState(0)

  const siguienteConsejo = () => {
    setConsejoIdx((prev) => (prev + 1) % CONSEJOS.length)
  }

  return (
    <div className="tab-pane inicio-pane fade-in">
      <div className="tab-header">
        <h1>Inicio</h1>
        <p className="tab-subtitle">Tu guía para verificar y consumir seguro</p>
      </div>

      {/* Banner de advertencia */}
      <div className="disclaimer-banner" role="alert">
        <span className="disclaimer-icon">
          <IconAlert />
        </span>
        <div className="disclaimer-text">
          <strong>Aviso importante</strong>
          <p>Esta app no garantiza que una bebida sea segura. Verifica siempre antes de ingerir.</p>
        </div>
      </div>

      {/* Botón destacado para comenzar el flujo paso a paso */}
      <div className="start-flow-card">
        <button
          id="btn-iniciar-flujo"
          className="btn primary btn-next-step"
          onClick={() => onNavigateTab('verificar')}
        >
          <span>Iniciar verificación de botella</span>
          <span className="next-arrow-icon">→</span>
        </button>
      </div>

      {/* Botones principales de acceso rápido */}
      <div className="quick-actions-grid">
        <button
          id="btn-inicio-validar-codigo"
          className="action-card action-verificar"
          onClick={() => onNavigateTab('verificar')}
        >
          <div className="action-icon-pill">
            <IconCheck />
          </div>
          <div className="action-info">
            <span className="action-step-badge">Paso 2</span>
            <span className="action-title">Validar en la página</span>
            <small className="action-desc">Consulta el código en la web oficial SycTrace</small>
          </div>
          <span className="action-arrow">
            <IconChevron />
          </span>
        </button>

        <button
          id="btn-inicio-inspeccionar"
          className="action-card action-inspeccionar"
          onClick={() => onNavigateTab('inspeccion')}
        >
          <div className="action-icon-pill">
            <IconTorch />
          </div>
          <div className="action-info">
            <span className="action-step-badge">Paso 3</span>
            <span className="action-title">Inspeccionar</span>
            <small className="action-desc">Usa la linterna y checklist físico</small>
          </div>
          <span className="action-arrow">
            <IconChevron />
          </span>
        </button>

        <button
          id="btn-inicio-emergencia"
          className="action-card action-emergencia"
          onClick={() => onNavigateTab('emergencia')}
        >
          <div className="action-icon-pill">
            <IconPhone />
          </div>
          <div className="action-info">
            <span className="action-step-badge">Paso 4</span>
            <span className="action-title">Emergencia</span>
            <small className="action-desc">Llamar al 123 y síntomas de alarma</small>
          </div>
          <span className="action-arrow">
            <IconChevron />
          </span>
        </button>
      </div>

      {/* Consejo del día */}
      <div className="tip-card">
        <div className="tip-card-header">
          <div className="tip-tag">
            <span className="tip-spark">💡</span>
            <span>Consejo del día</span>
          </div>
          <button
            id="btn-rotar-consejo"
            className="tip-refresh-btn"
            onClick={siguienteConsejo}
            title="Ver otro consejo"
          >
            Siguiente ›
          </button>
        </div>
        <p className="tip-text">{CONSEJOS[consejoIdx]}</p>
        <div className="tip-dots">
          {CONSEJOS.map((_, i) => (
            <span
              key={i}
              className={`tip-dot ${i === consejoIdx ? 'active' : ''}`}
              onClick={() => setConsejoIdx(i)}
            />
          ))}
        </div>
      </div>

      {/* Resumen de la ruta guiada */}
      <div className="flow-card">
        <h3 className="flow-title">Ruta de seguridad recomendada</h3>
        <ol className="flow-steps">
          <li>
            <span className="flow-num">1</span>
            <div>
              <strong>Inicio y advertencias</strong>
              <p>Conoce los puntos básicos antes de descorchar o comprar.</p>
            </div>
          </li>
          <li>
            <span className="flow-num">2</span>
            <div>
              <strong>Validación externa en SycTrace</strong>
              <p>Abre la página oficial, consulta la estampilla y confirma la validación.</p>
            </div>
          </li>
          <li>
            <span className="flow-num">3</span>
            <div>
              <strong>Inspección física a contraluz</strong>
              <p>Activa la linterna y detecta turbidez o partículas extrañas.</p>
            </div>
          </li>
          <li>
            <span className="flow-num">4</span>
            <div>
              <strong>Respuesta inmediata de emergencia</strong>
              <p>Ante cualquier malestar o sospecha, llama al 123 sin demora.</p>
            </div>
          </li>
        </ol>
      </div>

      <div className="step-tag-footer">1 · Inicio</div>
    </div>
  )
}
