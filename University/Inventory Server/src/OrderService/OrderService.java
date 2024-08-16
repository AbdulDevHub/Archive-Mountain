package OrderService;

import com.sun.net.httpserver.HttpServer;

import ProductService.ProductEntry;
import UserService.UserEntry;

import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpExchange;

import java.util.HashMap;
import java.util.List;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URL;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;
import java.util.Map;

import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

/**
 * The OrderService class is the main class for the order service.
 * It contains the main method and the handlers for the HTTP requests.
 */
public class OrderService {

    /**
     * Adding to javadoc does not complain about missing constructor.
     */
    public OrderService() {
    }

    /**
     * In-memory data structure to store order entries.
     */
    public static Map<Integer, OrderEntry> entries = new HashMap<>();
    /**
     * In-memory data structure to store product entries that have been retrieved.
     */
    public static Map<Integer, ProductEntry> productEntriesCache = new HashMap<>();
    /**
     * In-memory data structure to store user entries that have been retrieved.
     */
    public static Map<Integer, UserEntry> userEntriesCache = new HashMap<>();
    /**
     * The name of the service.
     */
    public static String serviceName = "OrderService";
    /**
     * The path to the file where the data is persisted.
     */
    public static String filePath = "OrdersTable.txt";
    /**
     * The name of the proxy service.
     */
    public static String ProxyName = "InterServiceCommunication";
    /**
     * The IP of the order service.
     */
    public static String orderIP;
    /**
     * The IP of the proxy service.
     */
    public static String proxyIP;
    /**
     * The port of the order service.
     */
    public static int orderPort;
    /**
     * The port of the proxy service.
     */
    public static int proxyPort;

    /**
     * The main method for the order service.
     * It reads the configuration file and starts the server.
     *
     * @param args Usage: java OrderService args[0]
     * 
     * @throws IOException If an I/O error occurs
     */
    public static void main(String[] args) throws IOException {
        if (args.length != 1) {
            System.out.println("Usage: java OrderService <config_file_path>");
            System.exit(1);
        }

        String configFilePath = args[0];

        JSONObject configs = getConfigs(serviceName, configFilePath);
        JSONObject proxyConfigs = getConfigs(ProxyName, configFilePath);

        // Get IP and port
        try {
            orderIP = (String) configs.get("ip");
            orderPort = ((Long) configs.get("port")).intValue();
            proxyIP = (String) proxyConfigs.get("ip");
            proxyPort = ((Long) proxyConfigs.get("port")).intValue();
        } catch (NumberFormatException | ClassCastException | NullPointerException e) {
            System.out.println("Invalid configs");
            System.exit(1);
            return;
        }

        if (orderIP == null || orderIP.isEmpty() || orderPort < 1 || proxyIP == null || proxyIP.isEmpty()
                || proxyPort < 1) {
            System.out.println("Invalid service configuration");
            System.exit(1);
        }

        HttpServer server = HttpServer.create(new InetSocketAddress(orderIP, orderPort), 0);
        // Example: Set a custom executor with a fixed-size thread pool
        server.setExecutor(Executors.newFixedThreadPool(20)); // Adjust the pool size as needed
        server.createContext("/order", new OrderHandler());
        server.createContext("/user", new UserHandler());
        server.createContext("/product", new ProductHandler());
        server.createContext("/user/purchased", new UserPurchasedHandler());

        server.setExecutor(null); // creates a default executor
        server.start();

        System.out.println("Product Service started on IP: " + orderIP + ", PORT: " + orderPort);
    }

    /**
     * The OrderHandler class handles all HTTP requests for the order service.
     * It implements the HttpHandler interface.
     */
    static class OrderHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {

            if (!"POST".equals(exchange.getRequestMethod())) {
                writeResponse(exchange, 405, "{\"status\": \"Invalid Request\"}");
                return;
            }

            JSONObject json = getRequestBody(exchange, true);

