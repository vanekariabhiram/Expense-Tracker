import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

function Dashboard({ onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);

  // Form states
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const token = localStorage.getItem('token');
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/expenses', config);
      const formattedTransactions = response.data.map(exp => ({
        id: exp.id,
        date: exp.date,
        category: exp.category_name || 'Expense',
        amount: -parseFloat(exp.amount),
        status: 'Success',
        type: 'expense',
        description: exp.description
      }));
      setTransactions(formattedTransactions);
      
      // Calculate totals
      const expenseTotal = formattedTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const incomeTotal = formattedTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      setMonthlyExpenses(expenseTotal);
      setMonthlyIncome(incomeTotal);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/expenses/categories', config);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const openIncomeModal = () => {
    setShowIncomeModal(true);
    document.body.style.overflow = 'hidden';
  };

  const openExpenseModal = () => {
    setShowExpenseModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = (modalType) => {
    if (modalType === 'income') {
      setShowIncomeModal(false);
      setIncomeForm({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      setShowExpenseModal(false);
      setExpenseForm({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    document.body.style.overflow = 'auto';
  };

  const addIncome = async () => {
    if (!incomeForm.amount || !incomeForm.category || !incomeForm.date) {
      alert('Please fill in all required fields');
      return;
    }

    const newTransaction = {
      date: incomeForm.date,
      category: incomeForm.category.charAt(0).toUpperCase() + incomeForm.category.slice(1),
      amount: parseFloat(incomeForm.amount),
      status: 'Success',
      type: 'income',
      description: incomeForm.description
    };

    setTransactions([newTransaction, ...transactions]);
    setMonthlyIncome(monthlyIncome + parseFloat(incomeForm.amount));
    closeModal('income');
    showNotification('Income added successfully!', 'success');
  };

  const addExpense = async () => {
    if (!expenseForm.amount || !expenseForm.category || !expenseForm.date) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const expenseData = {
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description,
        date: expenseForm.date,
        category_id: categories.find(cat => cat.name.toLowerCase() === expenseForm.category.toLowerCase())?.id || 1
      };

      await axios.post('http://localhost:5000/api/expenses', expenseData, config);
      await fetchTransactions();
      closeModal('expense');
      showNotification('Expense added successfully!', 'success');
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Error adding expense');
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, config);
      await fetchTransactions();
      showNotification('Transaction deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1001;
      animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const spendingLimit = 12645;
  const remainingLimit = spendingLimit - monthlyExpenses;
  const spendingPercentage = (monthlyExpenses / spendingLimit) * 100;

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>

      <div className="header">
        <h1>Personal Finance Dashboard</h1>
        <div className="header-controls">
          <button className="export-btn" onClick={onLogout}>
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Monthly Income</span>
            </div>
            <div className="amount income-amount">₹{monthlyIncome.toLocaleString()}.00</div>
            <div className="change">
              <i className="fas fa-arrow-up"></i>
              <span>vs last month</span>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Monthly Expenses</span>
            </div>
            <div className="amount expense-amount">₹{monthlyExpenses.toLocaleString()}.00</div>
            <div className="change">
              <i className="fas fa-arrow-up"></i>
              <span>vs last month</span>
            </div>
          </div>

          <div className="card my-card">
            <div className="card-chip"></div>
            <div className="card-number">**** **** **** 4562</div>
            <div className="card-holder">CARD HOLDER</div>
            <div className="card-logo">
              <div className="card-logo-circle logo-red"></div>
              <div className="card-logo-circle logo-orange"></div>
            </div>

            <div className="spending-section">
              <div className="spending-used">Spending Limit Used</div>
              <div className="spending-limit">₹{remainingLimit.toLocaleString()}.00</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(spendingPercentage, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Activity Overview</span>
            </div>
            <div className="chart-container">
              <div className="chart-bar" style={{ height: '60%' }}>
                <div className="bar-label">Jan</div>
              </div>
              <div className="chart-bar" style={{ height: '80%' }}>
                <div className="bar-label">Feb</div>
              </div>
              <div className="chart-bar" style={{ height: '45%' }}>
                <div className="bar-label">Mar</div>
              </div>
              <div className="chart-bar" style={{ height: '70%' }}>
                <div className="bar-label">Apr</div>
              </div>
              <div className="chart-bar" style={{ height: '55%' }}>
                <div className="bar-label">May</div>
              </div>
              <div className="chart-bar" style={{ height: '85%' }}>
                <div className="bar-label">Jun</div>
              </div>
              <div className="chart-bar" style={{ height: '40%' }}>
                <div className="bar-label">Jul</div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Expense Categories</span>
            </div>
            <div className="categories-list">
              <div className="category-item">
                <div className="category-info">
                  <div className="category-icon" style={{ background: '#ef4444' }}>
                    <i className="fas fa-shopping-bag"></i>
                  </div>
                  <div>
                    <div className="category-name">Shopping</div>
                    <div className="category-percent">32%</div>
                  </div>
                </div>
                <div className="category-amount">₹1,250</div>
              </div>
              <div className="category-item">
                <div className="category-info">
                  <div className="category-icon" style={{ background: '#3b82f6' }}>
                    <i className="fas fa-utensils"></i>
                  </div>
                  <div>
                    <div className="category-name">Food</div>
                    <div className="category-percent">28%</div>
                  </div>
                </div>
                <div className="category-amount">₹1,098</div>
              </div>
              <div className="category-item">
                <div className="category-info">
                  <div className="category-icon" style={{ background: '#8b5cf6' }}>
                    <i className="fas fa-plane"></i>
                  </div>
                  <div>
                    <div className="category-name">Travel</div>
                    <div className="category-percent">18%</div>
                  </div>
                </div>
                <div className="category-amount">₹705</div>
              </div>
            </div>
          </div>
        </div>

        <div className="transactions-section">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Transactions</span>
              <div className="transaction-actions">
                <button className="action-button income-btn" onClick={openIncomeModal}>
                  <i className="fas fa-plus"></i>
                  Add Income
                </button>
                <button className="action-button expense-btn" onClick={openExpenseModal}>
                  <i className="fas fa-minus"></i>
                  Add Expense
                </button>
              </div>
            </div>
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 10).map(transaction => {
                  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  const amountDisplay = transaction.amount > 0
                    ? `+₹${transaction.amount.toLocaleString()}.00`
                    : `-₹${Math.abs(transaction.amount).toLocaleString()}.00`;
                  
                  return (
                    <tr key={transaction.id}>
                      <td>{formattedDate}</td>
                      <td>{transaction.category}</td>
                      <td style={{ color: transaction.amount > 0 ? '#10b981' : '#ef4444' }}>
                        {amountDisplay}
                      </td>
                      <td><span className="status-success">{transaction.status}</span></td>
                      <td>
                        <button className="action-btn" onClick={() => deleteTransaction(transaction.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="modal" onClick={() => closeModal('income')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Income</h2>
              <button className="modal-close" onClick={() => closeModal('income')}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  value={incomeForm.amount}
                  onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={incomeForm.category}
                  onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  <option value="salary">Salary</option>
                  <option value="freelance">Freelance</option>
                  <option value="investment">Investment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  placeholder="Add a note (optional)"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={incomeForm.date}
                  onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => closeModal('income')}>Cancel</button>
              <button className="btn btn-primary" onClick={addIncome}>Add Income</button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="modal" onClick={() => closeModal('expense')}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Expense</h2>
              <button className="modal-close" onClick={() => closeModal('expense')}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Add a note (optional)"
                  rows="3"
                ></textarea>
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => closeModal('expense')}>Cancel</button>
              <button className="btn btn-primary" onClick={addExpense}>Add Expense</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;