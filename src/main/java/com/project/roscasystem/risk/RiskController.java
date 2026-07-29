package com.project.roscasystem.risk;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/risk/")
@RequiredArgsConstructor
public class RiskController {

    private final RiskService riskService;

    @GetMapping("/{membershipId}")
    public RiskResponseDTO getRisk(@PathVariable Long membershipId) {
        return riskService.getRisk(membershipId);
    }

    @GetMapping("/user/{userId}")
    public UserRiskReportDTO getUserRisk(@PathVariable Long userId) {
        return riskService.getUserRiskReport(userId);
    }
}
