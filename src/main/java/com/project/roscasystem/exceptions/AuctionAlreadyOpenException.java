package com.project.roscasystem.exceptions;

public class AuctionAlreadyOpenException extends RuntimeException {
    public AuctionAlreadyOpenException(String message) {
        super(message);
    }
}
