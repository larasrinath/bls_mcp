import axios, { AxiosInstance, AxiosError } from "axios";

const BASE_URL = "https://api.bls.gov/publicAPI/v2";

export class BlsApiError extends Error {
  statusCode?: number;
  isRateLimit: boolean;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "BlsApiError";
    this.statusCode = statusCode;
    this.isRateLimit = statusCode === 429;
  }
}

export interface SeriesDataParams {
  seriesid: string[];
  startyear?: string;
  endyear?: string;
  catalog?: boolean;
  calculations?: boolean;
  annualaverage?: boolean;
  aspects?: boolean;
  registrationkey?: string;
}

export class Client {
  private http: AxiosInstance;
  private registrationKey?: string;

  constructor(registrationKey?: string) {
    this.registrationKey = registrationKey;
    this.http = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        Accept: "application/json",
      },
    });
  }

  private authParams(extra?: Record<string, unknown>): Record<string, unknown> | undefined {
    const params: Record<string, unknown> = { ...extra };
    if (this.registrationKey) {
      // BLS v2 accepts `registrationkey` as a query param on GET endpoints.
      // Tradeoff: it lifts rate limits but may surface the key in URL/access logs.
      params.registrationkey = this.registrationKey;
    }
    return Object.keys(params).length > 0 ? params : undefined;
  }

  private handleError(error: unknown): never {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      if (status === 429) {
        throw new BlsApiError(
          "Rate limit exceeded. Registered users get higher limits — provide a BLS_API_KEY.",
          429
        );
      }
      throw new BlsApiError(
        `BLS API error: ${error.response?.statusText ?? error.message}`,
        status
      );
    }
    throw error;
  }

  async getSingleSeries(seriesId: string): Promise<unknown> {
    try {
      const response = await this.http.get(
        `/timeseries/data/${seriesId}`,
        { params: this.authParams() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getLatestSeries(seriesId: string): Promise<unknown> {
    try {
      const response = await this.http.get(
        `/timeseries/data/${seriesId}`,
        { params: this.authParams({ latest: true }) }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSeriesData(params: SeriesDataParams): Promise<unknown> {
    const payload: SeriesDataParams = { ...params };
    if (this.registrationKey && !payload.registrationkey) {
      payload.registrationkey = this.registrationKey;
    }
    try {
      const response = await this.http.post("/timeseries/data/", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getPopularSeries(survey?: string): Promise<unknown> {
    try {
      const response = await this.http.get("/timeseries/popular", {
        params: this.authParams(survey ? { survey } : undefined),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAllSurveys(): Promise<unknown> {
    try {
      const response = await this.http.get("/surveys", {
        params: this.authParams(),
      });
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSurvey(surveyAbbreviation: string): Promise<unknown> {
    try {
      const response = await this.http.get(
        `/surveys/${surveyAbbreviation}`,
        { params: this.authParams() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }
}
