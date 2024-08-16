package UserService;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.math.BigInteger;
import java.util.HashMap;
import java.io.*;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import java.util.Map;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 * The UserService class is the main class for the user service.
 * It contains the main method and the UserHandler class.
 */
public class UserService {

    /**
     * Adding to javadoc does not complain about missing constructor.
     */
    public UserService() {
    }

    /**
     * In-memory data structure to store user entries.
     */
    public static Map<Integer, UserEntry> entries = new HashMap<>();
    /**
     * The name of the service.
     */
    public static String serviceName = "UserService";
    /**
     * The path to the file where the data is persisted.
     */
    public static String filePath = "UsersTable.txt";

    /**
     * The main method for the user service.
     * It reads the configuration file and starts the server.
     *
     * @param args Usage: java UserService args[0]
     * 
     * @throws IOException If an I/O error occurs
     */
    public static void main(String[] args) throws IOException {
        if (args.length != 1) {
            System.out.println("Usage: java UserService <config_file_path>");
            System.exit(1);
        }

        String configFilePath = args[0];

        JSONObject configs = getConfigs(serviceName, configFilePath);

        // Get IP and port
        String ip = (String) configs.get("ip");
        int port;
        try {
            port = ((Long) configs.get("port")).intValue();
        } catch (NumberFormatException | ClassCastException | NullPointerException e) {
            System.out.println("Invalid port: " + configs.get("port"));
            System.exit(1);
            return;
        }

        if (ip == null || ip.isEmpty() || port == 0) {
            System.out.println("Invalid service configuration");
            System.exit(1);
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(ip, port), 0);
        // Example: Set a custom executor with a fixed-size thread pool
        server.setExecutor(Executors.newFixedThreadPool(20)); // Adjust the pool size as needed
        server.createContext("/user", new UserHandler());

        server.setExecutor(null); // creates a default executor
        server.start();

        System.out.println("User Service started on IP: " + ip + ", PORT: " + port);
    }

    /**
     * The UserHandler class handles all HTTP requests for the user service.
     * It implements the HttpHandler interface.
     */
    static class UserHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {

