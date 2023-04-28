<script lang="ts">
  import type { ResponseType } from "../schema";

  export let response: ResponseType;

  function getFilename(path: string) {
    return path.split("/").pop();
  }

  function getURL(path: string) {
    const filename = getFilename(path);
    return `https://www.meti.go.jp/shingikai/mono_info_service/art_economic/pdf/${filename}`;
  }

  function format(content: string) {
    return content.replace(/\n/g, "").replace(/•/g, "\n•");
  }

  function sortDocuments(
    documents: ResponseType["sourceDocuments"]
  ): ResponseType["sourceDocuments"] {
    const map = documents.reduce(
      (m, b) =>
        m.set(b.metadata.source, m.get(b.metadata.source)?.concat(b) ?? [b]),
      new Map<string, ResponseType["sourceDocuments"]>()
    );
    return [...map]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .flatMap(([_, v]) =>
        v.sort((a, b) => a.metadata.loc.pageNumber - b.metadata.loc.pageNumber)
      );
  }

  $: sourceDocuments = sortDocuments(response.sourceDocuments);
</script>

<div class="answer">
  <p class="text">{response.text}</p>
  {#each sourceDocuments as sourceDocument}
    <hr />
    <div>
      <p class="page-content">{format(sourceDocument.pageContent)}</p>
      <p>
        出典: <a href={getURL(sourceDocument.metadata.source)} target="_blank"
          >{getFilename(sourceDocument.metadata.source)}</a
        >
        {sourceDocument.metadata.loc.pageNumber}ページ
      </p>
    </div>
  {/each}
</div>

<style>
  p {
    padding: 0.5rem;
    line-height: 1.75;
  }
  .answer {
    max-width: 800px;
    margin: 0 auto;
  }
  .text {
    border: 1px solid black;
  }
  .page-content {
    white-space: pre-wrap;
  }
</style>
