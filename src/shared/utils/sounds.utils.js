// Data
import { soundCatalog } from "../data/sounds.data";

/** @type {Map<string, HTMLAudioElement>} */
const audioCache = new Map();

let globalVolume = 1;

/**
 * Normalizes a scalar or list value into an array.
 * @param {string | Array<string> | undefined} value - Input value.
 * @returns {Array<string>} Normalized non-empty array.
 */
const normalizeToArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (value) return [value];
  return [];
};

/**
 * Returns a list of sounds by optional filters.
 * @param {Object} [filters] - Sound filter options.
 * @param {string} [filters.category] - Sound category such as "click", "success", "error", or "notification".
 * @param {string | Array<string>} [filters.sentiment] - Sound sentiment such as "neutral", "positive", "negative", or "informational".
 * @returns {Array} Filtered sound metadata list.
 */
export const getSounds = ({ category, sentiment } = {}) => {
  const sentiments = normalizeToArray(sentiment);

  return soundCatalog.filter((item) => {
    const categoryMatch = category ? item.category === category : true;
    const sentimentMatch = sentiments.length
      ? sentiments.includes(item.sentiment)
      : true;

    return categoryMatch && sentimentMatch;
  });
};

/**
 * Returns a single sound metadata item by id.
 * @param {string} id - Sound id from catalog.
 * @returns {Object | null} Found sound metadata or null.
 */
export const getSoundById = (id) => {
  if (!id) return null;
  return soundCatalog.find((item) => item.id === id) || null;
};

/**
 * Returns random sound metadata from a list.
 * @param {Array} sounds - Candidate sound metadata list.
 * @returns {Object | null} Random sound metadata item or null.
 */
export const getRandomSound = (sounds) => {
  if (!Array.isArray(sounds) || sounds.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * sounds.length);
  return sounds[randomIndex] || null;
};

/**
 * Returns a random sound by filters.
 * @param {Object} [filters] - Sound filter options.
 * @param {string} [filters.category] - Sound category such as "click", "success", "error", or "notification".
 * @param {string | Array<string>} [filters.sentiment] - Sound sentiment such as "neutral", "positive", "negative", or "informational".
 * @returns {Object | null} Random sound metadata item or null.
 */
export const getRandomSoundByFilters = (filters = {}) => {
  const sounds = getSounds(filters);
  return getRandomSound(sounds);
};

/**
 * Preloads a sound into the audio cache for instant playback.
 * @param {string} id - Sound id from catalog.
 * @returns {HTMLAudioElement | null} The preloaded audio element or null.
 */
export const preloadSound = (id) => {
  if (typeof window === "undefined") return null;

  const sound = getSoundById(id);
  if (!sound?.src) return null;

  if (audioCache.has(id)) return audioCache.get(id);

  const audio = new Audio(sound.src);
  audio.preload = "auto";
  audioCache.set(id, audio);
  return audio;
};

/**
 * Preloads all sounds in the catalog into the audio cache.
 * @returns {void}
 */
export const preloadAllSounds = () => {
  soundCatalog.forEach((sound) => preloadSound(sound.id));
};

/**
 * Sets the global default volume for all future sound playback.
 * @param {number} volume - Volume level from 0 to 1.
 * @returns {void}
 */
export const setGlobalVolume = (volume) => {
  globalVolume = Math.min(1, Math.max(0, volume));
};

/**
 * Returns the current global volume level.
 * @returns {number} Volume level from 0 to 1.
 */
export const getGlobalVolume = () => globalVolume;

/**
 * Plays a sound by id. Creates and caches the Audio element on first call.
 * Uses cloneNode for overlapping playback support.
 * @param {string} id - Sound id from catalog.
 * @param {Object} [options] - Playback options.
 * @param {number} [options.volume] - Volume level from 0 to 1. Defaults to global volume.
 * @returns {HTMLAudioElement | null} The audio element being played, or null if not found.
 */
export const playSound = (id, { volume } = {}) => {
  if (typeof window === "undefined") return null;

  const sound = getSoundById(id);
  if (!sound?.src) return null;

  let audio = audioCache.get(id);
  if (!audio) {
    audio = new Audio(sound.src);
    audioCache.set(id, audio);
  }

  const instance = audio.cloneNode();
  instance.volume = Math.min(1, Math.max(0, volume ?? globalVolume));
  instance.play().catch(() => {});
  return instance;
};

/**
 * Plays a random sound matching the given filters.
 * @param {Object} [filters] - Sound filter and playback options.
 * @param {string} [filters.category] - Sound category such as "click", "success", "error", or "notification".
 * @param {string | Array<string>} [filters.sentiment] - Sound sentiment.
 * @param {number} [filters.volume] - Volume level from 0 to 1. Defaults to global volume.
 * @returns {HTMLAudioElement | null} The audio element being played, or null.
 */
export const playRandomSound = ({ category, sentiment, volume } = {}) => {
  const sound = getRandomSoundByFilters({ category, sentiment });
  if (!sound) return null;
  return playSound(sound.id, { volume });
};
