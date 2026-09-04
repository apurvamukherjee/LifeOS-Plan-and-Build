import { toLocalDateString } from '@/engine/streak/dateUtils'
import { db } from '../index'
import type { BaseRecord, Budget, Expense, RecurringBill } from '../schema'
import { insertRecord, softDeleteRecord, updateRecord } from './baseRepo'

export async function listExpenses(): Promise<Expense[]> {
  const all = await db.expenses.toArray()
  return all.filter((expense) => !expense.deleted).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
}

export async function addExpenseRaw(fields: Omit<Expense, keyof BaseRecord>): Promise<Expense> {
  return insertRecord<Expense>(db.expenses, fields)
}

export async function deleteExpense(id: string): Promise<void> {
  return softDeleteRecord<Expense>(db.expenses, id)
}

export async function listExpensesForLocalDate(localDate: string, timeZone: string): Promise<Expense[]> {
  const all = await listExpenses()
  return all.filter((expense) => toLocalDateString(expense.occurredAt, timeZone) === localDate)
}

export async function listBudgets(): Promise<Budget[]> {
  const all = await db.budgets.toArray()
  return all.filter((budget) => !budget.deleted)
}

export async function setBudget(category: string, monthlyLimit: number): Promise<void> {
  const existing = (await listBudgets()).find((budget) => budget.category === category)
  if (existing) {
    await updateRecord<Budget>(db.budgets, existing.id, { monthlyLimit })
  } else {
    await insertRecord<Budget>(db.budgets, { category, monthlyLimit })
  }
}

export async function deleteBudget(id: string): Promise<void> {
  return softDeleteRecord<Budget>(db.budgets, id)
}

export async function listRecurringBills(): Promise<RecurringBill[]> {
  const all = await db.recurringBills.toArray()
  return all.filter((bill) => !bill.deleted)
}

export async function createRecurringBill(
  fields: Omit<RecurringBill, keyof BaseRecord>,
): Promise<RecurringBill> {
  return insertRecord<RecurringBill>(db.recurringBills, fields)
}

export async function deleteRecurringBill(id: string): Promise<void> {
  return softDeleteRecord<RecurringBill>(db.recurringBills, id)
}
