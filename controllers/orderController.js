const prisma = require("../config/prisma");
const { v4: uuidv4 } = require('uuid');

// Create Order (User)
const createOrder = async (req, res) => {
    try {
        const { user_id } = req.body; // In a real app, get this from auth token

        // 1. Get User's Cart
        const cartItems = await prisma.cart.findMany({
            where: { user_id },
            include: {
                product: {
                    include: {
                        vendor: true
                    }
                }
            }
        });

        if (cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // 2. Calculate Total
        let total_amount = 0;
        const orderItemsData = cartItems.map(item => {
            const price = parseFloat(item.product.product_price); // Snapshot price
            const quantity = item.quantity;
            total_amount += price * quantity;

            return {
                product_id: item.product_id,
                vendor_id: item.product.vendor_id,
                price: price,
                quantity: quantity
            };
        });

        // 3. Create Order and OrderItems in a transaction
        // Note: Prisma operations in a loop should be part of a transaction or careful logic
        // We will use nested create for orderItems

        const newOrder = await prisma.order.create({
            data: {
                user_id,
                total_amount,
                orderItems: {
                    create: orderItemsData
                }
            },
            include: {
                orderItems: true
            }
        });

        // 4. Clear Cart
        await prisma.cart.deleteMany({
            where: { user_id }
        });

        res.status(201).json({ message: "Order placed successfully", order: newOrder });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// Get All Orders (Admin)
const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true, // Include user details
                orderItems: {
                    include: {
                        product: true,
                        vendor: true // Admin might want to know which vendor
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Vendor Orders (Vendor)
// Shows orders that contain products from this vendor, but ONLY shows the items belonging to this vendor.
const getVendorOrders = async (req, res) => {
    try {
        const { vendorId } = req.params;

        // Find OrderItems for this vendor
        const items = await prisma.orderItem.findMany({
            where: { vendor_id: vendorId },
            include: {
                order: {
                    include: {
                        user: {
                            include: {
                                addresses: true // Assuming we want to show where to ship
                            }
                        }
                    }
                },
                product: {
                    include: {
                        images: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Group by Order to make it look like "Orders"
        const ordersMap = new Map();

        items.forEach(item => {
            if (!ordersMap.has(item.order_id)) {
                ordersMap.set(item.order_id, {
                    order_id: item.order.order_id,
                    user: item.order.user,
                    payment_status: item.order.payment_status, // Overall order status
                    order_date: item.order.createdAt,
                    vendor_items: [],
                    vendor_total: 0
                });
            }
            const orderView = ordersMap.get(item.order_id);
            orderView.vendor_items.push({
                item_id: item.order_item_id,
                product: item.product,
                quantity: item.quantity,
                price: item.price,
                status: item.status
            });
            orderView.vendor_total += (parseFloat(item.price) * item.quantity);
        });

        const result = Array.from(ordersMap.values());

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Order Status (Admin)
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const updated = await prisma.order.update({
            where: { order_id: orderId },
            data: { order_status: status }
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Order Item Status (Vendor)
const updateOrderItemStatus = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { status } = req.body;

        const updated = await prisma.orderItem.update({
            where: { order_item_id: itemId },
            data: { status: status }
        });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createOrder,
    getAllOrders,
    getVendorOrders,
    updateOrderStatus,
    updateOrderItemStatus
};
