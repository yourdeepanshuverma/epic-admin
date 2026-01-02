export const updateListCache = (api, listEndpoint, updater) => {
  return (args, { dispatch, queryFulfilled }) => {
    const patch = dispatch(
      api.util.updateQueryData(listEndpoint, args, updater),
    );

    return queryFulfilled.catch(patch.undo);
  };
};

export const addItemToCache = (api, listEndpoint) =>
  updateListCache(api, listEndpoint, (draft, newItem) => {
    draft.push(newItem);
  });

export const updateItemInCache = (api, listEndpoint, idKey = "id") =>
  updateListCache(api, listEndpoint, (draft, updatedItem) => {
    const index = draft.findIndex((i) => i[idKey] === updatedItem[idKey]);
    if (index !== -1) draft[index] = updatedItem;
  });

export const removeItemFromCache = (api, listEndpoint, idKey = "id") =>
  updateListCache(api, listEndpoint, (draft, id) => {
    return draft.filter((i) => i[idKey] !== id);
  });
