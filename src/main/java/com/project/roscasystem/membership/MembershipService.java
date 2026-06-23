package com.project.roscasystem.membership;


import com.project.roscasystem.common.enums.MembershipStatus;
import com.project.roscasystem.group.Group;
import com.project.roscasystem.group.GroupRepository;
import com.project.roscasystem.user.User;
import com.project.roscasystem.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.time.LocalDate;



@Service
@RequiredArgsConstructor
public class MembershipService {
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final MembershipResponseDTO membershipResponseDTO;

    @Transactional
    public MembershipResponseDTO joinGroup(JoinGroupRequestDTO request) {


        User user= userRepository.findById(request.getUserId()).orElseThrow(()-> new RuntimeException("user not found"));
        Group group= groupRepository.findById(request.getGroupId()).orElseThrow(()-> new RuntimeException(("Group not found")));

        if(membershipRepository.existsByUserAndGroup(user, group)){
            throw new RuntimeException("Membership already exists");
        }

        double currentTrustScore= user.getCurrentTrustScore();
        double riskThreshold= group.getRiskThreshold();

        if(currentTrustScore<riskThreshold){
            throw new RuntimeException("Cannot join group as the trust score is lower than the risk threshold");
        }

        long currentMembers= membershipRepository.countByGroup(group);

        if(currentMembers>=group.getGroupSize()){
            throw new RuntimeException("Group is full");
        }

        //each object represents new member, so manual object creation
        Membership membership= new Membership();

        membership.setUser(user);
        membership.setGroup(group);
        membership.setPenaltyAmount(0);
        membership.setJoiningDate(LocalDate.now());
        membership.setTotalEarned(0);
        membership.setMembershipStatus(MembershipStatus.ACTIVE);
        membership.setTrustScoreAtJoining(user.getCurrentTrustScore());



        membership =membershipRepository.save(membership);

        MembershipResponseDTO response =
                new MembershipResponseDTO(

                        membership.getId(),

                        user.getName(),

                        group.getGroupName(),

                        membership.getTrustScoreAtJoining(),

                        membership.getMembershipStatus()

                );





        return membershipResponseDTO;

    }
}
