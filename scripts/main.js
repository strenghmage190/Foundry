// Importações e configurações iniciais
const MODULE_ID = "beyonders";

// Criação da Classe da Janela (Container)
class BeyondersApp extends Application {
  constructor(options = {}) {
    super(options);
    this._reactRoot = null; // Guardará a referência do React
  }

  static get defaultOptions() {
    const base = (typeof game !== 'undefined' && game?.system?.id === 'beyonders') ? `systems/beyonders` : `modules/${MODULE_ID}`;
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "beyonders-app",
      title: "Beyonders Dream",
      template: `${base}/templates/root.html`, // Um HTML quase vazio
      width: 1200,
      height: 800,
      resizable: true,
      classes: ["beyonders-style"], // Para isolar seu CSS
    });
  }

  // A Mágica acontece aqui: Quando o Foundry renderizar a janela
  async activateListeners(html) {
    super.activateListeners(html);
    
    // Procura a DIV onde o React vai morar
    const rootElement = document.getElementById("beyonders-root");

    // Aqui importamos seu código React compilado globalmente ou via módulo ES
    const mountWhenAvailable = async () => {
      if (!rootElement) return;
      // If the global mount function already exists, use it
      if (window.BeyondersRender && typeof window.BeyondersRender === 'function') {
        this._reactRoot = window.BeyondersRender(rootElement);
        return;
      }

      // Otherwise attempt to dynamically import the ES bundle adjacent to this script
      try {
        const script = document.currentScript && document.currentScript.src ? document.currentScript.src : null;
        let base = null;
        if (script) {
          base = script.replace(/scripts\/main\.js$/, '');
        }
        // Try common locations if base not found
        const candidates = [];
        if (base) candidates.push(base + '../beyonders.bundle.es.js', base + '../beyonders.bundle.es.mjs');
        candidates.push(`/systems/beyonders/beyonders.bundle.es.js`, `/modules/${MODULE_ID}/beyonders.bundle.es.js`);

        for (const c of candidates) {
          try {
            // dynamic import may throw; when successful the bundle should expose window.BeyondersRender
            await import(c);
            if (window.BeyondersRender && typeof window.BeyondersRender === 'function') {
              this._reactRoot = window.BeyondersRender(rootElement);
              return;
            }
          } catch (e) {
            // ignore and try next
          }
        }

        // Last resort: create a script tag to load the IIFE bundle
        const iifeCandidates = [];
        if (base) iifeCandidates.push(base + '../beyonders.bundle.iife.js');
        iifeCandidates.push(`/systems/beyonders/beyonders.bundle.iife.js`, `/modules/${MODULE_ID}/beyonders.bundle.iife.js`);

        for (const src of iifeCandidates) {
          try {
            await new Promise((resolve, reject) => {
              const s = document.createElement('script');
              s.src = src;
              s.onload = () => resolve(true);
              s.onerror = () => reject(new Error('failed to load ' + src));
              document.head.appendChild(s);
            });
            if (window.BeyondersRender && typeof window.BeyondersRender === 'function') {
              this._reactRoot = window.BeyondersRender(rootElement);
              return;
            }
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        console.warn('BeyondersApp: failed to dynamically load bundle', e);
      }
      console.error('BeyondersApp: Could not load Beyonders bundle. Make sure the system/module is installed correctly.');
    };

    mountWhenAvailable();
  }

  // Importante: Limpar o React quando fechar a janela para não pesar memória
  async close(options) {
    if (this._reactRoot && typeof this._reactRoot.unmount === 'function') {
      this._reactRoot.unmount(); // Comando para desmontar o React
    }
    return super.close(options);
  }
}

// Botão para abrir
Hooks.on('getSceneControlButtons', (controls) => {
  const btn = {
    name: "beyonders",
    title: "Beyonders",
    icon: "fas fa-dragon",
    layer: "controls",
    tools: [{
      name: "open",
      title: "Abrir App",
      icon: "fas fa-book-open",
      onClick: () => new BeyondersApp().render(true)
    }]
  };

  try {
    if (Array.isArray(controls) && typeof controls.push === 'function') {
      controls.push(btn);
      return;
    }
    // Some Foundry versions or hooks may pass an object; try to find an inner array to push into
    if (controls && typeof controls === 'object') {
      if (Array.isArray(controls.controls)) {
        controls.controls.push(btn);
        return;
      }
      // Fallback: push into the first array-valued property
      for (const key of Object.keys(controls)) {
        if (Array.isArray(controls[key])) {
          controls[key].push(btn);
          return;
        }
      }
    }
    console.warn('Beyonders: unexpected controls shape in getSceneControlButtons', controls);
  } catch (e) {
    console.warn('Beyonders: failed to add scene control button', e);
  }
});

// Auto-open the Application for GMs when the world is ready.
// This is intentionally conservative (GM-only) to avoid opening for players automatically.
Hooks.once('ready', () => {
  try {
    const autoOpen = game.settings?.get ? game.settings.get('beyonders','autoOpen') : true;
    if (autoOpen && game?.user?.isGM) {
      console.log('Beyonders: auto-opening app for GM (setting enabled)');
      new BeyondersApp().render(true);
    }
  } catch (err) {
    console.warn('Beyonders: failed to auto-open app', err);
  }
});
