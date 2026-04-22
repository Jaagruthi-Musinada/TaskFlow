const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();
app.set('trust proxy', 1); // Enable trusting the Render proxy
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const passport = require('passport');
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Added to support http://localhost:5000/auth/google/callback
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
    res.send('To-Do API is running');
});

// Export app for Vercel
module.exports = app;

// Only listen if not imported (dev mode)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
