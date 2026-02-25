package com.Backend.AI_Resume_Builder_Backend.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "system_stats")
public class SystemStats {

    @Id
    @Column(name = "stat_key", nullable = false, unique = true)
    private String key;

    @Column(name = "stat_value", nullable = false)
    private Long value;

    public SystemStats() {
    }

    public SystemStats(String key, Long value) {
        this.key = key;
        this.value = value;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public Long getValue() {
        return value;
    }

    public void setValue(Long value) {
        this.value = value;
    }
}
