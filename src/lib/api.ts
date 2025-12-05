const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

// ============================================================================
// Auth Types
// ============================================================================

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  status: "active" | "inactive" | "pending" | "suspended";
  createdAt: string;
}

// ============================================================================
// User Types
// ============================================================================

export type UserStatus = "active" | "inactive" | "pending" | "suspended";

export interface UserResponseDto {
  id: string;
  email: string;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateUserDto {
  status?: UserStatus;
}

// ============================================================================
// Portfolio Types
// ============================================================================

export interface PortfolioSummaryDto {
  reportCount: number;
  holdingCount: number;
  lastCalculatedAt?: string;
}

export interface PortfolioResponseDto {
  id: string;
  name: string;
  description?: string;
  currency: string;
  isDefault: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioWithSummaryDto extends PortfolioResponseDto {
  summary: PortfolioSummaryDto;
}

export interface PortfolioListResponseDto {
  portfolios: PortfolioWithSummaryDto[];
  total: number;
}

export interface CreatePortfolioDto {
  name: string;
  description?: string;
  currency?: string;
  isDefault?: boolean;
}

export interface UpdatePortfolioDto {
  name?: string;
  description?: string;
  currency?: string;
  isArchived?: boolean;
}

// ============================================================================
// Report Types
// ============================================================================

export interface ReportResponseDto {
  id: string;
  fileName: string;
  fileType: "csv" | "json";
  fileSize: number;
  broker: "ibkr" | "freedom_finance";
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  transactionCount?: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  processedAt?: string;
  createdAt: string;
}

export interface ReportListResponseDto {
  reports: ReportResponseDto[];
  total: number;
}

export type BrokerType = "ibkr" | "freedom_finance";

// ============================================================================
// Dividend Types
// ============================================================================

export interface WithholdingTaxDto {
  id: string;
  type: string;
  amount: number;
  currency: string;
  country?: string;
  reclaimable: boolean;
}

export interface DividendResponseDto {
  id: string;
  symbol: string;
  grossAmount: number;
  taxWithheld: number;
  netAmount: number;
  currency: string;
  executedAt: string;
  exDate?: string;
  description?: string;
  withholdingTaxes?: WithholdingTaxDto[];
  reportId: string;
}

export interface DividendSummaryDto {
  totalGross: number;
  totalTax: number;
  totalNet: number;
  count: number;
}

export interface DividendListResponseDto {
  dividends: DividendResponseDto[];
  total: number;
  summary: DividendSummaryDto;
}

// ============================================================================
// Holding Types (from portfolio breakdown)
// ============================================================================

export interface HoldingResponseDto {
  id: string;
  symbol: string;
  companyName?: string;
  assetClass: string;
  status: "open" | "closed" | "short";
  quantity: number;
  totalQuantityBought: number;
  totalQuantitySold: number;
  avgCostBasis: number;
  totalCostBasis: number;
  currentPrice: number;
  marketValue: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
  totalDividends: number;
  totalCommissions: number;
  percentOfPortfolio: number;
  firstBuyDate?: string;
  lastSellDate?: string;
  currency: string;
}

// ============================================================================
// Holding Transaction Types
// ============================================================================

export interface TradeTransactionDto {
  id: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  amount: number;
  currency: string;
  executedAt: string;
  description?: string;
  commission?: number;
}

export interface TaxTransactionDto {
  id: string;
  symbol?: string;
  type: string;
  amount: number;
  currency: string;
  country?: string;
  reclaimable: boolean;
  executedAt: string;
  description?: string;
}

export interface DividendTransactionDto {
  id: string;
  grossAmount: number;
  netAmount: number;
  currency: string;
  exDate: string;
  payDate: string;
  taxWithheld?: number;
  description?: string;
}

export interface CommissionTransactionDto {
  id: string;
  symbol?: string;
  type: string;
  amount: number;
  currency: string;
  executedAt: string;
  description?: string;
}

export interface OptionTradeTransactionDto {
  id: string;
  symbol: string;
  underlying: string;
  optionType: "call" | "put";
  strike: number;
  expirationDate: string;
  action: "buy" | "sell" | "exercise" | "assign" | "expire";
  quantity: number;
  price: number;
  premium: number;
  currency: string;
  executedAt: string;
  description?: string;
  commission?: number;
}

export interface LotTransactionDto {
  id: string;
  quantity: number;
  remainingQuantity: number;
  costBasis: number;
  totalCost: number;
  acquiredAt: string;
  soldQuantity: number;
  soldAt?: string;
  realizedPnl: number;
  holdingPeriodDays?: number;
  isLongTerm: boolean;
  lotType: "long" | "short" | "cover";
}

/** @deprecated Use LotTransactionDto instead */
export type LotDto = LotTransactionDto;

export interface HoldingTransactionsSummaryDto {
  totalTrades: number;
  totalDividends: number;
  totalTaxes: number;
  totalCommissions: number;
  totalOptionTrades: number;
}

export interface HoldingTransactionsResponseDto {
  symbol: string;
  portfolioId: string;
  trades: TradeTransactionDto[];
  dividends: DividendTransactionDto[];
  taxes: TaxTransactionDto[];
  commissions: CommissionTransactionDto[];
  optionTrades: OptionTradeTransactionDto[];
  summary: HoldingTransactionsSummaryDto;
  lots?: LotTransactionDto[];
}


// ============================================================================
// Portfolio Breakdown Types
// ============================================================================

export interface BreakdownHoldingDto {
  id: string;
  symbol: string;
  companyName?: string;
  assetClass: string;
  status: "open" | "closed" | "short";
  quantity: number;
  avgCostBasis: number;
  totalCostBasis: number;
  currentPrice: number;
  marketValue: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
  totalDividends: number;
  percentOfPortfolio: number;
  currency: string;
}

export interface TopPerformerDto {
  symbol: string;
  pnl: number;
  percent: number;
}

export interface AssetAllocationDto {
  assetClass: string;
  percent: number;
  value: number;
}

export interface PortfolioBreakdownResponseDto {
  portfolioId: string;
  lastCalculatedAt?: string;
  holdings: BreakdownHoldingDto[];
  topGainers: TopPerformerDto[];
  topLosers: TopPerformerDto[];
  assetAllocation: AssetAllocationDto[];
}

// ============================================================================
// Trade Types
// ============================================================================

export type TradeType = "buy" | "sell";
export type AssetClassType = "stock" | "etf";
export type DataSource = "CSV_UPLOAD" | "IBKR_FLEX";

export interface TradeResponseDto {
  id: string;
  symbol: string;
  assetClass: AssetClassType;
  type: TradeType;
  quantity: number;
  price: number;
  amount: number;
  currency: string;
  executedAt: string;
  description?: string;
  commission?: number;
  source: DataSource;
}

export interface TradeSummaryDto {
  totalTrades: number;
  buyCount: number;
  sellCount: number;
  totalBought: number;
  totalSold: number;
  totalCommissions: number;
}

export interface TradeListResponseDto {
  trades: TradeResponseDto[];
  total: number;
  summary: TradeSummaryDto;
}

export interface TradeFilters {
  symbol?: string;
  type?: TradeType;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Option Trade Types
// ============================================================================

export type OptionType = "call" | "put";
export type OptionAction = "buy" | "sell" | "exercise" | "assign" | "expire";

export interface OptionTradeResponseDto {
  id: string;
  symbol: string;
  underlying: string;
  optionType: OptionType;
  strike: number;
  expirationDate: string;
  action: OptionAction;
  quantity: number;
  price: number;
  premium: number;
  currency: string;
  executedAt: string;
  description?: string;
  commission?: number;
  source: DataSource;
}

export interface OptionTradeSummaryDto {
  totalTrades: number;
  premiumReceived: number;
  premiumPaid: number;
  netPremium: number;
  totalCommissions: number;
  callCount: number;
  putCount: number;
}

export interface OptionTradeListResponseDto {
  optionTrades: OptionTradeResponseDto[];
  total: number;
  summary: OptionTradeSummaryDto;
}

export interface OptionTradeFilters {
  underlying?: string;
  optionType?: OptionType;
  action?: OptionAction;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// Transfer Types
// ============================================================================

export type TransferType = "deposit" | "withdrawal" | "transfer" | "transfer_in" | "transfer_out";

export interface TransferResponseDto {
  id: string;
  type: TransferType;
  amount: number;
  currency: string;
  executedAt: string;
  description?: string;
  broker: BrokerType;
  source: DataSource;
}

export interface TransferSummaryDto {
  totalDeposits: number;
  totalWithdrawals: number;
  netTransfers: number;
  count: number;
}

export interface TransferListResponseDto {
  transfers: TransferResponseDto[];
  total: number;
  summary: TransferSummaryDto;
}

export interface TransferFilters {
  type?: TransferType;
  broker?: BrokerType;
  startDate?: string;
  endDate?: string;
}

// ============================================================================
// API Error handling
// ============================================================================

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public error?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ============================================================================
// Token management
// ============================================================================

const TOKEN_KEY = "trade_insight_token";

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string): void => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  remove: (): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  },
};

// ============================================================================
// Base fetch wrapper
// ============================================================================

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.get();

