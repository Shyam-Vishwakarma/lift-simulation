"use-strict";
import { validate } from "./functions.js";
const floorInput = document.querySelector(".floors");
const liftInput = document.querySelector(".lifts");
const inputBtn = document.querySelector(".input-button");

const handleSubmit = () => {
  const lifts = liftInput.value;
  const floors = floorInput.value;
  // validate entered values
  const validationResult = validate(floors, lifts);

  if (validationResult !== "OK") {
    return;
  }

  // hide input container

  // show simulation window
  // render floors and lifts
};
inputBtn.addEventListener("click", handleSubmit);
