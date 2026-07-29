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
    public GroupResponseDTO createGroup(@Valid @RequestBody CreateGroupRequestDTO request, org.springframework.security.core.Authentication authentication){
        return groupService.createGroup(request, authentication.getName());
    }

    @GetMapping("/{id}")
    public GroupResponseDTO getGroup(@PathVariable Long id){
        return groupService.getGroup(id);
    }

    @DeleteMapping("/{id}")
    public void deleteGroup(@PathVariable Long id){
          groupService.deleteGroup(id);
    }

    @GetMapping
    public List<GroupResponseDTO> getAllGroups(){
        return groupService.getAllGroups();
    }

    @PatchMapping("/start")
    public GroupResponseDTO startGroup(@Valid @RequestBody StartGroupRequestDTO request, org.springframework.security.core.Authentication authentication){
        return groupService.startGroup(request, authentication.getName());
    }

}
