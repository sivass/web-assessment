import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Mock transaction data
const mockTransactions = [
  {
    id: "1",
    date: "24 Aug 2023",
    referenceId: "#8343434343424",
    to: "Bloom Enterprise Sdn Bhd",
    type: "DuitNow payment",
    amount: "RM 1,200.00",
  },
  {
    id: "2",
    date: "14 Jul 2023",
    referenceId: "#8343434343425",
    to: "Muhammad Andy Axmawi",
    type: "DuitNow payment",
    amount: "RM 54,810.16",
  },
  {
    id: "3",
    date: "12 Jul 2023",
    referenceId: "#8343434343426",
    to: "Utilities Company Sdn Bhd",
    type: "DuitNow payment",
    amount: "RM 100.00",
  },
  {
    id: "4",
    date: "10 Jul 2023",
    referenceId: "#8343434343427",
    to: "Tech Solutions Ltd",
    type: "DuitNow payment",
    amount: "RM 2,500.00",
  },
  {
    id: "5",
    date: "08 Jul 2023",
    referenceId: "#8343434343428",
    to: "Digital Services Co",
    type: "DuitNow payment",
    amount: "RM 750.00",
  },
];

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  // Check authentication
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // In a real app, you would:
  // 1. Decode the JWT token
  // 2. Get the user ID from the token
  // 3. Fetch transactions from a database
  // 4. Apply pagination, filtering, etc.

  return NextResponse.json({
    transactions: mockTransactions,
    total: mockTransactions.length,
  });
}
