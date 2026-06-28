package com.Backend.AI_Resume_Builder_Backend.messaging;

/**
 * Centralized RabbitMQ exchange, queue, and routing key constants.
 * Shared across all microservices via common-lib.
 */
public final class RabbitMQConstants {

    private RabbitMQConstants() {} // Prevent instantiation

    // ── Exchange ──
    public static final String EXCHANGE = "resify.topic";

    // ── ATS Scoring ──
    public static final String ATS_SCORE_REQUEST_QUEUE = "ats.score.request";
    public static final String ATS_SCORE_REQUEST_KEY = "ats.score.request";
    public static final String ATS_SCORE_RESULT_QUEUE = "ats.score.result";
    public static final String ATS_SCORE_RESULT_KEY = "ats.score.result";

    // ── PDF Compilation ──
    public static final String PDF_COMPILE_REQUEST_QUEUE = "pdf.compile.request";
    public static final String PDF_COMPILE_REQUEST_KEY = "pdf.compile.request";
    public static final String PDF_COMPILE_RESULT_QUEUE = "pdf.compile.result";
    public static final String PDF_COMPILE_RESULT_KEY = "pdf.compile.result";

    // ── Resume Generation ──
    public static final String RESUME_GEN_REQUEST_QUEUE = "resume.gen.request";
    public static final String RESUME_GEN_REQUEST_KEY = "resume.gen.request";
    public static final String RESUME_GEN_RESULT_QUEUE = "resume.gen.result";
    public static final String RESUME_GEN_RESULT_KEY = "resume.gen.result";

    // ── Dead Letter ──
    public static final String DLX_EXCHANGE = "resify.dlx";
    public static final String DLQ_QUEUE = "resify.dead-letter";
}
