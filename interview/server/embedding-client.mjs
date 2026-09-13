import { apiUrl } from "./config.mjs";
import { friendlyNetworkError, httpStatusHint } from "./net.mjs";

export class EmbeddingClient {
  constructor(config) { this.config = config; }
  get enabled() { return Boolean(this.config.baseUrl && this.config.apiKey && this.config.model); }

  async embed(inputs) {
    if (!this.enabled || !inputs.length) return [];
    const url = apiUrl(this.config.baseUrl, "embeddings");
    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
        body: JSON.stringify({ model: this.config.model, input: inputs }),
      });
    } catch (error) {
      throw new Error(friendlyNetworkError(error, { what: "向量服务", url }) ?? error.message);
    }
    if (!response.ok) throw new Error(`Embedding 服务返回 HTTP ${response.status}${httpStatusHint(response.status)}`);
    const payload = await response.json();
    return payload.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
  }
}
