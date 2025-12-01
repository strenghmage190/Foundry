export class BeyondersActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["beyonders-actor-sheet"],
      template: `systems/beyonders-system/templates/actor-sheet.html`,
      width: 1000,
      height: 760,
      resizable: true,
    });
  }

  /** Provide data to the template */
  getData(options) {
    const data = super.getData(options);
    // Expose actor id and a minimal agent payload for the React app
    data.beyonders = {
      actorId: this.actor.id,
      name: this.actor.name,
      img: this.actor.img,
    };
    return data;
  }

  /** Once the sheet DOM is available, mount the React app into our root element */
  activateListeners(html) {
    super.activateListeners(html);
    const rootEl = html.find('#beyonders-root')[0];
    if (!rootEl) return;

    // Expose the actor id globally so the React mount can pick it up if needed
    try {
      window.BEYONDERS_CURRENT_ACTOR = this.actor.id;
    } catch (e) {
      // ignore
    }

    const mountReact = async () => {
      if (typeof window.BeyondersRender === 'function') {
        try {
          this._reactRoot = window.BeyondersRender(rootEl);
        } catch (e) {
          console.warn('BeyondersActorSheet: React mount threw', e);
        }
        return;
      }

      // Try to dynamically import the ES bundle then mount (best-effort)
      try {
        await import(`/systems/beyonders-system/beyonders.bundle.es.js`);
        if (typeof window.BeyondersRender === 'function') {
          this._reactRoot = window.BeyondersRender(rootEl);
          return;
        }
      } catch (e) {
        // ignore and fallback to IIFE
      }

      // Load IIFE as last resort
      try {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = '/systems/beyonders-system/beyonders.bundle.iife.js';
          s.onload = () => resolve(true);
          s.onerror = () => reject(new Error('Failed to load IIFE'));
          document.head.appendChild(s);
        });
        if (typeof window.BeyondersRender === 'function') {
          this._reactRoot = window.BeyondersRender(rootEl);
        }
      } catch (e) {
        console.error('BeyondersActorSheet: Could not load bundle to mount React app', e);
      }
    };

    mountReact();
  }

  async close(options) {
    try {
      if (this._reactRoot && typeof this._reactRoot.unmount === 'function') {
        this._reactRoot.unmount();
      }
    } catch (e) {
      // ignore
    }
    return super.close(options);
  }
}
