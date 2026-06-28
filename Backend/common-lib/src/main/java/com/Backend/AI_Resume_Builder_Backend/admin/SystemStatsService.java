package com.Backend.AI_Resume_Builder_Backend.admin;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SystemStatsService {

    public static final String KEY_PDF_COMPILATIONS = "pdf_compilations";
    public static final String KEY_ATS_CHECKS = "ats_checks";

    @Autowired
    private SystemStatsRepository systemStatsRepository;

    @Transactional
    public void incrementPdfCompilations() {
        incrementStat(KEY_PDF_COMPILATIONS);
    }

    @Transactional
    public void incrementAtsChecks() {
        incrementStat(KEY_ATS_CHECKS);
    }

    @Transactional
    public void incrementStat(String key) {
        int updated = systemStatsRepository.incrementValue(key);
        if (updated == 0) {
            try {
                SystemStats stat = new SystemStats(key, 1L);
                systemStatsRepository.saveAndFlush(stat);
            } catch (Exception e) {
                // If another thread inserted it concurrently, run the update again
                systemStatsRepository.incrementValue(key);
            }
        }
    }

    public long getStatValue(String key) {
        return systemStatsRepository.findById(key)
                .map(SystemStats::getValue)
                .orElse(0L);
    }
}
