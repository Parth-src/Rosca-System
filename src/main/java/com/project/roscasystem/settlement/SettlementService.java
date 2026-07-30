package com.project.roscasystem.settlement;

import com.project.roscasystem.auction.Auction;
import com.project.roscasystem.common.enums.MembershipStatus;
import com.project.roscasystem.membership.Membership;
import com.project.roscasystem.membership.MembershipRepository;
import com.project.roscasystem.recovery.RecoveryService;
import com.project.roscasystem.risk.RiskService;
import com.project.roscasystem.transaction.TransactionService;
import com.project.roscasystem.wallet.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final WalletService walletService;
    private final MembershipRepository membershipRepository;
    private final TransactionService transactionService;
    private final RecoveryService recoveryService;
    private final RiskService riskService;

    private double calculatePenalty(double contribution) {
        return contribution * 0.10;
    }

    @Transactional
    public double debitContributions(Auction auction) {
        if (auction == null || auction.getGroup() == null) {
            throw new IllegalArgumentException("Auction or associated group cannot be null");
        }

        List<Membership> memberships = membershipRepository.findByGroup(auction.getGroup());
        double contribution = auction.getGroup().getMonthlyDepositAmount();

        for (Membership membership : memberships) {
            if (membership.getUser() == null) {
                continue;
            }

            if (walletService.hasSufficientBalance(membership.getUser(), contribution)) {
                walletService.debit(membership.getUser(), contribution);
                transactionService.recordContribution(membership.getId(), contribution);
                riskService.contributionSuccess(membership.getUser().getId());
            } else {
                double penalty = calculatePenalty(contribution);
                recoveryService.createRecovery(
                        membership,
                        null, // Winner is unknown before auction starts
                        auction,
                        contribution,
                        penalty
                );
                riskService.defaultOccurred(membership.getUser().getId());
            }
        }

        // Return the full pool size as if everyone paid.
        return memberships.size() * contribution;
    }

    @Transactional
    public void payWinner(Membership winner, double amount) {
        if (winner == null || winner.getUser() == null || amount <= 0) {
            return;
        }

        walletService.credit(winner.getUser(), amount);
        transactionService.recordAllocation(winner.getId(), amount);
        
        winner.setTotalEarned(winner.getTotalEarned() + amount);
        winner.setMembershipStatus(MembershipStatus.POOL_RECEIVED);
        membershipRepository.save(winner);
    }

    @Transactional
    public void distributeDividend(Auction auction, double totalDiscountPool) {
        if (auction == null || auction.getGroup() == null || totalDiscountPool <= 0) {
            return;
        }

        List<Membership> memberships = membershipRepository.findByGroup(auction.getGroup());
        if (memberships.isEmpty()) {
            return;
        }

        int count = memberships.size();
        long totalCents = Math.round(totalDiscountPool * 100.0);
        long centsPerUser = totalCents / count;
        long remainderCents = totalCents % count;

        double baseDividend = centsPerUser / 100.0;
        double remainderBonus = remainderCents / 100.0;

        Long creatorUserId = auction.getGroup().getAdminUserId();

        for (Membership membership : memberships) {
            if (membership.getUser() == null) {
                continue;
            }

            double amountToCredit = baseDividend;

            // If the dividend is not evenly divisible, the extra remainder goes to the Group Creator
            if (creatorUserId != null && creatorUserId.equals(membership.getUser().getId())) {
                amountToCredit += remainderBonus;
            }

            // Round to 2 decimal places to prevent floating point inaccuracies
            amountToCredit = Math.round(amountToCredit * 100.0) / 100.0;

            if (amountToCredit > 0) {
                walletService.credit(membership.getUser(), amountToCredit);
                transactionService.recordDividend(membership.getId(), amountToCredit);
                
                membership.setTotalEarned(membership.getTotalEarned() + amountToCredit);
                membershipRepository.save(membership);
            }
        }
    }
}