package com.project.roscasystem.exceptions;

public class NoBidsFoundException extends RuntimeException{
    public NoBidsFoundException(String message){
        super(message);
    }
}
