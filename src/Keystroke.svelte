<script>
  import { createEventDispatcher } from "svelte";
  import { emptyModel, down, up } from "./pure-functions.js";

  const dispatch = createEventDispatcher();
  let model = emptyModel;

  const keydown = (keydownEvent) => {
    model = down(keydownEvent, model);
    do {
      let event = model.pendingDispatches.pop();
      if (event) dispatch(event.name, event.value);
    } while (model.pendingDispatches.length);
  };

  const keyup = (keyupEvent) => {
    model = up(keyupEvent, model);
  };
</script>

<svelte:body on:keydown={keydown} on:keyup={keyup} />