            // Command cases
            String command = null;
            try {
                command = (String) json.get("command");

                // Load persisted data into memory
                if (command.equals("restart")) {
                    System.out.println("Loading Order Data...");
                    entries = readEntriesFromFile(filePath);

                    // Call restart on user and product services
                    String reqCommand = "{\"command\": \"restart\"}";
                    HttpURLConnection userConn = null;
                    try {
                        URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/user/");
                        userConn = (HttpURLConnection) url.openConnection();
                        userConn.setRequestMethod("POST");
                        userConn.setRequestProperty("Content-Type", "application/json");
                        userConn.setRequestProperty("Accept", "application/json");
                        userConn.setDoOutput(true);
                        try (OutputStream os = userConn.getOutputStream()) {
                            byte[] input = reqCommand.getBytes("utf-8");
                            os.write(input, 0, input.length);
                        }
                    } catch (IOException e) {
                        writeResponse(exchange, 500, "{\"status\": \"Invalid Request\"}");
                        return;
                    }

                    int userResponse = userConn.getResponseCode();
                    if (userResponse != 200) {
                        writeResponse(exchange, userResponse, "{\"status\": \"Invalid Request\"}");
                        return;
                    }

                    HttpURLConnection productConn = null;
                    try {
                        URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/product/");
                        productConn = (HttpURLConnection) url.openConnection();
                        productConn.setRequestMethod("POST");
                        productConn.setRequestProperty("Content-Type", "application/json");
                        productConn.setRequestProperty("Accept", "application/json");
                        productConn.setDoOutput(true);
                        try (OutputStream os = productConn.getOutputStream()) {
                            byte[] input = reqCommand.getBytes("utf-8");
                            os.write(input, 0, input.length);
                        }
                    } catch (IOException e) {
                        writeResponse(exchange, 500, "{\"status\": \"Invalid Request\"}");
                        return;
                    }

                    int productResponse = productConn.getResponseCode();
                    if (productResponse != 200) {
                        writeResponse(exchange, productResponse, "{\"status\": \"Invalid Request\"}");
                        return;
                    }

                    writeResponse(exchange, 200, reqCommand);
                    return;
                }

                // Persist data
                if (command.equals("shutdown")) {
                    System.out.println("Persisting Order Data...");
                    persistData();

                    // Call shutdown on user and product services
                    String reqCommand = "{\"command\": \"shutdown\"}";
                    HttpURLConnection userConn = null;
                    try {
                        URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/user/");
                        userConn = (HttpURLConnection) url.openConnection();
                        userConn.setRequestMethod("POST");
                        userConn.setRequestProperty("Content-Type", "application/json");
                        userConn.setRequestProperty("Accept", "application/json");
                        userConn.setDoOutput(true);
                        try (OutputStream os = userConn.getOutputStream()) {
                            byte[] input = reqCommand.getBytes("utf-8");
                            os.write(input, 0, input.length);
                        }
                    } catch (IOException e) {
                        writeResponse(exchange, 500, "{\"status\": \"Invalid Request\"}");
                        return;
                    }

                    int userResponse = userConn.getResponseCode();
                    if (userResponse != 200) {
                        writeResponse(exchange, userResponse, "{\"status\": \"Invalid Request\"}");
                        return;
                    }

                    HttpURLConnection productConn = null;
                    try {
                        URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/product/");
                        productConn = (HttpURLConnection) url.openConnection();
                        productConn.setRequestMethod("POST");
                        productConn.setRequestProperty("Content-Type", "application/json");
                        productConn.setRequestProperty("Accept", "application/json");
                        productConn.setDoOutput(true);
                        try (OutputStream os = productConn.getOutputStream()) {
                            byte[] input = reqCommand.getBytes("utf-8");
                            os.write(input, 0, input.length);
                        }
                    } catch (IOException e) {
                        writeResponse(exchange, 500, "{\"status\": \"Invalid Request\"}");
                        return;
                    }

                    int productResponse = productConn.getResponseCode();
                    if (productResponse != 200) {
                        writeResponse(exchange, productResponse, "{\"status\": \"Invalid Request\"}");
                        return;
                    }

                    // Shutdown proxy service
                    HttpClient client = HttpClient.newHttpClient();
                    HttpRequest request = HttpRequest.newBuilder()
                            .uri(URI.create("http://" + proxyIP + ":" + proxyPort + "/shutdown/"))
                            .POST(HttpRequest.BodyPublishers.ofString(reqCommand))
                            .header("Content-Type", "application/json")
                            .header("Accept", "application/json")
                            .build();

                    client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                            .thenApply(HttpResponse::body)
                            .exceptionally(e -> "Error occurred: " + e.getMessage());

                    writeResponse(exchange, 200, reqCommand);

                    // Close the server
                    System.out.println("Shutting Down Order Service...");
                    exchange.getHttpContext().getServer().stop(0);
                    return;
                }

                // Check order command
                if (!command.equals("place order")) {
                    writeResponse(exchange, 400, "{\"status\": \"Invalid Request\"}");
                    return;
                }

            } catch (NumberFormatException | ClassCastException | NullPointerException e) {
                writeResponse(exchange, 400, "{\"status\": \"Invalid Request\"}");
                return;
            }

