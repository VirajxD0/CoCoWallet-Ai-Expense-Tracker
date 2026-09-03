export interface User { id: string; email: string; name?: string; created_at?: string }
export interface Expense { id: string; user_id: string; amount: number; description: string; category: string | null; receipt_url: string | null; date: string; created_at: string }
export interface Budget { id: string; user_id: string; category: string; monthly_limit: number; month: string; created_at: string }
export interface BudgetWithSpending extends Budget { spent: number; remaining: number; percentage: number; status: 'under'|'warning'|'over' }
export interface ExpenseListResponse { expenses: Expense[]; total: number; page: number; limit: number; totalPages: number }
export interface ExpenseStatsResponse { totalSpent: number; totalTransactions: number; averagePerTransaction: number; topCategories: Array<{ category: string; total: number; count: number }> }
export interface AiCategorizeResponse { category: string; confidence: number; reasoning: string }
export interface AiBudgetSuggestion { category: string; suggestedLimit: number; reasoning: string; averageMonthlySpend: number; basedOnMonths: number }
