const prisma = require("../config/prisma");

// Add to Wishlist
const addToWishlist = async (req, res) => {
    try {
        const { id } = req.params; // user_id
        const { product_id } = req.body;

        const newItem = await prisma.wishlist.create({
            data: {
                user_id: id,
                product_id
            }
        });

        res.status(201).json({ message: "Added to wishlist", item: newItem });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove from Wishlist
const deleteWishlistItem = async (req, res) => {
    try {
        const { wishlistId } = req.params;

        await prisma.wishlist.delete({
            where: { wishlist_id: parseInt(wishlistId) }
        });

        res.status(200).json({ message: "Removed from wishlist" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    addToWishlist,
    deleteWishlistItem
};
