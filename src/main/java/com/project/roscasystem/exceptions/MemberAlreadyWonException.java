package com.project.roscasystem.exceptions;

public class MemberAlreadyWonException extends RuntimeException{
    public MemberAlreadyWonException(String message){
        super(message);
    }
}
