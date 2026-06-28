package com.project.roscasystem.group;

import com.project.roscasystem.exceptions.GroupNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;

    @Transactional
    public GroupResponseDTO createGroup(CreateGroupRequestDTO request){
            Group group= new Group();

            group.setGroupName(request.getGroupName());
            group.setGroupSize(request.getGroupSize());
            group.setNumberOfCycles(request.getNumberOfCycles());
            group.setGroupFrequency(request.getGroupFrequency());
            group.setRiskThreshold(request.getRiskThreshold());
            group.setMonthlyDepositAmount(request.getContributionAmount());
            group.setNextAuctionTime(LocalDateTime.now());
            group.setAuctionDurationMinutes(request.getAuctionDurationMinutes());
            group.setCurrentCycle(1);

            group=groupRepository.save(group);

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
                group.getGroupFrequency()
        );
    }


    @Transactional
    public void deleteGroup(Long id){
        Group group= groupRepository.findById(id).orElseThrow(()->new GroupNotFoundException("Group not found"));
        groupRepository.delete(group);
    }


    public GroupResponseDTO getGroup(Long id){
        Group group= groupRepository.findById(id).orElseThrow(()->new GroupNotFoundException("Group not found"));

        return convertToDto(group);
    }

    public List<GroupResponseDTO> getAllGroups(){

        return groupRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

}