            int productId;
            int userId;
            int quantity;

            try {
                productId = ((Long) json.get("product_id")).intValue();
                userId = ((Long) json.get("user_id")).intValue();
                quantity = ((Long) json.get("quantity")).intValue();
            } catch (NumberFormatException | ClassCastException | NullPointerException e) {
                writeResponse(exchange, 400, "{\"status\": \"Invalid Request\"}");
                return;
            }

            // Generate order ID randomly not in use
            int orderId = 0;
            while (true) {
                orderId = (int) (Math.random() * 1000000);
                if (!entries.containsKey(orderId)) {
                    break;
                }
            }

            // Create order entry to handle early returns
            OrderEntry orderEntry = new OrderEntry(orderId, productId, userId, quantity, "Invalid Request");

            if (productId < 1 || userId < 1 || quantity < 1) {
                entries.put(orderId, orderEntry);
                writeResponse(exchange, 400, "{\"status\": \"Invalid Request\"}");
                return;
            }

            // Check if product exists in cache
            ProductEntry productEntry = productEntriesCache.get(productId);
            if (productEntry == null) {
                System.out.println("Product Cache Miss");

                // Check if product exists in product service
                HttpURLConnection conn = null;
                try {
                    URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/product/" + productId);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                } catch (IOException e) {
                    entries.put(orderId, orderEntry);
                    writeResponse(exchange, 500, "{\"status\": \"Invalid Request\"}");
                    return;
                }

                int responseCode = conn.getResponseCode();
                if (responseCode != 200) {
                    entries.put(orderId, orderEntry);
                    writeResponse(exchange, responseCode, "{\"status\": \"Invalid Request\"}");
                    return;
                }

                // Parse response and assume valid object
                InputStream stream = conn.getInputStream();
                StringBuilder response = new StringBuilder();
                JSONObject productJson = null;
                try (BufferedReader br = new BufferedReader(new InputStreamReader(stream, "utf-8"))) {
                    String responseLine = null;
                    while ((responseLine = br.readLine()) != null) {
                        response.append(responseLine.trim());
                    }
                    try {
                        productJson = (JSONObject) new JSONParser().parse(response.toString());
                    } catch (ParseException e) {
                        System.out.println("Error parsing JSON response");
                        entries.put(orderId, orderEntry);
                        writeResponse(exchange, 500, "{\"status\": \"Invalid Request\"}");
                        return;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    entries.put(orderId, orderEntry);
                    writeResponse(exchange, 400, "{\"status\": \"Invalid Request\"}");
                    return;
                }

                int pId = ((Long) productJson.get("id")).intValue();
                String pName = (String) productJson.get("name");
                String pDescription = (String) productJson.get("description");
                float pPrice = ((Double) productJson.get("price")).floatValue();
                int pQuantity = ((Long) productJson.get("quantity")).intValue();

                productEntry = new ProductEntry(pId, pName, pDescription, pPrice, pQuantity);

                // Update cache
                productEntriesCache.put(pId, productEntry);

            } else {
                System.out.println("Product Cache Hit");
            }

            // Check if product is available
            if (productEntry.getQuantity() < quantity) {
                orderEntry.setStatus("Exceeded quantity limit");
                entries.put(orderId, orderEntry);
                writeResponse(exchange, 409, "{\"status\": \"Exceeded quantity limit\"}");
                return;
            }

            // Check if user exists in cache
            UserEntry userEntry = userEntriesCache.get(userId);
            if (userEntry == null) {
                System.out.println("User Cache Miss");

                // Check if user exists in user service
                HttpURLConnection conn = null;
                try {
                    URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/user/" + userId);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("GET");
                } catch (IOException e) {
                    entries.put(orderId, orderEntry);
                    writeResponse(exchange, 500, "{\"status\": \"Invalid Request\"}");
                    return;
                }

                int responseCode = conn.getResponseCode();
                if (responseCode != 200) {
                    entries.put(orderId, orderEntry);
                    writeResponse(exchange, responseCode, "{\"status\": \"Invalid Request\"}");
                    return;
                }

                // Parse response and assume valid object
                InputStream stream = conn.getInputStream();
                StringBuilder response = new StringBuilder();
                JSONObject userJson = null;
                try (BufferedReader br = new BufferedReader(new InputStreamReader(stream, "utf-8"))) {
                    String responseLine = null;
                    while ((responseLine = br.readLine()) != null) {
                        response.append(responseLine.trim());
                    }
                    try {
                        userJson = (JSONObject) new JSONParser().parse(response.toString());
                    } catch (ParseException e) {
                        System.out.println("Error parsing JSON response");
                        entries.put(orderId, orderEntry);
                        writeResponse(exchange, 500, "{\"status\": \"Invalid Request\"}");
                        return;
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                    entries.put(orderId, orderEntry);
                    writeResponse(exchange, 400, "{\"status\": \"Invalid Request\"}");
                    return;
                }

                int uId = ((Long) userJson.get("id")).intValue();
                String uUsername = (String) userJson.get("username");
                String uEmail = (String) userJson.get("email");
                String uPassword = (String) userJson.get("password");

                userEntry = new UserEntry(uId, uUsername, uEmail, uPassword);

                // Update cache
                userEntriesCache.put(uId, userEntry);

            } else {
                System.out.println("User Cache Hit");
            }

            // Update product quantity
            productEntry.setQuantity(productEntry.getQuantity() - quantity);
            String productUpdateReq = String.format(
                    "{\"command\": \"%s\", \"id\": %d, \"quantity\": %d}", "update", productEntry.getId(),
                    productEntry.getQuantity());

            HttpURLConnection conn = null;
            try {
                URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/product/");
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Accept", "application/json");
                conn.setDoOutput(true);
                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = productUpdateReq.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }
            } catch (IOException e) {
                entries.put(orderId, orderEntry);
                writeResponse(exchange, 500, "{\"status\": \"Invalid Request\"}");
                return;
            }

            int responseCode = conn.getResponseCode();
            if (responseCode != 200) {
                entries.put(orderId, orderEntry);
                writeResponse(exchange, responseCode, "{\"status\": \"Invalid Request\"}");
                return;
            }

            // Create order entry
            productEntriesCache.put(productEntry.getId(), productEntry);
            orderEntry.setStatus("Success");
            entries.put(orderId, orderEntry);

            writeResponse(exchange, 200, orderEntry.toJSONString());
        }
    }