            if ("POST".equals(exchange.getRequestMethod())) {
                JSONObject json = getRequestBody(exchange);

                String command = null;
                String username = null;
                String email = null;
                String password = null;
                int id;
                try {
                    command = (String) json.get("command");

                    // Load persisted data into memory
                    if (command.equals("restart")) {
                        System.out.println("Loading User Data...");
                        entries = readEntriesFromFile(filePath);
                        writeResponse(exchange, 200, "{\"command\": \"restart\"}");
                        return;
                    }

                    // Persist data
                    if (command.equals("shutdown")) {
                        System.out.println("Persisting User Data...");
                        persistData();
                        writeResponse(exchange, 200, "{\"command\": \"shutdown\"}");

                        // Close the server
                        System.out.println("Shutting Down User Service...");
                        exchange.getHttpContext().getServer().stop(0);
                        return;
                    }

                    username = (String) json.get("username");
                    email = (String) json.get("email");
                    password = (String) json.get("password");
                    if (json.get("id") == null) {
                        writeResponse(exchange, 400, "{}");
                        return;
                    }
                    id = ((Long) json.get("id")).intValue();
                } catch (NumberFormatException | ClassCastException | NullPointerException e) {
                    writeResponse(exchange, 400, "{}");
                    return;
                }

                switch (command) {
                    case "create" -> {
                        // Check for valid request body
                        if (id < 1 || username == null || username.isEmpty() || email == null || email.isEmpty()
                                || password == null || password.isEmpty() || username == "''" || email == "''" || password == "''") {
                            writeResponse(exchange, 400, "{}");
                            return;
                        }

                        // Check if the user already exists
                        UserEntry exists = entries.get(id);
                        if (exists != null) {
                            writeResponse(exchange, 409, "{}");
                            return;
                        }

                        // Create the user
                        password = sha256(password).toUpperCase();
                        UserEntry entry = new UserEntry(id, username, email, password);
                        entries.put(id, entry);

                        writeResponse(exchange, 200, entry.toJSONString());
                        return;
                    }

                    case "update" -> {
                        // Check for valid request body
                        if (id < 1 || (username != null && username.isEmpty() && username != "''") || (email != null && email.isEmpty() && email != "''")
                                || (password != null && password.isEmpty()) && password != "''") {
                            writeResponse(exchange, 400, "{}");
                            return;
                        }

                        // Check if the user exists
                        UserEntry entry = entries.get(id);
                        if (entry == null) {
                            writeResponse(exchange, 404, "{}");
                            return;
                        }

                        // Update the user
                        if (username != null && username != "''"){
                            entry.setUsername(username);
                        }
                        if (email != null && email != "''") {
                            entry.setEmail(email);
                        }
                        if (password != null && password != "''") {
                            password = sha256(password);
                            entry.setPassword(password);
                        }

                        entries.put(id, entry);
                        writeResponse(exchange, 200, entry.toJSONString());
                        return;
                    }

                    case "delete" -> {
                        // Check for valid request body
                        if (id < 1 || username == null || username.isEmpty() || email == null || email.isEmpty()
                                || password == null || password.isEmpty()) {
                            writeResponse(exchange, 400, "{}");
                            return;
                        }

                        // Check if the user already exists
                        UserEntry ent = entries.get(id);
                        if (ent == null) {
                            writeResponse(exchange, 404, "{}");
                            return;
                        }

                        password = sha256(password);

                        // Check if all fields match
                        if (!username.equals(ent.getUsername()) || !email.equals(ent.getEmail())
                                || !password.equals(ent.getPassword())) {
                            writeResponse(exchange, 401, "{}");
                            return;
                        }

                        // Delete the user
                        entries.remove(id);
                        writeResponse(exchange, 200, "{}");
                        return;
                    }

                    default -> {
                        writeResponse(exchange, 400, "{}");
                        return;
                    }
                }

            } else if ("GET".equals(exchange.getRequestMethod())) {
                String requestUri = exchange.getRequestURI().toString();
                String[] parts = requestUri.split("/");
                String idString = parts[parts.length - 1];
                int id = 0;

                try {
                    id = Integer.parseInt(idString);
                } catch (NumberFormatException e) {
                    writeResponse(exchange, 400, "{}");
                    return;
                }

                if (id < 1) {
                    writeResponse(exchange, 400, "{}");
                    return;
                }

                UserEntry entry = entries.get(id);
                if (entry == null) {
                    writeResponse(exchange, 404, "{}");
                    return;
                }

                writeResponse(exchange, 200, entry.toJSONString());
                return;

            } else {
                writeResponse(exchange, 405, "{}");
                return;
            }
        }
    }

    private static void persistData() {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            for (Map.Entry<Integer, UserEntry> entry : entries.entrySet()) {
                UserEntry ent = entry.getValue();
                writer.write(String.format("%s,%s,%s,%s", entry.getKey(), ent.getUsername(), ent.getEmail(),
                        ent.getPassword()));
                writer.newLine();
            }
        } catch (IOException e) {
            System.out.println("Error writing to file: " + e.getMessage());
        }
    }

    private static JSONObject getConfigs(String serviceName, String configFilePath) {
        JSONObject json;
        try {
            Object obj = new JSONParser().parse(new FileReader(configFilePath));
            json = (JSONObject) obj;
        } catch (FileNotFoundException e) {
            System.out.println("Configuration file not found: " + configFilePath);
            System.exit(1);
            return null;
        } catch (IOException | ParseException e) {
            System.out.println("Error reading configuration file: " + configFilePath);
            System.exit(1);
            return null;
        }

        // Get service configs
        JSONObject configs = (JSONObject) json.get(serviceName);
        if (configs == null) {
            System.out.println("Config not found for service: " + serviceName);
            System.exit(1);
            return null;
        }

        return configs;
    }

    private static Map<Integer, UserEntry> readEntriesFromFile(String filePath) {
        Map<Integer, UserEntry> entries = new HashMap<>();

        File file = new File(filePath);
        if (file.length() == 0) {
            return entries;
        }

        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = br.readLine()) != null) {

                String[] parts = line.split(",");
                if (parts.length != 4) {
                    System.err.println("Invalid line in the file: " + line);
                    continue;
                }

                int id = Integer.parseInt(parts[0].trim());
                String username = parts[1].trim();
                String email = parts[2].trim();
                String password = parts[3].trim();

                UserEntry entry = new UserEntry(id, username, email, password);
                entries.put(id, entry);
            }

        } catch (IOException | NumberFormatException e) {
            e.printStackTrace();
        }

        return entries;
    }

    private static String sha256(String text) {
        try {
            MessageDigest messageDigest = MessageDigest.getInstance("SHA-256");
            byte[] hash = messageDigest.digest(text.getBytes(StandardCharsets.UTF_8));
            return String.format("%064x", new BigInteger(1, hash));
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return null;
        }
    }

    private static JSONObject getRequestBody(HttpExchange exchange) throws IOException {
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(exchange.getRequestBody(), StandardCharsets.UTF_8))) {
            StringBuilder requestBody = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                requestBody.append(line);
            }

            JSONParser parser = new JSONParser();

            JSONObject json = null;
            try {
                json = (JSONObject) parser.parse(requestBody.toString());
            } catch (ParseException e) {
                System.out.println("Error parsing JSON request body");
                writeResponse(exchange, 400, "{}");
                return null;
            }

            return json;
        } catch (IOException e) {
            System.out.println("Error reading request body");
            writeResponse(exchange, 400, "{}");
            return null;
        }
    }

    private static void writeResponse(HttpExchange exchange, int code, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(code, response.length());

        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }
}
