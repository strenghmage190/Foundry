import { SystemActor, SystemItem, BeyondersActorSheet } from './module/documents.mjs';
import {
  HeroDataModel,
  VillainDataModel,
  PawnDataModel,
  WeaponDataModel,
  SpellDataModel
} from './module/data-models.mjs';

// Provide a minimal `process` shim for bundles that reference `process.env`.
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
  window.process = { env: {} };
}

Hooks.once('init', () => {
  console.log('Beyonders System | Initializing');
  // Register our Actor document class so game.actors uses it
  CONFIG.Actor.documentClass = SystemActor;
  // Register our Item document class so game.items uses it
  CONFIG.Item.documentClass = SystemItem;
  // Register simple Data Models for actor/item subtypes
  CONFIG.Actor.dataModels = CONFIG.Actor.dataModels || {
    hero: HeroDataModel,
    villain: VillainDataModel,
    pawn: PawnDataModel
  };
  CONFIG.Item.dataModels = CONFIG.Item.dataModels || {
    weapon: WeaponDataModel,
    spell: SpellDataModel
  };
  // Configure trackable attributes.
  CONFIG.Actor.trackableAttributes = {
    hero: {
      bar: ["system.resources.health", "system.resources.power", "system.goodness"],
      value: ["system.level"]
    },
    pawn: {
      bar: ["system.resources.health", "system.resources.power"],
      value: []
    }
  };
  // Register a system setting to control auto-open behavior
  game.settings.register('beyonders', 'autoOpen', {
    name: 'Beyonders: Auto Open',
    hint: 'Automatically open the Beyonders window for GM users on world load',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });
});

Hooks.once('ready', () => {
  console.log('Beyonders System | Ready');
  try {
    // Register the Actor sheet so users can open Beyonders as a native Actor sheet
    CONFIG.Actor.sheetClasses = CONFIG.Actor.sheetClasses || {};
    ['hero', 'villain', 'pawn'].forEach(type => {
      CONFIG.Actor.sheetClasses[type] = CONFIG.Actor.sheetClasses[type] || {};
      CONFIG.Actor.sheetClasses[type]['beyonders'] = BeyondersActorSheet;
    });
    console.log('Beyonders System | Registered BeyondersActorSheet');
  } catch (e) {
    console.warn('Beyonders System | Failed to register BeyondersActorSheet', e);
  }
});

// Ensure the front-end bundle is available in the page scope. Try ESM import first, then fallback to IIFE script.
Hooks.once('ready', async () => {
  try {
    await import('/systems/beyonders/beyonders.bundle.es.js');
    console.log('Beyonders System | ES bundle imported');
  } catch (esErr) {
    console.warn('Beyonders System | ES bundle import failed, attempting IIFE fallback', esErr);
    try {
      const s = document.createElement('script');
      s.src = '/systems/beyonders/beyonders.bundle.iife.js';
      s.onload = () => console.log('Beyonders System | IIFE bundle loaded');
      s.onerror = (e) => console.warn('Beyonders System | failed to load IIFE bundle', e);
      document.head.appendChild(s);
    } catch (iifeErr) {
      console.error('Beyonders System | failed to load any bundle', iifeErr);
    }
  }
  // If the autoOpen setting is enabled and the current user is a GM, open the app
  try {
    const autoOpen = game.settings.get('beyonders', 'autoOpen');
    if (autoOpen && game.user?.isGM) {
      console.log('Beyonders System | auto-opening for GM per setting');
      // Defer to after a short timeout so UI is ready
      setTimeout(() => {
        try {
          const existing = Object.values(ui.windows).find(w => w.id === 'beyonders-app');
          if (!existing) {
            if (typeof window.BeyondersApp === 'function') new window.BeyondersApp().render(true);
          }
        } catch (err) {
          // fallback: rely on scripts/main.js which will open via its ready hook
        }
      }, 500);
    }
  } catch (err) {
    // ignore if settings not yet registered
  }
});
