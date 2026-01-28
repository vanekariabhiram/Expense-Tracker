import { useState } from 'react';

function ExpenseForm({ onAddExpense, categories }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddExpense({
      amount: parseFloat(amount),
      description,
      date,
      category_id: categoryId || null
    });
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategoryId('');
  };

  return (
    <div className="expense-form">
      <h3>Add New Expense</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <button type="submit">Add Expense</button>
      </form>
    </div>
  );
}

export default ExpenseForm;