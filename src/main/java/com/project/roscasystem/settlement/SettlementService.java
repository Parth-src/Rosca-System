package com.project.roscasystem.settlement;

import com.project.roscasystem.auction.Auction;
import com.project.roscasystem.membership.Membership;
import com.project.roscasystem.membership.MembershipRepository;
import com.project.roscasystem.recovery.RecoveryService;
import com.project.roscasystem.risk.RiskService;
import com.project.roscasystem.transaction.TransactionService;
import com.project.roscasystem.wallet.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final WalletService walletService;
    private final MembershipRepository membershipRepository;
    private final TransactionService transactionService;
    private final RecoveryService recoveryService;
    private final RiskService  riskService;

    private double calculatePenalty(double contribution) {
        return contribution * 0.10;
    }

    public double debitContributions(Auction auction) {

        List<Membership> memberships =
                membershipRepository.findByGroup(auction.getGroup());

        double contribution =
                auction.getGroup().getMonthlyDepositAmount();

        for (Membership membership : memberships) {

            if (walletService.hasSufficientBalance(
                    membership.getUser(),
                    contribution)) {

                walletService.debit(
                        membership.getUser(),
                        contribution
                );

                transactionService.recordContribution(
                        membership.getId(),
                        contribution
                );

                riskService.contributionSuccess(membership.getUser().getId());
            }

            else {
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
        // The system absorbs the missing contributions temporarily.
        return memberships.size() * contribution;
    }

    public void payWinner(Membership winner, double amount) {

        walletService.credit(
                winner.getUser(),
                amount
        );

        transactionService.recordAllocation(
                winner.getId(),
                amount
        );
        
        winner.setTotalEarned(winner.getTotalEarned() + amount);
        membershipRepository.save(winner);
    }

    public void distributeDividend(Auction auction, double dividend) {
        if (dividend <= 0) {
            return;
        }

        List<Membership> memberships =
                membershipRepository.findByGroup(auction.getGroup());

        for (Membership membership : memberships) {

            walletService.credit(
                    membership.getUser(),
                    dividend
            );

            transactionService.recordDividend(
                    membership.getId(),
                    dividend
            );
            
            membership.setTotalEarned(membership.getTotalEarned() + dividend);
            membershipRepository.save(membership);
        }
    }
}