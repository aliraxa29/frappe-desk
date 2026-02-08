import { defineStore } from "pinia";
import { ref } from "vue";

export const useFreezeStore = defineStore("freeze", () => {
  const isFrozen = ref(false);
  const message = ref("");
  const freezeCount = ref(0);

  function freeze(msg: string = "Loading...") {
    freezeCount.value++;
    isFrozen.value = true;
    message.value = msg;
  }

  function unfreeze() {
    freezeCount.value = Math.max(0, freezeCount.value - 1);
    if (freezeCount.value === 0) {
      isFrozen.value = false;
      message.value = "";
    }
  }

  function reset() {
    freezeCount.value = 0;
    isFrozen.value = false;
    message.value = "";
  }

  return {
    isFrozen,
    message,
    freeze,
    unfreeze,
    reset,
  };
});
