package com.Backend.AI_Resume_Builder_Backend.Service;

import com.Backend.AI_Resume_Builder_Backend.Entity.SystemStats;
import com.Backend.AI_Resume_Builder_Backend.Repository.SystemStatsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

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
        Optional<SystemStats> statOpt = systemStatsRepository.findById(key);
        if (statOpt.isPresent()) {
            SystemStats stat = statOpt.get();
            stat.setValue(stat.getValue() + 1);
            systemStatsRepository.save(stat);
        } else {
            SystemStats stat = new SystemStats(key, 1L);
            systemStatsRepository.save(stat);
        }
    }

    public long getStatValue(String key) {
        return systemStatsRepository.findById(key)
                .map(SystemStats::getValue)
                .orElse(0L);
    }
}
