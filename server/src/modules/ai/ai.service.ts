import { env } from '../../config/env';
import { query } from '../../config/database';
import { CategorizeInput, SuggestBudgetsInput, NaturalQueryInput } from './ai.schema';
import { CategorizeResponse, BudgetSuggestion, NaturalQueryResponse } from './ai.types';
import logger from '../../config/logger';

/**
 * AI service — integrates with Google Gemini for intelligent features.
 * All AI logic lives here, isolated from HTTP concerns.
 */
export class AiService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor() {
    this.apiKey = env.GEMINI_API_KEY;
  }

  /**
   * Call Gemini API with a prompt — tries multiple models, surfaces real error.
   */
  private async callGemini(prompt: string): Promise<string> {
    const models = ['gemini-2.0-flash', 'gemini-2.5-flash'];
    let lastError = '';
    let lastStatus = 0;
    for (const model of models) {
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
        });
        if (response.ok) {
          const data: any = await response.json();
          return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
        lastError = await response.text();
        lastStatus = response.status;
        logger.warn({ model, status: response.status, error: lastError }, 'Gemini model failed, trying next');
        // Don't retry on auth/key errors — fail fast with clear message
        if (lastStatus === 400 || lastStatus === 401 || lastStatus === 403) break;
        if (lastStatus !== 404) break;
      } catch (e: any) {
        lastError = e.message;
        logger.warn({ model, err: e }, 'Gemini fetch exception');
      }
    }
    logger.error({ status: lastStatus, error: lastError }, 'Gemini API error — all models failed');
    // Hint for invalid key format (Gemini keys start with AIza...)
    if (!this.apiKey?.startsWith('AIza')) {
      throw new Error(`AI service error: ${lastStatus || 500} — Invalid GEMINI_API_KEY format (expected AIza...). Get one at https://aistudio.google.com/api-keys. Details: ${lastError}`);
    }
    throw new Error(`AI service error: ${lastStatus || 500} — ${lastError}`);
  }

  /**
   * Categorize an expense description using AI.
   */
  async categorize(input: CategorizeInput): Promise<CategorizeResponse> {
    const prompt = `You are a personal finance categorization assistant.

Categorize this expense into ONE of these categories:
- Food & Dining
- Transportation
- Housing & Utilities
- Entertainment
- Shopping
- Health & Medical
- Education
- Travel
- Subscriptions
- Personal Care
- Groceries
- Other

Expense: "${input.description}"
${input.amount ? `Amount: ₹${input.amount}` : ''}

Respond ONLY with valid JSON in this exact format:
{
  "category": "Category Name",
  "confidence": 0.95,
  "reasoning": "Brief explanation"
}`;

    const response = await this.callGemini(prompt);

    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      return JSON.parse(jsonMatch[0]) as CategorizeResponse;
    } catch {
      return {
        category: 'Other',
        confidence: 0.5,
        reasoning: 'Could not parse AI response, defaulting to Other',
      };
    }
  }

  /**
   * Suggest monthly budgets based on past spending.
   */
  async suggestBudgets(userId: string, input: SuggestBudgetsInput): Promise<BudgetSuggestion[]> {
    // Get past expenses
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - input.months);
    const startDateStr = startDate.toISOString().split('T')[0];

    const expenses = await query<{ category: string; amount: number; date: string }>(
      'SELECT category, amount, date FROM expenses WHERE user_id = ? AND date >= ? AND category IS NOT NULL',
      [userId, startDateStr]
    );

    if (!expenses.length) {
      return [];
    }

    // Aggregate by category
    const categoryData = new Map<string, { total: number; months: Set<string> }>();
    expenses.forEach((e) => {
      const cat = e.category;
      const dateStr = typeof e.date === 'string' ? e.date : new Date(e.date as any).toISOString().split('T')[0];
      const month = dateStr.substring(0, 7);
      const existing = categoryData.get(cat) || { total: 0, months: new Set() };
      existing.total += Number(e.amount);
      existing.months.add(month);
      categoryData.set(cat, existing);
    });

    // Build prompt with actual data
    const spendingSummary = Array.from(categoryData.entries())
      .map(([cat, data]) => {
        const avgMonthly = data.total / data.months.size;
        return `${cat}: ₹${avgMonthly.toFixed(2)}/month average (over ${data.months.size} months)`;
      })
      .join('\n');

    const prompt = `You are a personal finance advisor. Based on this spending history, suggest reasonable monthly budgets.

Spending history:
${spendingSummary}

Rules:
- Suggest limits that are realistic (slightly above average to allow growth)
- Round to nearest ₹100 or ₹500
- Be conservative but not overly restrictive

Respond ONLY with a JSON array:
[
  {
    "category": "Category Name",
    "suggestedLimit": 500,
    "reasoning": "Brief explanation",
    "averageMonthlySpend": 420
  }
]`;

    let response: string;
    try {
      response = await this.callGemini(prompt);
    } catch (e: any) {
      logger.warn({ err: e.message }, 'Gemini failed — falling back to local average');
      // Fallback: no AI, just averages (prevents 500 on budgets page)
      return Array.from(categoryData.entries()).map(([cat, data]) => ({
        category: cat,
        suggestedLimit: Math.ceil((data.total / data.months.size * 1.15) / 10) * 10,
        reasoning: 'AI unavailable — suggested 15% above average',
        averageMonthlySpend: data.total / data.months.size,
        basedOnMonths: input.months,
      }));
    }

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array in response');
      const suggestions = JSON.parse(jsonMatch[0]) as BudgetSuggestion[];
      return suggestions.map((s) => ({
        ...s,
        basedOnMonths: input.months,
      }));
    } catch {
      return Array.from(categoryData.entries()).map(([cat, data]) => ({
        category: cat,
        suggestedLimit: Math.ceil((data.total / data.months.size / 10)) * 10,
        reasoning: 'Based on average monthly spending',
        averageMonthlySpend: data.total / data.months.size,
        basedOnMonths: input.months,
      }));
    }
  }

  /**
   * Answer natural language queries about expenses.
   */
  async naturalQuery(userId: string, input: NaturalQueryInput): Promise<NaturalQueryResponse> {
    const expenses = await query<{ amount: number; description: string; category: string; date: string }>(
      'SELECT amount, description, category, date FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT 500',
      [userId]
    );

    if (!expenses.length) {
      return {
        answer: 'No expense data found. Start tracking your expenses first!',
      };
    }

    const expensesContext = expenses
      .map((e) => {
        const d = typeof e.date === 'string' ? e.date : new Date(e.date as any).toISOString().split('T')[0];
        return `${d}: ₹${e.amount} - ${e.description} (${e.category || 'Uncategorized'})`;
      })
      .join('\n');

    const prompt = `You are a personal finance assistant. Answer the user's question about their expenses based on this data.

Expenses:
${expensesContext}

User question: "${input.query}"

Rules:
- Answer concisely and helpfully
- Include specific numbers when relevant
- If the question can't be answered from the data, say so
- Format numbers as currency (₹X) using Indian Rupee symbol and en-IN formatting`;

    let answer: string;
    try {
      answer = await this.callGemini(prompt);
    } catch (e: any) {
      logger.warn({ err: e.message }, 'Gemini failed — falling back to local answer');
      // Fallback: answer from data directly without AI
      const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const byCategory = new Map<string, number>();
      expenses.forEach(e => {
        byCategory.set(e.category || 'Uncategorized', (byCategory.get(e.category || 'Uncategorized') || 0) + Number(e.amount));
      });

      const currentMonth = new Date().toISOString().slice(0, 7);
      const currentMonthExpenses = expenses.filter(e => {
        const d = typeof e.date === 'string' ? e.date : new Date(e.date as any).toISOString().split('T')[0];
        return d.startsWith(currentMonth);
      });
      const monthSpent = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const monthByCategory = new Map<string, number>();
      currentMonthExpenses.forEach(e => {
        monthByCategory.set(e.category || 'Uncategorized', (monthByCategory.get(e.category || 'Uncategorized') || 0) + Number(e.amount));
      });

      const q = input.query.toLowerCase();

      if (q.includes('total') && (q.includes('month') || q.includes('this'))) {
        answer = `You've spent ₹${monthSpent.toLocaleString('en-IN')} this month (${currentMonthExpenses.length} transactions).`;
      } else if (q.includes('total')) {
        answer = `You've spent ₹${totalSpent.toLocaleString('en-IN')} in total across ${expenses.length} transactions.`;
      } else if (q.includes('food') || q.includes('dining')) {
        const food = monthByCategory.get('Food & Dining') || 0;
        answer = `You spent ₹${food.toLocaleString('en-IN')} on Food & Dining this month (${currentMonth}).`;
      } else if (q.includes('transport')) {
        const transport = monthByCategory.get('Transport') || 0;
        answer = `You spent ₹${transport.toLocaleString('en-IN')} on Transport this month (${currentMonth}).`;
      } else if (q.includes('shopping')) {
        const shopping = monthByCategory.get('Shopping') || 0;
        answer = `You spent ₹${shopping.toLocaleString('en-IN')} on Shopping this month (${currentMonth}).`;
      } else if (q.includes('entertainment')) {
        const ent = monthByCategory.get('Entertainment') || 0;
        answer = `You spent ₹${ent.toLocaleString('en-IN')} on Entertainment this month (${currentMonth}).`;
      } else if (q.includes('top') || q.includes('most') || q.includes('highest')) {
        const sorted = Array.from(monthByCategory.entries()).sort((a, b) => b[1] - a[1]);
        const top = sorted[0];
        answer = top ? `Your top spending category this month is ${top[0]} at ₹${top[1].toLocaleString('en-IN')}.` : 'No spending data for this month.';
      } else {
        // Generic summary
        const lines = Array.from(monthByCategory.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([cat, amt]) => `• ${cat}: ₹${amt.toLocaleString('en-IN')}`)
          .join('\n');
        answer = `Here's your spending breakdown for ${currentMonth} (total: ₹${monthSpent.toLocaleString('en-IN')}):\n${lines || 'No data yet.'}`;
      }
    }

    return { answer };
  }
}

export const aiService = new AiService();
