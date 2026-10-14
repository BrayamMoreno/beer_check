import { useState } from 'react'
import { IconPhone, IconAlert, IconCheck } from '../icons'

const SINTOMAS = [
  {
    id: 'vision',
    nombre: 'Visión borrosa o ceguera',
    desc: 'Sensación de "tormenta de nieve", puntos ciegos o pérdida repentina de visión.',
    critico: true,
  },
  {
    id: 'nauseas',
    nombre: 'Náuseas y vómitos repetitivos',
    desc: 'Vómitos incontrolables y sensación de malestar gástrico extremo.',
    critico: true,
  },
  {
    id: 'dolor_ab',
    nombre: 'Dolor abdominal punzante',
    desc: 'Cólicos severos o ardor intenso en el estómago que no ceden.',
    critico: true,
  },
  {
    id: 'cefalea',
    nombre: 'Dolor de cabeza intenso',
    desc: 'Cefalea pulsátil profunda que empeora progresivamente.',
    critico: false,
  },
  {
    id: 'respiracion',
    nombre: 'Dificultad para respirar',
    desc: 'Respiración agitada, superficial o sensación de ahogo.',
    critico: true,
  },
  {
    id: 'confusion',
    nombre: 'Confusión o mareo extremo',
    desc: 'Incapacidad para mantenerse en pie, somnolencia profunda o desorientación.',
    critico: true,
  },
  {
    id: 'convulsiones',
    nombre: 'Convulsiones o pérdida de consciencia',
    desc: 'Espasmos involuntarios o desmayo sin respuesta a estímulos.',
    critico: true,
  },
]

export default function EmergenciaTab() {
  const [sintomasSeleccionados, setSintomasSeleccionados] = useState({})

  const toggleSintoma = (id) => {
    setSintomasSeleccionados((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const numSintomas = Object.values(sintomasSeleccionados).filter(Boolean).length

  return (
    <div className="tab-pane emergencia-pane fade-in">
      <div className="tab-header">
        <h1>Emergencia</h1>
        <p className="tab-subtitle">Línea directa y primeros auxilios ante intoxicación</p>
      </div>

      {/* Botón principal de llamada del croquis */}
      <div className="emergency-call-card">
        <a id="btn-llamar-123" href="tel:123" className="btn-call-emergency">
          <div className="call-icon-wrap">
            <IconPhone />
          </div>
          <div className="call-info">
            <span className="call-title">Llamar al 123</span>
            <small className="call-sub">Línea Única de Seguridad y Emergencias</small>
          </div>
        </a>

        <div className="secondary-lines">
          <a href="tel:106" className="sec-line-btn">
            Línea Salud 106
          </a>
          <a href="tel:125" className="sec-line-btn">
            Ambulancias 125
          </a>
        </div>
      </div>

      {/* Sección Síntomas de alarma del croquis */}
      <div className="sintomas-section">
        <div className="sintomas-header">
          <h3 className="section-title">Síntomas de alarma</h3>
          <span className="sintomas-subtag">Intoxicación por metanol</span>
        </div>

        <p className="sintomas-intro">
          Los síntomas pueden aparecer entre <strong>30 minutos y 24 horas</strong> después de
          ingerir alcohol adulterado:
        </p>

        <div className="sintomas-list">
          {SINTOMAS.map((s) => {
            const isChecked = !!sintomasSeleccionados[s.id]
            return (
              <div
                key={s.id}
                id={`sintoma-${s.id}`}
                className={`sintoma-card ${isChecked ? 'selected' : ''}`}
                onClick={() => toggleSintoma(s.id)}
              >
                <div className="sintoma-check-circle">
                  {isChecked ? <IconCheck /> : <span className="dot-circle" />}
                </div>
                <div className="sintoma-content">
                  <div className="sintoma-name-row">
                    <strong className="sintoma-name">{s.nombre}</strong>
                    {s.critico && <span className="critico-badge">Urgente</span>}
                  </div>
                  <small className="sintoma-desc">{s.desc}</small>
                </div>
              </div>
            )
          })}
        </div>

        {numSintomas > 0 && (
          <div className="sintomas-alert-box alert-critica">
            <IconAlert />
            <div>
              <strong>
                ¡Has marcado {numSintomas} síntoma(s) de intoxicación!
              </strong>
              <p>
                No esperes a que los síntomas empeoren. Dirígete de inmediato al hospital de urgencias
                más cercano. El metanol puede causar ceguera permanente o secuelas fatales si no se
                trata a tiempo.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Protocolo de Primeros Auxilios */}
      <div className="primeros-auxilios-card">
        <h3 className="auxilios-title">¿Qué hacer mientras llega la ayuda?</h3>
        <ul className="auxilios-list">
          <li className="auxilio-prohibido">
            <span className="aux-icon">🚫</span>
            <div>
              <strong>NO induzcas el vómito</strong>
              <small>Puede provocar broncoaspiración o quemaduras adicionales en las vías respiratorias.</small>
            </div>
          </li>
          <li className="auxilio-permitido">
            <span className="aux-icon">🍾</span>
            <div>
              <strong>Guarda la botella y el envase</strong>
              <small>Llévala al hospital; el equipo médico analizará químicamente el tipo de alcohol.</small>
            </div>
          </li>
          <li className="auxilio-permitido">
            <span className="aux-icon">⏱️</span>
            <div>
              <strong>Anota la hora y cantidad consumida</strong>
              <small>Esta información es vital para los toxicólogos calcular la dosis de antídoto.</small>
            </div>
          </li>
          <li className="auxilio-permitido">
            <span className="aux-icon">🛌</span>
            <div>
              <strong>Coloca a la persona de lado</strong>
              <small>Posición lateral de seguridad en caso de vómito espontáneo o pérdida de consciencia.</small>
            </div>
          </li>
        </ul>
      </div>

      <div className="step-tag-footer">4 · Emergencia</div>
    </div>
  )
}