    static class UserPurchasedHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equals(exchange.getRequestMethod())) {
                writeResponse(exchange, 405, "{}");
                return;
            }

            String requestURI = exchange.getRequestURI().toString();
            String[] parts = requestURI.split("/");
            int userId;
            try {
                userId = Integer.parseInt(parts[parts.length - 1]);
            } catch (NumberFormatException e) {
                writeResponse(exchange, 400, "{\"status\": \"Invalid User ID\"}");
                return;
            }

            List<OrderEntry> userOrders = entries.values().stream()
                .filter(entry -> entry.getUserId() == userId && !"Invalid Request".equals(entry.getStatus()))
                .collect(Collectors.toList());

            if (userOrders.isEmpty()) {
                // Before returning an empty JSON, check if the user exists in the user service
                UserEntry userEntry = userEntriesCache.get(userId);
                if (userEntry == null) {
                    System.out.println("User Cache Miss");

                    // Check if user exists in user service
                    HttpURLConnection conn = null;
                    try {
                        URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/user/" + userId);
                        conn = (HttpURLConnection) url.openConnection();
                        conn.setRequestMethod("GET");
                    } catch (IOException e) {
                        writeResponse(exchange, 500, "{\"status\": \"Invalid Request\"}");
                        return;
                    }

                    int responseCode = conn.getResponseCode();
                    if (responseCode != 200) {
                        writeResponse(exchange, responseCode, "{\"status\": \"Invalid Request\"}");
                        return;
                    }

                    // User exists, but no purchases
                    writeResponse(exchange, 200, "{}");
                    return;
                } else {
                    System.out.println("User Cache Hit");
                }
            }
            
            Map<Integer, Integer> purchases = new HashMap<>();
            for (OrderEntry entry : userOrders) {
                purchases.put(entry.getProductId(), purchases.getOrDefault(entry.getProductId(), 0) + entry.getQuantity());
            }

            JSONObject json = new JSONObject(purchases);
            writeResponse(exchange, 200, json.toJSONString());

        }
    }

    /**
     * The UserHandler class handles all HTTP requests for the user service.
     * It implements the HttpHandler interface.
     */
    static class UserHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {

            // Check supported methods
            if (!"POST".equals(exchange.getRequestMethod()) && !"GET".equals(exchange.getRequestMethod())) {
                writeResponse(exchange, 405, "{}");
                return;
            }

            HttpURLConnection conn = null;
            

            if ("POST".equals(exchange.getRequestMethod())) {
                JSONObject json = getRequestBody(exchange, false);
                URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/user");
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Accept", "application/json");
                conn.setDoOutput(true);
                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = json.toString().getBytes("utf-8");
                    os.write(input, 0, input.length);
                }
            } else if ("GET".equals(exchange.getRequestMethod())) {
                String requestURI = exchange.getRequestURI().toString();
                String[] parts = requestURI.split("/");
                String id = parts[parts.length - 1];
                URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/user/" + id);
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
            }

            int responseCode = conn.getResponseCode();
            InputStream stream = responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream();
            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(stream, "utf-8"))) {
                String responseLine = null;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            } catch (Exception e) {
                e.printStackTrace();
                writeResponse(exchange, 400, "{}");
                return;
            }

            // Invalidate existing cache
            if (responseCode == 200 && "POST".equals(exchange.getRequestMethod())) {
                userEntriesCache.clear();
            }

            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(responseCode, response.length());
            OutputStream os = exchange.getResponseBody();
            os.write(response.toString().getBytes());
            os.close();
        }
    }

    /**
     * The ProductHandler class handles all HTTP requests for the product service.
     * It implements the HttpHandler interface.
     */
    static class ProductHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {

            // Check supported methods
            if (!"POST".equals(exchange.getRequestMethod()) && !"GET".equals(exchange.getRequestMethod())) {
                writeResponse(exchange, 405, "{}");
                return;
            }

            HttpURLConnection conn = null;

            if ("POST".equals(exchange.getRequestMethod())) {
                JSONObject json = getRequestBody(exchange, false);
                URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/product");
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("POST");
                conn.setRequestProperty("Content-Type", "application/json");
                conn.setRequestProperty("Accept", "application/json");
                conn.setDoOutput(true);
                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = json.toString().getBytes("utf-8");
                    os.write(input, 0, input.length);
                }
            } else if ("GET".equals(exchange.getRequestMethod())) {
                String requestURI = exchange.getRequestURI().toString();
                String[] parts = requestURI.split("/");
                String id = parts[parts.length - 1];
                URL url = new URL("http://" + proxyIP + ":" + proxyPort + "/product/" + id);
                conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
            }

            int responseCode = conn.getResponseCode();
            InputStream stream = responseCode >= 400 ? conn.getErrorStream() : conn.getInputStream();
            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(stream, "utf-8"))) {
                String responseLine = null;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
            } catch (Exception e) {
                e.printStackTrace();
                writeResponse(exchange, 400, "{}");
                return;
            }

            // Invalidate existing cache
            if (responseCode == 200 && "POST".equals(exchange.getRequestMethod())) {
                productEntriesCache.clear();
            }

            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(responseCode, response.length());
            OutputStream os = exchange.getResponseBody();
            os.write(response.toString().getBytes());
            os.close();
        }
    }

    private static void persistData() {
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            for (Map.Entry<Integer, OrderEntry> entry : entries.entrySet()) {
                OrderEntry ent = entry.getValue();
                writer.write(String.format("%d,%d,%d,%d,%s", ent.getId(), ent.getProductId(), ent.getUserId(),
                        ent.getQuantity(), ent.getStatus()));
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

    private static Map<Integer, OrderEntry> readEntriesFromFile(String filePath) {
        Map<Integer, OrderEntry> entries = new HashMap<>();

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
                int product_id = Integer.parseInt(parts[1].trim());
                int user_id = Integer.parseInt(parts[2].trim());
                int quantity = Integer.parseInt(parts[3].trim());
                String status = parts[4].trim();

                OrderEntry entry = new OrderEntry(id, product_id, user_id, quantity, status);
                entries.put(id, entry);
            }

        } catch (IOException | NumberFormatException e) {
            e.printStackTrace();
        }

        return entries;
    }

    private static JSONObject getRequestBody(HttpExchange exchange, boolean order) throws IOException {
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
                writeResponse(exchange, 400, order ? "{\"status\": \"Invalid Request\"}" : "{}");
                return null;
            }

            return json;
        } catch (IOException e) {
            System.out.println("Error reading request body");
            writeResponse(exchange, 400, order ? "{\"status\": \"Invalid Request\"}" : "{}");
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
