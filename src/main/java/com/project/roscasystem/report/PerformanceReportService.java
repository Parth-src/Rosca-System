package com.project.roscasystem.report;

import com.project.roscasystem.auction.Auction;
import com.project.roscasystem.auction.AuctionRepository;
import com.project.roscasystem.common.enums.TransactionType;
import com.project.roscasystem.exceptions.MembershipNotFoundException;
import com.project.roscasystem.membership.Membership;
import com.project.roscasystem.membership.MembershipRepository;
import com.project.roscasystem.transaction.Transaction;
import com.project.roscasystem.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PerformanceReportService {

    private final TransactionRepository transactionRepository;
    private final AuctionRepository auctionRepository;
    private final MembershipRepository membershipRepository;

    public PerformanceReportDTO generatePerformanceReport(Long membershipId) {
        Membership membership = membershipRepository.findById(membershipId).orElseThrow(()->new MembershipNotFoundException("Membership not found"));

        List<Transaction> transactions = transactionRepository.findByMembership(membership);

        double totalInvested =
                transactions.stream()
                        .filter(t ->
                                t.getTransactionType()== TransactionType.CONTRIBUTION ||
                                        t.getTransactionType()==TransactionType.PENALTY)
                        .mapToDouble(t -> Math.abs(t.getAmount()))
                        .sum();

        double dividend =
                transactions.stream()
                        .filter(t ->
                                t.getTransactionType()==TransactionType.DIVIDEND)
                        .mapToDouble(Transaction::getAmount)
                        .sum();

        double allocation =
                transactions.stream()
                        .filter(t ->
                                t.getTransactionType()==TransactionType.ALLOCATION)
                        .mapToDouble(Transaction::getAmount)
                        .sum();

        double recovery =
                transactions.stream()
                        .filter(t ->
                                t.getTransactionType()==TransactionType.RECOVERY)
                        .mapToDouble(Transaction::getAmount)
                        .sum();

        double penalty =
                transactions.stream()
                        .filter(t ->
                                t.getTransactionType()==TransactionType.PENALTY)
                        .mapToDouble(t -> Math.abs(t.getAmount()))
                        .sum();

        double totalReceived = dividend + allocation + recovery;
        double profit = totalReceived - totalInvested;
        double roi = 0;

        if(totalInvested>0){
            roi = (profit/totalInvested) *100;
        }

        Integer winningCycle = auctionRepository.findByWinner(membership).map(Auction::getCycleNumber).orElse(null);

        return new PerformanceReportDTO(
              membership.getUser().getName(),
              membership.getGroup().getGroupName(),
                membership.getGroup().getCurrentCycle()-1,
                totalInvested,
                totalReceived,
                dividend,
                allocation,
                recovery,
                penalty,
                profit,
                roi,
                winningCycle,
                membership.getUser().getCurrentTrustScore(),
                membership.getMembershipStatus()
        );
    }
}
