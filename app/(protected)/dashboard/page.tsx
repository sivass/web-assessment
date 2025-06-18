import TransactionTable from "../../../components/TransactionTable";

export default function DashboardPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Your Transactions</h1>
      <TransactionTable />
    </div>
  );
}
