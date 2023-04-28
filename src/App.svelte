<script lang="ts">
  import spinner from "./assets/spinner.svg";
  import { initializeApp } from "firebase/app";
  import {
    connectFunctionsEmulator,
    getFunctions,
    httpsCallable,
  } from "firebase/functions";
  import { Response, type ResponseType } from "./schema";
  import Answer from "./lib/Answer.svelte";

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_apiKey,
    authDomain: import.meta.env.VITE_authDomain,
    projectId: import.meta.env.VITE_projectId,
  };

  const app = initializeApp(firebaseConfig);
  const functions = getFunctions(app);
  const sendFunc = httpsCallable(functions, "send");

  console.log(import.meta.env.MODE);
  if (import.meta.env.MODE === "development") {
    connectFunctionsEmulator(functions, "localhost", 5001);
  }

  const send = async () => {
    parsed = null;
    loading = true;
    try {
      const result = await sendFunc(text);
      parsed = Response.parse(result.data);
    } catch {
      errorMessage = "エラーが発生しました";
    } finally {
      loading = false;
    }
  };

  let parsed: ResponseType | null = null;
  let text =
    "日本におけるアートのビジネス活用の状況について、日本語で回答してください。";
  let loading = false;
  let errorMessage = "";
</script>

<main>
  <div class="input">
    <textarea bind:value={text} />

    <button on:click={send}>送信</button>
  </div>

  {#if loading}
    <p class="spinner"><img src={spinner} alt="spinner" />loading...</p>
  {/if}

  {#if errorMessage}
    <p class="error"><strong>{errorMessage}</strong></p>
  {/if}

  {#if parsed}
    <Answer response={parsed} />
  {:else if !loading}
    <p>質問を送信してください</p>
  {/if}
</main>

<style>
  textarea {
    width: 30rem;
    height: 20rem;
    padding: 0.5rem;
  }

  .input {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .spinner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .error {
    color: red;
    font-weight: bold;
  }
</style>
