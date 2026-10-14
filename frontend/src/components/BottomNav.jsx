import { TABS } from '../tabs'

export default function BottomNav({ activeTab, onSelectTab }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      <div className="bottom-nav-inner">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id
          const { Icon } = tab
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="nav-icon-wrap">
                <Icon className="nav-icon" />
                {tab.id === 'emergencia' && <span className="nav-pulse-dot" />}
              </div>
              <span className="nav-label">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
