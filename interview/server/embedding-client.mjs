import { apiUrl } from "./config.mjs";

export class EmbeddingClient {
  constructor(config) { this.config = config; }
  get enabled() { return Boolean(this.config.baseUrl && this.config.apiKey && this.config.model); }

  async embed(inputs) {
    if (!this.enabled || !inputs.length) return [];
    const response = await fetch(apiUrl(this.config.baseUrl, "embeddings"), {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.config.apiKey}` },
      body: JSON.stringify({ model: this.config.model, input: inputs }),
    });
    if (!response.ok) throw new Error(`Embedding 服务返回 HTTP ${response.status}`);
    const payload = await response.json();
    return payload.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
  }
}
