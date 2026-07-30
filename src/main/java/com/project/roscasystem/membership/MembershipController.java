package com.project.roscasystem.membership;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/memberships")
@RequiredArgsConstructor
public class MembershipController {
    private final MembershipService membershipService;

    @PostMapping("/join")
    public MembershipResponseDTO joinGroup(@Valid @RequestBody JoinGroupRequestDTO request) {
        return membershipService.joinGroup(request);
    }

    @GetMapping("/{membershipId}")
    public MembershipResponseDTO getMembership(@PathVariable Long membershipId){
        return membershipService.getMembership(membershipId);
    }

    @GetMapping("/group/{groupId}")
    public List<MembershipResponseDTO> getGroupRoster(@PathVariable Long groupId){
        return membershipService.getGroupRoster(groupId);
    }

    @GetMapping("/user/{userId}")
    public List<MembershipResponseDTO> getUserMemberships( @PathVariable Long userId){
        return membershipService.getUserMemberships(userId);
    }

    @PatchMapping("/status")
    public MembershipResponseDTO updateMembershipStatus(@RequestBody UpdateMembershipStatusDTO request){
        return membershipService.updateMembershipStatus(request.getMembershipId(), request.getStatus());
    }

    @PatchMapping("/penalty")
    public MembershipResponseDTO applyPenalty(@Valid @RequestBody ApplyPenaltyRequestDTO request){
        return membershipService.applyPenalty(request.getMembershipId(), request.getAmount());
    }

    @PatchMapping("/leave/{membershipId}")
    public MembershipResponseDTO leaveMembership(@PathVariable Long membershipId){
        return membershipService.leaveMembership(membershipId);

    }



}
