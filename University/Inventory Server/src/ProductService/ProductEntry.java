package ProductService;

/**
 * The ProductEntry class represents a product in the product service.
 * It contains information about the products id, name, description, price, and
 * quantity.
 */
public class ProductEntry {
    private int id;
    private String name;
    private String description;
    private float price;
    private int quantity;

    /**
     * Constructor for ProductEntry
     * 
     * @param id          The id of the product
     * @param name        The name of the product
     * @param description The description of the product
     * @param price       The price of the product
     * @param quantity    The quantity of the product
     */
    public ProductEntry(int id, String name, String description, float price, int quantity) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.quantity = quantity;
    }

    /**
     * Returns the id of the product
     * 
     * @return The id of the product
     */
    public int getId() {
        return id;
    }

    /**
     * Returns the name of the product
     * 
     * @return The name of the product
     */
    public String getName() {
        return name;
    }

    /**
     * Returns the description of the product
     * 
     * @return The description of the product
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * Returns the price of the product
     * 
     * @return The price of the product
     */
    public float getPrice() {
        return price;
    }

    /**
     * Returns the quantity of the product
     * 
     * @return The quantity of the product
     */
    public int getQuantity() {
        return quantity;
    }

    /**
     * Updates the name of the product
     * 
     * @param name The name of the product
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Updates the price of the product
     * 
     * @param price The price of the product
     */
    public void setPrice(float price) {
        this.price = price;
    }

    /**
     * Updates the quantity of the product
     * 
     * @param quantity The quantity of the product
     */
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    /**
     * Updates the description of the product
     * 
     * @param description The description of the product
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Returns a JSON representation of the product
     * 
     * @return A JSON representation of the product
     */
    public String toJSONString() {
        String jsonResponse = String.format(
                "{\"id\": %d, \"name\": \"%s\", \"description\": \"%s\", \"price\": %.2f, \"quantity\": %d}",
                id, name, description, price, quantity);
        return jsonResponse;
    }
}
