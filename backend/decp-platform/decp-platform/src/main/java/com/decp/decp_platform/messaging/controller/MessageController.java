package com.decp.decp_platform.messaging.controller;

import com.decp.decp_platform.messaging.entity.Message;
import com.decp.decp_platform.messaging.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/{receiverId}")
    public ResponseEntity<Message> sendMessage(
            @PathVariable("receiverId") Long receiverId,
            @RequestParam("content") String content) {

        return ResponseEntity.ok(
                messageService.sendMessage(receiverId, content)
        );
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<Message>> getConversation(
            @PathVariable("userId") Long userId) {

        return ResponseEntity.ok(
                messageService.getConversation(userId)
        );
    }

    @GetMapping
    public ResponseEntity<List<Message>> getAllMyMessages() {
        return ResponseEntity.ok(messageService.getAllMyMessages());
    }
}