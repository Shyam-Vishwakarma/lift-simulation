function initializeState(floors, lifts) {
  return {
    floors,
    lifts,
    liftStates: Array(lifts)
      .fill()
      .map(() => ({
        currentFloor: 1,
        status: "idle",
        destination: null,
        direction: null,
      })),
    floorCalls: Array(floors + 1)
      .fill()
      .map(() => ({ up: false, down: false })),
    pendingCalls: [],
    activeCallsPerFloor: Array(floors + 1).fill(0),
  };
}

function renderSimulation(state) {
  const container = document.querySelector(".simulation-container");
  container.innerHTML = "";

  for (let i = 1; i <= state.floors; i++) {
    const floor = document.createElement("div");
    floor.className = "floor";
    floor.innerHTML = `
            <div class="floor-buttons" data-floor="${i}">
                ${
                  i < state.floors
                    ? `<button class="up-button" data-floor="${i}">Up</button>`
                    : ""
                }
                ${
                  i > 1
                    ? `<button class="down-button" data-floor="${i}">Down</button>`
                    : ""
                }
            </div>
            <div class="floor-number">Floor ${i}</div>
        `;

    for (let j = 0; j < state.lifts; j++) {
      const liftShaft = document.createElement("div");
      liftShaft.className = "lift-shaft";
      if (i === 1) {
        const lift = document.createElement("div");
        lift.className = "lift";
        lift.id = `lift-${j + 1}`;
        lift.style.bottom = "0px";
        lift.innerHTML = `
                    <div class="lift-number">${j + 1}</div>
                    <div class="lift-door left"></div>
                    <div class="lift-door right"></div>
                `;
        liftShaft.appendChild(lift);
      }
      floor.appendChild(liftShaft);
    }

    container.appendChild(floor);
  }
}

function attachEventListeners(state, callLift) {
  document.querySelectorAll(".up-button, .down-button").forEach((button) => {
    const handleEvent = (e) => {
      e.preventDefault(); // Prevent default touch behavior
      const floor = parseInt(e.target.dataset.floor);
      const direction = e.target.classList.contains("up-button")
        ? "up"
        : "down";
      callLift(state, floor, direction);
    };

    button.addEventListener("click", handleEvent);
    button.addEventListener("touchstart", handleEvent);
  });
}

function findNearestIdleLift(state, floor) {
  let nearestLift = -1;
  let minDistance = Infinity;

  for (let i = 0; i < state.lifts; i++) {
    if (state.liftStates[i].status === "idle") {
      const distance = Math.abs(state.liftStates[i].currentFloor - floor);
      if (distance < minDistance) {
        minDistance = distance;
        nearestLift = i;
      }
    }
  }

  return nearestLift;
}

async function openCloseDoors(lift) {
  const leftDoor = lift.querySelector(".lift-door.left");
  const rightDoor = lift.querySelector(".lift-door.right");
  const liftNumber = lift.querySelector(".lift-number");
  const liftNumberZIndexOld = liftNumber.style.zIndex;

  // Open doors - quick start, slow finish
  leftDoor.style.transition = "transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
  rightDoor.style.transition =
    "transform 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)";
  leftDoor.classList.add("open");
  rightDoor.classList.add("open");

  // Add simple colored background
  const background = document.createElement("div");
  background.className = "lift-background";
  lift.appendChild(background);
  liftNumber.style.zIndex = 0;

  // Show the background
  setTimeout(() => {
    background.style.opacity = 1;
  }, 100);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Close doors - slow start, quick finish
  leftDoor.style.transition = "transform 2.5s cubic-bezier(0.75, 0, 0.75, 0.9)";
  rightDoor.style.transition =
    "transform 2.5s cubic-bezier(0.75, 0, 0.75, 0.9)";
  leftDoor.classList.remove("open");
  rightDoor.classList.remove("open");

  // Hide the background after doors start closing
  setTimeout(() => {
    background.style.opacity = 0;
  }, 2400);

  await new Promise((resolve) => setTimeout(resolve, 2500));

  liftNumber.style.zIndex = liftNumberZIndexOld;
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Remove the background after doors are fully closed
  lift.removeChild(background);
}

function callLift(state, floor, direction) {
  const button = document.querySelector(
    `.floor-buttons[data-floor="${floor}"] .${direction}-button`
  );

  // Always add the call to pendingCalls
  if (
    !state.pendingCalls.some(
      (call) => call.floor === floor && call.direction === direction
    )
  ) {
    state.pendingCalls.push({ floor, direction });

    if (button) {
      button.classList.add("pressed");
      button.disabled = true;
    }
  }

  processNextCall(state);
}

function processNextCall(state) {
  if (state.pendingCalls.length === 0) return;

  const availableLift = findAvailableLift(state);
  if (availableLift !== -1) {
    const nextCall = state.pendingCalls.shift();
    assignLiftToCall(state, availableLift, nextCall.floor, nextCall.direction);
  }
}

function findAvailableLift(state) {
  return state.liftStates.findIndex((lift) => lift.status === "idle");
}

function assignLiftToCall(state, liftIndex, floor, direction) {
  const liftState = state.liftStates[liftIndex];
  liftState.destination = floor;
  liftState.direction = direction;
  liftState.status = "moving";
  moveLift(state, liftIndex, floor);
}

async function moveLift(state, liftIndex, targetFloor) {
  const lift = document.getElementById(`lift-${liftIndex + 1}`);
  const liftState = state.liftStates[liftIndex];

  const floorsToMove = Math.abs(targetFloor - liftState.currentFloor);
  const moveTime = floorsToMove * 2000; // 2 seconds per floor

  const floorHeight = document.querySelector(".floor").offsetHeight;
  const newPosition = (targetFloor - 1) * floorHeight;

  lift.style.transition = `bottom ${moveTime}ms cubic-bezier(0.42, 0, 0.58, 1)`;
  lift.style.bottom = `${newPosition}px`;

  await new Promise((resolve) => setTimeout(resolve, moveTime));

  liftState.currentFloor = targetFloor;
  await openCloseDoors(lift);

  // Reset lift state
  liftState.status = "idle";
  liftState.destination = null;
  liftState.direction = null;

  // Reset buttons for both directions
  resetButtons(targetFloor, "up");
  resetButtons(targetFloor, "down");

  // Process next call
  processNextCall(state);
}

function resetButtons(floor, direction) {
  const button = document.querySelector(
    `.floor-buttons[data-floor="${floor}"] .${direction}-button`
  );
  if (button) {
    button.classList.remove("pressed");
    button.disabled = false;
  }
}

export const initSimulation = (floors, lifts) => {
  const state = initializeState(floors, lifts);
  renderSimulation(state);
  attachEventListeners(state, callLift);
};
