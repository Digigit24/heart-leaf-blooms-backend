const prisma = require("../config/prisma");

// Create Category (Admin Only)
const createCategory = async (req, res) => {
    try {
        const { category_name, category_description, category_icon } = req.body;

        if (!category_name) {
            return res.status(400).json({ error: "Category name is required" });
        }

        const newCategory = await prisma.category.create({
            data: {
                category_name,
                category_description,
                category_icon
            }
        });

        res.status(201).json({ message: "Category created successfully", category: newCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                products: false
            }
        });
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Category (Admin Only)
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const updatedCategory = await prisma.category.update({
            where: { category_id: parseInt(id) },
            data: data
        });

        res.status(200).json({ message: "Category updated", category: updatedCategory });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Category (Admin Only)
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.category.delete({
            where: { category_id: parseInt(id) }
        });
        res.status(200).json({ message: "Category deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
};
