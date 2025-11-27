/**
 * Utilities for handling special serialization cases (e.g., Infinity values)
 * in Beyonders character data
 */

/**
 * Replacer for JSON.stringify that converts Infinity to a special marker string
 * This is needed because JSON.stringify(Infinity) produces null, which we don't want
 */
export function beyondersReplacer(key: string, value: any): any {
  if (value === Infinity) {
    return "∞_INFINITY";
  }
  return value;
}

/**
 * Reviver for JSON.parse that converts the special marker string back to Infinity
 * This is used when loading agent data from the database
 */
export function beyondersReviver(key: string, value: any): any {
  if (value === "∞_INFINITY") {
    return Infinity;
  }
  return value;
}

/**
 * Recursively revives an object by converting all "∞_INFINITY" markers back to Infinity
 * Used when loading data from Supabase since Supabase returns already-parsed objects
 */
export function reviveInfinityInObject(obj: any): any {
  if (obj === null || typeof obj !== "object") {
    if (obj === "∞_INFINITY") {
      return Infinity;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => reviveInfinityInObject(item));
  }

  const revived: any = {};
  for (const [key, value] of Object.entries(obj)) {
    revived[key] = reviveInfinityInObject(value);
  }
  return revived;
}
