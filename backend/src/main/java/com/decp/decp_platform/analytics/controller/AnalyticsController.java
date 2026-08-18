package com.decp.decp_platform.analytics.controller;

import com.decp.decp_platform.analytics.dto.AnalyticsResponse;
import com.decp.decp_platform.analytics.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public ResponseEntity<AnalyticsResponse> getDashboard() {
        return ResponseEntity.ok(analyticsService.getAnalytics());
    }
}