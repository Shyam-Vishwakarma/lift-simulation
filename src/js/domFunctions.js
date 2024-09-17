const errorMessageBox = document.querySelector(".error-message");

export const raiseError = (errorMessage) => {
  const errorHtml = `<p>${errorMessage}</p>`;
  errorMessageBox.insertAdjacentHTML("beforeend", errorHtml);
};
