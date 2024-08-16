package UserService;

/**
 * The UserEntry class represents a user in the user service.
 * It contains information about the users id, username, email, and hashed
 * password.
 */
public class UserEntry {
    private int id;
    private String username;
    private String email;
    private String password;

    /**
     * Constructor for UserEntry
     * 
     * @param id       The id of the user
     * @param username The username of the user
     * @param email    The email of the user
     * @param password The hashed password of the user
     */
    public UserEntry(int id, String username, String email, String password) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
    }

    /**
     * Returns the id of the user
     * 
     * @return The id of the user
     */
    public int getId() {
        return id;
    }

    /**
     * Returns the username of the user
     * 
     * @return The username of the user
     */
    public String getUsername() {
        return username;
    }

    /**
     * Returns the email of the user
     * 
     * @return The email of the user
     */
    public String getEmail() {
        return email;
    }

    /**
     * Returns the hashed password of the user
     * 
     * @return The hashed password of the user
     */
    public String getPassword() {
        return password;
    }

    /**
     * Updates the id of the user
     * 
     * @param id The id of the user
     */
    public void setId(int id) {
        this.id = id;
    }

    /**
     * Updates the username of the user
     * 
     * @param username The username of the user
     */
    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Updates the email of the user
     * 
     * @param email The email of the user
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Updates the hashed password of the user
     * 
     * @param password The hashed password of the user
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Returns a JSON representation of the user
     * 
     * @return A JSON representation of the user
     */
    public String toJSONString() {
        String jsonResponse = String.format(
                "{\"id\": %d, \"username\": \"%s\", \"email\": \"%s\", \"password\": \"%s\"}", id,
                username, email, password);
        return jsonResponse;
    }
}
