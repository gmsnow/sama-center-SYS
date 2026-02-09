const pool = require('../../dbconnection/todosConnection')
exports.todos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM todos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching tasks' });
  }
};
exports.addTodo = async (req, res) => {
  const { task_text } = req.body;
  if (!task_text) return res.status(400).json({ error: 'Task text is required' });

  try {
    const result = await pool.query(
      'INSERT INTO todos (task_text) VALUES ($1) RETURNING *',
      [task_text]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error adding task' });
  }
};
exports.editTodo = async (req, res) => {
  const { id } = req.params;
  const { is_completed, task_text } = req.body;

  try {
    const result = await pool.query(
      `UPDATE todos 
       SET is_completed = COALESCE($1, is_completed),
           task_text = COALESCE($2, task_text),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [is_completed, task_text, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error updating task' });
  }
};
exports.deleteTodo =  async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting task' });
  }
};