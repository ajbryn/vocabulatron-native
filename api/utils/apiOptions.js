// import { getToken } from "./auth";

export const apiOptions = async ({
  params = {},
  url = "",
  method = "get",
  noToken,
  data,
  etag,
  headers,
  query,
  responseType,
  signal,
} = {}) => {
  // const rootUrl = "http://192.168.1.219/api";
  const rootUrl = process.env.REACT_APP_API_URL || "http://192.168.1.219/api";
  if (!rootUrl) {
    throw new Error(
      "API root URL is not defined. Please set REACT_APP_API_URL in your environment variables."
    );
  }
  if (!url.startsWith("/")) {
    url = `/${url}`;
  }

  const options = {
    method: method.toLowerCase(),
    url: `${rootUrl}${url}`,
    headers: {
      "Content-Type": "application/json",
    },
    query,
    params,
    responseType,
    signal,
  };

  if (etag) {
    options.headers["if-none-match"] = etag;
  }

  if (headers) {
    options.headers = { ...options.headers, ...headers };
  }

  // if (!noToken) {
  //   const userToken = await getToken();
  //   options.headers.Authorization = `Bearer ${userToken}`;
  // }

  switch (options.method) {
    case "post":
    case "patch":
    case "put":
      return {
        ...options,
        data,
      };
    case "delete":
    case "get":
    default:
      return options;
  }
};
