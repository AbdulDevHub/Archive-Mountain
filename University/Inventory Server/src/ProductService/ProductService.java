package ProductService;

import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.util.HashMap;
import java.io.*;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

import java.util.Map;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 * The ProductService class is the main class for the product service.
 * It contains the main method and the ProductHandler class.
 */
public class ProductService {

    /**
     * Adding to javadoc does not complain about missing constructor.
     */
    public ProductService() {
    }

    /**
     * In-memory data structure to store product entries.
     */
    public static Map<Integer, ProductEntry> entries = new HashMap<>();
    /**
     * The name of the service.
     */
    public static String serviceName = "ProductService";
    /**
     * The path to the file where the data is persisted.
     */
    public static String filePath = "ProductsTable.txt";

    /**
     * The main method for the product service.
     * It reads the configuration file and starts the server.
     *
     * @param args Usage: java ProductService args[0]
     * 
     * @throws IOException If an I/O error occurs
     */
    public static void main(String[] args) throws IOException {
        if (args.length != 1) {
            System.out.println("Usage: java ProductService <config_file_path>");
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
        server.createContext("/product", new ProductHandler());

        server.setExecutor(null); // creates a default executor
        server.start();

        System.out.println("Product Service started on IP: " + ip + ", PORT: " + port);
    }

    /**
     * The ProductHandler class handles all HTTP requests for the product service.
     * It implements the HttpHandler interface.
     */
    static class ProductHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {

            if ("POST".equals(exchange.getRequestMethod())) {
                JSONObject json = getRequestBody(exchange);

                Float price = null;
                if (json.get("price") != null) {
                    try {
                        price = ((Double) json.get("price")).floatValue();
                    } catch (NumberFormatException | ClassCastException | NullPointerException e) {
                        writeResponse(exchange, 400, "{}");
                        return;
                    }
                }

                Integer quantity = null;
                if (json.get("quantity") != null) {
                    try {
                        quantity = ((Long) json.get("quantity")).intValue();
                    } catch (NumberFormatException | ClassCastException | NullPointerException e) {
                        writeResponse(exchange, 400, "{}");
                        return;
                    }
                }

                String command = null;
                String name = null;
                String description = null;

                int id;
                try {
                    command = (String) json.get("command");

                    // Load persisted data into memory
                    if (command.equals("restart")) {
                        System.out.println("Loading Product Data...");
                        entries = readEntriesFromFile(filePath);
                        writeResponse(exchange, 200, "{\"command\": \"restart\"}");
                        return;
                    }

                    // Persist data
                    if (command.equals("shutdown")) {
                        System.out.println("Persisting Product Data...");
                        persistData();
                        writeResponse(exchange, 200, "{\"command\": \"shutdown\"}");

                        // Close the server
                        System.out.println("Shutting Down Product Service...");
                        exchange.getHttpContext().getServer().stop(0);
                        return;
                    }

                    name = (String) json.get("name");
                    description = (String) json.get("description");
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
                        if (id < 1 || name == null || name.isEmpty() || description == null
                                || description.isEmpty() || price == null || price.floatValue() < 0 || quantity == null
                                || quantity.intValue() < 0) {
                            writeResponse(exchange, 400, "{}");
                            return;
                        }

                        // Check if the product already exists
                        ProductEntry exists = entries.get(id);
                        if (exists != null) {
                            writeResponse(exchange, 409, "{}");
                            return;
                        }

                        // Create the product
                        ProductEntry entry = new ProductEntry(id, name, description, price.floatValue(),
                                quantity.intValue());
                        entries.put(id, entry);

                        writeResponse(exchange, 200, entry.toJSONString());
                        return;
                    }

                    case "update" -> {
                        // Check for valid request body
                        if (id < 1 || (name != null && name.isEmpty()
                                || (description != null && description.isEmpty())
                                || (price != null && price.floatValue() < 0)
                                || (quantity != null && quantity.intValue() < 0))) {
                            writeResponse(exchange, 400, "{}");
                            return;
                        }

                        // Check if the product exists
                        ProductEntry entry = entries.get(id);
                        if (entry == null) {
                            writeResponse(exchange, 404, "{}");
                            return;
                        }

                        // Update the product
                        if (name != null) {
                            entry.setName(name);
                        }
                        if (description != null) {
                            entry.setDescription(description);
                        }
                        if (price != null) {
                            entry.setPrice(price.floatValue());
                        }
                        if (quantity != null) {
                            entry.setQuantity(quantity.intValue());
                        }

                        entries.put(id, entry);
                        writeResponse(exchange, 200, entry.toJSONString());
                        return;
                    }

                    case "delete" -> {
                        // Check for valid request body
                        if (id < 1 || name == null || name.isEmpty() || price == null || price.floatValue() < 0 || quantity == null
                                || quantity.intValue() < 0) {
                            writeResponse(exchange, 400, "{}");
                            return;
                        }

                        // Check if the product already exists
                        ProductEntry ent = entries.get(id);
                        if (ent == null) {
                            writeResponse(exchange, 404, "{}");
                            return;
                        }

                        // Check if all fields match
                        if (!ent.getName().equals(name) || ent.getPrice() != price.floatValue() || ent.getQuantity() != quantity.intValue()) {
                            writeResponse(exchange, 401, "{}");
                            return;
                        }

                        // Delete the product
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

                ProductEntry entry = entries.get(id);
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
            for (Map.Entry<Integer, ProductEntry> entry : entries.entrySet()) {
                ProductEntry ent = entry.getValue();
                writer.write(String.format("%d,%s,%s,%.2f,%d", ent.getId(), ent.getName(),
                        ent.getDescription(), ent.getPrice(), ent.getQuantity()));
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

    private static Map<Integer, ProductEntry> readEntriesFromFile(String filePath) {
        Map<Integer, ProductEntry> entries = new HashMap<>();

        File file = new File(filePath);
        if (file.length() == 0) {
            return entries;
        }

        try (BufferedReader br = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = br.readLine()) != null) {

                String[] parts = line.split(",");
                if (parts.length != 5) {
                    System.err.println("Invalid line in the file: " + line);
                    continue;
                }

                int id = Integer.parseInt(parts[0].trim());
                String name = parts[1].trim();
                String description = parts[2].trim();
                float price = Float.parseFloat(parts[3].trim());
                int quantity = Integer.parseInt(parts[4].trim());

                ProductEntry entry = new ProductEntry(id, name, description, price, quantity);
                entries.put(id, entry);
            }

        } catch (IOException | NumberFormatException e) {
            e.printStackTrace();
        }

        return entries;
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
