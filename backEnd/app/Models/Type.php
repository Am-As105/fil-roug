<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Type extends Model
{
    //
    public function catastrophes()
    {
        return $this->hasMany(Catastrophe::class);
    }
}
