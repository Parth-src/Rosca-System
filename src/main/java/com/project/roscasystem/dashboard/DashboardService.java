package com.project.roscasystem.dashboard;

import com.project.roscasystem.common.enums.GroupStatus;
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
        
        List<Membership> activeMemberships = memberships.stream()
                .filter(m -> m.getGroup() != null &&
                        (m.getGroup().getGroupStatus() == GroupStatus.ACTIVE || m.getGroup().getGroupStatus() == GroupStatus.FORMING) &&
                        (m.getMembershipStatus() == MembershipStatus.ACTIVE || m.getMembershipStatus() == MembershipStatus.POOL_RECEIVED) &&
                        m.getGroup().getCurrentCycle() <= m.getGroup().getNumberOfCycles())
                .toList();

        int activeGroupsCount = activeMemberships.size();

        List<Transaction> transactions = transactionRepository.findByMembership_User_Id(user.getId());
        
        // Calculate total savings: Sum of all CONTRIBUTION transactions (positive value)
        double totalSavings = transactions.stream()
                .filter(t -> t.getTransactionType() == TransactionType.CONTRIBUTION)
                .mapToDouble(t -> Math.abs(t.getAmount()))
                .sum();

        // Fetch risk score from the user entity
        double riskScore = user.getCurrentTrustScore(); 
        
        // Upcoming contribution based on active groups' monthly deposit amounts
        double upcomingContribution = activeMemberships.stream()
                .mapToDouble(m -> m.getGroup().getMonthlyDepositAmount())
                .sum();

        return DashboardSummaryDTO.builder()
                .totalSavings(totalSavings)
                .activeGroupsCount(activeGroupsCount)
                .upcomingContribution(upcomingContribution)
                .riskScore(riskScore)
                .build();
    }
}
