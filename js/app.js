/**
 * NEXUS APPLICATION ROOT
 * Master state coordinator, dynamic theme sync, full-width desktop & mobile navigation
 */
const NexusApp = (() => {
  const ZONES = {
    sos: {
      name: 'RED ZONE',
      badge: 'RED ZONE (112 APEX)',
      color: '#ef4444',
      rgb: '239, 68, 68',
      islandText: 'EMERGENCY DISPATCH LIVE'
    },
    civic: {
      name: 'YELLOW ZONE',
      badge: 'YELLOW ZONE (CIVIC)',
      color: '#f59e0b',
      rgb: '245, 158, 11',
      islandText: 'MUNICIPAL GIS CONNECTED'
    },
    med: {
      name: 'BLUE ZONE',
      badge: 'BLUE ZONE (BIO-TRIAGE)',
      color: '#3b82f6',
      rgb: '59, 130, 246',
      islandText: 'TRIAGE PROTOCOL READY'
    },
    shield: {
      name: 'GREEN ZONE',
      badge: 'GREEN ZONE (CYBER)',
      color: '#10b981',
      rgb: '16, 185, 129',
      islandText: 'SENTINEL ENGINE ACTIVE'
    }
  };

  let activeZone = 'sos';
  let toastTimer = null;

  /* --------------------------------------------------------------------------
     Navigation & Dynamic Theming
     -------------------------------------------------------------------------- */
  const switchTab = (zoneKey) => {
    if (!ZONES[zoneKey]) return;
    activeZone = zoneKey;
    NexusAudio.play('click');

    // 1. Update root attribute for zone styling
    document.body.setAttribute('data-active-zone', zoneKey);

    // 2. Synchronize dynamic CSS variables
    const zone = ZONES[zoneKey];
    document.documentElement.style.setProperty('--accent-color', zone.color);
    document.documentElement.style.setProperty('--accent-rgb', zone.rgb);

    // 3. Update Header & Island Status
    const badge = document.getElementById('activeZoneBadge');
    if (badge) badge.textContent = zone.badge;

    // 4. Update Desktop Tabs
    document.querySelectorAll('.desktop-tab-btn').forEach((btn) => {
      const isTarget = btn.getAttribute('data-zone') === zoneKey;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    // 5. Update Mobile Bottom Nav Buttons
    document.querySelectorAll('.mobile-nav-btn').forEach((btn) => {
      const isTarget = btn.getAttribute('data-zone') === zoneKey;
      btn.classList.toggle('active', isTarget);
      btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    // 6. Toggle Active Tab Pane
    document.querySelectorAll('.tab-pane').forEach((pane) => {
      pane.classList.remove('active');
    });

    const targetPane = document.getElementById(`pane-${zoneKey}`);
    if (targetPane) {
      targetPane.classList.add('active');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* --------------------------------------------------------------------------
     Toast Notifications
     -------------------------------------------------------------------------- */
  const showToast = (message) => {
    clearTimeout(toastTimer);
    const toast = document.getElementById('toastPill');
    const msgEl = document.getElementById('toastMsg');
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.add('show');
    NexusAudio.play('click');

    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };

  /* --------------------------------------------------------------------------
     Simulated AI Processing Engine
     -------------------------------------------------------------------------- */
  const runAiProcessingSequence = (options, onComplete) => {
    const { title, subtitle, steps, duration = 2000 } = options;
    const modal = document.getElementById('processingModal');
    const titleEl = document.getElementById('procTitle');
    const subEl = document.getElementById('procSubtitle');
    const listEl = document.getElementById('procStepList');

    if (!modal) return;

    if (titleEl) titleEl.textContent = title;
    if (subEl) subEl.textContent = subtitle;

    if (listEl) {
      listEl.innerHTML = steps
        .map((step, idx) => `
          <div class="proc-step-item ${idx === 0 ? 'done' : ''}" id="proc-s-${idx}">
            <i class="${idx === 0 ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle'}"></i>
            <span>${step}</span>
          </div>
        `)
        .join('');
    }

    modal.classList.add('active');

    const stepTime = duration / (steps.length + 1);
    steps.forEach((_, idx) => {
      if (idx === 0) return;
      setTimeout(() => {
        const prevEl = document.getElementById(`proc-s-${idx - 1}`);
        const currEl = document.getElementById(`proc-s-${idx}`);
        if (prevEl) {
          prevEl.className = 'proc-step-item done';
          const icon = prevEl.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-circle-check';
        }
        if (currEl) {
          currEl.className = 'proc-step-item done';
          const icon = currEl.querySelector('i');
          if (icon) icon.className = 'fa-solid fa-circle-check';
          NexusAudio.play('holdPulse');
        }
      }, stepTime * idx);
    });

    setTimeout(() => {
      modal.classList.remove('active');
      NexusAudio.play('success');
      if (onComplete) onComplete();
    }, duration);
  };

  /* --------------------------------------------------------------------------
     Status Bar Utilities & Live Clock
     -------------------------------------------------------------------------- */
  const startLiveClock = () => {
    const clock = document.getElementById('liveClock');
    if (!clock) return;

    const update = () => {
      const now = new Date();
      let h = now.getHours();
      let m = now.getMinutes();
      let s = now.getSeconds();
      clock.textContent = `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };
    update();
    setInterval(update, 1000);
  };

  /* --------------------------------------------------------------------------
     Keyboard Shortcuts & System Listeners
     -------------------------------------------------------------------------- */
  const setupKeyboardShortcuts = () => {
    window.addEventListener('keydown', (e) => {
      if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'INPUT') {
        return;
      }
      if (e.key === '1') switchTab('sos');
      else if (e.key === '2') switchTab('civic');
      else if (e.key === '3') switchTab('med');
      else if (e.key === '4') switchTab('shield');
    });
  };

  const setupHeaderControls = () => {
    const soundBtn = document.getElementById('audioToggleBtn');
    const soundIcon = document.getElementById('audioIcon');
    const helpBtn = document.getElementById('infoHelpBtn');

    if (soundBtn && soundIcon) {
      soundBtn.addEventListener('click', () => {
        const enabled = NexusAudio.toggle();
        soundIcon.className = enabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        soundBtn.classList.toggle('active', !enabled);
        showToast(`Audio Synth Feedback: ${enabled ? 'ON' : 'MUTED'}`);
      });
    }

    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        showToast('Nexus Universal Emergency Bridge: Active Mesh Protocol v2.4');
      });
    }

    const shieldInput = document.getElementById('shieldInput');
    if (shieldInput) {
      shieldInput.addEventListener('input', NexusZones.updateShieldCounter);
    }
  };

  /* --------------------------------------------------------------------------
     Bootstrap Initialization
     -------------------------------------------------------------------------- */
  const init = () => {
    startLiveClock();
    setupKeyboardShortcuts();
    setupHeaderControls();
    NexusZones.initSos();
    console.log('Nexus Emergency Universal Bridge initialized in full desktop view mode.');
  };

  return {
    init,
    switchTab,
    showToast,
    runAiProcessingSequence,
    getActiveZone: () => activeZone
  };
})();

// Auto-run once DOM is ready
document.addEventListener('DOMContentLoaded', NexusApp.init);
