package com.project.roscasystem.group;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/groups")
public class GroupController {
    private final GroupService groupService;

    @PostMapping
    public GroupResponseDTO createGroup(@Valid @RequestBody CreateGroupRequestDTO request){
        return groupService.createGroup(request);
    }

    @RequestMapping("/{id}")
    public GroupResponseDTO getGroup(@PathVariable Long id){
        return groupService.getGroup(id);
    }

    @DeleteMapping
    public void deleteGroup(@PathVariable Long id){
          groupService.deleteGroup(id);
    }

    @GetMapping
    public List<GroupResponseDTO> getAllGroups(){
        return groupService.getAllGroups();
    }


}
