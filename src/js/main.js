"use-strict";
import { hideInputContainer, validate } from "./functions.js";
const floorInput = document.querySelector(".floors");
const liftInput = document.querySelector(".lifts");
const inputBtn = document.querySelector(".input-button");
import { initSimulation } from "./simulationLogics.js";

const handleSubmit = () => {
  const lifts = parseInt(liftInput.value);
  const floors = parseInt(floorInput.value);
  // validate entered values
  const validationResult = validate(floors, lifts);

  if (validationResult !== "OK") {
    return;
  }

  // hide input container
  hideInputContainer();
  // show simulation window
  // showSimulationContainer();
  initSimulation(floors, lifts);
};
inputBtn.addEventListener("click", handleSubmit);
