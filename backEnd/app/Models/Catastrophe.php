<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Catastrophe extends Model
{
    //
    protected $fillable = [
        'title',
        'description',
        'latitude',
        'longitude',
        'date',
        'severity',
        'status',
        'type_id'
    ];
    public function type()
    {
        return $this->belongsTo(Type::class);
    }
}
