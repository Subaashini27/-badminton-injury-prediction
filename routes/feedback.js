const express = require('express');
const router = express.Router();
const { pool } = require('../database');

// Middleware to check if the user is a coach
const isCoach = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coaches WHERE user_id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: Only coaches can perform this action' });
    }
    req.coach = { id: rows[0].id };
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database error while verifying coach status' });
  }
};

// GET feedback for the logged-in athlete
router.get('/', async (req, res) => {
    try {
        const [athleteRows] = await pool.query('SELECT id FROM athletes WHERE user_id = ?', [req.user.id]);
        if (athleteRows.length === 0) {
            return res.status(404).json({ error: 'Athlete profile not found for this user.' });
        }
        const athleteId = athleteRows[0].id;

        const [feedbackRows] = await pool.query(
            `SELECT 
                f.id, 
                f.message, 
                f.priority, 
                f.created_at as timestamp,
                u.name as coachName
            FROM feedback f
            JOIN coaches c ON f.coach_id = c.id
            JOIN users u ON c.user_id = u.id
            WHERE f.athlete_id = ? 
            ORDER BY f.created_at DESC`,
            [athleteId]
        );
        res.json(feedbackRows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});

// POST new feedback from a coach to an athlete
router.post('/', isCoach, async (req, res) => {
  const { athleteId, message, priority } = req.body;
  const coachId = req.coach.id;

  if (!athleteId || !message || !priority) {
    return res.status(400).json({ error: 'Missing required fields: athleteId, message, priority' });
  }

  try {
    await pool.query(
      'INSERT INTO feedback (coach_id, athlete_id, message, priority) VALUES (?, ?, ?, ?)',
      [coachId, athleteId, message, priority]
    );
    res.status(201).json({ success: true, message: 'Feedback added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add feedback' });
  }
});

module.exports = router; 