  const headers: HeadersInit = {
    ...options.headers,
  };

  // Only set Content-Type for requests with a body, and not for FormData
  if (options.body && !(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || "An error occurred",
      errorData.error
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================================================
// Auth API
// ============================================================================

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResponseDto> => {
    const response = await fetchApi<AuthResponseDto>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    tokenStorage.set(response.accessToken);
    return response;
  },

  register: async (data: RegisterDto): Promise<AuthResponseDto> => {
    const response = await fetchApi<AuthResponseDto>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    tokenStorage.set(response.accessToken);
    return response;
  },

  getProfile: async (): Promise<UserProfileDto> => {
    return fetchApi<UserProfileDto>("/auth/me");
  },

  logout: (): void => {
    tokenStorage.remove();
  },

  isAuthenticated: (): boolean => {
    return !!tokenStorage.get();
  },
};

// ============================================================================
// Users API
// ============================================================================

export const usersApi = {
  getById: async (userId: string): Promise<UserResponseDto> => {
    return fetchApi<UserResponseDto>(`/users/${userId}`);
  },

  update: async (
    userId: string,
    data: UpdateUserDto
  ): Promise<UserResponseDto> => {
    return fetchApi<UserResponseDto>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (userId: string): Promise<void> => {
    return fetchApi<void>(`/users/${userId}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// Portfolios API
// ============================================================================

export const portfoliosApi = {
  list: async (includeArchived = false): Promise<PortfolioListResponseDto> => {
    const params = includeArchived ? "?includeArchived=true" : "";
    return fetchApi<PortfolioListResponseDto>(`/portfolios${params}`);
  },

  getById: async (portfolioId: string): Promise<PortfolioWithSummaryDto> => {
    return fetchApi<PortfolioWithSummaryDto>(`/portfolios/${portfolioId}`);
  },

  create: async (data: CreatePortfolioDto): Promise<PortfolioResponseDto> => {
    return fetchApi<PortfolioResponseDto>("/portfolios", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    portfolioId: string,
    data: UpdatePortfolioDto
  ): Promise<PortfolioResponseDto> => {
    return fetchApi<PortfolioResponseDto>(`/portfolios/${portfolioId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (portfolioId: string): Promise<void> => {
    return fetchApi<void>(`/portfolios/${portfolioId}`, {
      method: "DELETE",
    });
  },

  setDefault: async (portfolioId: string): Promise<PortfolioResponseDto> => {
    return fetchApi<PortfolioResponseDto>(
      `/portfolios/${portfolioId}/set-default`,
      {
        method: "POST",
      }
    );
  },

  getBreakdown: async (
    portfolioId: string
  ): Promise<PortfolioBreakdownResponseDto> => {
    return fetchApi<PortfolioBreakdownResponseDto>(
      `/portfolios/${portfolioId}/breakdown`
    );
  },

  getHoldingTransactions: async (
    portfolioId: string,
    symbol: string
  ): Promise<HoldingTransactionsResponseDto> => {
    return fetchApi<HoldingTransactionsResponseDto>(
      `/portfolios/${portfolioId}/holdings/${symbol}/transactions`
    );
  },
};

// ============================================================================
// Reports API (Portfolio-scoped)
// ============================================================================

export const reportsApi = {
  upload: async (
    portfolioId: string,
    file: File,
    broker: BrokerType
  ): Promise<ReportResponseDto> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("broker", broker);

    return fetchApi<ReportResponseDto>(
      `/portfolios/${portfolioId}/reports/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
  },

  list: async (portfolioId: string): Promise<ReportListResponseDto> => {
    return fetchApi<ReportListResponseDto>(
      `/portfolios/${portfolioId}/reports`
    );
  },

  getById: async (
    portfolioId: string,
    reportId: string
  ): Promise<ReportResponseDto> => {
    return fetchApi<ReportResponseDto>(
      `/portfolios/${portfolioId}/reports/${reportId}`
    );
  },

  delete: async (portfolioId: string, reportId: string): Promise<void> => {
    return fetchApi<void>(`/portfolios/${portfolioId}/reports/${reportId}`, {
      method: "DELETE",
    });
  },
};

// ============================================================================
// Dividends API (Portfolio-scoped)
// ============================================================================

export interface DividendFilters {
  symbol?: string;
  startDate?: string;
  endDate?: string;
}

export const dividendsApi = {
  list: async (
    portfolioId: string,
    filters?: DividendFilters
  ): Promise<DividendListResponseDto> => {
    const params = new URLSearchParams();
    if (filters?.symbol) params.append("symbol", filters.symbol);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const queryString = params.toString();
    const endpoint = `/portfolios/${portfolioId}/dividends${queryString ? `?${queryString}` : ""}`;
    return fetchApi<DividendListResponseDto>(endpoint);
  },
};

// ============================================================================
// Trades API (Portfolio-scoped)
// ============================================================================

export const tradesApi = {
  list: async (
    portfolioId: string,
    filters?: TradeFilters
  ): Promise<TradeListResponseDto> => {
    const params = new URLSearchParams();
    if (filters?.symbol) params.append("symbol", filters.symbol);
    if (filters?.type) params.append("type", filters.type);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const queryString = params.toString();
    const endpoint = `/portfolios/${portfolioId}/trades${queryString ? `?${queryString}` : ""}`;
    return fetchApi<TradeListResponseDto>(endpoint);
  },
};

// ============================================================================
// Option Trades API (Portfolio-scoped)
// ============================================================================

export const optionTradesApi = {
  list: async (
    portfolioId: string,
    filters?: OptionTradeFilters
  ): Promise<OptionTradeListResponseDto> => {
    const params = new URLSearchParams();
    if (filters?.underlying) params.append("underlying", filters.underlying);
    if (filters?.optionType) params.append("optionType", filters.optionType);
    if (filters?.action) params.append("action", filters.action);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const queryString = params.toString();
    const endpoint = `/portfolios/${portfolioId}/options${queryString ? `?${queryString}` : ""}`;
    return fetchApi<OptionTradeListResponseDto>(endpoint);
  },
};

// ============================================================================
// Transfers API (Portfolio-scoped)
// ============================================================================

export const transfersApi = {
  list: async (
    portfolioId: string,
    filters?: TransferFilters
  ): Promise<TransferListResponseDto> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append("type", filters.type);
    if (filters?.broker) params.append("broker", filters.broker);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    const queryString = params.toString();
    const endpoint = `/portfolios/${portfolioId}/transfers${queryString ? `?${queryString}` : ""}`;
    return fetchApi<TransferListResponseDto>(endpoint);
  },
};

// ============================================================================
// FlexQuery Types
// ============================================================================

export interface ConfigureFlexQueryDto {
  token: string;
  queryId: string;
}

export interface ConfigureFlexQueryResponseDto {
  message: string;
  syncQueued: boolean;
}

export interface FlexQueryCredentialsDto {
  configured: boolean;
  queryId?: string;
  tokenMasked?: string;
  isActive?: boolean;
  lastSyncAt?: string;
  lastSyncStatus?: "success" | "failed" | "pending";
  lastError?: string;
}

// ============================================================================
// Market Data Types
// ============================================================================

export interface HistoricalPriceDto {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalPricesResponseDto {
  symbol: string;
  data: HistoricalPriceDto[];
}

export interface LatestPriceDto {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  updatedAt: string;
}

// ============================================================================
// Market Data API
// ============================================================================

// ============================================================================
// FlexQuery API (Portfolio-scoped)
// ============================================================================

export const flexQueryApi = {
  getCredentials: async (
    portfolioId: string
  ): Promise<FlexQueryCredentialsDto> => {
    return fetchApi<FlexQueryCredentialsDto>(
      `/portfolios/${portfolioId}/flex-query/credentials`
    );
  },

  configure: async (
    portfolioId: string,
    data: ConfigureFlexQueryDto
  ): Promise<ConfigureFlexQueryResponseDto> => {
    return fetchApi<ConfigureFlexQueryResponseDto>(
      `/portfolios/${portfolioId}/flex-query/credentials`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  delete: async (portfolioId: string): Promise<void> => {
    return fetchApi<void>(`/portfolios/${portfolioId}/flex-query/credentials`, {
      method: "DELETE",
    });
  },
};

export const marketDataApi = {
  getHistoricalPrices: async (
    symbol: string,
    startDate: string,
    endDate?: string,
    limit?: number
  ): Promise<HistoricalPricesResponseDto> => {
    const params = new URLSearchParams();
    params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (limit) params.append("limit", limit.toString());

    return fetchApi<HistoricalPricesResponseDto>(
      `/market/prices/historical/${symbol}?${params.toString()}`
    );
  },

  getLatestPrice: async (symbol: string): Promise<LatestPriceDto> => {
    return fetchApi<LatestPriceDto>(`/market/prices/latest/${symbol}`);
  },

  getLatestPrices: async (symbols: string[]): Promise<LatestPriceDto[]> => {
    return fetchApi<LatestPriceDto[]>(
      `/market/prices/latest?symbols=${symbols.join(",")}`
    );
  },
};

