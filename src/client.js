/**
 * Global HTMX event handlers
 * Handles all HTMX interactions in the browser
 */

// Handle thought form submission
htmx.on("htmx:afterSwap", (evt) => {
  if (
    evt.detail.target.id === "thoughts-list" &&
    evt.detail.xhr.status === 201
  ) {
    const form = document.getElementById("thought-form");
    if (form) {
      form.reset();
    }
    const errorDiv = document.getElementById("form-error");
    if (errorDiv) {
      errorDiv.innerHTML = "";
    }
  }
});

// Handle form errors
htmx.on("htmx:responseError", (evt) => {
  if (evt.detail.pathInfo.requestPath === "/api/thoughts") {
    const errorDiv = document.getElementById("form-error");
    if (errorDiv) {
      errorDiv.innerHTML = evt.detail.xhr.responseText || "An error occurred";
    }
  }
});
