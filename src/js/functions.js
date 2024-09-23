import { raiseError } from "./domFunctions.js";
const errorMessageBox = document.querySelector(".error-message");
const inputConatainer = document.querySelector(".input-container");
const inputButton = document.querySelector(".input-button");
const simulationContainer = document.querySelector(".simulation-container");
export const validate = (floors, lifts) => {
  errorMessageBox.querySelectorAll("p").forEach((p) => p.remove());
  const validationResult = validateValues(floors, lifts);

  if (validationResult !== "OK") {
    raiseError(validationResult);
    return "NotOK";
  } else return "OK";
};

const validateValues = (floors, lifts) => {
  if (floors == "" || lifts == "") {
    return "Enter non-zero positive integers for both floors and lifts";
  } else if (floors == 1 && lifts > 0) {
    return "What's the need of lift(s) for a single floor?";
  } else if (floors < 0 || lifts < 0) {
    return "Please enter non-zero positive integer only";
  } else if (!/^\d+$/.test(floors) || !/^\d+$/.test(lifts)) {
    return "Enter non-zero positive integers for both floors and lifts";
  } else if (floors == 0 || lifts == 0) {
    return "Enter non-zero positive integers for both floors and lifts";
  }
  return "OK";
};

export const hideInputContainer = () => {
  inputButton.textContent = "Starting...";
  inputConatainer.classList.add("hidden");
};
export const showSimulationContainer = () => {
  simulationContainer.classList.remove("hidden");
};
