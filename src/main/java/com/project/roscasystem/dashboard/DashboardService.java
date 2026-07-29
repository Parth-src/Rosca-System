package com.project.roscasystem.dashboard;

import com.project.roscasystem.common.enums.MembershipStatus;
import com.project.roscasystem.common.enums.TransactionType;
import com.project.roscasystem.membership.Membership;
import com.project.roscasystem.membership.MembershipRepository;
import com.project.roscasystem.transaction.Transaction;
import com.project.roscasystem.transaction.TransactionRepository;
import com.project.roscasystem.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MembershipRepository membershipRepository;
    private final TransactionRepository transactionRepository;

    public DashboardSummaryDTO getDashboardSummary(User user) {
        List<Membership> memberships = membershipRepository.findByUser(user);
        
        int activeGroupsCount = (int) memberships.stream()
                .filter(m -> m.getMembershipStatus() == MembershipStatus.ACTIVE)
                .count();

        List<Transaction> transactions = transactionRepository.findByMembership_User_Id(user.getId());
        
        // Calculate total savings: Sum of all CONTRIBUTION transactions
        double totalSavings = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.CONTRIBUTION)
                .mapToDouble(Transaction::getAmount)
                .sum();

        // Fetch risk score from the user entity
        double riskScore = user.getCurrentTrustScore(); 
        
        // Dummy calculation for upcoming contribution based on active groups
        double upcomingContribution = activeGroupsCount * 500.0; 

        return DashboardSummaryDTO.builder()
                .totalSavings(totalSavings)
                .activeGroupsCount(activeGroupsCount)
                .upcomingContribution(upcomingContribution)
                .riskScore(riskScore)
                .build();
    }
}
