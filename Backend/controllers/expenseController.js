const xlsx = require('xlsx');
const Expense = require("../models/Expense");
const path = require('path');

//add expense source
exports.addExpense = async (req, res) => {
    const userId = req.user.id;

    try {
        const { icon, category, amount, date } = req.body;

        //validation: check for missing fields
        if (!category || !amount || !date) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date)
        });

        await newExpense.save();
        res.status(200).json(newExpense);
    } catch (error) {
        console.error("Error adding expense:", error.message);
        res.status(500).json({ message: "Server Error" });
    }
}

//get all expense source
exports.getAllExpense = async (req, res) => {
  const userId = req.user.id;

  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });
    res.status(200).json(expense);
  } catch (error) {
    console.error("Error in getAllExpense:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/*exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        const income = await Income.find({ userId }).sort({ date: -1 });
        res.json(income);
    } catch (error) {
        res.status(500).json({ message: "Server Error "});
    }
};
*/

//delete expense source
exports.deleteExpense = async (req, res) => {
  try {
    // Find the expense by ID
    const expense = await Expense.findById(req.params.id);

    // If not found
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Ensure the expense belongs to the logged-in user
    if (expense.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this expense" });
    }

    // Delete it
    await expense.deleteOne();

    // ✅ Always send a response
    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error.message);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/*exports.deleteIncome = async (req, res) => {
    try {
        await Income.findByIdAndDelete(req.params.id);
        res.json({ message: "Income deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
} 
*/

//download excel
exports.downloadExpenseExcel = async (req, res) => {
  const userId = req.user.id;

  try {
    const expense = await Expense.find({ userId }).sort({ date: -1 });

    if (!expense || expense.length === 0) {
      return res.status(404).json({ message: "No expense data found" });
    }

    const data = expense.map((item) => ({
      Source: item.source,
      Amount: item.amount,
      Date: item.date.toISOString().split("T")[0],
    }));

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Expense");

    // Save to project folder (backend/uploads/expense_details.xlsx)
    const filePath = path.join(__dirname, "../uploads/expense_details.xlsx");
    xlsx.writeFile(wb, filePath);

    // Send file as download to Postman
    res.download(filePath);
  } catch (error) {
    console.error("Error generating Excel:", error.message);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

/*exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id;
    try {
        const income = await Income.find({ userId }).sort({ date: -1 });

        //prepare data for excel
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date,
        }));

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb, ws, "Income");
        xlsx.writeFile(wb, 'income_details.xlsx');
        res.download('income_details.xlsx');
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};*/