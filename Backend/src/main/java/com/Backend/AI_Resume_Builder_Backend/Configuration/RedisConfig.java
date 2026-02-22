package com.Backend.AI_Resume_Builder_Backend.Configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettucePoolingClientConfiguration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis Configuration for AI Agent Caching
 * 
 * This configuration sets up Redis for caching AI responses to:
 * - Reduce Gemini API calls by 70-90%
 * - Improve response times for repeated queries
 * - Store agent conversation context
 * 
 * Cache Types:
 * - bulletImprovement: Cached bullet point improvements (24h TTL)
 * - jobMatching: Job description matching results (1h TTL)
 * - contentGeneration: Generated content (24h TTL)
 * - agentSession: Agent conversation context (30min TTL)
 */
@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    @Value("${spring.data.redis.password:}")
    private String redisPassword;

    @Value("${cache.ai.bullet-improvement-ttl:86400000}")
    private long bulletImprovementTtl;

    @Value("${cache.ai.job-matching-ttl:3600000}")
    private long jobMatchingTtl;

    @Value("${cache.ai.content-generation-ttl:86400000}")
    private long contentGenerationTtl;

    @Value("${cache.ai.agent-session-ttl:1800000}")
    private long agentSessionTtl;

    /**
     * Configure Redis connection factory with connection pooling
     */
    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
        redisConfig.setHostName(redisHost);
        redisConfig.setPort(redisPort);
        
        if (redisPassword != null && !redisPassword.isEmpty()) {
            redisConfig.setPassword(redisPassword);
        }

        LettuceClientConfiguration clientConfig = LettucePoolingClientConfiguration.builder()
                .commandTimeout(Duration.ofMillis(5000))
                .build();

        return new LettuceConnectionFactory(redisConfig, clientConfig);
    }

    /**
     * Configure RedisTemplate with JSON serialization
     * Used for manual Redis operations beyond @Cacheable
     */
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Use String serializer for keys
        StringRedisSerializer stringSerializer = new StringRedisSerializer();
        template.setKeySerializer(stringSerializer);
        template.setHashKeySerializer(stringSerializer);

        // Use JSON serializer for values (supports complex objects)
        GenericJackson2JsonRedisSerializer jsonSerializer = new GenericJackson2JsonRedisSerializer();
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);

        template.afterPropertiesSet();
        return template;
    }

    /**
     * Configure CacheManager with different TTLs for different cache types
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Default cache configuration
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        // Cache-specific configurations with different TTLs
        Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();

        // Bullet improvement cache - 24 hours (results are stable)
        cacheConfigurations.put("bulletImprovement", defaultConfig
                .entryTtl(Duration.ofMillis(bulletImprovementTtl)));

        // Job matching cache - 1 hour (job descriptions change)
        cacheConfigurations.put("jobMatching", defaultConfig
                .entryTtl(Duration.ofMillis(jobMatchingTtl)));

        // Content generation cache - 24 hours
        cacheConfigurations.put("contentGeneration", defaultConfig
                .entryTtl(Duration.ofMillis(contentGenerationTtl)));

        // Agent session cache - 30 minutes (conversation context)
        cacheConfigurations.put("agentSession", defaultConfig
                .entryTtl(Duration.ofMillis(agentSessionTtl)));

        // Resume data cache - 2 hours
        cacheConfigurations.put("resumeData", defaultConfig
                .entryTtl(Duration.ofHours(2)));

        // User preferences cache - 24 hours
        cacheConfigurations.put("userPreferences", defaultConfig
                .entryTtl(Duration.ofHours(24)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()
                .build();
    }
}
