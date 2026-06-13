package com.Backend.AI_Resume_Builder_Backend.gateway;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.Backend.AI_Resume_Builder_Backend.gateway")
public class GatewayApplication {

    public static void main(String[] args) {
        System.setProperty("java.net.preferIPv4Stack", "false");
        loadDotEnv();
        SpringApplication.run(GatewayApplication.class, args);
    }

    private static void loadDotEnv() {
        Path path = Paths.get(".env");
        if (!Files.exists(path)) {
            path = Paths.get("../.env");
        }
        if (Files.exists(path)) {
            try {
                List<String> lines = Files.readAllLines(path);
                for (String line : lines) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                        continue;
                    }
                    String[] parts = line.split("=", 2);
                    String key = parts[0].trim();
                    String value = parts[1].trim();
                    if (System.getProperty(key) == null) {
                        System.setProperty(key, value);
                    }
                }
                System.out.println("Loaded environment variables from " + path.toAbsolutePath());
            } catch (IOException e) {
                System.err.println("Failed to load .env file: " + e.getMessage());
            }
        }
    }
}
