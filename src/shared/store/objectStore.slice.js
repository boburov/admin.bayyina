// Redux Store
import { createSlice } from "@reduxjs/toolkit";

// Data structure example
/*
  links:{
    id: [{...}]
  }
*/

// Initial state - stores different collections of items by category
const initialState = {
  users: { me: {} },
};

export const objectStoreSlice = createSlice({
  initialState,
  name: "objectStore",
  reducers: {
    addEntityToObjectStore: (state, action) => {
      const { collectionName, entityId, entityData } = action.payload;

      const collection = state[collectionName];
      const entityAlreadyExists = collection?.[entityId];

      if (entityAlreadyExists) {
        return console.error(
          `[ObjectStore] Entity already exists in collection "${collectionName}" with ID: ${entityId}`
        );
      }

      collection[entityId] = entityData;
    },

    updateEntityFromObjectStore: (state, action) => {
      const { collectionName, entityId, entityData } = action.payload;

      const collection = state[collectionName];
      const entity = collection?.[entityId];

      if (entity === undefined) {
        console.error(
          `[ObjectStore] Entity does not exist in collection "${collectionName}" with ID: ${entityId}`
        );
        return;
      }

      collection[entityId] = { ...(entity || {}), ...entityData };
    },

    deleteEntityFromObjectStore: (state, action) => {
      const { collectionName, entityId } = action.payload;

      const collection = state[collectionName];
      const entity = collection?.[entityId];

      if (!entity) {
        return console.error(
          `[ObjectStore] Entity does not exist in collection "${collectionName}" with ID: ${entityId}`
        );
      }

      delete collection[entityId];
    },

    // Add item to entity's array (for id: [{...}] structure)
    addItemToEntity: (state, action) => {
      const { collectionName, entityId, item } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ObjectStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      // Initialize entity array if it doesn't exist
      if (!collection[entityId]) {
        collection[entityId] = [];
      }

      if (!Array.isArray(collection[entityId])) {
        console.error(
          `[ObjectStore] Entity "${entityId}" in collection "${collectionName}" is not an array`
        );
        return;
      }

      collection[entityId] = [item, ...collection[entityId]];
      console.log(
        `[ObjectStore] Item added to entity "${entityId}" in collection "${collectionName}"`
      );
    },

    // Update item in entity's array by ID
    updateItemInEntity: (state, action) => {
      const {
        itemId,
        entityId,
        itemData,
        collectionName,
        idField = "_id",
      } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ObjectStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      const entity = collection[entityId];

      if (!entity) {
        console.error(
          `[ObjectStore] Entity "${entityId}" does not exist in collection "${collectionName}"`
        );
        return;
      }

      if (!Array.isArray(entity)) {
        console.error(
          `[ObjectStore] Entity "${entityId}" in collection "${collectionName}" is not an array`
        );
        return;
      }

      const itemIndex = entity.findIndex((item) => item[idField] === itemId);

      if (itemIndex === -1) {
        console.error(
          `[ObjectStore] Item with ${idField}="${itemId}" not found in entity "${entityId}" of collection "${collectionName}"`
        );
        return;
      }

      // Merge existing item with new data
      entity[itemIndex] = {
        ...entity[itemIndex],
        ...itemData,
      };

      console.log(
        `[ObjectStore] Item with ${idField}="${itemId}" updated in entity "${entityId}" of collection "${collectionName}"`
      );
    },

    // Delete item from entity's array by ID
    deleteItemFromEntity: (state, action) => {
      const {
        itemId,
        entityId,
        collectionName,
        idField = "_id",
      } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ObjectStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      const entity = collection[entityId];

      if (!entity) {
        console.error(
          `[ObjectStore] Entity "${entityId}" does not exist in collection "${collectionName}"`
        );
        return;
      }

      if (!Array.isArray(entity)) {
        console.error(
          `[ObjectStore] Entity "${entityId}" in collection "${collectionName}" is not an array`
        );
        return;
      }

      const itemIndex = entity.findIndex((item) => item[idField] === itemId);

      if (itemIndex === -1) {
        console.error(
          `[ObjectStore] Item with ${idField}="${itemId}" not found in entity "${entityId}" of collection "${collectionName}"`
        );
        return;
      }

      entity.splice(itemIndex, 1);
      console.log(
        `[ObjectStore] Item with ${idField}="${itemId}" deleted from entity "${entityId}" in collection "${collectionName}"`
      );
    },

    // Replace entire entity array
    replaceEntityArray: (state, action) => {
      const { collectionName, entityId, items } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ObjectStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!Array.isArray(items)) {
        console.error(
          `[ObjectStore] Items must be an array for entity "${entityId}" in collection "${collectionName}"`
        );
        return;
      }

      collection[entityId] = items;
      console.log(
        `[ObjectStore] Entity "${entityId}" array replaced in collection "${collectionName}" with ${items.length} items`
      );
    },

    // Clear entity array
    clearEntityArray: (state, action) => {
      const { collectionName, entityId } = action.payload;

      const collection = state[collectionName];

      if (!collection) {
        console.error(
          `[ObjectStore] Collection "${collectionName}" does not exist`
        );
        return;
      }

      if (!collection[entityId]) {
        console.error(
          `[ObjectStore] Entity "${entityId}" does not exist in collection "${collectionName}"`
        );
        return;
      }

      collection[entityId] = [];
      console.log(
        `[ObjectStore] Entity "${entityId}" array cleared in collection "${collectionName}"`
      );
    },
  },
});

// Export actions
export const {
  addItemToEntity,
  clearEntityArray,
  replaceEntityArray,
  updateItemInEntity,
  deleteItemFromEntity,
  addEntityToObjectStore,
  updateEntityFromObjectStore,
  deleteEntityFromObjectStore,
} = objectStoreSlice.actions;

// Export reducer
export default objectStoreSlice.reducer;
