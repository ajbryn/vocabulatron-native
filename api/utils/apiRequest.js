import axios from "axios";

const axiosInstance = axios.create({
  timeout: 30000,
});

const reportSuccess = (result, url) => {
  const obj = {
    endpoint: url,
    message: "Success",
    error: false,
    data: result?.data,
    statusCode: result?.status,
    response: result,
  };

  if (process.env.NODE_ENV !== "production") {
    console.log("Network Response: ", obj);
  }
};

const reportCancel = (error, url) => {
  const obj = {
    endpoint: url,
    message: "Cancelled",
    error: false,
    data: null,
    statusCode: null,
    response: error,
  };

  if (process.env.NODE_ENV !== "production") {
    console.log("Request Canceled: ", obj);
  }
};

const reportIssue = (error, toastMessage) => {
  if (process.env.NODE_ENV === "development") {
    console.log("Network Error: ", error);
  }

  if (!toastMessage?.hideMessage) {
    // createToast(
    //   (toastMessage?.message ? toastMessage.message + ", " : "") +
    //     error.errorBody,
    //   TOAST_TYPES.ERROR
    // );
    console.error(
      (toastMessage?.message ? toastMessage.message + ", " : "") +
        error.errorBody
    );
  }

  bugsnag.notify(
    new Error("Error Request:  " + JSON.stringify(error, null, 2))
  );
  return error;
};

const handle401 = () => {
  //TODO: wire up toast messages
  //createToast("Session expired. Please log in.", "");
  //   navigate(ROUTES.LOGIN, { screen: SCREENS.LOGIN });
  console.log("401 response");
};

const handleError = (error, req, toastMessage = null) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, request, data } = error.response;

    const errorMessage = data?.errorBody || data?.error?.message;
    if (status === 401) {
      //   if (errorMessage) {
      //     createToast(errorMessage, TOAST_TYPES.ERROR);
      //   }
      handle401();
      return;
    }
    const errorBody =
      (data?.errors && Object.values(data.errors).join(" | ")) ||
      errorMessage ||
      "An error occurred while updating or retrieving data";
    const errorObj = {
      request: request,
      message: errorMessage,
      endpoint: request?.url,
      error: true,
      code: error?.code || "UNKNOWN_ERROR",
      status: status,
      statusCode: status,
      url: req.url,
      data: req.data,
      errorBody: `${status}: ${errorBody}`,
    };
    return reportIssue(errorObj, toastMessage);
  } else if (error.request) {
    return reportIssue(
      {
        error: true,
        statusCode: 418,
        status: 418,
        code: "ECONNABORTED",
        errorBody: "NOT_CONNECTED",
        url: req.url,
        data: req.data,
      },
      toastMessage
    );
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
  } else {
    return reportIssue(
      {
        error: true,
        statusCode: 418,
        status: 418,
        code: "ECONNABORTED",
        errorBody: "Unable to process request",
        url: req.url,
        data: req.data,
      },
      toastMessage
    );
  }
};

export const apiRequest = async (request, toastMessageConfig = null) => {
  if (process.env.NODE_ENV === "development") {
    // const loggedRequest = { ...request, data: JSON.parse(request) };
    // console.log("Requesting...", loggedRequest);
    console.log("Request: ", request);
  }

  try {
    const result = await axiosInstance(request);

    console.log("Response: ", result);
    if (result?.status < 400) {
      if (typeof toastMessageConfig === "string") {
        toastMessageConfig = {
          success: {
            message: toastMessageConfig,
          },
        };
      }
      reportSuccess(result, request.url, toastMessageConfig?.success);
      return result;
    }

    throw result;
  } catch (error) {
    if (axios.isCancel(error)) {
      reportCancel(error, request.url);
      return {
        canceled: true,
        request,
        message: "This request was cancelled",
      };
    }

    return handleError(error, request, toastMessageConfig?.failure);
  }
};
