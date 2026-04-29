




<?php

class BankAccount {

   private  $owner;
    private  $balance;
    static  $totalAccounts = 0;

    public function __construct( $balance , $owner)
    {
        $this->owner = $owner; 
        $this->owner = $balance; 


    }
     
    public function deposit($amount)
    {
        $this->balance += $amount;
        
    }

     public function withdraw($amount)
    {
        $this->balance += $amount;
        
    }
    
   
    

}


?>