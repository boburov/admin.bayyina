// React
import { useState } from "react";

/**
 * Hook that manages object state with convenience updaters.
 * @param {Object} [initialState={}] - Initial state object.
 * @returns {{state: Object, setField: Function, setFields: Function, resetState: Function}} State and helpers.
 */
const useObjectState = (initialState = {}) => {
  const savedInitialState = useState(initialState);
  const [state, setState] = useState(initialState);

  /**
   * Updates a single key in state.
   * @param {string} key - Key to update.
   * @param {any} value - Value to set.
   */
  const setField = (key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Updates multiple keys in state.
   * @param {Object} [updates={}] - Key/value map to merge into state.
   */
  const setFields = (updates = {}) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  /**
   * Resets state back to the initial object.
   */
  const resetState = () => setState(savedInitialState);

  return { ...state, state, setField, setFields, resetState };
};

export default useObjectState;
