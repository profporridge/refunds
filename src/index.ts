import { createMachine, interpret } from "xstate";
import "./styles.css";

document.getElementById("app").innerHTML = `
<h1>XState TypeScript Example</h1>
<div>
  Open the <strong>Console</strong> to view the machine output.
</div>
`;

interface ToggleContext {
  count: number;
}

type ToggleEvent = {
  type: "TOGGLE";
};

// Edit your machine(s) here
const machine = createMachine<ToggleContext, ToggleEvent>({
  id: "machine",
  initial: "inactive",
  context: {
    count: 0
  },
  states: {
    inactive: {
      on: { TOGGLE: "active" }
    },
    active: {
      on: { TOGGLE: "inactive" }
    }
  }
});

// Edit your service(s) here
const service = interpret(machine).onTransition((state) => {
  console.log(state.value);
});

service.start();

service.send("TOGGLE");
service.send("TOGGLE");
