module.exports = function simplifyDebts(balances, members) {
  const debtors = [];
  const creditors = [];

  // Separar deudores y acreedores
  for (const userId in balances) {
    const amount = balances[userId];

    if (amount < 0) {
      debtors.push({ userId, amount: Math.abs(amount) });
    } else if (amount > 0) {
      creditors.push({ userId, amount });
    }
  }

  const transactions = [];

  let i = 0;
  let j = 0;

  // Emparejar deudores con acreedores
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: members.find((m) => m._id.toString() === debtor.userId),
      to: members.find((m) => m._id.toString() === creditor.userId),
      amount: Number(amount.toFixed(2))
    });

    // Actualizar montos
    debtor.amount -= amount;
    creditor.amount -= amount;

    // Si ya quedó en 0, pasar al siguiente
    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return transactions;
};


