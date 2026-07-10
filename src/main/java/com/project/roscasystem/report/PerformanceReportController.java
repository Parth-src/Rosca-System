package com.project.roscasystem.report;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class PerformanceReportController {

    private final PerformanceReportService performanceReportService;

    @GetMapping("/performance/{membershipId}")
    public PerformanceReportDTO getReport(
            @PathVariable Long membershipId){

        return performanceReportService.generatePerformanceReport(membershipId);
    }
}
