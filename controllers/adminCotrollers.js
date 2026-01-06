const prisma = require("../config/prisma");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const createAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Generate 6 length ID
        const id = uuidv4().substring(0, 6);

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = await prisma.admin.create({
            data: {
                id,
                name,
                email,
                password: hashedPassword
            }
        });

        res.status(201).json({ message: "Admin created successfully", admin: newAdmin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await prisma.admin.findUnique({
            where: { email }
        });

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '1d' });

        res.status(200).json({ message: "Login successful", token, admin });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const displayAdmin = async (req, res) => {
    try {
        const { id } = req.params;

        const admin = await prisma.admin.findUnique({
            where: { id }
        });

        if (!admin) {
            return res.status(404).json({ error: "Admin not found" });
        }

        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password } = req.body;

        let updateData = {};

        if (email) {
            updateData.email = email;
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: "No fields to update provided" });
        }

        const updatedAdmin = await prisma.admin.update({
            where: { id },
            data: updateData
        });

        res.status(200).json({ message: "Admin updated successfully", admin: updatedAdmin });

    } catch (error) {
        if (error.code === 'P2002') { // Unique constraint failed
            return res.status(400).json({ error: "Email already exists" });
        }
        if (error.code === 'P2025') { // Record not found
            return res.status(404).json({ error: "Admin not found" });
        }
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createAdmin,
    loginAdmin,
    displayAdmin,
    updateAdmin
};
