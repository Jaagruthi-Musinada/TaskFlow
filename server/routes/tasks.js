const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const prisma = new PrismaClient();

// Get all tasks
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({ where: { userId: req.user.userId } });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
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
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
