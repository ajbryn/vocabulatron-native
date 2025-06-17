import { apiOptions, apiRequest } from "./utils";

export const api = {
  getHello: async (params) => {
    const options = await apiOptions({
      url: `hello`,
      method: "get",
      params,
    });

    return apiRequest(options);
  },

  getTypes: async () => {
    const options = await apiOptions({
      url: `types`,
      method: "get",
    });

    return apiRequest(options);
  },
};
