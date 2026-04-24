module.exports = function simplifyDebts(balances, members) {
  const debtors = [];
  const creditors = [];

  // Convertimos el balance neto de cada usuario en dos listas: quien debe y quien cobra.
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

  // Emparejamos deudores con acreedores hasta cubrir todas las deudas pendientes.
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const amount = Math.min(debtor.amount, creditor.amount);

    transactions.push({
      from: members.find((m) => m._id.toString() === debtor.userId),
      to: members.find((m) => m._id.toString() === creditor.userId),
      amount: Number(amount.toFixed(2))
    });

    // Restamos lo ya compensado para avanzar al siguiente usuario cuando quede saldado.
    debtor.amount -= amount;
    creditor.amount -= amount;

    // Si ya quedo en 0, pasamos al siguiente deudor o acreedor.
    if (debtor.amount === 0) i++;
    if (creditor.amount === 0) j++;
  }

  return transactions;
};


