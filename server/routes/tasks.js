const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const redis = require('../config/redisClient');
const router = express.Router();

const prisma = new PrismaClient();

// Redis Indexing Helpers
const tokenize = (text) => {
    if (!text) return [];
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(t => t.length > 0);
};

// Health Check / Redis Ping
router.get('/ping', async (req, res) => {
    try {
        const result = await redis.ping();
        res.json({ message: result }); // Should return 'PONG'
    } catch (err) {
        res.status(500).json({ message: 'Redis is down', error: err.message });
    }
});

const indexTaskInRedis = async (task) => {
    const { id, title, userId, priority, deadline, completed } = task;
    const taskKey = `task:${id}`;
    const tokens = tokenize(title);

    try {
        // Store task data as hash
        await redis.hmset(taskKey, {
            id,
            title,
            userId,
            priority: priority || 'Low',
            deadline: deadline ? new Date(deadline).toISOString() : '',
            completed: completed ? '1' : '0'
        });

        // Index each token
        for (const token of tokens) {
            await redis.sadd(`idx:user:${userId}:token:${token}`, id);
        }

        // Add to user's set of tasks
        await redis.sadd(`user:${userId}:tasks`, id);
    } catch (err) {
        console.error('Redis Indexing Error:', err);
    }
};

const deindexTaskInRedis = async (task) => {
    const { id, title, userId } = task;
    const tokens = tokenize(title);

    try {
        for (const token of tokens) {
            await redis.srem(`idx:user:${userId}:token:${token}`, id);
        }
        await redis.del(`task:${id}`);
        await redis.srem(`user:${userId}:tasks`, id);
    } catch (err) {
        console.error('Redis Deindexing Error:', err);
    }
};

// Get all tasks
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({ where: { userId: req.user.userId } });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Search tasks using Redis
router.get('/search', authMiddleware, async (req, res) => {
    const { q } = req.query;
    const userId = req.user.userId;

    if (!q) return res.json([]);

    const searchTokens = tokenize(q);
    if (searchTokens.length === 0) return res.json([]);

    try {
        const tokenKeys = searchTokens.map(token => `idx:user:${userId}:token:${token}`);
        
        // Find matching IDs across all tokens
        const matchingIds = await redis.sinter(...tokenKeys);

        if (matchingIds.length === 0) return res.json([]);

        // Retrieve full task hashes
        const results = [];
        for (const id of matchingIds) {
            const taskData = await redis.hgetall(`task:${id}`);
            if (Object.keys(taskData).length > 0) {
                results.push({
                    ...taskData,
                    id: parseInt(taskData.id),
                    completed: taskData.completed === '1'
                });
            }
        }

        res.json(results);
    } catch (err) {
        console.error('Redis Search Error:', err);
        res.status(500).json({ message: 'Search failed' });
    }
});

// Create task
router.post('/', authMiddleware, async (req, res) => {
    const { title, description, deadline } = req.body;
    console.log('Creating task:', { title, description, deadline, userId: req.user.userId });
    try {
        const task = await prisma.task.create({
            data: {
                title,
                description,
                deadline: deadline ? new Date(deadline) : null,
                priority: req.body.priority || 'Low',
                userId: req.user.userId,
            },
        });
        
        // Index in Redis
        await indexTaskInRedis(task);
        
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update task
router.put('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { title, description, deadline, completed } = req.body;
    try {
        // Ensure task belongs to user
        const task = await prisma.task.findFirst({ where: { id: parseInt(id), userId: req.user.userId } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: {
                title,
                description,
                deadline: deadline ? new Date(deadline) : null,
                priority: req.body.priority,
                completed,
            },
        });

        // Update Redis Index
        await deindexTaskInRedis(task); // Deindex old version
        await indexTaskInRedis(updatedTask); // Index new version

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const task = await prisma.task.findFirst({ where: { id: parseInt(id), userId: req.user.userId } });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        await prisma.task.delete({ where: { id: parseInt(id) } });

        // Deindex from Redis
        await deindexTaskInRedis(task);

        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Sync all tasks to Redis (one-time or maintenance)
router.post('/sync-all', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const tasks = await prisma.task.findMany({ where: { userId } });
        
        // Clear existing user index
        const userTasksKey = `user:${userId}:tasks`;
        const taskIds = await redis.smembers(userTasksKey);
        for (const id of taskIds) {
            const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });
            if (task) await deindexTaskInRedis(task);
        }

        // Re-index everything
        for (const task of tasks) {
            await indexTaskInRedis(task);
        }

        res.json({ message: 'Sync complete', count: tasks.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sync failed' });
    }
});

module.exports = router;
