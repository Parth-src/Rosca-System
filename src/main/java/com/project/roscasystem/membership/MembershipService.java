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
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
public class MembershipService {
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;


    @Transactional
    public MembershipResponseDTO joinGroup(JoinGroupRequestDTO request) {



        User user= userRepository.findById(request.getUserId()).orElseThrow(()-> new RuntimeException("user not found"));
        Group group= groupRepository.findById(request.getGroupId()).orElseThrow(()-> new RuntimeException(("Group not found")));

        checkEligibility(user,group);

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

        return convertToDTO(membership);
    }



    //cHECKING ELIGIBILITY OF USER
    private void checkEligibility(User user, Group group){

        if(membershipRepository.existsByUserAndGroup(user,group)){
            throw new RuntimeException("Membership already exists");
        }

        if(user.getCurrentTrustScore()<group.getRiskThreshold()){
            throw new RuntimeException("Cannot join group as the trust score is lower than the risk threshold");
        }

        long currentMembers= membershipRepository.countByGroup(group);
        if(currentMembers>=group.getGroupSize()){
            throw new RuntimeException("Group is full");
        }

    }



    /**
     * Converts Membership entity to MembershipResponseDTO
     */
    private MembershipResponseDTO convertToDTO(Membership membership){
        return new MembershipResponseDTO(
                membership.getId(),

                membership.getUser().getName(),

                membership.getGroup().getGroupName(),

                membership.getTrustScoreAtJoining(),

                membership.getMembershipStatus()
        );


    }

    public MembershipResponseDTO getMembership(Long membershipId){
        Membership membership= membershipRepository.findById(membershipId).orElseThrow(()-> new RuntimeException("Membership not found"));

        return convertToDTO(membership);
    }

    public List<MembershipResponseDTO> getUserMemberships(Long userId){

        User user= userRepository.findById(userId).orElseThrow(()-> new RuntimeException("user not found"));


        List<Membership> memberships= membershipRepository.findByUser(user);

        List<MembershipResponseDTO> reponse=
                memberships.stream()
                        .filter(membership -> membership.getMembershipStatus().equals(MembershipStatus.ACTIVE))
                        .map(this::convertToDTO)
                        .toList();

        return reponse;

    }

    public MembershipResponseDTO updateMembershipStatus(Long membershipId, MembershipStatus status){
        Membership membership=  membershipRepository.findById(membershipId).orElseThrow(()-> new RuntimeException("Membership not found"));

        if(membership.getMembershipStatus()==status){
            return convertToDTO(membership);
        }
        membership.setMembershipStatus(status);
        membershipRepository.save(membership);

        return convertToDTO(membership);
    }

    @Transactional
    public MembershipResponseDTO applyPenalty(Long membershipId, double amount){
        Membership membership=  membershipRepository.findById(membershipId).orElseThrow(()-> new RuntimeException("Membership not found"));

        if(amount<=0){
            throw new RuntimeException("Penalty amount must be greater than 0");
        }
        membership.setPenaltyAmount(membership.getPenaltyAmount()+amount);

        membership= membershipRepository.save(membership);

        return convertToDTO(membership);
    }

    public MembershipResponseDTO leaveMembership(Long membershipId){

        return updateMembershipStatus(membershipId, MembershipStatus.LEFT);
    }

}
