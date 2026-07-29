package com.project.roscasystem.auction;

import com.project.roscasystem.bid.Bid;
import com.project.roscasystem.bid.BidRepository;
import com.project.roscasystem.bid.BidResponseDTO;
import com.project.roscasystem.bid.PlaceBidRequestDTO;
import com.project.roscasystem.common.enums.AuctionStatus;
import com.project.roscasystem.common.enums.MembershipStatus;
import com.project.roscasystem.exceptions.*;
import com.project.roscasystem.group.Group;
import com.project.roscasystem.group.GroupRepository;
import com.project.roscasystem.membership.Membership;
import com.project.roscasystem.membership.MembershipRepository;
import com.project.roscasystem.recovery.RecoveryService;
import com.project.roscasystem.risk.RiskService;
import com.project.roscasystem.settlement.SettlementService;
import com.project.roscasystem.transaction.TransactionService;
import com.project.roscasystem.user.User;
import com.project.roscasystem.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;



@Service
@AllArgsConstructor
public class AuctionService {
    private final MembershipRepository membershipRepository;
    private final GroupRepository groupRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final SettlementService settlementService;
    private final RecoveryService recoveryService;
    private final RiskService riskService;
    private final UserRepository userRepository;

    public AuctionResponseDTO createAuction(Long groupId){
        Group group=  groupRepository.findById(groupId).orElseThrow(()->new GroupNotFoundException("No such group exists"));

        if(auctionRepository.existsByGroupAndAuctionStatus(group, AuctionStatus.OPEN )){
            throw new RuntimeException("Auction already exists");
        }

        if(group.getCurrentCycle()>group.getNumberOfCycles()){
            throw new RuntimeException("Current cycle exceeds maximum number of auctions");
        }

        Auction auction= new Auction();
        auction.setAuctionStatus(AuctionStatus.OPEN);
        auction.setGroup(group);
        auction.setCycleNumber(group.getCurrentCycle());
        auction.setWinningDiscountBid(0);
        auction.setStartTime(LocalDateTime.now());
        auction.setEndTime(LocalDateTime.now().plusMinutes(group.getAuctionDurationMinutes() > 0 ? group.getAuctionDurationMinutes() : 15));



        auction=auctionRepository.save(auction);

        settlementService.debitContributions(auction);

        return convertToDto(auction);
    }

    private AuctionResponseDTO convertToDto(Auction auction){

        return new AuctionResponseDTO(

                auction.getId(),

                auction.getGroup().getGroupName(),

                auction.getCycleNumber(),

                auction.getWinningDiscountBid(),

                auction.getWinner() == null
                        ? null
                        : auction.getWinner()
                        .getUser()
                        .getName(),

                auction.getAuctionStatus(),

                auction.getStartTime(),

                auction.getEndTime()

        );

    }

    public AuctionResponseDTO getCurrentAuction(Long groupId){
        Group group= groupRepository.findById(groupId).orElseThrow(()->new GroupNotFoundException("No such group exists"));

        Auction auction= auctionRepository.findTopByGroupOrderByCycleNumberDesc(group).orElseThrow(()->new AuctionNotFoundException("No such auction exists"));

        return convertToDto(auction);
    }

    private Bid determineWinner(Auction auction){
        List<Bid> bids= bidRepository.findByAuction(auction);
        if(bids.isEmpty()){
            return null;
        }

        Bid winner= bids.stream()
                .min(
                        Comparator
                                .comparing(Bid::getBidAmount)
                                .thenComparing(Bid::getCreatedAt)
                ).orElse(null);

        return winner;
    }

