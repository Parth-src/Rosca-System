package com.project.roscasystem.recovery;

import com.project.roscasystem.common.enums.RecoveryStatus;
import com.project.roscasystem.membership.Membership;
import com.project.roscasystem.transaction.TransactionService;
import com.project.roscasystem.wallet.WalletService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecoveryService {

    private final RecoveryRepository recoveryRepository;
    private final WalletService walletService;
    private final TransactionService transactionService;

    @Transactional
    public void createRecovery(
            Membership defaulter,
            Membership beneficiary,
            com.project.roscasystem.auction.Auction auction,
            double contribution,
            double penalty
    ) {

        Recovery recovery = new Recovery();

        recovery.setDefaulter(defaulter);
        recovery.setBeneficiary(beneficiary);
        recovery.setAuction(auction);
        recovery.setPendingContribution(contribution);
        recovery.setPenalty(penalty);
        recovery.setRecoveryStatus(RecoveryStatus.PENDING);

        recoveryRepository.save(recovery);
    }

    @Transactional
    public void processRecoveries() {

        List<Recovery> recoveries =
                recoveryRepository.findByRecoveryStatus(
                        RecoveryStatus.PENDING
                );

        for (Recovery recovery : recoveries) {

            double totalAmount =
                    recovery.getPendingContribution()
                            + recovery.getPenalty();

            if (walletService.hasSufficientBalance(
                    recovery.getDefaulter().getUser(),
                    totalAmount)) {

                walletService.debit(
                        recovery.getDefaulter().getUser(),
                        totalAmount
                );

                walletService.credit(
                        recovery.getBeneficiary().getUser(),
                        totalAmount
                );

                transactionService.recordPenalty(
                        recovery.getDefaulter().getId(),
                        recovery.getPenalty()
                );

                transactionService.recordRecovery(
                        recovery.getBeneficiary().getId(),
                        totalAmount
                );

                recovery.setRecoveryStatus(
                        RecoveryStatus.COMPLETED
                );

                recoveryRepository.save(recovery);
            }
        }
    }

}