function ExpenseList({ expenses, onDeleteExpense, loading }) {
  if (loading) return <div>Loading...</div>;

  return (
    <div className="expense-list">
      <h3>Recent Expenses</h3>
      {expenses.length === 0 ? (
        <p>No expenses yet. Add your first expense!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense.id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.description}</td>
                <td>{expense.category_name || 'Uncategorized'}</td>
                <td>${parseFloat(expense.amount).toFixed(2)}</td>
                <td>
                  <button 
                    onClick={() => onDeleteExpense(expense.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ExpenseList;