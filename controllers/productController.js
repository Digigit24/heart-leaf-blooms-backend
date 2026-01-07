const prisma = require("../config/prisma");

// Create Product (Vendor)
const createProduct = async (req, res) => {
    try {
        const {
            vendor_id,
            category_id,
            product_name,
            product_title,
            product_description,
            product_price,
            discount_price,
            product_guide,
            product_images // Array of strings (URLs)
        } = req.body;

        // Verify Vendor
        const vendor = await prisma.vendor.findUnique({ where: { id: vendor_id } });
        if (!vendor) return res.status(404).json({ error: "Vendor not found" });

        // Verify Category
        const category = await prisma.category.findUnique({ where: { category_id: parseInt(category_id) } });
        if (!category) return res.status(404).json({ error: "Category not found" });

        // Prepare Image Data
        let imageData = [];

        // From S3 Upload
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                imageData.push({ img_url: file.location });
            });
        }

        // From Body (if mixed or text URLs provided)
        if (req.body.product_images) {
            let urls = req.body.product_images;
            if (!Array.isArray(urls)) urls = [urls];
            urls.forEach(url => imageData.push({ img_url: url }));
        }

        const newProduct = await prisma.product.create({
            data: {
                vendor_id,
                category_id: parseInt(category_id),
                product_name,
                product_title,
                product_description,
                product_price,
                discount_price,
                product_guide,
                images: {
                    create: imageData
                }
            },
            include: {
                images: true,
                category: true,
                vendor: true
            }
        });

        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Products
const getAllProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                images: true,
                category: true,
                vendor: {
                    select: {
                        name: true,
                        shopName: true
                    }
                }
            }
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Single Product
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { product_id: id },
            include: {
                images: true,
                category: true,
                vendor: true
            }
        });

        if (!product) return res.status(404).json({ error: "Product not found" });

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // Separate images if present, as they need special handling usually, 
        // but for now let's assume we just update scalar fields or handling complexity later.
        // If product_images is passed, we might want to add them or replace them.
        // For simplicity: Update scalar fields.

        const { product_images, ...updateData } = data;

        const updatedProduct = await prisma.product.update({
            where: { product_id: id },
            data: updateData
        });

        // If images provided, maybe add them?
        let newImages = [];

        // From S3 Upload
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                newImages.push({ product_id: id, img_url: file.location });
            });
        }

        // From Body
        if (product_images) {
            let urls = product_images;
            if (!Array.isArray(urls)) urls = [urls];
            urls.forEach(url => newImages.push({ product_id: id, img_url: url }));
        }

        if (newImages.length > 0) {
            await prisma.image.createMany({
                data: newImages
            });
        }

        res.status(200).json({ message: "Product updated", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Cascade delete images
        await prisma.image.deleteMany({ where: { product_id: id } });

        await prisma.product.delete({
            where: { product_id: id }
        });

        res.status(200).json({ message: "Product deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Products by Category
const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await prisma.product.findMany({
            where: { category_id: parseInt(categoryId) },
            include: { images: true }
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Products by Vendor
const getProductsByVendor = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const products = await prisma.product.findMany({
            where: { vendor_id: vendorId },
            include: { images: true }
        });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    getProductsByVendor
};
