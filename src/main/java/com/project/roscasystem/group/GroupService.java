package com.project.roscasystem.group;


import com.project.roscasystem.exceptions.GroupNotFoundException;
import com.project.roscasystem.exceptions.UserNotFoundException;
import com.project.roscasystem.membership.Membership;
import com.project.roscasystem.membership.MembershipRepository;
import com.project.roscasystem.user.User;
import com.project.roscasystem.user.UserRepository;
import com.project.roscasystem.common.enums.MembershipStatus;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;

    @Transactional
    public GroupResponseDTO createGroup(CreateGroupRequestDTO request, String username){
            User adminUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

            Group group = new Group();
            group.setGroupName(request.getGroupName());
            group.setGroupSize(request.getGroupSize());
            group.setNumberOfCycles(request.getNumberOfCycles());
            group.setGroupFrequency(request.getGroupFrequency());
            group.setRiskThreshold(request.getRiskThreshold());
            group.setMonthlyDepositAmount(request.getContributionAmount());
            group.setNextAuctionTime(null); // Auction time is NOT set on creation
            group.setAuctionDurationMinutes(15);
            group.setCurrentCycle(1);
            group.setAdminUserId(adminUser.getId());

            group = groupRepository.save(group);

            // Automatically add creator to the group
            Membership membership = new Membership();
            membership.setUser(adminUser);
            membership.setGroup(group);
            membership.setPenaltyAmount(0);
            membership.setJoiningDate(LocalDate.now());
            membership.setTotalEarned(0);
            membership.setMembershipStatus(MembershipStatus.ACTIVE);
            membership.setTrustScoreAtJoining(adminUser.getCurrentTrustScore());
            membershipRepository.save(membership);

            return convertToDto(group);
    }

    @Transactional
    public GroupResponseDTO startGroup(StartGroupRequestDTO request, String username){
        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new GroupNotFoundException("Group not found"));

        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        boolean isMember = membershipRepository.findByGroup(group).stream()
                .anyMatch(m -> m.getUser() != null && m.getUser().getId().equals(user.getId()));

        if (group.getAdminUserId() == null) {
            group.setAdminUserId(user.getId());
        } else if (!user.getId().equals(group.getAdminUserId()) && !isMember) {
            throw new RuntimeException("Only a member or admin of the group can start the group");
        }

        if (group.getNextAuctionTime() != null) {
            throw new RuntimeException("Group is already started");
        }

        long currentMembers = membershipRepository.countByGroup(group);
        
        if (currentMembers < group.getGroupSize()) {
            if (Boolean.TRUE.equals(request.getReduceSizeIfNeeded())) {
                if (currentMembers < 3) {
                    throw new RuntimeException("Group must have at least 3 members to start");
                }
                group.setGroupSize((int) currentMembers);
                group.setNumberOfCycles((int) currentMembers);
                // The monthly deposit amount remains the same, but the total pool per cycle changes
            } else {
                throw new RuntimeException("Group is not full. Wait for more members or reduce the group size.");
            }
        }

        group.setNextAuctionTime(request.getFirstAuctionTime());
        group = groupRepository.save(group);

        return convertToDto(group);
    }

    private GroupResponseDTO convertToDto(Group group){
        return new GroupResponseDTO(
                group.getId(),
                group.getGroupName(),
                group.getGroupSize(),
                group.getMonthlyDepositAmount(),
                group.getRiskThreshold(),
                group.getCurrentCycle(),
                group.getNumberOfCycles(),
                group.getAuctionDurationMinutes(),
                group.getGroupFrequency(),
                group.getNextAuctionTime(),
                group.getAdminUserId()
        );
    }

    @Transactional
    public void deleteGroup(Long id){
        Group group = groupRepository.findById(id).orElseThrow(()->new GroupNotFoundException("Group not found"));
        groupRepository.delete(group);
    }

    public GroupResponseDTO getGroup(Long id){
        Group group = groupRepository.findById(id).orElseThrow(()->new GroupNotFoundException("Group not found"));
        return convertToDto(group);
    }

    public List<GroupResponseDTO> getAllGroups(){
        return groupRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }
}