    @Transactional
    public AuctionResponseDTO closeAuction(Long auctionId){
        Auction auction= auctionRepository.findById(auctionId).orElseThrow(()->new AuctionNotFoundException("No such auction"));

        if(auction.getAuctionStatus()!=AuctionStatus.OPEN){
            throw new AuctionClosedException("Auction is not open");
        }

        Bid winningBid= determineWinner(auction);

        if (winningBid == null) {
            Group group = auction.getGroup();
            Membership adminMembership = membershipRepository.findByGroupAndUser_Id(group, group.getAdminUserId())
                    .orElseThrow(() -> new RuntimeException("Admin membership not found"));

            auction.setWinner(adminMembership);
            auction.setWinningDiscountBid(0); // 0 discount means full pool requested
            auction.setAuctionStatus(AuctionStatus.CLOSED);
            
            recoveryService.assignBeneficiaryToRecoveries(auction, adminMembership);
            recoveryService.processRecoveries();

            double collectedAmount = group.getGroupSize() * group.getMonthlyDepositAmount();
            
            // Full pool goes to admin
            settlementService.payWinner(adminMembership, collectedAmount);
            
            // Dividend is 0
            settlementService.distributeDividend(auction, 0);

            group.setCurrentCycle(group.getCurrentCycle() + 1);
            group.updateNextAuctionTime();

            groupRepository.save(group);
            auctionRepository.save(auction);

            return convertToDto(auction);
        }

        auction.setWinner(winningBid.getBidderMembership());
        auction.setWinningDiscountBid(winningBid.getBidAmount());
        auction.setAuctionStatus(AuctionStatus.CLOSED);

        recoveryService.assignBeneficiaryToRecoveries(auction, winningBid.getBidderMembership());
        recoveryService.processRecoveries();

        Group group = auction.getGroup();

        double collectedAmount = group.getGroupSize() * group.getMonthlyDepositAmount();

        double winnerAmount = Math.min(
                winningBid.getBidAmount(),
                collectedAmount
        );

        double dividend =
                (collectedAmount - winnerAmount)
                        / group.getGroupSize();


        settlementService.payWinner(
                winningBid.getBidderMembership(),
                winnerAmount
        );

        settlementService.distributeDividend(
                auction,
                dividend
        );

        group.setCurrentCycle(group.getCurrentCycle() + 1);
        group.updateNextAuctionTime();

        groupRepository.save(group);
        auctionRepository.save(auction);

        return convertToDto(auction);
    }

    @Transactional
    public BidResponseDTO placeBid(PlaceBidRequestDTO request){
        Auction auction= auctionRepository.findById(request.getAuctionId()).orElseThrow(()->new AuctionNotFoundException("No such auction"));

        if(auction.getAuctionStatus()!=AuctionStatus.OPEN){
            throw new AuctionClosedException("Auction is not open");
        }

        if(LocalDateTime.now().isAfter(auction.getEndTime())){
            throw new AuctionClosedException("The 30-minute auction window has expired.");
        }

        Membership membership= membershipRepository.findById(request.getMembershipId()).orElseThrow(()->new MembershipNotFoundException("No such member"));

        if(!riskService.canBid(membership)){
            throw new RuntimeException("Membership suspended");
        }

        if(!membership.getGroup().equals(auction.getGroup())){
            throw new RuntimeException("Member does not belong to this group");
        }

        if(auctionRepository.existsByGroupAndWinner(auction.getGroup(), membership)){
            throw new MemberAlreadyWonException("Member already won");
        }

        if(request.getBidAmount()<=0){
            throw new InvalidBidException("Invalid Bid");
        }

        double poolAmount= auction.getGroup().getGroupSize() * auction.getGroup().getMonthlyDepositAmount();

        if(request.getBidAmount()>poolAmount){
            throw new InvalidBidException("Bid is greater then pool amount");
        }

        Bid bid= new Bid();
        bid.setAuction(auction);
        bid.setBidderMembership(membership);
        bid.setBidAmount(request.getBidAmount());
        bid=bidRepository.save(bid);


        return convertToDto(bid);

    }

    private BidResponseDTO convertToDto(Bid bid){
        return new BidResponseDTO(

                bid.getId(),

                bid.getBidderMembership()
                        .getUser()
                        .getName(),

                bid.getBidAmount(),

                bid.getAuction()
                        .getId()

        );

    }

    public List<AuctionResponseDTO> getGroupAuctions(Long groupId) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() ->
                        new GroupNotFoundException("No such group exists"));

        return auctionRepository.findByGroupOrderByCycleNumber(group)
                .stream()
                .map(this::convertToDto)
                .toList();
    }



    public List<com.project.roscasystem.group.GroupResponseDTO> getUpcomingAuctions(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return membershipRepository.findByUser(user).stream()
                .map(Membership::getGroup)
                .filter(g -> g.getNextAuctionTime() != null && g.getNextAuctionTime().isAfter(LocalDateTime.now()))
                .map(g -> new com.project.roscasystem.group.GroupResponseDTO(
                        g.getId(), g.getGroupName(), g.getGroupSize(), g.getMonthlyDepositAmount(),
                        g.getRiskThreshold(), g.getCurrentCycle(), g.getNumberOfCycles(),
                        g.getAuctionDurationMinutes(), g.getGroupFrequency(), g.getNextAuctionTime(),
                        g.getAdminUserId()))
                .toList();
    }

    public BidResponseDTO getWinningBid(Long auctionId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new AuctionNotFoundException("No such auction"));

        Bid winner = determineWinner(auction);
        if (winner == null) {
            return null; // or throw exception, but returning null is fine if no bids yet
        }
        return convertToDto(winner);
    }

}
