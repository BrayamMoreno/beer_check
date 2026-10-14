import { useState } from 'react'

function clasificar(v) {
  if (v < 3.5) return { txt: 'Muy ácido', cls: 'acid-strong' }
  if (v < 6.5) return { txt: 'Ácido', cls: 'acid' }
  if (v <= 7.5) return { txt: 'Neutro', cls: 'neutral' }
  return { txt: 'Alcalino', cls: 'alkaline' }
}

export function Thumb({ src, alt, icono, big }) {
  const [fallida, setFallida] = useState(false)
  return (
    <div className={`thumb ${big ? 'big' : ''}`}>
      {src && !fallida ? (
        <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={() => setFallida(true)} />
      ) : (
        <span>{icono || '🍾'}</span>
      )}
    </div>
  )
}

export default function ResultadoPh({ ph }) {
  const min = Number(ph.ph_minimo)
  const max = Number(ph.ph_maximo)
  const prom = Number(ph.ph_promedio)
  const pct = (v) => `${(v / 14) * 100}%`
  const c = clasificar(prom)

  return (
    <div className="resultado">
      <div className="verified-badge">✓ Verificado por el usuario en SycTrace</div>
      <div className="res-head">
        <Thumb big src={ph.imagen} alt={ph.nombre} icono={ph.tipo?.icono} />
        <div>
          <h2>{ph.nombre}</h2>
          <p className="muted">
            {ph.marca} · {ph.tipo?.nombre} · {Number(ph.grado_alcoholico)}% vol
          </p>
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
        <div className="scale-ticks">
          {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((t) => (
            <span key={t} style={{ left: pct(t) }}>
              {t}
            </span>
          ))}
        </div>
        <div className="scale-legend">
          <span>Ácido</span>
          <span>Neutro</span>
          <span>Alcalino</span>
        </div>
      </div>

      <div className="stats">
        <div>
          <small>Mínimo</small>
          <strong>{min.toFixed(2)}</strong>
        </div>
        <div>
          <small>Promedio</small>
          <strong>{prom.toFixed(2)}</strong>
        </div>
        <div>
          <small>Máximo</small>
          <strong>{max.toFixed(2)}</strong>
        </div>
      </div>

      {ph.descripcion && <p className="desc">{ph.descripcion}</p>}
    </div>
  )
}
