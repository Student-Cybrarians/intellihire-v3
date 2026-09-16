/**
 * IntelliHire v3 - Next.js Edge SaaS Perimeter Client.
 * Connects Next.js API route handlers to the Python Intelligence Platform.
 */

export interface ServiceHealthStatus {
  service: string;
  version: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime_seconds: number;
  components: Array<{
    name: string;
    status: string;
    latency_ms: number;
  }>;
}

export interface ParseDocumentOptions {
  documentBase64?: string;
  documentText?: string;
  fileName?: string;
  mimeType?: string;
  tenantId: string;
  candidateId?: string;
}

export interface ParsedDocumentResult {
  document_id: string;
  tenant_id: string;
  raw_text: string;
  linearized_text: string;
  blocks: Array<{
    block_type: string;
    content: string;
    page_number: number;
    confidence: number;
  }>;
  validation: {
    is_valid: boolean;
    mime_type: string;
    file_size_bytes: number;
    security_flags: string[];
    errors: string[];
  };
}

export interface ExtractEntitiesResult {
  candidate_id?: string;
  skills: Array<{
    raw_name: string;
    canonical_id: string;
    canonical_name: string;
    category: string;
    domain: string;
    provenance: Array<{
      start_char: number;
      end_char: number;
      matched_text: string;
    }>;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    start_year?: number;
    end_year?: number;
  }>;
  experience: Array<{
    company: string;
    role_title: string;
    start_date?: string;
    end_date?: string;
    duration_months?: number;
  }>;
  total_years_experience: number;
  seniority_estimate: string;
}

export interface HybridSearchOptions {
  query: string;
  tenantId: string;
  topK?: number;
  denseWeight?: number;
  filters?: {
    minYearsExperience?: number;
    requiredSkills?: string[];
    seniorityLevels?: string[];
  };
}

export interface SearchCandidateHit {
  candidate_id: string;
  score: number;
  dense_score: number;
  sparse_score: number;
  name: string;
  target_role: string;
  matched_skills: string[];
  snippet: string;
}

export interface CodeExecutionOptions {
  language: 'python' | 'javascript' | 'typescript' | 'go' | 'cpp';
  sourceCode: string;
  testCases: Array<{
    id: string;
    stdin: string;
    expected_output: string;
    is_hidden?: boolean;
  }>;
  timeoutSeconds?: number;
}

export interface CodeExecutionResult {
  submission_id?: string;
  language: string;
  status: 'accepted' | 'rejected' | 'compilation_error' | 'timeout';
  all_passed: boolean;
  passed_count: number;
  total_test_cases: number;
  score_percentage: number;
  results: Array<{
    test_case_id: string;
    passed: boolean;
    status: string;
    execution_time_ms: number;
  }>;
}

export class IntelligenceClient {
  private baseUrl: string;
  private secretKey: string;

  constructor(
    baseUrl: string = process.env.INTELLIGENCE_SERVICE_URL || 'http://localhost:8000',
    secretKey: string = process.env.INTERNAL_API_SECRET || 'ih_sec_default_internal_service_key_77a92b3c4d5e'
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.secretKey = secretKey;
  }

  private getHeaders(tenantId: string = 'default_tenant'): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'X-Internal-Secret': this.secretKey,
      'X-Tenant-ID': tenantId,
      'X-Service-ID': 'edge-nextjs-perimeter',
    };
  }

  async checkHealth(): Promise<ServiceHealthStatus> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  }

  async parseDocument(opts: ParseDocumentOptions): Promise<ParsedDocumentResult> {
    const res = await fetch(`${this.baseUrl}/api/v1/documents/parse`, {
      method: 'POST',
      headers: this.getHeaders(opts.tenantId),
      body: JSON.stringify({
        document_base64: opts.documentBase64,
        document_text: opts.documentText,
        file_name: opts.fileName,
        mime_type: opts.mimeType,
        tenant_id: opts.tenantId,
        candidate_id: opts.candidateId,
      }),
    });
    if (!res.ok) throw new Error(`Document parsing failed: ${res.statusText}`);
    return res.json();
  }

  async extractEntities(text: string, tenantId: string = 'default_tenant'): Promise<ExtractEntitiesResult> {
    const res = await fetch(`${this.baseUrl}/api/v1/nlp/extract`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({ text, tenant_id: tenantId }),
    });
    if (!res.ok) throw new Error(`Entity extraction failed: ${res.statusText}`);
    return res.json();
  }

  async hybridSearch(opts: HybridSearchOptions): Promise<{ total_hits: number; results: SearchCandidateHit[] }> {
    const res = await fetch(`${this.baseUrl}/api/v1/search/hybrid`, {
      method: 'POST',
      headers: this.getHeaders(opts.tenantId),
      body: JSON.stringify({
        query: opts.query,
        tenant_id: opts.tenantId,
        top_k: opts.topK || 10,
        dense_weight: opts.denseWeight ?? 0.6,
        filters: opts.filters,
      }),
    });
    if (!res.ok) throw new Error(`Hybrid search failed: ${res.statusText}`);
    return res.json();
  }

  async executeCode(opts: CodeExecutionOptions, tenantId: string = 'default_tenant'): Promise<CodeExecutionResult> {
    const res = await fetch(`${this.baseUrl}/api/v1/sandbox/execute`, {
      method: 'POST',
      headers: this.getHeaders(tenantId),
      body: JSON.stringify({
        language: opts.language,
        source_code: opts.sourceCode,
        test_cases: opts.testCases,
        limits: opts.timeoutSeconds ? { timeout_seconds: opts.timeoutSeconds } : undefined,
        tenant_id: tenantId,
      }),
    });
    if (!res.ok) throw new Error(`Code execution failed: ${res.statusText}`);
    return res.json();
  }
}

export const intelligenceClient = new IntelligenceClient();
