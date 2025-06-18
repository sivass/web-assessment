interface Transaction {
  date: string;
  referenceId: string;
  to: string;
  type: string;
  amount: string;
}

export default function TransactionTable() {
  const transactions: Transaction[] = [
    {
      date: "24 Aug 2023",
      referenceId: "#8343434343424",
      to: "Bloom Enterprise Sdn Bhd",
      type: "DuitNow payment",
      amount: "RM 1,200.00",
    },
    {
      date: "14 Jul 2023",
      referenceId: "#8343434343424",
      to: "Muhammad Andy Axmawi",
      type: "DuitNow payment",
      amount: "RM 54,810.16",
    },
    {
      date: "12 Jul 2023",
      referenceId: "#8343434343424",
      to: "Utilities Company Sdn Bhd",
      type: "DuitNow payment",
      amount: "RM 100.00",
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              To
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Transaction Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((txn, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {txn.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {txn.referenceId}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{txn.to}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {txn.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {txn.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
