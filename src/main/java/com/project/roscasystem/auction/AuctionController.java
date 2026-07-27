package com.project.roscasystem.auction;

import com.project.roscasystem.bid.BidResponseDTO;
import com.project.roscasystem.bid.PlaceBidRequestDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auctions")
public class AuctionController {
    private final AuctionService auctionService;

    @PostMapping("/{groupId}")
    public AuctionResponseDTO createAuction(@PathVariable Long groupId){
        return auctionService.createAuction(groupId);
    }

    @GetMapping("/current/{groupId}")
    public AuctionResponseDTO getCurrentAuction(@PathVariable Long groupId){
        return auctionService.getCurrentAuction(groupId);
    }

    @PostMapping("/bid")
    public BidResponseDTO createBid(@Valid @RequestBody PlaceBidRequestDTO request){
        return auctionService.placeBid(request);
    }

    @PatchMapping("/close/{auctionId}")
    public AuctionResponseDTO closeAuction(@PathVariable Long auctionId){
        return auctionService.closeAuction(auctionId);
    }

    @GetMapping("/group/{groupId}")
    public List<AuctionResponseDTO> getGroupAuctions(@PathVariable Long groupId) {
        return auctionService.getGroupAuctions(groupId);
    }

    @GetMapping("/upcoming")
    public List<com.project.roscasystem.group.GroupResponseDTO> getUpcomingAuctions(org.springframework.security.core.Authentication authentication) {
        return auctionService.getUpcomingAuctions(authentication.getName());
    }

}
