package OrderService;

/**
 * The OrderEntry class represents an order in the order service.
 * It contains information about the orders id, product_if, user_id, quantity,
 * and status.
 */
public class OrderEntry {
    private int id;
    private int product_id;
    private int user_id;
    private int quantity;
    private String status;

    /**
     * Constructor for OrderEntry
     * 
     * @param id         The id of the order
     * @param product_id The product_id of the order
     * @param user_id    The user_id of the order
     * @param quantity   The quantity of the order
     * @param status     The status of the order
     */
    public OrderEntry(int id, int product_id, int user_id, int quantity, String status) {
        this.id = id;
        this.product_id = product_id;
        this.user_id = user_id;
        this.quantity = quantity;
        this.status = status;
    }

    /**
     * Returns the id of the order
     * 
     * @return The id of the order
     */
    public int getId() {
        return this.id;
    }

    /**
     * Returns the product_id of the order
     * 
     * @return The product_id of the order
     */
    public int getProductId() {
        return this.product_id;
    }

    /**
     * Returns the user_id of the order
     * 
     * @return The user_id of the order
     */
    public int getUserId() {
        return this.user_id;
    }

    /**
     * Returns the quantity of the order
     * 
     * @return The quantity of the order
     */
    public int getQuantity() {
        return quantity;
    }

    /**
     * Returns the status of the order
     * 
     * @return The status of the order
     */
    public String getStatus() {
        return this.status;
    }

    /**
     * Updates the status of the order
     * 
     * @param status The status of the order
     */
    public void setStatus(String status) {
        this.status = status;
    }

    /**
     * Returns a JSON representation of the order
     * 
     * @return A JSON representation of the order
     */
    public String toJSONString() {
        String jsonResponse = String.format(
                "{\"id\": %d, \"product_id\": %d, \"user_id\": %d, \"quantity\": %d, \"status\": \"%s\"}", id,
                product_id, user_id, quantity, status);
        return jsonResponse;
    }
}
