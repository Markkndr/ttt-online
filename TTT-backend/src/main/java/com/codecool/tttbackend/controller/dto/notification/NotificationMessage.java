package com.codecool.tttbackend.controller.dto.notification;

import com.codecool.tttbackend.controller.dto.notification.meta.NotificationMeta;

public record NotificationMessage(String type, String title, String body, NotificationMeta meta) {
}
