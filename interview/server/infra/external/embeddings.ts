import { apiUrl, type ServiceConfig } from "../config/index.ts";
import { friendlyNetworkError, httpStatusHint } from "../network.ts";

export class EmbeddingClient {
  readonly config: ServiceConfig;
  constructor(config: ServiceConfig) { this.config = config; }
  get enabled() { return Boolean(this.config.baseUrl && this.config.apiKey && this.config.model); }

  async embed(inputs: string[]): Promise<number[][]> {
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
      throw new Error(friendlyNetworkError(error, { what: "向量服务", url }) ?? (error as Error).message);
    }
    if (!response.ok) throw new Error(`Embedding 服务返回 HTTP ${response.status}${httpStatusHint(response.status)}`);
    const payload = (await response.json()) as { data: Array<{ index: number; embedding: number[] }> };
    return payload.data.sort((a, b) => a.index - b.index).map((item) => item.embedding);
  }
}
