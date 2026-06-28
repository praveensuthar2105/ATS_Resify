package com.Backend.AI_Resume_Builder_Backend.config;

import com.Backend.AI_Resume_Builder_Backend.messaging.RabbitMQConstants;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ infrastructure beans for intelligence-service.
 * Mirrors the queue/exchange declarations from resume-service
 * so both sides agree on the topology.
 */
@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange resifyExchange() {
        return ExchangeBuilder.topicExchange(RabbitMQConstants.EXCHANGE)
                .durable(true)
                .build();
    }

    @Bean
    public DirectExchange deadLetterExchange() {
        return ExchangeBuilder.directExchange(RabbitMQConstants.DLX_EXCHANGE)
                .durable(true)
                .build();
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(RabbitMQConstants.DLQ_QUEUE).build();
    }

    @Bean
    public Binding dlqBinding() {
        return BindingBuilder.bind(deadLetterQueue())
                .to(deadLetterExchange())
                .with("dead-letter");
    }

    @Bean
    public Queue atsScoreRequestQueue() {
        return QueueBuilder.durable(RabbitMQConstants.ATS_SCORE_REQUEST_QUEUE)
                .withArgument("x-dead-letter-exchange", RabbitMQConstants.DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", "dead-letter")
                .build();
    }

    @Bean
    public Binding atsScoreRequestBinding() {
        return BindingBuilder.bind(atsScoreRequestQueue())
                .to(resifyExchange())
                .with(RabbitMQConstants.ATS_SCORE_REQUEST_KEY);
    }

    @Bean
    public Queue atsScoreResultQueue() {
        return QueueBuilder.durable(RabbitMQConstants.ATS_SCORE_RESULT_QUEUE)
                .withArgument("x-dead-letter-exchange", RabbitMQConstants.DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", "dead-letter")
                .build();
    }

    @Bean
    public Binding atsScoreResultBinding() {
        return BindingBuilder.bind(atsScoreResultQueue())
                .to(resifyExchange())
                .with(RabbitMQConstants.ATS_SCORE_RESULT_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        return new Jackson2JsonMessageConverter(mapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        template.setExchange(RabbitMQConstants.EXCHANGE);
        return template;
    }
}
