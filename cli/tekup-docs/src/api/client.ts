import axios, { AxiosInstance } from 'axios';

export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
}

export class DocsApiClient {
  private client: AxiosInstance;

  constructor(config: ApiConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    });
  }

  async listDocuments(params?: {
    category?: string;
    tags?: string[];
    author?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const response = await this.client.get('/api/trpc/docs.list', {
      params: {
        input: JSON.stringify(params || {}),
      },
    });
    return response.data.result.data;
  }

  async getDocument(id: string) {
    const response = await this.client.get('/api/trpc/docs.get', {
      params: {
        input: JSON.stringify({ id }),
      },
    });
    return response.data.result.data;
  }

  async createDocument(data: {
    path: string;
    title: string;
    content: string;
    category: string;
    tags?: string[];
  }) {
    const response = await this.client.post('/api/trpc/docs.create', {
      input: data,
    });
    return response.data.result.data;
  }

  async updateDocument(data: {
    id: string;
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
  }) {
    const response = await this.client.post('/api/trpc/docs.update', {
      input: data,
    });
    return response.data.result.data;
  }

  async deleteDocument(id: string) {
    const response = await this.client.post('/api/trpc/docs.delete', {
      input: { id },
    });
    return response.data.result.data;
  }

  async getHistory(documentId: string) {
    const response = await this.client.get('/api/trpc/docs.history', {
      params: {
        input: JSON.stringify({ documentId }),
      },
    });
    return response.data.result.data;
  }

  async addComment(data: {
    documentId: string;
    content: string;
    lineNumber?: number;
  }) {
    const response = await this.client.post('/api/trpc/docs.addComment', {
      input: data,
    });
    return response.data.result.data;
  }

  async getComments(documentId: string) {
    const response = await this.client.get('/api/trpc/docs.getComments', {
      params: {
        input: JSON.stringify({ documentId }),
      },
    });
    return response.data.result.data;
  }

  async resolveComment(commentId: string) {
    const response = await this.client.post('/api/trpc/docs.resolveComment', {
      input: { commentId },
    });
    return response.data.result.data;
  }

  async getConflicts() {
    const response = await this.client.get('/api/trpc/docs.getConflicts');
    return response.data.result.data;
  }

  async resolveConflict(data: {
    conflictId: string;
    resolution: 'accept_local' | 'accept_remote' | 'manual';
    mergedContent?: string;
  }) {
    const response = await this.client.post('/api/trpc/docs.resolveConflict', {
      input: data,
    });
    return response.data.result.data;
  }

  async search(params: {
    query?: string;
    category?: string;
    tags?: string[];
    author?: string;
    limit?: number;
    offset?: number;
  }) {
    const response = await this.client.get('/api/trpc/docs.search', {
      params: {
        input: JSON.stringify(params),
      },
    });
    return response.data.result.data;
  }
}

// Create default client instance
export function createClient(): DocsApiClient {
  const baseUrl = process.env.DOCS_API_URL || 'http://localhost:3000';
  const apiKey = process.env.DOCS_API_KEY;

  return new DocsApiClient({ baseUrl, apiKey });
}
