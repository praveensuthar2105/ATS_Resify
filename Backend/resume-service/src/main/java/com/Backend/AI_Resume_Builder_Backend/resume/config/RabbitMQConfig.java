package com.Backend.AI_Resume_Builder_Backend.resume.config;

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
 * RabbitMQ infrastructure beans for resume-service.
 * Declares the topic exchange, queues, and bindings.
 */
@Configuration
public class RabbitMQConfig {

    // ── Exchange ──

    @Bean
    public TopicExchange resifyExchange() {
        return ExchangeBuilder.topicExchange(RabbitMQConstants.EXCHANGE)
                .durable(true)
                .build();
    }

    // ── Dead Letter Exchange ──

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

    // ── ATS Score Request Queue (Producer side) ──

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

    // ── ATS Score Result Queue (Consumer side — listens for results) ──

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

    // ── PDF Compile Request Queue ──

    @Bean
    public Queue pdfCompileRequestQueue() {
        return QueueBuilder.durable(RabbitMQConstants.PDF_COMPILE_REQUEST_QUEUE)
                .withArgument("x-dead-letter-exchange", RabbitMQConstants.DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", "dead-letter")
                .build();
    }

    @Bean
    public Binding pdfCompileRequestBinding() {
        return BindingBuilder.bind(pdfCompileRequestQueue())
                .to(resifyExchange())
                .with(RabbitMQConstants.PDF_COMPILE_REQUEST_KEY);
    }

    // ── PDF Compile Result Queue ──

    @Bean
    public Queue pdfCompileResultQueue() {
        return QueueBuilder.durable(RabbitMQConstants.PDF_COMPILE_RESULT_QUEUE)
                .withArgument("x-dead-letter-exchange", RabbitMQConstants.DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", "dead-letter")
                .build();
    }

    @Bean
    public Binding pdfCompileResultBinding() {
        return BindingBuilder.bind(pdfCompileResultQueue())
                .to(resifyExchange())
                .with(RabbitMQConstants.PDF_COMPILE_RESULT_KEY);
    }

    // ── Resume Generation Request Queue ──

    @Bean
    public Queue resumeGenRequestQueue() {
        return QueueBuilder.durable(RabbitMQConstants.RESUME_GEN_REQUEST_QUEUE)
                .withArgument("x-dead-letter-exchange", RabbitMQConstants.DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", "dead-letter")
                .build();
    }

    @Bean
    public Binding resumeGenRequestBinding() {
        return BindingBuilder.bind(resumeGenRequestQueue())
                .to(resifyExchange())
                .with(RabbitMQConstants.RESUME_GEN_REQUEST_KEY);
    }

    // ── Resume Generation Result Queue ──

    @Bean
    public Queue resumeGenResultQueue() {
        return QueueBuilder.durable(RabbitMQConstants.RESUME_GEN_RESULT_QUEUE)
                .withArgument("x-dead-letter-exchange", RabbitMQConstants.DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", "dead-letter")
                .build();
    }

    @Bean
    public Binding resumeGenResultBinding() {
        return BindingBuilder.bind(resumeGenResultQueue())
                .to(resifyExchange())
                .with(RabbitMQConstants.RESUME_GEN_RESULT_KEY);
    }

    // ── Message Converter (JSON serialization) ──

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
